import './sim-talents-tree.scss';
import SimTalentsIcon from './sim-talents-icon';
import type { TalentsObject } from '@core/shared/types';
import { useStore } from '@core/shared/store';

function SimTalentsTree(props: { label: string; objects: TalentsObject[]; allTotal: number; restrictions: boolean; removeMode?: boolean }) {
	const store = useStore();
	const { setTalent, getPlayerLevel } = store;

	let treeTotal = 0;
	props.objects.forEach((obj: TalentsObject) => (treeTotal += obj.count));
	let level = getPlayerLevel();

	// Add a talent point
	function talentLeftClick(talent: any) {
		let count = parseInt(talent.count);
		let max = parseInt(talent.ranks.length);
		if (count >= max) return;
		if (props.restrictions) {
			let row = parseInt(talent.row);
			if (treeTotal < row * 5) return;
			if (level - 9 - props.allTotal <= 0) return;
			if (talent.requires.length && props.objects[talent.requires[0]].count < talent.requires[1]) return;
		}
		talent.count = count + 1;
		setTalent(talent.id, talent.count);
	}

	// Remove a talent point
	function talentRightClick(talent: any) {
		let count = parseInt(talent.count);
		if (count <= 0) return;

		// check previous row points
		let valid = true;
		if (props.restrictions) {
			let countArr: any[] = [];
			props.objects.forEach((t: any) => {
				countArr[t.row] = (countArr[t.row] || 0) + t.count;
				if (t.row == talent.row && t.col == talent.col) countArr[t.row]--;
			});
			for (let i = 0; i < countArr.length; i++) {
				countArr[i] += countArr[i - 1] || 0;
			}
			props.objects.forEach((t: any) => {
				if (t.count && t.row * 5 > countArr[t.row - 1]) valid = false;
			});

			// check arrow requirements
			props.objects.forEach((t: any) => {
				if (t.requires && props.objects[t.requires[0]] == talent && t.count) valid = false;
			});
		}

		if (!valid) return;
		talent.count = count - 1;
		setTalent(talent.id, talent.count);
	}

	// Build the talent tree
	function buildRows() {
		const rows = [];
		for (let i = 0; i < 7; i++) {
			let row = [];
			for (let j = 0; j < 4; j++) {
				let cell = <td key={j}></td>;
				props.objects.forEach((talent: any) => {
					if (talent.row == i && talent.col == j)
						cell = (
							<td key={j}>
								<SimTalentsIcon
									data={talent}
									definition={talent.definition}
									count={talent.count}
									greyed={props.restrictions && (treeTotal < talent.row * 5 || level - 9 - props.allTotal <= 0)}
									required={talent.requires && props.objects[talent.requires[0]]}
									handleRightClick={talentRightClick}
									handleLeftClick={props.removeMode ? talentRightClick : talentLeftClick}></SimTalentsIcon>
							</td>
						);
				});
				row.push(cell);
			}
			rows.push(<tr key={i}>{row}</tr>);
		}
		return rows;
	}

	return (
		<div className="sim-talents-tree">
			<table>
				<tbody>{buildRows()}</tbody>
			</table>
			<p className="label">{props.label}</p>
		</div>
	);
}

export default SimTalentsTree;
