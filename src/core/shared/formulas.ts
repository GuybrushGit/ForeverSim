import type { Player } from '@core/game/player';
import type { Target } from '@core/game/target';
import type { Weapon } from '@core/game/weapon';
import { round } from './utils';
import type { Simulation } from '@core/simulation';
import { ClassMask, SpellSchool } from './enums';

export function getAgiPerCrit(classid: number, level: number) {
	switch (classid) {
		case ClassMask.Warrior:
			return [
				0.25, 0.2381, 0.2381, 0.2273, 0.2174, 0.2083, 0.2083, 0.2, 0.1923, 0.1923, 0.1852, 0.1786, 0.1667, 0.1613, 0.1563, 0.1515, 0.1471, 0.1389,
				0.1351, 0.1282, 0.1282, 0.125, 0.119, 0.1163, 0.1111, 0.1087, 0.1064, 0.102, 0.1, 0.0962, 0.0943, 0.0926, 0.0893, 0.0877, 0.0847, 0.0833,
				0.082, 0.0794, 0.0781, 0.0758, 0.0735, 0.0725, 0.0704, 0.0694, 0.0676, 0.0667, 0.0649, 0.0633, 0.0625, 0.061, 0.0595, 0.0588, 0.0575, 0.0562,
				0.0549, 0.0543, 0.0532, 0.0521, 0.051, 0.05,
			][level - 1];
		default:
			return 0;
	}
}
export function getIntPerCrit(classid: number, _level: number) {
	switch (classid) {
		case ClassMask.Warrior:
		case ClassMask.Hunter:
		case ClassMask.Rogue:
			return 0;
		case ClassMask.Paladin:
			return 0.01851;
		case ClassMask.Priest:
			return 0.01689;
		case ClassMask.Mage:
		case ClassMask.Shaman:
			return 0.0168;
		case ClassMask.Druid:
			return 0.01666;
		case ClassMask.Warlock:
			return 0.0165;
	}
	return 0;
}
export function getAPPerStrength(classid: number) {
	switch (classid) {
		case ClassMask.Warrior:
		case ClassMask.Paladin:
		case ClassMask.Shaman:
		case ClassMask.Druid:
			return 2;
		case ClassMask.Rogue:
		case ClassMask.Hunter:
		case ClassMask.Mage:
		case ClassMask.Priest:
		case ClassMask.Warlock:
			return 1;
	}
	return 0;
}
export function getRAPPerAgi(classid: number) {
	switch (classid) {
		case ClassMask.Hunter:
			return 2;
		case ClassMask.Warrior:
		case ClassMask.Paladin:
		case ClassMask.Shaman:
		case ClassMask.Druid:
		case ClassMask.Rogue:
		case ClassMask.Mage:
		case ClassMask.Priest:
		case ClassMask.Warlock:
			return 0;
	}
	return 0;
}
export function getRageConversion(level: number) {
	if (level == 25) return 82.25;
	if (level == 40) return 140.5;
	return round(0.0091107836 * level * level + 3.225598133 * level + 4.2652911);
}
export function getAgiPerDodge(level: number) {
	let val1 = 3.9;
	let val60 = 20;
	return (val1 * (60 - level)) / 59 + (val60 * (level - 1)) / 59;
}
export function getArmorReduction(defenderArmor: number, attackerLevel: number, penetration: number = 0) {
	let armor = Math.max(defenderArmor, 0);
	armor -= armor * (penetration / 100);
	let r = armor / (armor + 400 + 85 * attackerLevel);
	return r > 0.75 ? 0.75 : r;
}

/**************  PLAYER VS MOB **************/

