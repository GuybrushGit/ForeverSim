import { rng10k, round } from '@core/shared/utils';
import type { Weapon } from './weapon';
import {
	CombatResult,
	EncounterPosition,
	EventType,
	ItemType,
	Powers,
	ProcFlags,
	SchoolMask,
	SpellAttributes,
	SpellAttributesEx,
	SpellAttributesEx3,
	SpellSchool,
} from '@core/shared/enums';
import type { Simulation } from '@core/simulation';
import { ExecuteAction, type Action } from '@core/game/action';
import type { Spell } from './spell';
import type { Target } from './target';

export const Combat = {
	meleeAttackOutgoing(sim: Simulation, weapon: Weapon, target: Target) {
		let result =
			sim.encounter.position == EncounterPosition.Back
				? Combat.rollMeleeAttackBack(sim, weapon, target.index)
				: Combat.rollMeleeAttackFront(sim, weapon, target.index);
		let dmg = weapon.getDamage(sim);

		if (result == CombatResult.Parry || result == CombatResult.Miss || result == CombatResult.Dodge) dmg = 0;
		if (result == CombatResult.Glance) dmg *= 1 - sim.target_stats[target.index].player_glance_reduction[weapon.index] / 100;
		if (result == CombatResult.Crit) dmg *= 2;

		// armor damage reduction
		dmg = dmg * (1 - (weapon.offhand ? sim.target_stats[target.index].armor_reduction_oh : sim.target_stats[target.index].armor_reduction_mh));

		// Block comes after armor
		if (result == CombatResult.Block) dmg = Math.max(0, dmg - sim.target_stats[target.index].block_amount);

		// before or after modifiers??
		dmg += sim.target_stats[target.index].dmg_taken[SpellSchool.Physical];
		dmg = dmg * sim.target_stats[target.index].dmg_taken_mod[SpellSchool.Physical];

		dmg = round(dmg);

		sim.addEvent(EventType.AttackDone, dmg, round(dmg * sim.final_stats.threat_mod), result, undefined, weapon);

		Combat.procEvent(sim, ProcFlags.PROC_FLAG_SUCCESSFUL_MELEE_HIT, result, target, weapon, dmg);

		// gain rage
		Combat.gainRage(sim, weapon, result, dmg);
	},

	meleeSpellOutgoing(sim: Simulation, spell: Spell, target: Target, action?: Action) {
		let wep = spell.itemClass == ItemType.Armor ? sim.player.shield : sim.player.mainhand;
		if (!wep) return;
		let result =
			sim.encounter.position == EncounterPosition.Back
				? Combat.rollMeleeSpellBack(sim, spell, wep, target.index, action)
				: Combat.rollMeleeSpellFront(sim, spell, wep, target.index, action);
		let procFlag = ProcFlags.PROC_FLAG_SUCCESSFUL_MELEE_SPELL_HIT as ProcFlags;
		if (spell.attributes & SpellAttributes.SPELL_ATTR_ON_NEXT_SWING) procFlag |= ProcFlags.PROC_FLAG_SUCCESSFUL_MELEE_SWING_HIT;

		let dmg = 0;
		let fullyBlocked = spell.attributesEx3 & SpellAttributesEx3.SPELL_ATTR_EX3_BLOCKABLE_SPELL;
		if (
			result == CombatResult.Normal ||
			result == CombatResult.Crit ||
			(result == CombatResult.Block && !fullyBlocked) ||
			(result == CombatResult.BlockCrit && !fullyBlocked)
		) {
			// spell did hit, do effects
			dmg = spell.applyEffects(sim, target, action);

			// if no dmg it must be something like sunder armor or rend - dont crit or block_amount
			if (dmg == 0) {
				result = CombatResult.Normal;
				procFlag = ProcFlags.PROC_FLAG_SUCCESSFUL_NONE_SPELL_HIT; // should this be here?
			}

			// crit damage
			if (result == CombatResult.Crit || result == CombatResult.BlockCrit) dmg *= 1 + 1 * (action ? action.critdmgmod : 1);

			// armor damage reduction
			if (spell.schoolMask & SchoolMask.Physical) dmg = dmg * (1 - sim.target_stats[target.index].armor_reduction_mh);

			// Block comes after armor
			if (result == CombatResult.Block || result == CombatResult.BlockCrit) dmg = Math.max(0, dmg - sim.target_stats[target.index].block_amount);

			// before or after modifiers??
			dmg += sim.target_stats[target.index].dmg_taken[spell.spellSchool];
			dmg = dmg * sim.target_stats[target.index].dmg_taken_mod[spell.spellSchool];
		}

		dmg = round(dmg);

		// https://github.com/magey/tbc-warrior/wiki/Threat-Values
		// https://github.com/Voomlz/voomlz.github.io/blob/master/era/class/warrior.js
		let threat = dmg * sim.final_stats.threat_mod;
		if (action && action.threat_mod) threat *= action.threat_mod;
		if (action && action.threat_flat) threat += action.threat_flat;

		sim.addEvent(EventType.SpellDone, dmg, round(threat), result, spell, wep);

		Combat.procEvent(sim, procFlag, result, target, wep, dmg);

		if (action) Combat.gainRage(sim, wep, result, dmg, action);
	},

	meleeSpellOutgoingOffhand(sim: Simulation, spell: Spell, target: Target, action?: Action) {
		if (!sim.player.offhand) return;
		let wep = sim.player.offhand;
		let result =
			sim.encounter.position == EncounterPosition.Back
				? Combat.rollMeleeSpellBack(sim, spell, wep, target.index, action)
				: Combat.rollMeleeSpellFront(sim, spell, wep, target.index, action);
		let procFlag = ProcFlags.PROC_FLAG_SUCCESSFUL_MELEE_SPELL_HIT as ProcFlags;

		let dmg = 0;
		let fullyBlocked = spell.attributesEx3 & SpellAttributesEx3.SPELL_ATTR_EX3_BLOCKABLE_SPELL;
		if (
			result == CombatResult.Normal ||
			result == CombatResult.Crit ||
			(result == CombatResult.Block && !fullyBlocked) ||
			(result == CombatResult.BlockCrit && !fullyBlocked)
		) {
			// spell did hit, do effects
			dmg = spell.applyEffects(sim, target, action, wep);

			// if no dmg it must be something like sunder armor or rend - dont crit or block_amount
			if (dmg == 0) {
				result = CombatResult.Normal;
				procFlag = ProcFlags.PROC_FLAG_SUCCESSFUL_NONE_SPELL_HIT; // should this be here?
			}

			// crit damage
			if (result == CombatResult.Crit || result == CombatResult.BlockCrit) dmg *= 1 + 1 * (action ? action.critdmgmod : 1);

			// armor damage reduction
			if (spell.schoolMask & SchoolMask.Physical) dmg = dmg * (1 - sim.target_stats[target.index].armor_reduction_mh);

			// Block comes after armor
			if (result == CombatResult.Block || result == CombatResult.BlockCrit) dmg = Math.max(0, dmg - sim.target_stats[target.index].block_amount);

			// before or after modifiers??
			dmg += sim.target_stats[target.index].dmg_taken[spell.spellSchool];
			dmg = dmg * sim.target_stats[target.index].dmg_taken_mod[spell.spellSchool];
		}

		dmg = round(dmg);

		let threat = dmg * sim.final_stats.threat_mod;
		if (action && action.threat_mod) threat *= action.threat_mod;
		if (action && action.threat_flat) threat += action.threat_flat;

		sim.addEvent(EventType.SpellDone, dmg, round(threat), result, spell, wep);

		Combat.procEvent(sim, procFlag, result, target, wep, dmg);

		if (action) Combat.gainRage(sim, wep, result, dmg, action);
	},

	meleeAttackIncoming(sim: Simulation, target: Target) {
		let result = Combat.rollMeleeAttackIncoming(sim, target.index);
		let dmg = target.getDamage();

		// Weapon Damage * (1 + 0.15873% * Attack Power)
		dmg *= 1 + 0.0015873 * sim.target_stats[target.index].melee_ap;

		if (result == CombatResult.Parry || result == CombatResult.Miss || result == CombatResult.Dodge) dmg = 0;
		if (result == CombatResult.Crushing) dmg *= 2.5;
		if (result == CombatResult.Crit) dmg *= 2;

		// rage gain before armor / block
		// https://github.com/magey/forever-warrior/issues/3
		if (dmg) sim.addPower((dmg * 100) / sim.final_stats.health);

		// armor damage reduction and dmg taken reduction
		dmg = dmg * (1 - sim.target_stats[target.index].player_armor_reduction);
		dmg += sim.final_stats.dmg_taken[SpellSchool.Physical]; // before or after modifiers??
		dmg = dmg * sim.final_stats.dmg_taken_mod[SpellSchool.Physical];

		// Block comes after armor
		if (result == CombatResult.Block) dmg = Math.max(0, dmg - sim.final_stats.block_amount);

		dmg = round(dmg);

		sim.addEvent(EventType.AttackReceived, dmg, 0, result);
		Combat.procEvent(sim, ProcFlags.PROC_FLAG_TAKEN_MELEE_HIT, result, target, undefined, dmg);

		//if (dmg) sim.addPower((dmg / sim.player.rage_conversion) * 25);
	},

	rollMeleeAttackBack(sim: Simulation, weapon: Weapon, target: number) {
		let tmp = 0;
		let roll = rng10k();
		tmp +=
			sim.player.offhand && !sim.queue
				? sim.target_stats[target].player_dw_miss_chance[weapon.index] * 100
				: sim.target_stats[target].player_miss_chance[weapon.index] * 100;
		if (roll < tmp) return CombatResult.Miss;
		tmp += sim.target_stats[target].dodge[weapon.index] * 100;
		if (roll < tmp) return CombatResult.Dodge;
		tmp += sim.target_stats[target].player_glance_chance[weapon.index] * 100;
		if (roll < tmp) return CombatResult.Glance;
		tmp += (sim.target_stats[target].player_crit + weapon.bonuscrit) * 100;
		if (roll < tmp) return CombatResult.Crit;
		return CombatResult.Normal;
	},

	rollMeleeAttackFront(sim: Simulation, weapon: Weapon, target: number) {
		let tmp = 0;
		let roll = rng10k();
		tmp +=
			sim.player.offhand && !sim.queue
				? sim.target_stats[target].player_dw_miss_chance[weapon.index] * 100
				: sim.target_stats[target].player_miss_chance[weapon.index] * 100;
		if (roll < tmp) return CombatResult.Miss;
		tmp += sim.target_stats[target].dodge[weapon.index] * 100;
		if (roll < tmp) return CombatResult.Dodge;
		tmp += sim.target_stats[target].parry * 100;
		if (roll < tmp) return CombatResult.Parry;
		tmp += sim.target_stats[target].player_glance_chance[weapon.index] * 100;
		if (roll < tmp) return CombatResult.Glance;
		tmp += sim.target_stats[target].block_chance[weapon.index] * 100;
		if (roll < tmp) return CombatResult.Block;
		tmp += (sim.target_stats[target].player_crit + weapon.bonuscrit) * 100;
		if (roll < tmp) return CombatResult.Crit;
		return CombatResult.Normal;
	},

	rollMeleeSpellBack(sim: Simulation, spell: Spell, weapon: Weapon, target: number, action?: Action) {
		let tmp = 0;
		let roll = rng10k();
		if (!weapon) return CombatResult.Normal;
		tmp += sim.target_stats[target].player_miss_chance[weapon.index] * 100;
		if (roll < tmp) return CombatResult.Miss;
		if (!(spell.attributes & SpellAttributes.SPELL_ATTR_IMPOSSIBLE_DODGE_PARRY_BLOCK)) {
			tmp += sim.target_stats[target].dodge[weapon.index] * 100;
			if (roll < tmp) return CombatResult.Dodge;
		}
		if (!spell.isWeaponDamageSpell) {
			roll = rng10k();
			tmp = 0;
		}
		tmp += (sim.target_stats[target].player_crit + weapon.bonuscrit + (action ? action.crit : 0)) * 100;
		if (roll < tmp) return CombatResult.Crit;
		return CombatResult.Normal;
	},

	rollMeleeSpellFront(sim: Simulation, spell: Spell, weapon: Weapon, target: number, action?: Action) {
		let tmp = 0;
		let roll = rng10k();
		tmp += sim.target_stats[target].player_miss_chance[weapon.index] * 100;
		if (roll < tmp) return CombatResult.Miss;
		let canBlockDodgeParry = !(spell.attributes & SpellAttributes.SPELL_ATTR_IMPOSSIBLE_DODGE_PARRY_BLOCK);
		if (canBlockDodgeParry) {
			tmp += sim.target_stats[target].dodge[weapon.index] * 100;
			if (roll < tmp) return CombatResult.Dodge;
			tmp += sim.target_stats[target].parry * 100;
			if (roll < tmp) return CombatResult.Parry;
		}
		// Melee spells based on weapon damage follow normal attack table
		if (spell.isWeaponDamageSpell) {
			tmp += canBlockDodgeParry ? sim.target_stats[target].block_chance[weapon.index] * 100 : 0;
			if (roll < tmp) return CombatResult.Block;
			tmp += (sim.target_stats[target].player_crit + weapon.bonuscrit + (action ? action.crit : 0)) * 100;
			if (roll < tmp) return CombatResult.Crit;
			return CombatResult.Normal;
		}
		// Melee spells not based on weapon damage roll twice for block_amount / crit
		let isBlock = canBlockDodgeParry && rng10k() < sim.target_stats[target].block_chance[weapon.index] * 100;
		let isCrit = rng10k() < (sim.target_stats[target].player_crit + weapon.bonuscrit + (action ? action.crit : 0)) * 100;
		if (isBlock && isCrit) return CombatResult.BlockCrit;
		if (isBlock) return CombatResult.Block;
		if (isCrit) return CombatResult.Crit;
		return CombatResult.Normal;
	},

	rollMeleeAttackIncoming(sim: Simulation, target: number) {
		let tmp = 0;
		let roll = rng10k();
		tmp += sim.target_stats[target].miss_chance * 100;
		if (roll < tmp) return CombatResult.Miss;
		tmp += sim.target_stats[target].player_dodge * 100;
		if (roll < tmp) return CombatResult.Dodge;
		tmp += sim.target_stats[target].player_parry * 100;
		if (roll < tmp) return CombatResult.Parry;
		if (sim.player.shield) {
			tmp += sim.target_stats[target].player_block_chance * 100;
			if (roll < tmp) return CombatResult.Block;
		}
		tmp += sim.target_stats[target].crit_chance * 100;
		if (roll < tmp) return CombatResult.Crit;
		tmp += sim.target_stats[target].crushing * 100;
		if (roll < tmp) return CombatResult.Crushing;
		return CombatResult.Normal;
	},

	procEvent(sim: Simulation, flag: number, result: CombatResult, target: Target, weapon?: Weapon, dmg?: number) {
		// dodge timer for overpower
		if (result == CombatResult.Dodge && flag & (ProcFlags.PROC_FLAG_SUCCESSFUL_MELEE_HIT | ProcFlags.PROC_FLAG_SUCCESSFUL_MELEE_SPELL_HIT))
			sim.timers.dodge = sim.step;

		// timers for revenge
		if (flag & ProcFlags.PROC_FLAG_TAKEN_MELEE_HIT) {
			if (result == CombatResult.Dodge) sim.timers.inc_dodge = sim.step;
			if (result == CombatResult.Parry) sim.timers.inc_parry = sim.step;
			if (result == CombatResult.Block || result == CombatResult.BlockCrit) sim.timers.inc_block = sim.step;
		}

		// parry haste
		if (result == CombatResult.Parry) {
			Combat.parryHaste(sim, flag, target);
		}

		// weapon procs
		// weapons proc before auras so attack that procs windfury can remove the first charge
		if (weapon) weapon.procs.forEach(proc => proc.trigger(sim, flag, result, target, weapon));

		// shield spikes
		if (sim.player.shield && (result == CombatResult.Block || result == CombatResult.BlockCrit) && flag & ProcFlags.PROC_FLAG_TAKEN_MELEE_HIT) {
			sim.player.shield.procs.forEach(proc => proc.trigger(sim, flag, result, target, weapon));
		}

		// temporary aura procs
		sim.auras.forEach(aura => aura.triggerProc(sim, flag, result, dmg));

		// talent procs
		sim.player.procs.forEach(proc => proc.trigger(sim, flag, result, target));

		// temporary procs
		sim.player_procs.forEach(proc => proc.trigger(sim, flag, result, target));
	},

	parryHaste(sim: Simulation, flag: number, target: Target) {
		if (flag & ProcFlags.PROC_FLAG_TAKEN_MELEE_HIT) {
			if (sim.player.offhand && sim.timers.offhand < sim.timers.mainhand) {
				sim.timers.offhand = sim.player.offhand.getParryHaste(sim, sim.timers.offhand);
			} else if (sim.player.mainhand) {
				sim.timers.mainhand = sim.player.mainhand.getParryHaste(sim, sim.timers.mainhand);
			}
		} else {
			sim.timers.targets[target.index] = target.getParryHaste(sim.timers.targets[target.index]);
		}
	},

	gainRage(sim: Simulation, weapon: Weapon, result: CombatResult, dmg: number, action?: Action) {
		if (sim.player.power_type != Powers.POWER_RAGE) return;
		if (action) {
			if (
				action.spell.attributesEx & SpellAttributesEx.SPELL_ATTR_EX_DISCOUNT_POWER_ON_MISS &&
				(result == CombatResult.Miss || result == CombatResult.Dodge || result == CombatResult.Parry)
			) {
				if (action instanceof ExecuteAction) sim.addPower((action.cost + sim.aux[action.id]) * 0.8);
				else sim.addPower(action.cost * 0.8);
			}
		} else {
			if (result == CombatResult.Dodge || result == CombatResult.Parry) {
				//sim.addPower((weapon.getAverageDamage(sim, 0) / sim.player.rage_conversion) * 75 * 0.75);
			} else if (result != CombatResult.Miss) {
				// https://github.com/magey/forever-warrior/issues/3
				sim.addPower(weapon.speed * weapon.rage_mod * 10);
			}
		}
	},

	magicSpellOutgoing(sim: Simulation, spell: Spell, target: Target) {
		let result = Combat.rollMagicSpell(sim, spell, target);
		let dmg = 0;

		if (result.mod) {
			// spell did hit, do effects
			dmg = spell.applyEffects(sim, target);

			if (dmg == 0) result.type = CombatResult.Normal;

			dmg *= result.mod;

			// before or after modifiers??
			dmg += sim.target_stats[target.index].dmg_taken[spell.spellSchool];
			dmg = dmg * sim.target_stats[target.index].dmg_taken_mod[spell.spellSchool];
		}

		Combat.procEvent(sim, ProcFlags.PROC_FLAG_SUCCESSFUL_NEGATIVE_SPELL_HIT, result.type, target, undefined, dmg);

		dmg = round(dmg);

		sim.addEvent(EventType.SpellDone, dmg, round(dmg * sim.final_stats.threat_mod), result.type, spell);
	},

	rollMagicSpell(sim: Simulation, spell: Spell, target: Target) {
		let modifier = 1;
		if (rng10k() < sim.target_stats[target.index].player_spell_miss_chance) return { type: CombatResult.Miss, mod: 0 };
		if (spell.isBinary) {
			if (rng10k() < target.resist_binary[spell.spellSchool]) return { type: CombatResult.Resist, mod: 0 };
		} else {
			let tmp = 0;
			let roll = rng10k();
			for (let i = 0; i < target.partial_resist_table[spell.spellSchool].length; i++) {
				tmp += target.partial_resist_table[spell.spellSchool][i][1];
				if (roll < tmp) {
					modifier = 1 - target.partial_resist_table[spell.spellSchool][i][0];
					break;
				}
			}
		}
		// spell did hit, roll crit
		if (rng10k() < sim.final_stats.crit[spell.spellSchool] * 100) {
			return { type: modifier < 1 ? CombatResult.ResistCrit : CombatResult.Crit, mod: modifier * 1.5 };
		}
		// no crit
		return { type: modifier < 1 ? CombatResult.Resist : CombatResult.Normal, mod: modifier };
	},
} as const;
