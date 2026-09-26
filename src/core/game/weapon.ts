import type { Simulation } from '@core/simulation';
import { ItemType, SpellSchool, SpellType, WeaponType } from '@core/shared/enums';
import { type Item } from '@core/shared/types';
import { rng } from '@core/shared/utils';
import { ProcSpell } from './aura';

export class Weapon {
	index: number;
	mindmg: number;
	maxdmg: number;
	speed: number;
	normSpeed: number;
	type: WeaponType;
	class: ItemType;
	offhand: boolean;
	twohand: boolean;
	procs: ProcSpell[];

	bonuscrit: number = 0;
	bonushit: number = 0;
	bonusdmg: number = 0;
	dmgmod: number = 1;
	armor_penetration: number = 0;
	rage_mod: number = 3.46;

	constructor(item: Item, offhand: boolean, twohand: boolean, templateSpells: any) {
		this.index = offhand ? 1 : 0;
		this.offhand = offhand;
		this.twohand = twohand;
		this.mindmg = item.mindmg || 0;
		this.maxdmg = item.maxdmg || 0;
		this.speed = item.speed || 0;
		this.normSpeed = twohand ? 3.3 : 2.4;
		this.type = item.subclassId as WeaponType;
		this.class = item.classId as ItemType;
		this.dmgmod = offhand ? 0.5 : 1;
		this.procs = [];
		if (this.twohand) this.rage_mod = 4.5;
		if (this.offhand) this.rage_mod /= 2;

		if (item.proc) {
			let chance = item.proc.chance;
			if (!chance) chance = ~~((this.speed * (item.proc.ppm || 1)) / 0.6);
			let spell = templateSpells[item.proc.spell];
			this.procs.push(new ProcSpell(spell, 20, chance, item.proc.cooldown || 0, 0));
		}
	}

	use(speedmod: number): number {
		return ~~((this.speed * 1000) / speedmod);
	}

	getDamage(sim: Simulation) {
		let dmg =
			rng(this.mindmg + this.bonusdmg, this.maxdmg + this.bonusdmg) +
			(sim.final_stats.melee_ap / 14) * this.speed +
			sim.final_stats.dmg_done[SpellSchool.Physical];
		return dmg * this.dmgmod * sim.final_stats.dmg_done_mod[SpellSchool.Physical];
	}

	getAverageDamage(sim: Simulation, target: number) {
		let dmg =
			(this.mindmg + this.bonusdmg + this.maxdmg + this.bonusdmg) / 2 +
			(sim.final_stats.melee_ap / 14) * this.normSpeed +
			sim.final_stats.dmg_done[SpellSchool.Physical];
		dmg = dmg * this.dmgmod * sim.final_stats.dmg_done_mod[SpellSchool.Physical];
		return dmg * (1 - (this.offhand ? sim.target_stats[target].armor_reduction_oh : sim.target_stats[target].armor_reduction_mh));
	}

	getDeepWoundsDamage(sim: Simulation) {
		let dmg =
			(this.mindmg + this.bonusdmg + this.maxdmg + this.bonusdmg) / 2 +
			(sim.final_stats.melee_ap / 14) * this.speed +
			sim.final_stats.dmg_done[SpellSchool.Physical];
		return dmg * this.dmgmod * sim.final_stats.dmg_done_mod[SpellSchool.Physical];
	}

	// Assumed this formula, couldn't find a good explanation of parry haste
	getParryHaste(sim: Simulation, timer: number): number {
		// percentage = time remaining / attack speed
		// If percentage > 60%, reduce timer by 40%
		// If percentage < 60% and > 20%, reduce timer by (percentage - 20%)
		// If percentage < 20% do nothing

		let attackSpeed = ~~((this.speed * 1000) / sim.final_stats.haste[SpellType.Melee]);
		let perc = timer / attackSpeed;
		if (perc >= 0.6) return ~~(timer * 0.6);
		if (perc >= 0.2) return ~~(timer * (1.2 - perc));
		return ~~timer;
	}
}