// Chance for the target to parry the player
export function getTargetParryChance(player: Player, target: Target) {
	let diff = target.level - player.level;
	let modifier = diff > 2 ? 0.6 : 0.2;
	return round(Math.max(5 - player.base_stats.expertise + diff * 5 * modifier, 0));
}
// Chance for the target to dodge the player
export function getTargetDodgeChance(player: Player, weapon: Weapon, target: Target) {
	return round(Math.max(5 - player.base_stats.expertise + (target.base_stats.defense - player.base_stats.weapon_skill[weapon.type]) * 0.1, 0));
}
// Chance for the target to block_amount the player
export function getTargetBlockChance(player: Player, weapon: Weapon, target: Target) {
	return round(Math.min(Math.max(5 + (target.base_stats.defense - player.base_stats.weapon_skill[weapon.type]) * 0.1, 0), 5));
}
// Randomized damage reduction from glancing
export function getGlanceReduction(player: Player, weapon: Weapon, target: Target) {
	let diff = target.base_stats.defense - player.base_stats.weapon_skill[weapon.type];
	let low = Math.max(Math.min(1.3 - 0.05 * diff, 0.91), 0.01);
	let high = Math.max(Math.min(1.2 - 0.03 * diff, 0.99), 0.2);
	return Math.random() * (high - low) + low;
}
// Chance for the player to glance the target
export function getGlanceChance(player: Player, weapon: Weapon, target: Target) {
	return 10 + Math.max(target.base_stats.defense - Math.min(player.level * 5, player.base_stats.weapon_skill[weapon.type]), 0) * 2;
}
// Chance for the player to miss the target
export function getMissChance(player: Player, weapon: Weapon, target: Target) {
	let diff = target.base_stats.defense - player.base_stats.weapon_skill[weapon.type];
	let miss = 5 + (diff > 10 ? diff * 0.2 : diff * 0.1);
	miss -= diff > 10 ? player.base_stats.hit[SpellSchool.Physical] - 1 : player.base_stats.hit[SpellSchool.Physical];
	miss -= weapon.bonushit;
	return Math.max(0, round(miss));
}
// Chance for the player to miss the target dual wield
export function getDWMissChance(player: Player, weapon: Weapon, target: Target) {
	let diff = target.base_stats.defense - player.base_stats.weapon_skill[weapon.type];
	let miss = 5 + (diff > 10 ? diff * 0.2 : diff * 0.1);
	miss = miss * 0.8 + 20;
	miss -= diff > 10 ? player.base_stats.hit[SpellSchool.Physical] - 1 : player.base_stats.hit[SpellSchool.Physical];
	miss -= weapon.bonushit;
	return Math.max(0, round(miss));
}
// Chance for the player to crit the target
// Weapon and Action specific crit added later
export function getCritChance(sim: Simulation, target: Target) {
	let crit =
		sim.final_stats.agi * sim.player.agi_per_crit + sim.player.base_stats.crit[SpellSchool.Physical] + sim.aura_stats.crit[SpellSchool.Physical];
	let diff = sim.player.level * 5 - target.level * 5;
	crit += diff > 0 ? diff * 0.04 : diff * 0.2;
	if (target.level - sim.player.level >= 3) crit -= 1.8;
	return round(crit);
}
export function getSpellCritChance(sim: Simulation, school: SpellSchool) {
	let crit = sim.final_stats.int * sim.player.int_per_crit + sim.player.base_stats.crit[school] + sim.aura_stats.crit[school];
	return round(crit);
}

/**************  MOB VS PLAYER **************/

// Chance for the target to miss the player
export function getTargetMissChance(sim: Simulation, target: Target) {
	return round(5 + (sim.final_stats.defense - target.level * 5) * 0.04);
}
// Chance for the player to parry the target
export function getParryChance(sim: Simulation, target: Target) {
	return round(5 + sim.player.base_stats.parry + sim.aura_stats.parry + (sim.final_stats.defense - target.level * 5) * 0.04);
}
// Chance for the player to dodge the target
export function getDodgeChance(sim: Simulation, target: Target) {
	let base = sim.player.base_stats.dodge + sim.aura_stats.dodge + sim.final_stats.agi / getAgiPerDodge(sim.player.level);
	return round(base + (sim.final_stats.defense - target.level * 5) * 0.04);
}
// Chance for the player to block the target
export function getBlockChance(sim: Simulation, target: Target) {
	return round(5 + sim.player.base_stats.block_chance + sim.aura_stats.block_chance + (sim.final_stats.defense - target.level * 5) * 0.04);
}
// Chance for the target to crush the player
export function getTargetCrushingChance(player: Player, target: Target) {
	return Math.max((target.level * 5 - player.level * 5) * 2 - 15, 0);
}
// Chance for the target to crit the player
export function getTargetCritChance(sim: Simulation, target: Target) {
	return 5 + (target.level * 5 - sim.final_stats.defense) * 0.04;
}

/**************  MAGIC SPELLS **************/

