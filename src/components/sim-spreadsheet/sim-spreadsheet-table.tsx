import './sim-spreadsheet-table.scss';
import { useEffect, useState, useCallback, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, themeQuartz, type ColumnState, type GridReadyEvent, type IRowNode } from 'ag-grid-community';
import { getQualityClass, round } from '@core/shared/utils';
import { FunnelSimpleIcon, PushPinIcon, XIcon } from '@phosphor-icons/react';
import { useStore } from '@core/shared/store';
import clsx from 'clsx';
import { GetArmorType, GetWeaponType, ItemType } from '@core/shared/enums';
import SimModal from '@components/sim-modal/sim-modal';

ModuleRegistry.registerModules([AllCommunityModule]);

const global = globalThis as any;
type FilterField =
	| 'name'
	| 'ilvl'
	| 'dps'
	| 'stats.str'
	| 'stats.agi'
	| 'stats.sta'
	| 'stats.melee_ap'
	| 'stats.hit_rate'
	| 'stats.crit_rate'
	| 'type';
type FilterOperator = 'contains' | 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'greaterThanOrEqual' | 'lessThanOrEqual';
type TableFilter = { id: number; field: FilterField; operator: FilterOperator; value: string; slot: string; hidden?: boolean };

const filterFields: { value: FilterField; label: string; numeric: boolean }[] = [
	{ value: 'name', label: 'Name', numeric: false },
	{ value: 'ilvl', label: 'Item level', numeric: true },
	{ value: 'dps', label: 'DPS', numeric: true },
	{ value: 'stats.str', label: 'Strength', numeric: true },
	{ value: 'stats.agi', label: 'Agility', numeric: true },
	{ value: 'stats.sta', label: 'Stamina', numeric: true },
	{ value: 'stats.melee_ap', label: 'Attack power', numeric: true },
	{ value: 'stats.hit_rate', label: 'Hit', numeric: true },
	{ value: 'stats.crit_rate', label: 'Crit', numeric: true },
	{ value: 'type', label: 'Type', numeric: false },
];

const textOperators: { value: FilterOperator; label: string }[] = [
	{ value: 'contains', label: 'includes' },
	{ value: 'equals', label: 'is' },
	{ value: 'notEquals', label: 'is not' },
];

const numericOperators: { value: FilterOperator; label: string }[] = [
	{ value: 'equals', label: '=' },
	{ value: 'notEquals', label: '!=' },
	{ value: 'greaterThan', label: '>' },
	{ value: 'greaterThanOrEqual', label: '>=' },
	{ value: 'lessThan', label: '<' },
	{ value: 'lessThanOrEqual', label: '<=' },
];

