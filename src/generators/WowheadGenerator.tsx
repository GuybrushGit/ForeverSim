import { useState } from 'react';
import type { Item, ItemsObject, Stats } from '@core/shared/types';
import { InventoryType, ItemQuality, ItemType, SpellSchool } from '@core/shared/enums';
import gearPlannerUrl from './data/gear-planner.js?url';

const ITEM_DATA_KEY = 'wow.gearPlanner.classicplus.item';

type WowheadItem = {
	id: number;
	class: number;
	subclass: number;
	name: string;
	quality: number;
	classMask?: number;
	icon: string;
	inventoryType: number;
	itemLevel: number;
	requiredLevel?: number;
	displayId?: number;
	stats?: Record<string, number>;
};

function Loading() {
	return (
		<div className="loader-container">
			<span className="loader"></span>
		</div>
	);
}

async function saveFile(blob: any) {
	const a = document.createElement('a');
	a.download = 'items_wowhead.ts';
	a.href = URL.createObjectURL(blob);
	a.addEventListener('click', () => {
		setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
	});
	a.click();
}

function loadWowheadItems(): Promise<Record<string, WowheadItem>> {
	return new Promise((resolve, reject) => {
		const windowWithWowhead = window as any;
		const previousWowhead = windowWithWowhead.WH;
		const wowhead = previousWowhead || {};
		const previousSetPageData = wowhead.setPageData;
		let items: Record<string, WowheadItem> | undefined;
		const script = document.createElement('script');
		const timeout = window.setTimeout(() => finish(new Error('Timed out loading Wowhead item data')), 30000);

		function finish(error?: Error) {
			window.clearTimeout(timeout);
			script.remove();
			if (previousSetPageData) wowhead.setPageData = previousSetPageData;
			else delete wowhead.setPageData;
			if (previousWowhead) windowWithWowhead.WH = previousWowhead;
			else delete windowWithWowhead.WH;
			if (error) reject(error);
			else if (items) resolve(items);
			else reject(new Error('Wowhead response did not contain item data'));
		}

		wowhead.setPageData = (key: string, data: Record<string, WowheadItem>) => {
			if (key === ITEM_DATA_KEY) items = data;
			else if (previousSetPageData) previousSetPageData.call(wowhead, key, data);
		};
		windowWithWowhead.WH = wowhead;
		script.src = gearPlannerUrl;
		script.onload = () => finish();
		script.onerror = () => finish(new Error('Failed to download Wowhead item data'));
		document.head.appendChild(script);
	});
}

function getGearSlots(inventoryType: number): (keyof ItemsObject)[] {
	switch (inventoryType) {
		case InventoryType.Head:
			return ['head'];
		case InventoryType.Neck:
			return ['neck'];
		case InventoryType.Shoulder:
			return ['shoulder'];
		case InventoryType.Back:
			return ['back'];
		case InventoryType.Chest:
		case InventoryType.Robe:
			return ['chest'];
		case InventoryType.Waist:
			return ['waist'];
		case InventoryType.Legs:
			return ['legs'];
		case InventoryType.Feet:
			return ['feet'];
		case InventoryType.Wrists:
			return ['wrists'];
		case InventoryType.Hands:
			return ['hands'];
		case InventoryType.Ring:
			return ['finger1', 'finger2'];
		case InventoryType.Trinket:
			return ['trinket1', 'trinket2'];
		case InventoryType.Onehand:
			return ['mainhand', 'offhand'];
		case InventoryType.Shield:
		case InventoryType.Offhand:
			return ['offhand'];
		case InventoryType.Bow:
		case InventoryType.Ranged:
			return ['ranged'];
		case InventoryType.Twohand:
			return ['twohand'];
		case InventoryType.Mainhand:
			return ['mainhand'];
		default:
			return [];
	}
}

