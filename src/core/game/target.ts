import { getSetting, rng } from '@core/shared/utils';
import { type Player } from './player';
import {
	getDWMissChance,
	getGlanceChance,
	getGlanceReduction,
	getMissChance,
	getSpellPartialResistTable,
	getTargetBlockChance,
	getTargetCrushingChance,
	getTargetDodgeChance,
	getTargetParryChance,
	getTargetSpellBinaryResist,
	getTargetSpellMiss,
} from '@core/shared/formulas';
import { SpellSchool, Targets } from '@core/shared/enums';
import type { SpellModifier } from '@core/shared/types';

export function getTargetArray(data: any, player: Player) {
	let targets: Target[] = [];
	targets.push(new Target(data, player, 1));
	for (let i = 2; i < 5; i++) {
		let enabled = getSetting(data.settings, 'targetenabled' + i);
		if (enabled && enabled.value == 'yes') targets.push(new Target(data, player, i));
	}
	return targets;
}

export class TargetStats {
	level: number = 0;
	melee_ap: number = 0;
	dmg_taken: number[] = Array(8).fill(0);
	dmg_taken_mod: number[] = Array(8).fill(1);
	resistance: number[] = Array(8).fill(0);
	weapon_skill: number[] = Array(21).fill(0);

	parry: number = 0;
	dodge: number[] = Array(2).fill(0); // depends on weapon
	block_amount: number = 0;
	block_chance: number[] = Array(2).fill(0);
	defense: number = 0;
	crushing: number = 0;
	miss_chance: number = 0;
	crit_chance: number = 0;
	armor_reduction_mh: number = 0; // armor reduction when player attacks the target
	armor_reduction_oh: number = 0; // armor reduction when player attacks the target

	// Chance for the player to miss / glance this target
	player_miss_chance: number[] = Array(2).fill(0);
	player_dw_miss_chance: number[] = Array(2).fill(0);
	player_glance_reduction: number[] = Array(2).fill(0);
	player_glance_chance: number[] = Array(2).fill(0);
	player_armor_reduction: number = 0; // armor reduction when target attacks the player
	player_spell_miss_chance: number = 0;
	player_crit: number = 0;
	player_parry: number = 0;
	player_dodge: number = 0;
	player_block_chance: number = 0;

	constructor(level: number) {
		this.level = level;
		this.melee_ap = 270;
		this.defense = level * 5;
		this.weapon_skill = Array(21).fill(level * 5);
	}
}

export class Target {
	index: number;
	level: number;
	type: number = 0;
	base_stats: TargetStats;

	// offensive
	speed: number;
	dmg: number;
	mindmg: number;
	maxdmg: number;

	// resist tables
	resist_binary: number[] = Array(8).fill(0);
	partial_resist_table: any[] = Array(8);
	partial_resist_table_reduced: any[] = Array(8);