function SimSpreadsheetTable(props: { dashboard: boolean }) {
	const store = useStore();
	const {
		slot,
		getItems,
		getEnchants,
		getPlayerLevel,
		clearSlot,
		setEnchant,
		setItem,
		getSettings,
		getSetting,
		getActions,
		getTalents,
		getBuffs,
		getAbilities,
		getPlayerClassId,
	} = store;
	const progressBarRef = useRef(null);
	const spreadsheetTableRef = useRef(null);
	const [filters, setFilters] = useState<TableFilter[]>(() => ((globalThis as any).templateFilters ?? []) as TableFilter[]);
	const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
	const [filterField, setFilterField] = useState<FilterField>('name');
	const [filterOperator, setFilterOperator] = useState<FilterOperator>('contains');
	const [filterValue, setFilterValue] = useState('');
	let classid = getPlayerClassId();
	let items = getItems();
	let enchants = getEnchants();
	let settings = getSettings();
	let actions = getActions();
	let talents = getTalents();
	let buffs = getBuffs();
	let abilities = getAbilities();
	let currentIterations = 2000;
	let updateInterval = 0;
	const baselineDps = useRef(0);

	const defaultColDef = [
		{
			maxWidth: 60,
			headerName: '',

			cellRenderer: function (params: any) {
				return (
					<>
						<PushPinIcon
							weight={params.data.pinned ? 'fill' : 'regular'}
							style={{ cursor: 'pointer' }}
							onClick={() => pinItem(params.data, params.node.id)}></PushPinIcon>
						<a
							href={`https://forever.wowhead.com/${slot.indexOf('enchant') == -1 ? 'item' : 'spell'}=${params.data.id}${
								params.data.rand ? '&rand=' + params.data.rand : ''
							}`}
							className="wh-tooltip"
							data-id={params.data.id}
							onClick={e => {
								e.preventDefault();
								selectItem(params.data);
							}}></a>
					</>
				);
			},
		},
		{
			field: 'ilvl',
			maxWidth: 60,
			headerName: 'ilvl',
			cellRenderer: function (params: any) {
				return (
					<>
						<span>{params.data.ilvl}</span>
					</>
				);
			},
		},
		{
			field: 'name',
			flex: 5,
			cellRenderer: function (params: any) {
				return (
					<>
						<span className={getQualityClass(params.data.quality)}>{params.data.name}</span>
					</>
				);
			},
		},
		// { field: 'proc.spell', headerName: 'proc' },
		// { field: 'useSpell', headerName: 'use spell' },

		{ field: 'stats.str', headerName: 'Str' },
		{ field: 'stats.agi', headerName: 'Agi' },
		{ field: 'stats.sta', headerName: 'Sta' },
		{ field: 'stats.melee_ap', headerName: 'AP' },
		{
			field: 'stats.hit_rate',
			headerName: 'Hit',
		},
		{
			field: 'stats.crit_rate',
			headerName: 'Crit',
		},
		{
			field: 'type',
			headerName: 'Type',
			valueGetter: (p: any) => {
				return p.data.classId == ItemType.Armor ? GetArmorType(p.data.subclassId) : GetWeaponType(p.data.subclassId);
			},
		},
		{
			id: 'dps',
			field: 'dps',
			headerName: 'DPS',
			flex: 1.2,
			sort: 'desc',
			cellRenderer: function (params: any) {
				if (baselineDps.current) params.data.baseline = baselineDps.current;
				return <span className={`cell-dps ${params.data.baseline > params.data.dps ? 'down' : 'up'}`}>{params.data.dps}</span>;
			},
		},
	];
	const [colDefs, setColDefs]: any[] = useState(defaultColDef);

	useEffect(() => {
		setColDefs(defaultColDef);
	}, [slot]);

	const myTheme = themeQuartz.withParams({
		accentColor: '#0086F4',
		selectedRowBackgroundColor: 'rgba(19, 49, 65)',
		backgroundColor: 'transparent',
		borderColor: 'hsla(220, 20%, 25%, 0.6)',
		browserColorScheme: 'dark',
		fontSize: 12,
		foregroundColor: 'white',
		headerBackgroundColor: 'hsl(220, 30%, 6%)',
		headerFontSize: 12,
		headerFontWeight: 700,
		headerTextColor: 'white',
		rowVerticalPaddingScale: 1,
		spacing: 5,
		wrapperBorder: false,
		wrapperBorderRadius: 0,
		columnBorder: false,
		sidePanelBorder: false,
		menuBackgroundColor: 'hsl(220, 30%, 6%)',
		oddRowBackgroundColor: 'hsl(220, 30%, 6%)',
		pickerListBackgroundColor: 'hsl(220, 30%, 6%)',
		widgetContainerHorizontalPadding: '12px',
		widgetContainerVerticalPadding: '12px',
		inputHeight: '30px',
		listItemHeight: '30px',
		rangeSelectionBorderColor: 'transparent',
	});

	const defaultSortModel: ColumnState[] = [
		{ colId: 'dps', sort: 'desc', sortIndex: 0 },
		{ colId: 'ilvl', sort: 'desc', sortIndex: 1 },
	];

	const gridOptions = {
		animateRows: false,
		enableRowPinning: true,
		getRowId: (params: any) => params.data.id.toString(),
		getRowClass: (params: any) => {
			if (params.data.selected) return 'ag-row-selected';
		},
		onGridReady: (event: GridReadyEvent) => {
			global.gridApi = event.api;
			global.gridApi.applyColumnState({ state: defaultSortModel });
		},
	};

	const isRowPinned = (rowNode: any) => {
		return rowNode.data.pinned ? 'top' : null;
	};

	function pinItem(item: any, id: string) {
		item.pinned = !item.pinned;

		let newItem = { id: item.id, path: item.path, selected: item.selected, pinned: item.pinned, acquired: item.acquired };
		if (slot.includes('enchant')) setEnchant(slot, item.id, newItem);
		else setItem(slot, item.id, newItem);

		global.gridApi.setGridOption('isRowPinned', (rowNode: any) => {
			return rowNode.data.pinned ? 'top' : null;
		});
		global.gridApi.redrawRows({ rowNodes: [global.gridApi.getRowNode(id.replace(/^\D+/g, '')) as IRowNode<any>] });
	}

	function selectItem(item: any) {
		if (item.selected) {
			item.selected = false;
		} else {
			clearSlot(slot);
			if (slot == 'mainhand' || slot == 'offhand') clearSlot('twohand');
			if (slot == 'twohand') {
				clearSlot('mainhand');
				clearSlot('offhand');
			}
			item.selected = true;
		}
		let newItem = { id: item.id, path: item.path, selected: item.selected, pinned: item.pinned, acquired: item.acquired } as any;
		if (item.rand) newItem.rand = item.rand;

		if (slot.includes('enchant')) setEnchant(slot, item.id, newItem);
		else setItem(slot, item.id, newItem);

		global.gridApi.redrawRows();
	}

	const onFilterTextBoxChanged = useCallback(() => {
		global.gridApi.setGridOption('quickFilterText', (document.getElementById('quick-filter') as HTMLInputElement).value);
	}, []);

	function getItemData() {
		let level = getPlayerLevel();
		let list = slot.includes('enchant') ? enchants : items;
		const availableItems = list[slot].filter((item: any) => !item.requires || level >= item.requires || item.selected || item.pinned);
		return availableItems.filter(itemMatchesFilters);
	}

	function getFilteredCollections() {
		const filteredItems = getItemData();
		if (slot.includes('enchant')) return { items, enchants: { ...enchants, [slot]: filteredItems } };
		return { items: { ...items, [slot]: filteredItems }, enchants };
	}

	function getFilterValue(item: any, field: FilterField): string | number {
		if (field === 'type') return item.classId == ItemType.Armor ? GetArmorType(item.subclassId) : GetWeaponType(item.subclassId);
		if (field.startsWith('stats.')) {
			const stat = field.slice(6);
			const value = item.stats?.[stat];
			return Array.isArray(value) ? value[1] : value || 0;
		}
		return item[field] ?? '';
	}

	function itemMatchesFilters(item: any) {
		return filters.every(activeFilter => {
			if (activeFilter.slot !== slot) return true;
			const actual = getFilterValue(item, activeFilter.field);
			if (activeFilter.operator === 'contains') return String(actual).toLowerCase().includes(activeFilter.value.toLowerCase());
			if (activeFilter.operator === 'equals') return String(actual).toLowerCase() === activeFilter.value.toLowerCase();
			if (activeFilter.operator === 'notEquals') return String(actual).toLowerCase() !== activeFilter.value.toLowerCase();
			const actualNumber = Number(actual);
			const filterNumber = Number(activeFilter.value);
			if (Number.isNaN(actualNumber) || Number.isNaN(filterNumber)) return false;
			if (activeFilter.operator === 'greaterThan') return actualNumber > filterNumber;
			if (activeFilter.operator === 'greaterThanOrEqual') return actualNumber >= filterNumber;
			if (activeFilter.operator === 'lessThan') return actualNumber < filterNumber;
			return actualNumber <= filterNumber;
		});
	}

	function addFilter() {
		if (!filterValue.trim()) return;
		setFilters(current => [...current, { id: Date.now(), field: filterField, operator: filterOperator, value: filterValue.trim(), slot }]);
		setFilterValue('');
		setIsFilterModalOpen(false);
	}

	function removeFilter(id: number) {
		setFilters(current => current.filter(activeFilter => activeFilter.id !== id));
	}

	function formatFilter(filter: TableFilter) {
		const field = filterFields.find(option => option.value === filter.field);
		const operator = [...textOperators, ...numericOperators].find(option => option.value === filter.operator);
		return `${field?.label} ${operator?.label} ${filter.value}`;
	}

	function getBaseLine(callback: any) {
		if (!spreadsheetTableRef.current) return;
		(spreadsheetTableRef.current as HTMLElement).classList.add('loading');
		(globalThis as any).workers.start(
			{
				classid: getPlayerClassId(),
				settings: getSettings(),
				actions: getActions(),
				items: getItems(),
				enchants: getEnchants(),
				talents: getTalents(),
				buffs: getBuffs(),
				abilities: getAbilities(),
			},
			(_states: any[]) => {},
			(states: any[]) => {
				let totalduration = 0;
				let totaldmg = 0;
				states.forEach(s => {
					totalduration += s.duration;
					totaldmg += s.dmg;
				});
				baselineDps.current = round(totaldmg / totalduration);
				callback();
			},
		);
	}

	function simAll(threshold: number) {
		getBaseLine(function () {
			const filteredCollections = getFilteredCollections();
			let data = {
				classid,
				settings,
				actions,
				items: filteredCollections.items,
				enchants: filteredCollections.enchants,
				talents,
				buffs,
				abilities,
				test_slot: slot,
				threshold,
			} as any;

			if (!threshold) {
				let length = getItemData().length;
				if (length <= 10) currentIterations = Math.max(10000, Number(getSetting('simulations').value));
				else if (length <= 20) currentIterations = 6000;
				else if (length <= 50) currentIterations = 4000;
				else currentIterations = 2000;
				updateInterval = setInterval(updateProgressBar, 2);
			}

			global.workers.compareItems(data, currentIterations, update, finish_all);
		});
	}

	function simPinned() {
		getBaseLine(function () {
			const filteredCollections = getFilteredCollections();
			let itemData = getItemData();
			if (itemData.filter((item: any) => item.pinned).length == 0) return;

			updateInterval = setInterval(updateProgressBar, 2);

			let data = {
				classid,
				settings,
				actions,
				items: filteredCollections.items,
				enchants: filteredCollections.enchants,
				talents,
				buffs,
				abilities,
				test_slot: slot,
				pinned: true,
			} as any;

			global.workers.compareItems(data, Number(getSetting('simulations').value), update, finish_pinned);
		});
	}

	function simPageOne() {
		getBaseLine(function () {
			updateInterval = setInterval(updateProgressBar, 2);
			const filteredCollections = getFilteredCollections();

			const pageSize = global.gridApi.paginationGetPageSize();
			const pageOneItems = [];
			for (let rowIndex = 0; rowIndex < pageSize; rowIndex++) {
				const rowNode = global.gridApi.getDisplayedRowAtIndex(rowIndex);
				if (!rowNode) break;
				pageOneItems.push(rowNode.data);
			}
			const itemsFiltered = slot.includes('enchant') ? filteredCollections.items : { ...filteredCollections.items, [slot]: pageOneItems };
			const enchantsFiltered = slot.includes('enchant') ? { ...filteredCollections.enchants, [slot]: pageOneItems } : filteredCollections.enchants;

			let data = {
				classid,
				settings,
				actions,
				items: itemsFiltered,
				enchants: enchantsFiltered,
				talents,
				buffs,
				abilities,
				test_slot: slot,
			} as any;

			global.workers.compareItems(data, Number(getSetting('simulations').value), update, finish_pinned);
		});
	}

	function update(states: any[]) {
		let list = slot.includes('enchant') ? enchants[slot] : items[slot];
		for (let item of list) {
			for (let state of states) {
				if (item.id == state.test_itemId) {
					const rowNode = global.gridApi!.getRowNode(item.id.toString());
					if (rowNode) {
						rowNode.setDataValue('dps', round(state.dmg / state.duration));
					}
				}
			}
		}
	}

	function updateProgressBar() {
		// if (!progressBarRef.current) return;
		// let total = 0;
		// global.workers.states.forEach((a: any) => (total += a.progress));
		// let progress =
		// 	(global.workers.counter - global.workers.maxWorkers) / global.workers.maxCounter +
		// 	total / global.workers.maxWorkers / (global.workers.maxCounter / global.workers.maxWorkers);
		// let progressBar = progressBarRef.current as HTMLElement;
		// progressBar.style.display = 'block';
		// (progressBar.children[0] as HTMLElement).style.width = round(progress * 100) + '%';
	}

	function hideProgressBar() {
		// if (!progressBarRef.current) return;
		// (progressBarRef.current as HTMLElement).style.display = 'none';
		if (!spreadsheetTableRef.current) return;
		(spreadsheetTableRef.current as HTMLElement).classList.remove('loading');
	}

	function finish_all(states: any[]) {
		update(states);
		global.gridApi.applyColumnState({ state: defaultSortModel });
		global.gridApi!.resetColumnState();

		// 100 sims on all
		// 1000 on top 50
		// 5000 on top 20
		// full on top 10
		if (currentIterations == 2000) {
			currentIterations = 4000;
			simAll(getThreshold(50));
		} else if (currentIterations == 4000) {
			currentIterations = 6000;
			simAll(getThreshold(20));
		} else if (currentIterations == 6000) {
			currentIterations = Math.max(10000, Number(getSetting('simulations').value));
			simAll(getThreshold(10));
		} else {
			clearInterval(updateInterval);
			hideProgressBar();
			if (!spreadsheetTableRef.current) return;
			(spreadsheetTableRef.current as HTMLElement).classList.remove('loading');
		}
	}

	function getThreshold(top: number) {
		let dps = [];
		let itemList = slot.includes('enchant') ? enchants[slot] : items[slot];
		for (let item of itemList) if (item.dps) dps.push(item.dps);
		dps = dps.sort((a, b) => b - a);
		if (top >= dps.length) top = dps.length - 1;
		return ~~dps[top];
	}

	function finish_pinned(states: any[]) {
		update(states);
		clearInterval(updateInterval);
		hideProgressBar();
		global.gridApi.applyColumnState({ state: defaultSortModel });
		global.gridApi!.resetColumnState();
	}

	const visibleFilters = filters.filter(filter => !filter.hidden && filter.slot === slot);

	return (
		<div className="sim-spreadsheet-table" ref={spreadsheetTableRef}>
			<div className="loader-container">
				<span className="loader"></span>
			</div>
			<div className="buttons">
				<button onClick={simPinned}>Sim Pinned</button>
				<button onClick={simPageOne}>Sim Page 1</button>
				<button onClick={() => simAll(0)}>Sim All</button>
				<button onClick={() => setIsFilterModalOpen(true)}>
					<FunnelSimpleIcon size={14} />
					Add Filter
				</button>
				<input type="text" id="quick-filter" placeholder="Search" onInput={onFilterTextBoxChanged} />
			</div>
			<div className="progress-bar" ref={progressBarRef}>
				<div></div>
			</div>
			<div className="filters-bar">
				{visibleFilters.map(filter => (
					<div className="filter" key={filter.id}>
						<span>{formatFilter(filter)}</span>
						<button aria-label={`Remove ${formatFilter(filter)}`} onClick={() => removeFilter(filter.id)}>
							<XIcon size={12} weight="bold" />
						</button>
					</div>
				))}
				{visibleFilters.length === 0 && <span className="empty">&nbsp;No filters applied</span>}
			</div>
			<SimModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)}>
				<div className="filter-modal">
					<h3>Add Filter</h3>
					<label>
						Field
						<select
							value={filterField}
							onChange={event => {
								const nextField = event.currentTarget.value as FilterField;
								setFilterField(nextField);
								setFilterOperator(filterFields.find(field => field.value === nextField)?.numeric ? 'greaterThan' : 'contains');
							}}>
							{filterFields.map(field => (
								<option key={field.value} value={field.value}>
									{field.label}
								</option>
							))}
						</select>
					</label>
					<label>
						Condition
						<select value={filterOperator} onChange={event => setFilterOperator(event.currentTarget.value as FilterOperator)}>
							{(filterFields.find(field => field.value === filterField)?.numeric ? numericOperators : textOperators).map(operator => (
								<option key={operator.value} value={operator.value}>
									{operator.label}
								</option>
							))}
						</select>
					</label>
					<label>
						Value
						<input
							autoFocus
							value={filterValue}
							onChange={event => setFilterValue(event.currentTarget.value)}
							onKeyDown={event => event.key === 'Enter' && addFilter()}
						/>
					</label>
					<div className="filter-modal-actions">
						<button onClick={() => setIsFilterModalOpen(false)}>Cancel</button>
						<button className="primary" onClick={addFilter} disabled={!filterValue.trim()}>
							Add Filter
						</button>
					</div>
				</div>
			</SimModal>
			<div className={clsx('container', props.dashboard && 'dashboard')}>
				<AgGridReact
					theme={myTheme}
					columnDefs={colDefs}
					rowData={getItemData()}
					pagination={true}
					paginationAutoPageSize={true}
					gridOptions={gridOptions}
					defaultColDef={{ flex: 1 }}
					isRowPinned={isRowPinned}
				/>
			</div>
		</div>
	);
}

export default SimSpreadsheetTable;
