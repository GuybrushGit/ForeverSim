import './sim-dashboard-paperdoll.scss';
import SimIcon from '@components/sim-icon/sim-icon';
import { CheckCircleIcon } from '@phosphor-icons/react';
import clsx from 'clsx';
import SimDashboardStats from './sim-dashboard-stats';
import { useStore } from '@core/shared/store';
import { SimTabs, SimTabsItem } from '@components/sim-tabs/sim-tabs';
import { useState } from 'react';
import { Player } from '@core/game/player';
import { getTargetArray, Target } from '@core/game/target';
import { Encounter } from '@core/game/encounter';
import { Simulation } from '@core/simulation';

function SimDashboardPaperdoll(props: { statWeights: boolean; setStatWeights: any }) {
	const store = useStore();
	const { getPlayerClassId, getItems, getEnchants, getItemSet, setItem, setSlot, getSettings, getActions, getTalents, getBuffs, getAbilities, slot } =
		store;
	let itemSlot = slot;

	let data = {
		classid: getPlayerClassId(),
		settings: getSettings(),
		actions: getActions(),
		items: getItems(),
		enchants: getEnchants(),
		talents: getTalents(),
		buffs: getBuffs(),
		abilities: getAbilities(),
	};

	const [tab, setTab] = useState(0);
	let items = getItems();
	let enchants = getEnchants();

	const encounter = new Encounter(data);
	const player = new Player(data);
	const targets: Target[] = getTargetArray(data, player);
	const sim = new Simulation(encounter, targets, player);
	console.log(sim);

	function handleClick(slot: string) {
		if (slot == 'shirt' || slot == 'tabard') return;
		props.setStatWeights(false);
		setSlot(slot);
	}

	function setAcquired(item: any, slot: string, event: any) {
		event.stopPropagation();
		item.acquired = !item.acquired;
		let newItem = { id: item.id, path: item.path, selected: item.selected, pinned: item.pinned, acquired: item.acquired };
		setItem(slot, item.id, newItem);
	}

	function buildSlot(slot: string) {
		let slotpath = slot.replace(/\d+/g, '');
		if (slot == 'back') slotpath = 'chest';
		if (slot == 'twohand') slotpath = 'mainhand';
		let img = `https://wow.zamimg.com/images/wow/icons/medium/inventoryslot_${slotpath}.jpg`;
		let item;
		let child;
		let tempchild;

		for (let i in items[slot]) {
			if (items[slot][i].selected) item = items[slot][i];
		}

		let pieces = [];
		let itemSet = item && getItemSet(item.id);
		if (item && itemSet) {
			for (let slot in items) {
				for (let obj of items[slot]) {
					if (obj.selected && itemSet.items.includes(obj.id)) pieces.push(obj.id);
				}
			}
		}

		let enchantslot = slot + '_enchant';
		let hasEnchant = !!enchants[enchantslot];
		if (hasEnchant) {
			for (let i in enchants[enchantslot]) {
				if (enchants[enchantslot][i].selected) child = enchants[enchantslot][i];
			}
		}

		let tempenchantslot = slot + '_tempenchant';
		let hasTempEnchant = !!enchants[tempenchantslot];
		if (hasTempEnchant) {
			for (let i in enchants[tempenchantslot]) {
				if (enchants[tempenchantslot][i].selected) tempchild = enchants[tempenchantslot][i];
			}
		}

		return (
			<div
				className={clsx('icon-container', item && item.acquired && 'acquired', !props.statWeights && itemSlot.indexOf(slot) > -1 && 'slot-selected')}>
				{getIcon(item, slot, img, false, child && child.enchant, pieces.join(':'))}
				{item && hasEnchant && getIcon(child, slot + '_enchant', 'https://wow.zamimg.com/images/wow/icons/medium/inventoryslot_enchant.jpg', true)}
				{item &&
					hasTempEnchant &&
					getIcon(tempchild, slot + '_tempenchant', 'https://wow.zamimg.com/images/wow/icons/medium/inventoryslot_enchant.jpg', true)}
				{item && <CheckCircleIcon size={18} weight="bold" onClick={e => setAcquired(item, slot, e)} className="icon-acquired"></CheckCircleIcon>}
			</div>
		);
	}

	function getIcon(item: any, slot: string, img: string, child: boolean, enchant?: string, pieces?: string) {
		if (item && slot.indexOf('_enchant') > -1) item.path = 'spell_holy_greaterheal';
		if (item && slot.indexOf('_tempenchant') > -1) item.path = 'inv_stone_sharpeningstone_05';
		if (item) {
			return (
				<SimIcon
					child={child}
					id={item.id}
					item={slot.indexOf('enchant') == -1}
					rand={item.rand}
					ench={enchant}
					pieces={pieces}
					name={item.name}
					img={item.path}
					greyed={false}
					handleClick={() => handleClick(slot)}></SimIcon>
			);
		}
		return <SimIcon child={child} name={slot} fullimg={img} greyed={false} handleClick={() => handleClick(slot)}></SimIcon>;
	}

	return (
		<div className="sim-dashboard-paperdoll">
			<div className="top-button">
				<button className={props.statWeights ? 'selected' : ''} onClick={() => props.setStatWeights(true)}>
					Stat Weights
				</button>
			</div>
			<div>
				<div className="left">
					{buildSlot('head')}
					{buildSlot('neck')}
					{buildSlot('shoulder')}
					{buildSlot('back')}
					{buildSlot('chest')}
					{buildSlot('shirt')}
					{buildSlot('tabard')}
					{buildSlot('wrists')}
				</div>
				<div className="center">
					<SimTabs>
						<SimTabsItem text="Base Stats" selected={tab == 0} handleClick={() => setTab(0)}></SimTabsItem>
						<SimTabsItem text="Defensive" selected={tab == 1} handleClick={() => setTab(1)}></SimTabsItem>
						<SimTabsItem text="Weapons" selected={tab == 2} handleClick={() => setTab(2)}></SimTabsItem>
					</SimTabs>
					{tab == 0 && <SimDashboardStats type="base" sim={sim}></SimDashboardStats>}
					{tab == 1 && <SimDashboardStats type="defensive" sim={sim}></SimDashboardStats>}
					{tab == 2 && <SimDashboardStats type="offensive" sim={sim}></SimDashboardStats>}
					<div className="bottom">
						{buildSlot('mainhand')}
						{buildSlot('offhand')}
						{buildSlot('twohand')}
						{buildSlot('ranged')}
					</div>
				</div>
				<div className="right">
					{buildSlot('hands')}
					{buildSlot('waist')}
					{buildSlot('legs')}
					{buildSlot('feet')}
					{buildSlot('finger1')}
					{buildSlot('finger2')}
					{buildSlot('trinket1')}
					{buildSlot('trinket2')}
				</div>
			</div>
		</div>
	);
}

export default SimDashboardPaperdoll;