	constructor(data: any, player: Player, index: number = 1) {
		this.index = index - 1;
		this.level = Number(getSetting(data.settings, 'targetlevel' + index).value) || 60;
		this.speed = Number(getSetting(data.settings, 'targetspeed' + index).value) * 1000 || 0;
		this.dmg = Number(getSetting(data.settings, 'targetdmg' + index).value) || 0;
		this.mindmg = this.dmg - this.dmg / 5;
		this.maxdmg = this.dmg + this.dmg / 5;

		this.base_stats = new TargetStats(this.level);
		this.base_stats.block_amount = ~~(this.level * 0.74); // wrong formula but dunno the real one
		this.base_stats.resistance[SpellSchool.Physical] = Number(getSetting(data.settings, 'targetarmor' + index).value) || 0;

		let magicres = Number(getSetting(data.settings, 'targetmagic' + index).value) || 0;
		this.base_stats.resistance[SpellSchool.Arcane] = magicres;
		this.base_stats.resistance[SpellSchool.Fire] = magicres;
		this.base_stats.resistance[SpellSchool.Frost] = magicres;
		this.base_stats.resistance[SpellSchool.Nature] = magicres;
		this.base_stats.resistance[SpellSchool.Shadow] = magicres;
		this.base_stats.player_spell_miss_chance = getTargetSpellMiss(player, this);
		this.base_stats.parry = getTargetParryChance(player, this);
		this.base_stats.crushing = getTargetCrushingChance(player, this);
		this.setResistances(player);

		if (player.mainhand) {
			this.base_stats.dodge[0] = getTargetDodgeChance(player, player.mainhand, this);
			this.base_stats.block_chance[0] = getTargetBlockChance(player, player.mainhand, this);
			this.base_stats.player_miss_chance[0] = getMissChance(player, player.mainhand, this);
			this.base_stats.player_dw_miss_chance[0] = getDWMissChance(player, player.mainhand, this);
			this.base_stats.player_glance_chance[0] = getGlanceChance(player, player.mainhand, this);
			this.base_stats.player_glance_reduction[0] = getGlanceReduction(player, player.mainhand, this);
		}

		if (player.offhand) {
			this.base_stats.dodge[1] = getTargetDodgeChance(player, player.offhand, this);
			this.base_stats.block_chance[1] = getTargetBlockChance(player, player.offhand, this);
			this.base_stats.player_miss_chance[1] = getMissChance(player, player.offhand, this);
			this.base_stats.player_dw_miss_chance[1] = getDWMissChance(player, player.offhand, this);
			this.base_stats.player_glance_chance[1] = getGlanceChance(player, player.offhand, this);
			this.base_stats.player_glance_reduction[1] = getGlanceReduction(player, player.offhand, this);
		}

		// updated during runtime
		// crit_chance
		// armor_reduction
		// player_armor_reduction
		// miss_chance

		this.applyTargetPassiveAuras(player);
	}
	applyTargetPassiveAuras(player: Player) {
		spell: for (let spell of player.passive_auras) {
			let mods: SpellModifier[] = [];
			for (let i of player.spell_mods) if (spell.classMask && i.mask & spell.classMask) mods.push(i);

			for (let ability of player.abilities) if (ability.id == spell.id) break spell;

			for (let effect of spell.effects) {
				if (effect.target != Targets.TARGET_UNIT_TARGET_ENEMY && effect.target != Targets.TARGET_ALL_ENEMY_IN_AREA) continue;
				effect.applyEffectAuraTarget(player, this.base_stats, spell, this, undefined, false, undefined, mods);
			}
		}
	}
	setResistances(player: Player) {
		this.resist_binary[SpellSchool.Arcane] = getTargetSpellBinaryResist(player, this, this.base_stats.resistance[SpellSchool.Arcane]);
		this.resist_binary[SpellSchool.Fire] = getTargetSpellBinaryResist(player, this, this.base_stats.resistance[SpellSchool.Fire]);
		this.resist_binary[SpellSchool.Frost] = getTargetSpellBinaryResist(player, this, this.base_stats.resistance[SpellSchool.Frost]);
		this.resist_binary[SpellSchool.Nature] = getTargetSpellBinaryResist(player, this, this.base_stats.resistance[SpellSchool.Nature]);
		this.resist_binary[SpellSchool.Shadow] = getTargetSpellBinaryResist(player, this, this.base_stats.resistance[SpellSchool.Shadow]);
		this.resist_binary[SpellSchool.Holy] = getTargetSpellBinaryResist(player, this, this.base_stats.resistance[SpellSchool.Holy]);

		this.partial_resist_table[SpellSchool.Arcane] = getSpellPartialResistTable(
			player.level,
			this.level,
			this.base_stats.resistance[SpellSchool.Arcane],
			false,
		);
		this.partial_resist_table[SpellSchool.Fire] = getSpellPartialResistTable(
			player.level,
			this.level,
			this.base_stats.resistance[SpellSchool.Fire],
			false,
		);
		this.partial_resist_table[SpellSchool.Frost] = getSpellPartialResistTable(
			player.level,
			this.level,
			this.base_stats.resistance[SpellSchool.Frost],
			false,
		);
		this.partial_resist_table[SpellSchool.Nature] = getSpellPartialResistTable(
			player.level,
			this.level,
			this.base_stats.resistance[SpellSchool.Nature],
			false,
		);
		this.partial_resist_table[SpellSchool.Shadow] = getSpellPartialResistTable(
			player.level,
			this.level,
			this.base_stats.resistance[SpellSchool.Shadow],
			false,
		);
		this.partial_resist_table[SpellSchool.Holy] = getSpellPartialResistTable(
			player.level,
			this.level,
			this.base_stats.resistance[SpellSchool.Holy],
			false,
		);

		this.partial_resist_table_reduced[SpellSchool.Arcane] = getSpellPartialResistTable(
			player.level,
			this.level,
			this.base_stats.resistance[SpellSchool.Arcane],
			true,
		);
		this.partial_resist_table_reduced[SpellSchool.Fire] = getSpellPartialResistTable(
			player.level,
			this.level,
			this.base_stats.resistance[SpellSchool.Fire],
			true,
		);
		this.partial_resist_table_reduced[SpellSchool.Frost] = getSpellPartialResistTable(
			player.level,
			this.level,
			this.base_stats.resistance[SpellSchool.Frost],
			true,
		);
		this.partial_resist_table_reduced[SpellSchool.Nature] = getSpellPartialResistTable(
			player.level,
			this.level,
			this.base_stats.resistance[SpellSchool.Nature],
			true,
		);
		this.partial_resist_table_reduced[SpellSchool.Shadow] = getSpellPartialResistTable(
			player.level,
			this.level,
			this.base_stats.resistance[SpellSchool.Shadow],
			true,
		);
		this.partial_resist_table_reduced[SpellSchool.Holy] = getSpellPartialResistTable(
			player.level,
			this.level,
			this.base_stats.resistance[SpellSchool.Holy],
			true,
		);
	}
	getDamage() {
		return rng(this.mindmg, this.maxdmg);
	}
	// Assumed this formula, couldn't find a good explanation of parry haste
	getParryHaste(timer: number): number {
		// percentage = time remaining / attack speed
		// If percentage > 60%, reduce timer by 40%
		// If percentage < 60% and > 20%, reduce timer by (percentage - 20%)
		// If percentage < 20% do nothing

		let perc = timer / this.speed;
		if (perc >= 0.6) return ~~(timer * 0.6);
		if (perc >= 0.2) return ~~(timer * (1.2 - perc));
		return ~~timer;
	}
}
