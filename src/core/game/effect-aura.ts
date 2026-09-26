import { AuraType, EffectType, EventType, Powers, SchoolMask, SpellIds, SpellModOp, SpellSchool, SpellType, SkillType, BaseStats, WeaponType, CombatResult, SpellAttributesEx3 } from '@core/shared/enums';
import type { Player, PlayerStats } from './player';
import type { Simulation } from '@core/simulation';
import { type Action } from './action';
import { round } from '@core/shared/utils';
import type { Spell } from './spell';
import { ProcSpell } from './aura';
import { getArmorReduction, getBlockChance, getCritChance, getDodgeChance, getParryChance, getSpellCritChance } from '@core/shared/formulas';
import templateSpells from '@modules/spells';
import type { SpellModifier } from '@core/shared/types';
import { Dummy } from './dummy';
import type { Effect } from './effect';

export function applyEffectAura(this: Effect, player: Player, stats: PlayerStats, spell: Spell, sim?: Simulation, remove?: boolean, action?: Action, mods?: SpellModifier[], charges?: number) {
	if (this.effectType != EffectType.ApplyAura && this.effectType != EffectType.ApplyAreaAuraParty) return;
	if (!this.auraType) return;
	let value = this.getValue(player, spell, action, sim && sim.actions_mods, mods);
	if (remove && charges && charges > 1) value *= charges;

	switch (this.auraType) {
		case AuraType.ModAttackPower:
			stats.melee_ap += value * (remove ? -1 : 1);
			if (sim)
				sim.final_stats.melee_ap =
					(player.base_stats.melee_ap + sim.aura_stats.melee_ap + sim.final_stats.str * player.ap_per_str) * sim.final_stats.melee_ap_mod;
			break;
		case AuraType.ModRangedAttackPower:
			stats.ranged_ap += value * (remove ? -1 : 1);
			if (sim)
				sim.final_stats.ranged_ap =
					(player.base_stats.ranged_ap + sim.aura_stats.ranged_ap + sim.final_stats.agi * player.rap_per_agi) * sim.final_stats.ranged_ap_mod;
			break;
		case AuraType.ModAttackPowerPct:
			if (remove) stats.melee_ap_mod /= 1 + value / 100;
			else stats.melee_ap_mod *= 1 + value / 100;
			if (sim) {
				sim.final_stats.melee_ap_mod = player.base_stats.melee_ap_mod * sim.aura_stats.melee_ap_mod;
				sim.final_stats.melee_ap =
					(player.base_stats.melee_ap + sim.aura_stats.melee_ap + sim.final_stats.str * player.ap_per_str) * sim.final_stats.melee_ap_mod;
			}
			break;
		case AuraType.ModRangedAttackPowerPct:
			if (remove) stats.ranged_ap_mod /= 1 + value / 100;
			else stats.ranged_ap_mod *= 1 + value / 100;
			if (sim) {
				sim.final_stats.ranged_ap_mod = player.base_stats.ranged_ap_mod * sim.aura_stats.ranged_ap_mod;
				sim.final_stats.ranged_ap =
					(player.base_stats.ranged_ap + sim.aura_stats.ranged_ap + sim.final_stats.agi * player.rap_per_agi) * sim.final_stats.ranged_ap_mod;
			}
			break;
		case AuraType.ModParryPercent:
			stats.parry += value * (remove ? -1 : 1);
			if (sim) for (let target of sim.targets) sim.target_stats[target.index].player_parry = getParryChance(sim, sim.targets[target.index]);
			break;
		case AuraType.ModDodgePercent:
			stats.dodge += value * (remove ? -1 : 1);
			if (sim) for (let target of sim.targets) sim.target_stats[target.index].player_dodge = getDodgeChance(sim, sim.targets[target.index]);
			break;
		case AuraType.ModHitChance:
			if (spell.id == SpellIds.ID_WARRIOR_DUALWIELDSPEC) return Dummy.DualWieldSpecHit(player, value);

			stats.hit[SpellSchool.Physical] += value * (remove ? -1 : 1);
			if (sim)
				sim.final_stats.hit[SpellSchool.Physical] = sim.player.base_stats.hit[SpellSchool.Physical] + sim.aura_stats.hit[SpellSchool.Physical];
			break;
		case AuraType.ModMeleeHaste:
		case AuraType.ModMeleeHaste2:
		case AuraType.ModMeleeHasteRacial:
			if (remove) stats.haste[SpellType.Melee] /= 1 + value / 100;
			else stats.haste[SpellType.Melee] *= 1 + value / 100;
			if (sim) sim.final_stats.haste[SpellType.Melee] = player.base_stats.haste[SpellType.Melee] * sim.aura_stats.haste[SpellType.Melee];
			break;
		case AuraType.ModRangedHaste:
			if (remove) stats.haste[SpellType.Ranged] /= 1 + value / 100;
			else stats.haste[SpellType.Ranged] *= 1 + value / 100;
			if (sim) sim.final_stats.haste[SpellType.Ranged] = player.base_stats.haste[SpellType.Ranged] * sim.aura_stats.haste[SpellType.Ranged];
			break;
		case AuraType.CastingSpeedNotStack:
			if (remove) stats.haste[SpellType.Magic] /= 1 + value / 100;
			else stats.haste[SpellType.Magic] *= 1 + value / 100;
			if (sim) sim.final_stats.haste[SpellType.Magic] = player.base_stats.haste[SpellType.Magic] * sim.aura_stats.haste[SpellType.Magic];
			break;
		case AuraType.ModIncreaseSpellPowerPct:
			// todo
			break;
		case AuraType.ModIncreaseHealth:
			stats.health += value * (remove ? -1 : 1);
			if (sim) sim.final_stats.health = (player.base_stats.health + sim.aura_stats.health + sim.final_stats.sta * 10) * stats.health_mod;
			break;
		case AuraType.ModIncreaseHealthPercent:
			if (remove) stats.health_mod /= 1 + value / 100;
			else stats.health_mod *= 1 + value / 100;
			if (sim) {
				sim.final_stats.health_mod = sim.player.base_stats.health_mod * sim.aura_stats.health_mod;
				sim.final_stats.health = (player.base_stats.health + sim.aura_stats.health + sim.final_stats.sta * 10) * stats.health_mod;
			}
			break;
		case AuraType.ModCritPct:
		case AuraType.ModWeaponCritPercent:
			if (spell.itemClass) {
				// weapon specific
				if (player.mainhand && spell.itemClass == player.mainhand.class)
					if (!spell.itemSubclassMask || (1 << player.mainhand.type) & spell.itemSubclassMask) player.mainhand.bonuscrit += value;
				if (player.offhand && spell.itemClass == player.offhand.class)
					if (!spell.itemSubclassMask || (1 << player.offhand.type) & spell.itemSubclassMask) player.offhand.bonuscrit += value;
			} else {
				// unit specific
				stats.crit[SpellSchool.Physical] += value * (remove ? -1 : 1);
				if (sim) for (let target of sim.targets) sim.target_stats[target.index].player_crit = getCritChance(sim, target);
			}
			break;
		case AuraType.ModSpellHitChance:
			if (remove) value *= -1;
			if (SchoolMask.Arcane & spell.schoolMask) stats.hit[SpellSchool.Arcane] += value;
			if (SchoolMask.Fire & spell.schoolMask) stats.hit[SpellSchool.Fire] += value;
			if (SchoolMask.Frost & spell.schoolMask) stats.hit[SpellSchool.Frost] += value;
			if (SchoolMask.Nature & spell.schoolMask) stats.hit[SpellSchool.Nature] += value;
			if (SchoolMask.Shadow & spell.schoolMask) stats.hit[SpellSchool.Shadow] += value;
			if (SchoolMask.Holy & spell.schoolMask) stats.hit[SpellSchool.Holy] += value;
			if (sim)
				sim.final_stats.hit[SpellSchool.Physical] = sim.player.base_stats.hit[SpellSchool.Physical] + sim.aura_stats.hit[SpellSchool.Physical];
			break;
		case AuraType.ModSpellCritChance:
			if (remove) value *= -1;
			stats.crit[SpellSchool.Arcane] += value;
			stats.crit[SpellSchool.Fire] += value;
			stats.crit[SpellSchool.Frost] += value;
			stats.crit[SpellSchool.Nature] += value;
			stats.crit[SpellSchool.Shadow] += value;
			stats.crit[SpellSchool.Holy] += value;
			if (sim) {
				sim.final_stats.crit[SpellSchool.Arcane] = getSpellCritChance(sim, SpellSchool.Arcane);
				sim.final_stats.crit[SpellSchool.Fire] = getSpellCritChance(sim, SpellSchool.Fire);
				sim.final_stats.crit[SpellSchool.Frost] = getSpellCritChance(sim, SpellSchool.Frost);
				sim.final_stats.crit[SpellSchool.Nature] = getSpellCritChance(sim, SpellSchool.Nature);
				sim.final_stats.crit[SpellSchool.Shadow] = getSpellCritChance(sim, SpellSchool.Shadow);
				sim.final_stats.crit[SpellSchool.Holy] = getSpellCritChance(sim, SpellSchool.Holy);
			}
			break;
		case AuraType.ModSpellCritChanceSchool2:
			if (remove) value *= -1;
			if (SchoolMask.Arcane & spell.schoolMask) stats.crit[SpellSchool.Arcane] += value;
			if (SchoolMask.Fire & spell.schoolMask) stats.crit[SpellSchool.Fire] += value;
			if (SchoolMask.Frost & spell.schoolMask) stats.crit[SpellSchool.Frost] += value;
			if (SchoolMask.Nature & spell.schoolMask) stats.crit[SpellSchool.Nature] += value;
			if (SchoolMask.Shadow & spell.schoolMask) stats.crit[SpellSchool.Shadow] += value;
			if (SchoolMask.Holy & spell.schoolMask) stats.crit[SpellSchool.Holy] += value;
			if (sim) {
				sim.final_stats.crit[SpellSchool.Arcane] = getSpellCritChance(sim, SpellSchool.Arcane);
				sim.final_stats.crit[SpellSchool.Fire] = getSpellCritChance(sim, SpellSchool.Fire);
				sim.final_stats.crit[SpellSchool.Frost] = getSpellCritChance(sim, SpellSchool.Frost);
				sim.final_stats.crit[SpellSchool.Nature] = getSpellCritChance(sim, SpellSchool.Nature);
				sim.final_stats.crit[SpellSchool.Shadow] = getSpellCritChance(sim, SpellSchool.Shadow);
				sim.final_stats.crit[SpellSchool.Holy] = getSpellCritChance(sim, SpellSchool.Holy);
			}
			break;
		case AuraType.ModSkill:
			if (!this.miscValue) return;
			if (remove) value *= -1;
			if (this.miscValue == SkillType.SKILL_DEFENSE) stats.defense += value;
			else if (this.miscValue == SkillType.SKILL_SWORDS) stats.weapon_skill[WeaponType.Sword1H] += value;
			else if (this.miscValue == SkillType.SKILL_AXES) stats.weapon_skill[WeaponType.Axe1H] += value;
			else if (this.miscValue == SkillType.SKILL_BOWS) stats.weapon_skill[WeaponType.Bows] += value;
			else if (this.miscValue == SkillType.SKILL_GUNS) stats.weapon_skill[WeaponType.Guns] += value;
			else if (this.miscValue == SkillType.SKILL_MACES) stats.weapon_skill[WeaponType.Mace1H] += value;
			else if (this.miscValue == SkillType.SKILL_2H_SWORDS) stats.weapon_skill[WeaponType.Sword2H] += value;
			else if (this.miscValue == SkillType.SKILL_STAVES) stats.weapon_skill[WeaponType.Staff] += value;
			else if (this.miscValue == SkillType.SKILL_2H_MACES) stats.weapon_skill[WeaponType.Mace2H] += value;
			else if (this.miscValue == SkillType.SKILL_UNARMED) stats.weapon_skill[WeaponType.Unarmed] += value;
			else if (this.miscValue == SkillType.SKILL_2H_AXES) stats.weapon_skill[WeaponType.Axe2H] += value;
			else if (this.miscValue == SkillType.SKILL_DAGGERS) stats.weapon_skill[WeaponType.Dagger] += value;
			else if (this.miscValue == SkillType.SKILL_THROWN) stats.weapon_skill[WeaponType.Thrown] += value;
			else if (this.miscValue == SkillType.SKILL_CROSSBOWS) stats.weapon_skill[WeaponType.Crossbow] += value;
			else if (this.miscValue == SkillType.SKILL_WANDS) stats.weapon_skill[WeaponType.Wand] += value;
			else if (this.miscValue == SkillType.SKILL_POLEARMS) stats.weapon_skill[WeaponType.Polearm] += value;
			//else console.log('mod skill not implemented', this, spell);
			if (sim) sim.updateFinalStats();
			break;
		case AuraType.ModSkillTalent:
			if (this.miscValue == SkillType.SKILL_DEFENSE) stats.defense += value;
			else if (this.miscValue == SkillType.SKILL_SWORDS) stats.weapon_skill[WeaponType.Sword1H] += value;
			else if (this.miscValue == SkillType.SKILL_AXES) stats.weapon_skill[WeaponType.Axe1H] += value;
			else if (this.miscValue == SkillType.SKILL_BOWS) stats.weapon_skill[WeaponType.Bows] += value;
			else if (this.miscValue == SkillType.SKILL_GUNS) stats.weapon_skill[WeaponType.Guns] += value;
			else if (this.miscValue == SkillType.SKILL_MACES) stats.weapon_skill[WeaponType.Mace1H] += value;
			else if (this.miscValue == SkillType.SKILL_2H_SWORDS) stats.weapon_skill[WeaponType.Sword2H] += value;
			else if (this.miscValue == SkillType.SKILL_STAVES) stats.weapon_skill[WeaponType.Staff] += value;
			else if (this.miscValue == SkillType.SKILL_2H_MACES) stats.weapon_skill[WeaponType.Mace2H] += value;
			else if (this.miscValue == SkillType.SKILL_UNARMED) stats.weapon_skill[WeaponType.Unarmed] += value;
			else if (this.miscValue == SkillType.SKILL_2H_AXES) stats.weapon_skill[WeaponType.Axe2H] += value;
			else if (this.miscValue == SkillType.SKILL_DAGGERS) stats.weapon_skill[WeaponType.Dagger] += value;
			else if (this.miscValue == SkillType.SKILL_THROWN) stats.weapon_skill[WeaponType.Thrown] += value;
			else if (this.miscValue == SkillType.SKILL_CROSSBOWS) stats.weapon_skill[WeaponType.Crossbow] += value;
			else if (this.miscValue == SkillType.SKILL_WANDS) stats.weapon_skill[WeaponType.Wand] += value;
			else if (this.miscValue == SkillType.SKILL_POLEARMS) stats.weapon_skill[WeaponType.Polearm] += value;
			//else console.log('mod skill talent not implemented', this, spell);
			break;
		case AuraType.ProcTriggerSpell:
			if (!this.triggerSpell) return;
			let procTriggerSpell = templateSpells[this.triggerSpell];
			if (!procTriggerSpell) return;

			// remove child aura and procs
			if (remove && sim) {
				for (let index = sim.player_procs.length - 1; index >= 0; index--) {
					if (sim.player_procs[index].spell.id == this.triggerSpell) sim.player_procs.splice(index, 1);
				}
				for (let aura of sim.auras) {
					if (aura.spell.id == this.triggerSpell) {
						aura.endtimer = sim.step;
						sim.timers.nextaura = aura;
						aura.processTimer(sim);
					}
				}
				if (this.triggerSpell == SpellIds.ID_ITEMS_BRITTLEARMORPROC)
					return Dummy.BrittleArmor(sim, templateSpells[SpellIds.ID_ITEMS_BRITTLEARMOR], true);

				return;
			}

			// weapon specific
			if (spell.itemClass) {
				if (player.mainhand && spell.itemClass == player.mainhand.class)
					if (!spell.itemSubclassMask || (1 << player.mainhand.type) & spell.itemSubclassMask)
						player.mainhand.procs.push(
							new ProcSpell(
								procTriggerSpell,
								spell.procMask || 0,
								(spell.procChance || 0) * (player.traits[spell.id] || 1),
								spell.procCooldown || 0,
								spell.procExtra || 0,
							),
						);
				if (player.offhand && spell.itemClass == player.offhand.class)
					if (!spell.itemSubclassMask || (1 << player.offhand.type) & spell.itemSubclassMask)
						player.offhand.procs.push(
							new ProcSpell(
								procTriggerSpell,
								spell.procMask || 0,
								(spell.procChance || 0) * (player.traits[spell.id] || 1),
								spell.procCooldown || 0,
								spell.procExtra || 0,
							),
						);
			}
			// player specific
			else {
				// procced by everything, add proc to the action
				// filter by icon path cause i dont know how else to do it
				if (spell.procMask == 87376) {
					for (let action of player.actions) {
						if (action.spell.path == procTriggerSpell.path && action.spell.name != procTriggerSpell.name) {
							action.proc = new ProcSpell(
								procTriggerSpell,
								spell.procMask || 0,
								(spell.procChance || 0) * (player.traits[spell.id] || 1),
								spell.procCooldown || 0,
								spell.procExtra || 0,
							);
							if (!spell.procMask) console.log('found no mask on ' + spell);
						}
					}
				} else if (sim) {
					sim.player_procs.push(
						new ProcSpell(procTriggerSpell, spell.procMask || 0, spell.procChance || 0, spell.procCooldown || 0, spell.procExtra || 0),
					);
					if (!spell.procMask) console.log('found no mask on ' + spell);
				} else {
					if (player.mainhand && spell.attributesEx3 & SpellAttributesEx3.SPELL_ATTR_EX3_REQUIRES_MAIN_HAND_WEAPON) {
						player.mainhand.procs.push(
							new ProcSpell(
								procTriggerSpell,
								spell.procMask || 0,
								(spell.procChance || 0) * (player.traits[spell.id] || 1),
								spell.procCooldown || 0,
								spell.procExtra || 0,
							),
						);
					} else {
						player.procs.push(
							new ProcSpell(
								procTriggerSpell,
								spell.procMask || 0,
								(spell.procChance || 0) * (player.traits[spell.id] || 1),
								spell.procCooldown || 0,
								spell.procExtra || 0,
							),
						);
					}
					if (!spell.procMask) console.log('found no mask on ' + spell);
				}
			}
			break;
		case AuraType.ModResistance:
			if (!this.miscValue) return;
			if (remove) value *= -1;
			if (this.miscValue & SchoolMask.Physical) stats.resistance[SpellSchool.Physical] += value;
			if (this.miscValue & SchoolMask.Arcane) stats.resistance[SpellSchool.Arcane] += value;
			if (this.miscValue & SchoolMask.Fire) stats.resistance[SpellSchool.Fire] += value;
			if (this.miscValue & SchoolMask.Frost) stats.resistance[SpellSchool.Frost] += value;
			if (this.miscValue & SchoolMask.Nature) stats.resistance[SpellSchool.Nature] += value;
			if (this.miscValue & SchoolMask.Shadow) stats.resistance[SpellSchool.Shadow] += value;
			if (this.miscValue & SchoolMask.Holy) stats.resistance[SpellSchool.Holy] += value;
			if (sim) {
				sim.final_stats.resistance = player.base_stats.resistance.map((num, index) => num + sim.aura_stats.resistance[index]);
				for (let target of sim.targets)
					sim.target_stats[target.index].player_armor_reduction = getArmorReduction(sim.final_stats.resistance[SpellSchool.Physical], target.level);
			}
			break;
		case AuraType.ModBaseResistancePct:
			if (!this.miscValue) return;
			// this should only run when applying talents from toughness right?
			if (this.miscValue & SchoolMask.Physical) stats.resistance[SpellSchool.Physical] *= 1 + value / 100;
			if (this.miscValue & SchoolMask.Arcane) stats.resistance[SpellSchool.Arcane] *= 1 + value / 100;
			if (this.miscValue & SchoolMask.Fire) stats.resistance[SpellSchool.Fire] *= 1 + value / 100;
			if (this.miscValue & SchoolMask.Frost) stats.resistance[SpellSchool.Frost] *= 1 + value / 100;
			if (this.miscValue & SchoolMask.Nature) stats.resistance[SpellSchool.Nature] *= 1 + value / 100;
			if (this.miscValue & SchoolMask.Shadow) stats.resistance[SpellSchool.Shadow] *= 1 + value / 100;
			if (this.miscValue & SchoolMask.Holy) stats.resistance[SpellSchool.Holy] *= 1 + value / 100;
			break;
		case AuraType.ModResistanceFlatDoesNotStack:
			if (!this.miscValue) return;
			if (remove) value *= -1;
			if (this.miscValue & SchoolMask.Arcane)
				stats.resistance_no_stack[SpellSchool.Arcane] = Math.max(value, stats.resistance_no_stack[SpellSchool.Arcane]);
			if (this.miscValue & SchoolMask.Fire)
				stats.resistance_no_stack[SpellSchool.Fire] = Math.max(value, stats.resistance_no_stack[SpellSchool.Fire]);
			if (this.miscValue & SchoolMask.Frost)
				stats.resistance_no_stack[SpellSchool.Frost] = Math.max(value, stats.resistance_no_stack[SpellSchool.Frost]);
			if (this.miscValue & SchoolMask.Nature)
				stats.resistance_no_stack[SpellSchool.Nature] = Math.max(value, stats.resistance_no_stack[SpellSchool.Nature]);
			if (this.miscValue & SchoolMask.Shadow)
				stats.resistance_no_stack[SpellSchool.Shadow] = Math.max(value, stats.resistance_no_stack[SpellSchool.Shadow]);
			if (this.miscValue & SchoolMask.Holy)
				stats.resistance_no_stack[SpellSchool.Holy] = Math.max(value, stats.resistance_no_stack[SpellSchool.Holy]);
			if (sim)
				sim.final_stats.resistance_no_stack = player.base_stats.resistance_no_stack.map(
					(num, index) => num + sim.aura_stats.resistance_no_stack[index],
				);
			break;
		case AuraType.ModTargetResistance:
			if (!this.miscValue) return;
			if (remove) value *= -1;
			if (!sim) return;
			for (let stats of sim.target_stats) {
				if (this.miscValue & SchoolMask.Physical) stats.resistance[SpellSchool.Physical] += value;
				if (this.miscValue & SchoolMask.Arcane) stats.resistance[SpellSchool.Arcane] += value;
				if (this.miscValue & SchoolMask.Fire) stats.resistance[SpellSchool.Fire] += value;
				if (this.miscValue & SchoolMask.Frost) stats.resistance[SpellSchool.Frost] += value;
				if (this.miscValue & SchoolMask.Nature) stats.resistance[SpellSchool.Nature] += value;
				if (this.miscValue & SchoolMask.Shadow) stats.resistance[SpellSchool.Shadow] += value;
				if (this.miscValue & SchoolMask.Holy) stats.resistance[SpellSchool.Holy] += value;
				if (player.mainhand)
					stats.armor_reduction_mh = getArmorReduction(stats.resistance[SpellSchool.Physical], player.level, player.mainhand.armor_penetration);
				if (player.offhand)
					stats.armor_reduction_oh = getArmorReduction(stats.resistance[SpellSchool.Physical], player.level, player.offhand.armor_penetration);
			}
			break;
		case AuraType.ModOffhandDamagePercent:
			if (!player.offhand) return;
			if (remove) player.offhand.dmgmod /= 1 + value / 100;
			else player.offhand.dmgmod *= 1 + value / 100;
			break;
		case AuraType.ModPowerRegen:
			if (remove) value *= -1;
			if (this.miscValue == player.power_type) player.power_regen += value;
			else if (!this.miscValue && player.power_type == Powers.POWER_MANA) player.power_regen += value;
			break;
		case AuraType.ModBlockPercent:
			if (remove) value *= -1;
			stats.block_chance += value;
			if (sim) for (let target of sim.targets) sim.target_stats[target.index].player_block_chance = getBlockChance(sim, target);
			break;
		case AuraType.Block:
			if (remove) value *= -1;
			stats.block_amount += value;
			if (sim) sim.final_stats.block_amount = sim.player.base_stats.block_amount + sim.aura_stats.block_amount;
			break;
		case AuraType.ModStat:
			if (remove) value *= -1;
			if (!this.miscValue || this.miscValue == -1) stats.str += value;
			if (this.miscValue == BaseStats.STAT_AGILITY || this.miscValue == -1) stats.agi += value;
			if (this.miscValue == BaseStats.STAT_STAMINA || this.miscValue == -1) stats.sta += value;
			if (this.miscValue == BaseStats.STAT_INTELLECT || this.miscValue == -1) stats.int += value;
			if (this.miscValue == BaseStats.STAT_SPIRIT || this.miscValue == -1) stats.spi += value;
			if (sim) sim.updateFinalStats();
			break;
		case AuraType.ModTotalStatPercentage:
			if (remove) {
				if (!this.miscValue || this.miscValue == -1) stats.stat_mod[BaseStats.STAT_STRENGTH] /= 1 + value / 100;
				if (this.miscValue == BaseStats.STAT_AGILITY || this.miscValue == -1) stats.stat_mod[BaseStats.STAT_AGILITY] /= 1 + value / 100;
				if (this.miscValue == BaseStats.STAT_STAMINA || this.miscValue == -1) stats.stat_mod[BaseStats.STAT_STAMINA] /= 1 + value / 100;
				if (this.miscValue == BaseStats.STAT_INTELLECT || this.miscValue == -1) stats.stat_mod[BaseStats.STAT_INTELLECT] /= 1 + value / 100;
				if (this.miscValue == BaseStats.STAT_SPIRIT || this.miscValue == -1) stats.stat_mod[BaseStats.STAT_SPIRIT] /= 1 + value / 100;
			} else {
				if (!this.miscValue || this.miscValue == -1) stats.stat_mod[BaseStats.STAT_STRENGTH] *= 1 + value / 100;
				if (this.miscValue == BaseStats.STAT_AGILITY || this.miscValue == -1) stats.stat_mod[BaseStats.STAT_AGILITY] *= 1 + value / 100;
				if (this.miscValue == BaseStats.STAT_STAMINA || this.miscValue == -1) stats.stat_mod[BaseStats.STAT_STAMINA] *= 1 + value / 100;
				if (this.miscValue == BaseStats.STAT_INTELLECT || this.miscValue == -1) stats.stat_mod[BaseStats.STAT_INTELLECT] *= 1 + value / 100;
				if (this.miscValue == BaseStats.STAT_SPIRIT || this.miscValue == -1) stats.stat_mod[BaseStats.STAT_SPIRIT] *= 1 + value / 100;
			}
			if (sim) sim.updateFinalStats();
			break;
		case AuraType.ModThreat:
			if (remove) stats.threat_mod /= 1 + value / 100;
			else stats.threat_mod *= 1 + value / 100;
			if (sim) sim.final_stats.threat_mod = player.base_stats.threat_mod * sim.aura_stats.threat_mod;
			break;
		case AuraType.ModTotalThreat:
			if (remove) value *= -1;
			if (sim) for (let target of sim.targets) sim.addEvent(EventType.Threat, 0, value, CombatResult.Normal, spell, undefined, target);
			break;
		case AuraType.ModDamageDone:
			if (!this.miscValue) return;
			if (remove) value *= -1;
			if (this.miscValue & SchoolMask.Physical) stats.dmg_done[SpellSchool.Physical] += value;
			if (this.miscValue & SchoolMask.Arcane) stats.dmg_done[SpellSchool.Arcane] += value;
			if (this.miscValue & SchoolMask.Fire) stats.dmg_done[SpellSchool.Fire] += value;
			if (this.miscValue & SchoolMask.Frost) stats.dmg_done[SpellSchool.Frost] += value;
			if (this.miscValue & SchoolMask.Nature) stats.dmg_done[SpellSchool.Nature] += value;
			if (this.miscValue & SchoolMask.Shadow) stats.dmg_done[SpellSchool.Shadow] += value;
			if (this.miscValue & SchoolMask.Holy) stats.dmg_done[SpellSchool.Holy] += value;
			if (sim) sim.final_stats.dmg_done = player.base_stats.dmg_done.map((num, index) => num + sim.aura_stats.dmg_done[index]);
			break;
		case AuraType.ModDamageTaken:
			if (!this.miscValue) return;
			if (remove) value *= -1;
			if (this.miscValue & SchoolMask.Physical) stats.dmg_taken[SpellSchool.Physical] += value;
			if (this.miscValue & SchoolMask.Arcane) stats.dmg_taken[SpellSchool.Arcane] += value;
			if (this.miscValue & SchoolMask.Fire) stats.dmg_taken[SpellSchool.Fire] += value;
			if (this.miscValue & SchoolMask.Frost) stats.dmg_taken[SpellSchool.Frost] += value;
			if (this.miscValue & SchoolMask.Nature) stats.dmg_taken[SpellSchool.Nature] += value;
			if (this.miscValue & SchoolMask.Shadow) stats.dmg_taken[SpellSchool.Shadow] += value;
			if (this.miscValue & SchoolMask.Holy) stats.dmg_taken[SpellSchool.Holy] += value;
			if (sim) sim.final_stats.dmg_taken = player.base_stats.dmg_taken.map((num, index) => num + sim.aura_stats.dmg_taken[index]);
			break;
		case AuraType.ModDamagePercentDone:
			if (spell.itemClass) {
				// weapon specific
				if (player.mainhand && spell.itemClass == player.mainhand.class)
					if (!spell.itemSubclassMask || (1 << player.mainhand.type) & spell.itemSubclassMask) player.mainhand.dmgmod *= 1 + value / 100 || 1;
				if (player.offhand && spell.itemClass == player.offhand.class)
					if (!spell.itemSubclassMask || (1 << player.offhand.type) & spell.itemSubclassMask) player.offhand.dmgmod *= 1 + value / 100 || 1;
				if (player.mainhand && player.shield && spell.itemClass == player.shield.class)
					if (!spell.itemSubclassMask || (1 << player.shield.type) & spell.itemSubclassMask) player.mainhand.dmgmod *= 1 + value / 100 || 1;
			} else {
				// unit specific
				if (!this.miscValue) return;
				if (remove) {
					if (this.miscValue & SchoolMask.Physical) stats.dmg_done_mod[SpellSchool.Physical] /= 1 + value / 100;
					if (this.miscValue & SchoolMask.Arcane) stats.dmg_done_mod[SpellSchool.Arcane] /= 1 + value / 100;
					if (this.miscValue & SchoolMask.Fire) stats.dmg_done_mod[SpellSchool.Fire] /= 1 + value / 100;
					if (this.miscValue & SchoolMask.Frost) stats.dmg_done_mod[SpellSchool.Frost] /= 1 + value / 100;
					if (this.miscValue & SchoolMask.Nature) stats.dmg_done_mod[SpellSchool.Nature] /= 1 + value / 100;
					if (this.miscValue & SchoolMask.Shadow) stats.dmg_done_mod[SpellSchool.Shadow] /= 1 + value / 100;
					if (this.miscValue & SchoolMask.Holy) stats.dmg_done_mod[SpellSchool.Holy] /= 1 + value / 100;
				} else {
					if (this.miscValue & SchoolMask.Physical) stats.dmg_done_mod[SpellSchool.Physical] *= 1 + value / 100;
					if (this.miscValue & SchoolMask.Arcane) stats.dmg_done_mod[SpellSchool.Arcane] *= 1 + value / 100;
					if (this.miscValue & SchoolMask.Fire) stats.dmg_done_mod[SpellSchool.Fire] *= 1 + value / 100;
					if (this.miscValue & SchoolMask.Frost) stats.dmg_done_mod[SpellSchool.Frost] *= 1 + value / 100;
					if (this.miscValue & SchoolMask.Nature) stats.dmg_done_mod[SpellSchool.Nature] *= 1 + value / 100;
					if (this.miscValue & SchoolMask.Shadow) stats.dmg_done_mod[SpellSchool.Shadow] *= 1 + value / 100;
					if (this.miscValue & SchoolMask.Holy) stats.dmg_done_mod[SpellSchool.Holy] *= 1 + value / 100;
				}
				if (sim) sim.final_stats.dmg_done_mod = player.base_stats.dmg_done_mod.map((num, index) => num * sim.aura_stats.dmg_done_mod[index]);
			}
			break;
		case AuraType.ModDamagePercentTaken:
			if (!this.miscValue) return;
			if (remove) {
				if (this.miscValue & SchoolMask.Physical) stats.dmg_taken_mod[SpellSchool.Physical] /= 1 + value / 100;
				if (this.miscValue & SchoolMask.Arcane) stats.dmg_taken_mod[SpellSchool.Arcane] /= 1 + value / 100;
				if (this.miscValue & SchoolMask.Fire) stats.dmg_taken_mod[SpellSchool.Fire] /= 1 + value / 100;
				if (this.miscValue & SchoolMask.Frost) stats.dmg_taken_mod[SpellSchool.Frost] /= 1 + value / 100;
				if (this.miscValue & SchoolMask.Nature) stats.dmg_taken_mod[SpellSchool.Nature] /= 1 + value / 100;
				if (this.miscValue & SchoolMask.Shadow) stats.dmg_taken_mod[SpellSchool.Shadow] /= 1 + value / 100;
				if (this.miscValue & SchoolMask.Holy) stats.dmg_taken_mod[SpellSchool.Holy] /= 1 + value / 100;
			} else {
				if (this.miscValue & SchoolMask.Physical) stats.dmg_taken_mod[SpellSchool.Physical] *= 1 + value / 100;
				if (this.miscValue & SchoolMask.Arcane) stats.dmg_taken_mod[SpellSchool.Arcane] *= 1 + value / 100;
				if (this.miscValue & SchoolMask.Fire) stats.dmg_taken_mod[SpellSchool.Fire] *= 1 + value / 100;
				if (this.miscValue & SchoolMask.Frost) stats.dmg_taken_mod[SpellSchool.Frost] *= 1 + value / 100;
				if (this.miscValue & SchoolMask.Nature) stats.dmg_taken_mod[SpellSchool.Nature] *= 1 + value / 100;
				if (this.miscValue & SchoolMask.Shadow) stats.dmg_taken_mod[SpellSchool.Shadow] *= 1 + value / 100;
				if (this.miscValue & SchoolMask.Holy) stats.dmg_taken_mod[SpellSchool.Holy] *= 1 + value / 100;
			}
			if (sim) sim.final_stats.dmg_taken_mod = player.base_stats.dmg_taken_mod.map((num, index) => num * sim.aura_stats.dmg_taken_mod[index]);
			break;
		case AuraType.ProcTriggerDamage:
			// shield spikes - assumed no procs no rolls and no modifiers just flat dmg
			let dmg = round(value);
			if (sim) sim.addEvent(EventType.SpellDone, dmg, round(dmg * sim.final_stats.threat_mod), CombatResult.Normal, spell);
			break;
		case AuraType.PeriodicTriggerSpell:
			if (remove) return;
			if (!this.triggerSpell) return 0;
			let triggerSpell = templateSpells[this.triggerSpell];
			if (triggerSpell) triggerSpell.cast(sim);
			break;
		case AuraType.ModArmorPenetrationPct:
			if (spell.itemClass) {
				// weapon specific
				if (player.mainhand && spell.itemClass == player.mainhand.class)
					if (!spell.itemSubclassMask || (1 << player.mainhand.type) & spell.itemSubclassMask) player.mainhand.armor_penetration += value;
				if (player.offhand && spell.itemClass == player.offhand.class)
					if (!spell.itemSubclassMask || (1 << player.offhand.type) & spell.itemSubclassMask) player.offhand.armor_penetration += value;
			}
			break;
		case AuraType.OverrideActionbarSpell:
			if (!this.miscValue || !this.basePointsF) return;
			for (let action of player.actions) {
				if (action.spell.id == this.miscValue && templateSpells[this.basePointsF]) action.spell = templateSpells[this.basePointsF];
			}
			break;
		case AuraType.ModMaxPower:
			player.power_max += value;
			break;
		case AuraType.DummyAura:
			if (spell.id == SpellIds.ID_WARRIOR_SWEEPINGSTRIKES) return;
			if (spell.id == SpellIds.ID_WARRIOR_TACTICALMASTERY) return Dummy.TacticalMastery(player, spell);
			if (spell.id == SpellIds.ID_WARRIOR_WEAPONMASTER) return Dummy.WeaponMaster(player, stats);
			if (spell.id == SpellIds.ID_WARRIOR_ENRAGE) return Dummy.Enrage(player, spell);
			if (spell.id == SpellIds.ID_WARRIOR_IMPZERKRAGE) return Dummy.ImpZerkRage(player, spell);
			if (spell.id == SpellIds.ID_WARRIOR_FLURRY) return Dummy.Flurry(player, spell);
			if (spell.id == SpellIds.ID_WARRIOR_BLOODTHRILLPROC) return;
			if (sim && spell.id == SpellIds.ID_ITEMS_RESTLESSSTRENGTH) return Dummy.RestlessStrength(sim, spell, remove);
			if (sim && spell.id == SpellIds.ID_ITEMS_BRITTLEARMOR) return Dummy.BrittleArmor(sim, spell, remove);
			if (spell.id == SpellIds.ID_WARRIOR_DUALWIELDSPEC) return Dummy.DualWieldSpecRage(player, value);
			if (spell.id == SpellIds.ID_WARRIOR_RAGINGBLOWS) return;
			if (spell.id == SpellIds.ID_WARRIOR_TOUCHGRAVE) return Dummy.TouchGrave(player, spell);

			if (spell.id == 11826) return;
			if (spell.id == 24658) return;
			if (spell.id == 1259813) return;

			//console.log('dummy aura not implemented', this, spell);
			break;
		case AuraType.AddFlatModifier:
		case AuraType.AddPctModifier:
			if (!sim) return;
			if (spell.id == 7376) return; // todo def stance devastate bonus

			if (this.auraType != AuraType.AddPctModifier) return;
			for (let action of player.actions) {
				if (action.spell.classMask && this.classMask && action.spell.classMask & this.classMask) {
					if (!sim.actions_mods[action.spell.id]) sim.actions_mods[action.spell.id] = { cost: 1, pctMod: 1 };

					if (remove) {
						if (this.miscValue == SpellModOp.SPELLMOD_COST) sim.actions_mods[action.spell.id].cost /= 1 + value / 100;
						if (this.miscValue == SpellModOp.SPELLMOD_ALL_EFFECTS) sim.actions_mods[action.spell.id].pctMod /= 1 + value / 100;
					} else {
						if (this.miscValue == SpellModOp.SPELLMOD_COST) sim.actions_mods[action.spell.id].cost *= 1 + value / 100;
						if (this.miscValue == SpellModOp.SPELLMOD_ALL_EFFECTS) sim.actions_mods[action.spell.id].pctMod *= 1 + value / 100;
					}
				}
			}
	}

	return true;
}