// Spell miss chance for any magic spell
export function getTargetSpellMiss(player: Player, target: Target) {
	let miss = 1;
	let diff = target.level - player.level;
	if (diff == -2) miss = 2;
	if (diff == -1) miss = 3;
	if (diff == 0) miss = 4;
	if (diff == 1) miss = 5;
	if (diff == 2) miss = 6;
	if (diff == 3) miss = 17;
	if (diff == 4) miss = 28;
	if (diff > 4) miss = 28 + 11 * (diff - 4);
	return miss;
}
// Spell resist chance for binary spells
export function getTargetSpellBinaryResist(player: Player, target: Target, defenderResistance: number) {
	let levelResist = Math.max(0, (target.level - player.level) * 8); // only for npc targets
	return round((7500 * (levelResist + defenderResistance)) / (player.level * 5));
}
// Spell partial resist chances for non binary spells
// Returns array of pairs [ amount resisted | chance to happen ]
// From https://royalgiraffe.github.io/legacy-sim/#/resistances
export function getSpellPartialResistTable(attackerLevel: number, defenderLevel: number, defenderResistance: number, reduce: boolean) {
	// level resistance only for npc targets
	let resistance = Math.max(0, (defenderLevel - attackerLevel) * 8) + defenderResistance;
	// DoTs with no direct damage have resistance reduced by 10
	if (reduce) resistance = ~~(resistance / 10);
	let resistanceRatio = resistance / (attackerLevel * 5);
	const regressionSegments = [
		[100, 0, 0, 0], // 0
		[24, 55, 18, 3], // 1/3
		[0, 22, 56, 22], // 2/3
		[0, 4, 16, 80], // 1
	];
	const i = Math.floor(resistanceRatio * 3);
	const frac = resistanceRatio * 3 - i;

	let percentages = [];
	if (i >= 3) {
		percentages = regressionSegments[3];
	} else {
		for (let k = 0; k < 4; k++) {
			percentages.push(regressionSegments[i][k] * (1 - frac) + regressionSegments[i + 1][k] * frac);
		}

		if (resistanceRatio < 2 / 3 - 1e-6) {
			percentages[0] = Math.max(1, percentages[0]);
		}
	}

	const result = [];
	for (let k = 0; k < 4; k++) {
		result.push([0.25 * k, round(percentages[k] * 100)]);
	}
	return result;
}

export function printAttackTable(sim: any) {
	console.clear();
	console.log('*** PLAYER VS MOB BACK ***');
	console.log('  - Mainhand:');
	if (sim.player.mainhand) {
		console.log('    miss: ' + getMissChance(sim.player, sim.player.mainhand, sim.targets[0]));
		console.log('    dw miss: ' + getDWMissChance(sim.player, sim.player.mainhand, sim.targets[0]));
		console.log('    dodge: ' + getTargetDodgeChance(sim.player, sim.player.mainhand, sim.targets[0]));
		console.log('    glance: ' + getGlanceChance(sim.player, sim.player.mainhand, sim.targets[0]));
		console.log('    crit: ' + (getCritChance(sim, sim.targets[0]) + sim.player.mainhand.bonuscrit));
	}
	console.log('  - Offhand:');
	if (sim.player.offhand) {
		console.log('    dw miss: ' + getDWMissChance(sim.player, sim.player.offhand, sim.targets[0]));
		console.log('    dodge: ' + getTargetDodgeChance(sim.player, sim.player.offhand, sim.targets[0]));
		console.log('    glance: ' + getGlanceChance(sim.player, sim.player.offhand, sim.targets[0]));
		console.log('    crit: ' + (getCritChance(sim, sim.targets[0]) + sim.player.offhand.bonuscrit));
	}

	console.log('   ');
	console.log('*** PLAYER VS MOB FRONT ***');
	console.log('  - Mainhand:');
	if (sim.player.mainhand) {
		console.log('    miss: ' + getMissChance(sim.player, sim.player.mainhand, sim.targets[0]));
		console.log('    dw miss: ' + getDWMissChance(sim.player, sim.player.mainhand, sim.targets[0]));
		console.log('    dodge: ' + getTargetDodgeChance(sim.player, sim.player.mainhand, sim.targets[0]));
		console.log('    parry: ' + getTargetParryChance(sim.player, sim.target));
		console.log('    glance: ' + getGlanceChance(sim.player, sim.player.mainhand, sim.targets[0]));
		console.log('    block_amount: ' + getTargetBlockChance(sim.player, sim.player.mainhand, sim.targets[0]));
		console.log('    crit: ' + (getCritChance(sim, sim.targets[0]) + sim.player.mainhand.bonuscrit));
	}
	console.log('  - Offhand:');
	if (sim.player.offhand) {
		console.log('    dw miss: ' + getDWMissChance(sim.player, sim.player.offhand, sim.targets[0]));
		console.log('    dodge: ' + getTargetDodgeChance(sim.player, sim.player.offhand, sim.targets[0]));
		console.log('    parry: ' + getTargetParryChance(sim.player, sim.target));
		console.log('    glance: ' + getGlanceChance(sim.player, sim.player.offhand, sim.targets[0]));
		console.log('    block_amount: ' + getTargetBlockChance(sim.player, sim.player.offhand, sim.targets[0]));
		console.log('    crit: ' + (getCritChance(sim, sim.targets[0]) + sim.player.offhand.bonuscrit));
	}

	console.log('   ');
	console.log('*** MOB VS PLAYER ***');
	console.log('    miss: ' + getTargetMissChance(sim, sim.targets[0]));
	console.log('    dodge: ' + getDodgeChance(sim, sim.targets[0]));
	console.log('    parry: ' + getParryChance(sim, sim.targets[0]));
	console.log('    block_amount: ' + getBlockChance(sim, sim.targets[0]));
	console.log('    crit: ' + getTargetCritChance(sim, sim.targets[0]));
	console.log('    crushing: ' + getTargetCrushingChance(sim.player, sim.target));
}
