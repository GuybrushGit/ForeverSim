import './sim-talents-tree.scss';
import SimTalentsIcon from './sim-talents-icon';
import type { TalentsObject } from '@core/shared/types';
import { useStore } from '@core/shared/store';

function SimTalentsTree(props: { label: string; objects: TalentsObject[]; allTotal: number }) {
	const store = useStore();
	const { setTalent, getPlayerLevel } = store;

	let treeTotal = 0;
	props.objects.forEach((obj: TalentsObject) => (treeTotal += obj.c));
	let level = getPlayerLevel();

	// Add a talent point
	function talentLeftClick(talent: any) {
		let count = parseInt(talent.c);
		let max = parseInt(talent.s.length);
		//let row = parseInt(talent.y);
		if (count >= max) return;
		// if (treeTotal < row * 5) return;
		// if (level - 9 - props.allTotal <= 0) return;
		// if (talent.r && props.objects[talent.r[0]].c < talent.r[1]) return;

		talent.c = count + 1;
		setTalent(talent.i, talent.c);
	}

	// Remove a talent point
	function talentRightClick(talent: any) {
		let count = parseInt(talent.c);
		if (count <= 0) return;

		// check previous row points
		let valid = true;
		// let countArr: any[] = [];
		// props.objects.forEach((t: any) => {
		// 	countArr[t.y] = (countArr[t.y] || 0) + t.c;
		// 	if (t.y == talent.y && t.x == talent.x) countArr[t.y]--;
		// });
		// for (let i = 0; i < countArr.length; i++) {
		// 	countArr[i] += countArr[i - 1] || 0;
		// }
		// props.objects.forEach((t: any) => {
		// 	if (t.c && t.y * 5 > countArr[t.y - 1]) valid = false;
		// });

		// // check arrow requirements
		// props.objects.forEach((t: any) => {
		// 	if (t.r && props.objects[t.r[0]] == talent && t.c) valid = false;
		// });

		if (!valid) return;
		talent.c = count - 1;
		setTalent(talent.i, talent.c);
	}

	// Build the talent tree
	function buildRows() {
		const rows = [];
		for (let i = 0; i < 7; i++) {
			let row = [];
			for (let j = 0; j < 4; j++) {
				let cell = <td key={j}></td>;
				props.objects.forEach((talent: any) => {
					if (talent.y == i && talent.x == j)
						cell = (
							<td key={j}>
								<SimTalentsIcon
									data={talent}
									definition={talent.def}
									count={talent.c}
									greyed={treeTotal < talent.y * 5 || level - 9 - props.allTotal <= 0}
									required={talent.r && props.objects[talent.r[0]]}
									handleRightClick={talentRightClick}
									handleLeftClick={talentLeftClick}></SimTalentsIcon>
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
