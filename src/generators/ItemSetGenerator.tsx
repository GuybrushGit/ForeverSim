import { useEffect, useState } from 'react';
import type { ItemSet } from '@core/shared/types';
import templateItems from '@modules/items';

function Loading() {
	return (
		<div className="loader-container">
			<span className="loader"></span>
		</div>
	);
}

async function saveFile(blob: any) {
	const a = document.createElement('a');
	a.download = 'itemsets.ts';
	a.href = URL.createObjectURL(blob);
	a.addEventListener('click', () => {
		setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
	});
	a.click();
}

// #region table management
function loadTable(name: string) {
	return fetch('./src/generators/data/' + name + '.csv')
		.then(response => response.text())
		.then(data => {
			return formatTable(data);
		});
}
function formatTable(data: string): any[] {
	let table = [] as any[];
	var rows = data.split(/\r?\n|\r/);
	var th = rows[0].split(',');
	rows.forEach(row => {
		if (row == rows[0]) return;

		// strip commas inside strings
		let count = 0;
		for (let i = 0; i < row.length; i++) {
			if (row[i] == '"') count++;
			if (row[i] == ',' && count % 2 == 1) {
				row = row.slice(0, i) + row.slice(i + 1);
			}
		}

		let fields = row.split(',');
		let obj = {} as any;
		for (let i = 0; i < fields.length; i++) {
			obj[th[i]] = fields[i];
		}
		table.push(obj);
	});
	return table;
}
// function getRow(table: any, id: string) {
// 	for (let r of table) if (r.ID == id) return r;
// }
function getRows(table: any, column: string, id: string) {
	let result = [];
	for (let r of table) if (r[column] == id) result.push(r);
	return result;
}

// #endregion

export default function ItemSetGenerator() {
	let itemSets: any[], itemSetSpells: any[];

	const [working, setWorking] = useState(false);

	useEffect(() => {
		let promises = [];
		promises.push(loadTable('itemset'));
		promises.push(loadTable('itemsetspell'));

		Promise.all(promises).then(values => {
			itemSets = values[0];
			itemSetSpells = values[1];
		});
	}, []);

	function generateData() {
		var allTheSets = [] as ItemSet[];

		if (!itemSets) {
			setWorking(false);
			return;
		}
		for (let itemSet of itemSets) {
			let obj = {} as ItemSet;
			obj.id = Number(itemSet.ID);
			if (!obj.id || obj.id > 1500) continue; // sod
			obj.items = [];

			for (let i = 0; i < 17; i++) {
				if (Number(itemSet[`ItemID[${i}]`])) obj.items.push(Number(itemSet[`ItemID[${i}]`]));
			}

			if (
				!obj.items.filter(id => {
					for (let s in templateItems) for (let item of templateItems[s as keyof typeof templateItems]) if (item.id == id) return true;
					return false;
				}).length
			) {
				continue;
			}

			let setSpells = getRows(itemSetSpells, 'ItemSetID', itemSet.ID);

			obj.sets = [];
			for (let spell of setSpells) {
				obj.sets.push({ count: Number(spell.Threshold), spell: Number(spell.SpellID) });
			}

			allTheSets.push(obj);
		}

		setWorking(false);
		let str = "import type { ItemSet } from '@core/shared/types';const templateSets = ";
		str += JSON.stringify(allTheSets, null, 2);
		str += ' as ItemSet[];export default templateSets;';
		const blob = new Blob([str], { type: 'application/json' });
		saveFile(blob);
	}

	return (
		<>
			{working && <Loading />}
			{!working && (
				<div style={{ width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
					<button
						onClick={() => {
							setWorking(true);
							setTimeout(() => {
								generateData();
							});
						}}>
						Generate Data
					</button>
				</div>
			)}
		</>
	);
}