function toItemStats(wowheadStats: WowheadItem['stats']): Stats {
	const stats: Stats = {};
	const statFields: Record<string, string> = {
		agi: 'agi',
		str: 'str',
		sta: 'sta',
		int: 'int',
		spi: 'spi',
		atkpwr: 'melee_ap',
		rgdatkpwr: 'ranged_ap',
		hitrtng: 'hit_rate',
		critstrkrtng: 'crit_rate',
		dodgertng: 'dodge_rate',
		parryrtng: 'parry_rate',
		blockrtng: 'block_rate',
		exprtng: 'expertise_rate',
		defrtng: 'defense',
		hastertng: 'haste_rate',
	};

	for (const [wowheadStat, simStat] of Object.entries(statFields)) {
		const value = Number(wowheadStats?.[wowheadStat] || 0);
		if (value) (stats as any)[simStat] = value;
	}

	const armor = Number(wowheadStats?.armor || 0) + Number(wowheadStats?.armorbonus || 0);
	if (armor) stats.armor = armor;

	const resistances: [string, number][] = [
		['arcres', SpellSchool.Arcane],
		['firres', SpellSchool.Fire],
		['frores', SpellSchool.Frost],
		['holres', SpellSchool.Holy],
		['natres', SpellSchool.Nature],
	];
	for (const [wowheadStat, school] of resistances) {
		const value = Number(wowheadStats?.[wowheadStat] || 0);
		if (value) {
			stats.resistance ??= Array(8).fill(0);
			stats.resistance[school] = value;
		}
	}

	const spellDamage = Number(wowheadStats?.spldmg || 0);
	if (spellDamage) {
		stats.dmg_done_mod = Array(8).fill(0);
		for (const school of [SpellSchool.Arcane, SpellSchool.Fire, SpellSchool.Frost, SpellSchool.Shadow, SpellSchool.Nature, SpellSchool.Holy]) {
			stats.dmg_done_mod[school] = spellDamage;
		}
	}

	return stats;
}

export default function WowheadGenerator() {
	const [working, setWorking] = useState(false);

	async function generateData() {
		setWorking(true);
		try {
			const [wowheadItems] = await Promise.all([loadWowheadItems()]);
			const newGear: ItemsObject = {
				head: [],
				neck: [],
				shoulder: [],
				back: [],
				chest: [],
				wrists: [],
				hands: [],
				waist: [],
				legs: [],
				feet: [],
				finger1: [],
				finger2: [],
				trinket1: [],
				trinket2: [],
				ranged: [],
				mainhand: [],
				offhand: [],
				twohand: [],
			};

			for (const rawItem of Object.values(wowheadItems)) {
				const id = Number(rawItem.id);
				if (rawItem.classMask !== undefined && rawItem.classMask !== 1) continue;
				if (rawItem.class !== ItemType.Armor && rawItem.class !== ItemType.Weapon) continue;
				if (rawItem.quality <= ItemQuality.Common) continue;

				const slots = getGearSlots(rawItem.inventoryType);
				if (!slots.length) continue;

				const wowheadStats = rawItem.stats;
				const item: Item = {
					id,
					classId: Number(rawItem.class),
					subclassId: Number(rawItem.subclass),
					slot: Number(rawItem.inventoryType),
					requires: Number(rawItem.requiredLevel || 0),
					quality: Number(rawItem.quality),
					ilvl: Number(rawItem.itemLevel),
					name: rawItem.name,
					path: rawItem.icon,
					displayid: Number(rawItem.displayId || 0),
					stats: toItemStats(wowheadStats),
				};
				const speed = Number(wowheadStats?.speed || wowheadStats?.mlespeed || wowheadStats?.rgdspeed || 0);
				const mindmg = Number(wowheadStats?.damageMinAll || wowheadStats?.mledmgmin || wowheadStats?.rgddmgmin || 0);
				const maxdmg = Number(wowheadStats?.damageMaxAll || wowheadStats?.mledmgmax || wowheadStats?.rgddmgmax || 0);
				if (speed) item.speed = speed;
				if (mindmg) item.mindmg = mindmg;
				if (maxdmg) item.maxdmg = maxdmg;
				for (const slot of slots) newGear[slot].push(item);
			}

			let str = "import type { ItemsObject } from '@core/shared/types';const templateItems = ";
			str += JSON.stringify(newGear, null, 2);
			str += ' as ItemsObject;export default templateItems;';
			const blob = new Blob([str], { type: 'text/typescript' });
			saveFile(blob);
		} catch (error) {
			console.error(error);
			window.alert(error instanceof Error ? error.message : 'Failed to generate Wowhead item data');
		} finally {
			setWorking(false);
		}
	}

	return (
		<>
			{working && <Loading />}
			{!working && (
				<div style={{ width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
					<button onClick={generateData}>Generate Data</button>
				</div>
			)}
		</>
	);
}
