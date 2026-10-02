import './sim-talents.scss';
import SimTalentsTree from './sim-talents-tree';
import { ArrowCounterClockwiseIcon, DownloadSimpleIcon, MinusCircleIcon } from '@phosphor-icons/react';
import type { TalentsTree, TalentsObject, PresetObject } from '@core/shared/types';
import { SimMenu, SimMenuItem } from '@components/sim-menu/sim-menu';
import { useStore } from '@core/shared/store';
import { useState } from 'react';
import clsx from 'clsx';

function SimTalents() {
	const store = useStore();
	const [restrictions, setRestrictions] = useState(true);
	const [activeTree, setActiveTree] = useState(0);
	const [removeMode, setRemoveMode] = useState(false);
	const { getTalents, setTalents, getPlayerLevel } = store;
	let talents = getTalents();

	function handleReset() {
		setTalents({});
	}

	function loadPreset(talents: any) {
		setTalents(talents);
	}

	let level = getPlayerLevel();
	let total = 0;
	const treeTotals = talents.map((tree: TalentsTree) => tree.t.reduce((sum: number, obj: TalentsObject) => sum + obj.count, 0));
	treeTotals.forEach((treeTotal: number) => (total += treeTotal));

	return (
		<div className="sim-talents">
			<div className="top">
				<button onClick={handleReset}>
					<ArrowCounterClockwiseIcon size={18}></ArrowCounterClockwiseIcon>
					<p>Reset</p>
				</button>

				<SimMenu icon={<DownloadSimpleIcon size={18}></DownloadSimpleIcon>} text="Load Preset">
					{(globalThis as any).templatePresets.map((preset: PresetObject) => {
						if (preset.type == 'talents') {
							return <SimMenuItem key={preset.name} text={preset.name} handleClick={() => loadPreset(preset.value)}></SimMenuItem>;
						}
					})}
				</SimMenu>

				<label className="restrictions">
					<input type="checkbox" checked={restrictions} onChange={e => setRestrictions(e.target.checked)} />
					<span>Restrictions</span>
				</label>

				<button className={clsx('remove-toggle', removeMode && 'active')} aria-pressed={removeMode} onClick={() => setRemoveMode(!removeMode)}>
					<MinusCircleIcon size={18}></MinusCircleIcon>
					<p>Remove</p>
				</button>

				<div className="points">
					<p>
						Points left: <span>{Math.max(level - 9 - total, 0)}</span>
					</p>
				</div>
			</div>
			<div className="tree-tabs" role="tablist">
				{talents.map((tree: any, index: number) => (
					<button
						key={tree.n}
						role="tab"
						aria-selected={index == activeTree}
						className={clsx(index == activeTree && 'active')}
						onClick={() => setActiveTree(index)}>
						{tree.n}
						<span>{treeTotals[index]}</span>
					</button>
				))}
			</div>
			<div className="trees">
				{talents.map((tree: any, index: number) => {
					return (
						<div key={tree.n} className={clsx('tree-wrapper', index == activeTree && 'active')}>
							<SimTalentsTree label={tree.n} objects={tree.t} allTotal={total} restrictions={restrictions} removeMode={removeMode}></SimTalentsTree>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default SimTalents;
