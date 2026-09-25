import './sim-talents.scss';
import SimTalentsTree from './sim-talents-tree';
import { ArrowCounterClockwiseIcon, DownloadSimpleIcon } from '@phosphor-icons/react';
import type { TalentsTree, TalentsObject, PresetObject } from '@core/shared/types';
import { SimMenu, SimMenuItem } from '@components/sim-menu/sim-menu';
import { useStore } from '@core/shared/store';

function SimTalents() {
	const store = useStore();
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
	talents.forEach((tree: TalentsTree) => tree.t.forEach((obj: TalentsObject) => (total += obj.c)));

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

				<div className="points">
					<p>
						Points left: <span>{Math.max(level - 9 - total, 0)}</span>
					</p>
				</div>
			</div>
			<div className="trees">
				{talents.map((tree: any) => {
					return <SimTalentsTree key={tree.n} label={tree.n} objects={tree.t} allTotal={total}></SimTalentsTree>;
				})}
			</div>
		</div>
	);
}

export default SimTalents;
