import type { Simulation } from '@core/simulation';
import type { TalentsTree } from '@core/shared/types';

export function getArmorType(type: number): string {
	if (type == 1) return 'Cloth';
	if (type == 2) return 'Leather';
	if (type == 3) return 'Mail';
	if (type == 4) return 'Plate';
	return 'Misc';
}
export function getQualityClass(q: string): string {
	if (q == '2') return 'color-uncommon';
	if (q == '3') return 'color-rare';
	if (q == '4') return 'color-epic';
	if (q == '5') return 'color-legendary';
	if (q == '6') return 'color-artifact';
	return '';
}
export function getSetting(settings: any, id: string): any {
	for (let type in settings) {
		for (let i in settings[type]) {
			if (settings[type][i].id == id) return settings[type][i];
		}
	}
}
export function getBuff(buffs: any, id: number): any {
	for (let type in buffs) {
		for (let i in buffs[type]) {
			if (buffs[type][i].id == id) return buffs[type][i];
		}
	}
}
export function getTalentByName(talents: TalentsTree[], name: string): any {
	for (let tree in talents) {
		for (let tal of talents[tree].t) {
			if (tal.n == name) return tal;
		}
	}
}
export function getMaxSpellLevel(id: number, spells: any, abilities: any[]): number {
	let name, classMask;
	for (let i in spells) {
		if (spells[i].id == id) {
			name = spells[i].name;
			classMask = spells[i].classMask;
		}
		if (spells[i].id != id && spells[i].name == name && classMask == spells[i].classMask) {
			if (abilities.filter(ab => ab.id == spells[i].id).length) return spells[i].baseLevel - 1;
		}
	}
	return 100;
}
export function round(num: number) {
	return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function rng(min: number, max: number) {
	return ~~(Math.random() * (max - min + 1) + min);
}

export function rng10k() {
	return ~~(Math.random() * 10000);
}

export function avg(min: number, max: number) {
	return (min + max) / 2;
}

export function log(sim: Simulation, msg: string) {
	if (sim.encounter.iterations > 1) return;
	let color = 'GoldenRod';
	if (msg.indexOf('Enemy') > -1) color = 'CadetBlue';
	else if (msg.indexOf('attack') > 1 || msg.indexOf('Global') > -1) color = 'Gray';
	else if (msg.indexOf('tick') > 1) color = 'Tomato';
	else if (msg.indexOf(' for ') > -1) color = 'DarkOrchid';
	else if (msg.indexOf('applied') > 1 || msg.indexOf('removed') > -1) color = '#17A8B6';
	console.log(`%c ${(sim.step / 1000).toFixed(3).padStart(6, ' ')} | ${sim.power.toString().padStart(6, ' ')} | ${msg}`, `color: ${color}`);
}
