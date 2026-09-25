import {
	AuraType,
	ClassFlag,
	EffectType,
	EventType,
	Powers,
	SchoolMask,
	SpellIds,
	SpellModOp,
	SpellSchool,
	SpellType,
	SkillType,
	BaseStats,
	Targets,
	WeaponType,
	CombatResult,
	SpellAttributesEx3,
} from '@core/shared/enums';
import type { Player, PlayerStats } from './player';
import type { Simulation } from '@core/simulation';
import { ExecuteAction, type Action } from './action';
import { rng, rng10k, round } from '@core/shared/utils';
import type { Spell } from './spell';
import { ProcSpell } from './aura';
import { getArmorReduction, getBlockChance, getCritChance, getDodgeChance, getParryChance, getSpellCritChance } from '@core/shared/formulas';
import templateSpells from '@modules/spells';
import type { SpellModifier } from '@core/shared/types';
import type { Target, TargetStats } from './target';
import { Dummy } from './dummy';
import type { Weapon } from './weapon';

export class Effect {
	effectType: EffectType = 0;
	auraType?: AuraType;
	auraPeriod?: number;
	basePoints?: number; // Base points added to result of according effect's rolled dice. F.e. EffectDieSides=26 and EffectBasePoints=49 will make 50-75.
	dieSides?: number; // Number of sides of dice which is being rolled for random value of according effect.
	basePointsF?: number;
	variance?: number;
	pointsPerLevel?: number;
	miscValue?: number;
	classMask?: number; // Identifies the spell class
	triggerSpell?: number;
	target?: number;
	targetCount?: number;
	amplitude?: number;

	constructor(obj: any) {
		obj && Object.assign(this, obj);
	}

	getValue(player: Player, spell: Spell, action?: Action, action_mods?: any, mods?: SpellModifier[]) {
		let val = this.basePointsF || 0;
		if (this.variance) val *= 1 + (rng(-1000, 1000) / 1000) * this.variance;
		// if (this.dieSides && this.dieSides > 1) val += rng(1, this.dieSides);
		// else val += this.dieSides || 0;
		if (this.pointsPerLevel) val += ~~((Math.min(player.level, spell.maxLevel || 60) - (spell.baseLevel || 1)) * (this.pointsPerLevel || 0));
		if (player.traits[spell.id]) val *= player.traits[spell.id];
		if (action) val = (val + action.flatModifier) * action.pctModifier;
		if (mods && mods.length > 0) {
			let flatMod = 0;
			let pctMod = 1;
			for (let mod of mods) {
				if (mod.op != SpellModOp.SPELLMOD_ALL_EFFECTS) continue;
				if (mod.type == AuraType.AddFlatModifier) flatMod += mod.value;
				if (mod.type == AuraType.AddPctModifier) pctMod *= 1 + mod.value / 100;
			}
			val = (val + flatMod) * pctMod;
		}
		if (action_mods && action_mods[spell.id]) {
			val *= action_mods[spell.id].pctMod;
		}
		return val;
	}

	applyEffect(sim: Simulation, spell: Spell, target?: Target, action?: Action, weapon?: Weapon) {
		if (target && this.target == Targets.TARGET_SELF) return;
		switch (this.effectType) {
			case EffectType.ApplyAura:
			case EffectType.ApplyAreaAuraParty: {
				let aura = sim.getAura(spell.id, target, weapon);
				if (!aura || !aura.timer || (spell.maxStacks && aura.charges < spell.maxStacks)) {
					if (spell.selfTarget || (this.target != Targets.TARGET_UNIT_TARGET_ENEMY && this.target != Targets.TARGET_ALL_ENEMY_IN_AREA))
						this.applyEffectAura(sim.player, sim.aura_stats, spell, sim, false, action);
					else if (target) this.applyEffectAuraTarget(sim.player, sim.target_stats[target.index], spell, target, sim, false, action);
				}
				break;
			}
			case EffectType.SchoolDamage: {
				if (!spell.schoolMask) return 0;

				if (spell.schoolMask & SchoolMask.Physical) {
					let dmg = this.getValue(sim.player, spell, action);
					if (spell.classMask && spell.classMask & (1 << ClassFlag.CF_WARRIOR_MORTAL_STRIKE)) dmg = Dummy.Bloodthirst(sim);
					if (spell.classMask && spell.classMask & (1 << ClassFlag.CF_WARRIOR_SHIELD_SLAM)) dmg += sim.final_stats.block_amount;

					if (sim && sim.actions_mods && sim.actions_mods[spell.id]) dmg *= sim.actions_mods[spell.id].pctMod;
					dmg = (dmg + sim.final_stats.dmg_done[SchoolMask.Physical]) * sim.final_stats.dmg_done_mod[SchoolMask.Physical];
					return dmg;
				} else {
					let dmg = this.getValue(sim.player, spell, action, sim && sim.actions_mods);

					// missing coefficient
					dmg += sim.final_stats.dmg_done[spell.spellSchool];
					dmg = dmg * sim.final_stats.dmg_done_mod[spell.spellSchool];
					return dmg;
				}
			}
			case EffectType.WeaponDmg: {
				if (!sim.player.mainhand) return 0;

				let weapon = sim.player.mainhand;
				let dmg = this.getValue(sim.player, spell, action);
				dmg += rng(weapon.mindmg + weapon.bonusdmg, weapon.maxdmg + weapon.bonusdmg) + (sim.final_stats.melee_ap / 14) * weapon.speed;

				if (sim && sim.actions_mods && sim.actions_mods[spell.id]) dmg *= sim.actions_mods[spell.id].pctMod;
				dmg = (dmg + sim.final_stats.dmg_done[SchoolMask.Physical]) * weapon.dmgmod * sim.final_stats.dmg_done_mod[SchoolMask.Physical];
				return dmg;
			}
			case EffectType.NormalizedWeaponDmg: {
				if (!action || !sim.player.mainhand) return 0;

				let wep = weapon || sim.player.mainhand;
				let dmg = this.getValue(sim.player, spell, action);
				dmg += rng(wep.mindmg + wep.bonusdmg, wep.maxdmg + wep.bonusdmg) + (sim.final_stats.melee_ap / 14) * wep.normSpeed;

				if (sim && sim.actions_mods && sim.actions_mods[spell.id]) dmg *= sim.actions_mods[spell.id].pctMod;
				if (spell.id == SpellIds.ID_WARRIOR_SPEARINGSTRIKE) dmg *= 0.4;
				if (target && !wep.offhand && spell.id == SpellIds.ID_WARRIOR_WHIRLWIND) Dummy.Whirlwind(sim, spell, target, action);

				// missing dmg_taken and dmg_taken_mod
				// dmg taken before or after crit / armor modifications?
				dmg = (dmg + sim.final_stats.dmg_done[SchoolMask.Physical]) * wep.dmgmod * sim.final_stats.dmg_done_mod[SchoolMask.Physical];
				return dmg;
			}
			case EffectType.HealthLeech: {
				if (!spell.schoolMask) return 0;
				let dmg = this.getValue(sim.player, spell, action, sim && sim.actions_mods);

				// missing coefficient
				dmg += sim.final_stats.dmg_done[spell.spellSchool];
				dmg = dmg * sim.final_stats.dmg_done_mod[spell.spellSchool];

				if (spell.id == SpellIds.ID_WARRIOR_TOUCHGRAVEPROC) dmg = Dummy.TouchGraveProc(sim);

				return dmg;
			}
			case EffectType.Energize: {
				let value = this.getValue(sim.player, spell, action, sim && sim.actions_mods);
				if (spell.id == SpellIds.ID_WARRIOR_SHIELDSPECPROC) value = 50;
				if (spell.id == SpellIds.ID_WARRIOR_UNBRIDLEDWRATH) value = 10;
				if (spell.id == SpellIds.ID_WARRIOR_MASTERDEFENSE) value = 50;
				if (spell.id == SpellIds.ID_WARRIOR_UNBRIDLEDWRATH && sim.player.mainhand && sim.player.mainhand.twohand) value *= 2;

				if (!this.miscValue && sim.player.power_type == Powers.POWER_MANA) sim.addPower(value);
				else if (this.miscValue == sim.player.power_type) sim.addPower(value);
				return 0;
			}
			case EffectType.AddExtraAttacks: {
				sim.extra_attacks += this.basePointsF || 0;
				sim.addEvent(EventType.ExtraAttack, this.basePointsF || 0, 0, undefined, spell);
				break;
			}
			case EffectType.TriggerSpell: {
				if (!this.triggerSpell) return 0;
				if (action && action instanceof ExecuteAction) return 0;
				let triggerSpell = templateSpells[this.triggerSpell];
				if (triggerSpell) triggerSpell.cast(sim);
				break;
			}
			case EffectType.Dummy: {
				if (action && action instanceof ExecuteAction)
					return Dummy.Execute(sim, spell, this.getValue(sim.player, spell, action, sim && sim.actions_mods), this.amplitude);
				if (spell.id == SpellIds.ID_ITEMS_RESTLESSSTRENGTHPROC) return Dummy.RestlessStrengthProc(sim);
				if (spell.id == SpellIds.ID_ITEMS_BRITTLEARMOR) return Dummy.BrittleArmor(sim, spell, false);
				if (target && spell.id == SpellIds.ID_WARRIOR_BLOODTHRILLPROC) return Dummy.BloodthrillProc(sim);

				if (spell.id == 13180) return;
				if (spell.id == 12938) return;
				if (spell.id == 29286) return;
				if (spell.id == 14537) return;
				if (spell.id == 23725) return;
				if (spell.id == 23453) return;
				if (spell.id == 29275) return;
				if (spell.id == 10523) return;
				if (spell.id == 16389) return;
				if (spell.id == 8248) return;
				if (spell.id == 8253) return;
				if (spell.id == 23894) return;
				if (spell.id == 1310222) return;

				//console.log('dummy spell not implemented ', spell);
				break;
			}
			case EffectType.ScriptEffect: {
				if (spell.id == SpellIds.ID_ITEMS_BRITTLEARMORPROC) return Dummy.BrittleArmorProc(sim);
				if (spell.id == 17512) return;
				if (spell.id == 707) return;

				//console.log('script effect not implemented ', spell);
				break;
			}
			case EffectType.Threat: {
				if (!target) return;
				let val = this.getValue(sim.player, spell, action, sim && sim.actions_mods);
				sim.addEvent(EventType.Threat, 0, val, CombatResult.Normal, spell, undefined, target);
				break;
			}
			case EffectType.Dispel:
			case EffectType.Heal:
			case EffectType.Summon:
			case EffectType.Charge:
			case EffectType.CreateItem:
			case EffectType.SendEvent:
			case EffectType.SummonChangeItem:
			case EffectType.InterruptCast:
			case EffectType.SummonPet:
			case EffectType.Inebriate:
			case EffectType.DispelMechanic:
			case EffectType.Teleport:
				// dont care
				break;
			default:
			//console.log('effect not implemented: ' + this.effectType, spell);
		}
		return 0;
	}

	applyEffectAura(
		player: Player,
		stats: PlayerStats,
		spell: Spell,
		sim?: Simulation,
		remove?: boolean,
		action?: Action,
		mods?: SpellModifier[],
		charges?: number,
	) {
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
				if (sim) sim.addEvent(EventType.SpellDone, dmg, dmg * sim.final_stats.threat_mod, CombatResult.Normal, spell);
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

	applyPeriodicAura(sim: Simulation, spell: Spell, target?: Target, action?: Action) {
		if (this.effectType != EffectType.ApplyAura || !this.auraType) return;

		switch (this.auraType) {
			case AuraType.PeriodicEnergize:
				if (!this.miscValue && sim.player.power_type == Powers.POWER_MANA)
					sim.addPower(this.getValue(sim.player, spell, action, sim && sim.actions_mods));
				else if (this.miscValue == sim.player.power_type) sim.addPower(this.getValue(sim.player, spell, action, sim && sim.actions_mods));
				return 0;
			case AuraType.PeriodicDamage:
			case AuraType.PeriodicLeech:
				if (!spell.schoolMask) return;
				if (!target) return;

				let dmg = this.getValue(sim.player, spell, action, sim && sim.actions_mods);
				if (spell.schoolMask & SchoolMask.Physical) {
					dmg = round(dmg * sim.final_stats.dmg_done_mod[SpellSchool.Physical]);
				} else {
					// if binary = no partial resist
					// if non binary and direct dmg = normal partial resist
					// if non binary and no direct dmg = reduced partial resist
					let modifier = 1;
					if (!spell.isBinary) {
						let tmp = 0;
						let roll = rng10k();
						let table = spell.isDamageSpell ? target.partial_resist_table[spell.spellSchool] : target.partial_resist_table_reduced[spell.spellSchool];
						for (let i = 0; i < table.length; i++) {
							tmp += table[i][1];
							if (roll < tmp) {
								modifier = 1 - table[i][0];
								break;
							}
						}
					}
					// missing coefficient
					dmg += sim.final_stats.dmg_done[spell.spellSchool];
					dmg = round(dmg * modifier * sim.final_stats.dmg_done_mod[spell.spellSchool]);
				}

				sim.addEvent(EventType.AuraTick, dmg, dmg * sim.final_stats.threat_mod, undefined, spell);
				break;
			case AuraType.PeriodicTriggerSpell:
				if (!this.triggerSpell) return 0;
				let triggerSpell = templateSpells[this.triggerSpell];
				if (triggerSpell) triggerSpell.cast(sim);
				break;
			case AuraType.DummyAura:
				if (spell.name == 'Deep Wounds') {
					let dmg = sim.aux[spell.id];
					sim.addEvent(EventType.AuraTick, dmg, dmg * sim.final_stats.threat_mod, undefined, spell);
				} else {
					//console.log('dummy aura not implemented', this);
				}
				break;
			case AuraType.ObsModHealth:
			case AuraType.PeriodicHeal:
			case AuraType.PeriodicManaLeech:
				// dont care
				break;
			default:
				//console.log('periodic aura not implemented', this);
				break;
		}
	}

	applyEffectAuraTarget(
		player: Player,
		stats: TargetStats,
		spell: Spell,
		_target: Target,
		sim?: Simulation,
		remove?: boolean,
		action?: Action,
		mods?: SpellModifier[],
	) {
		if (this.effectType != EffectType.ApplyAura && this.effectType != EffectType.ApplyAreaAuraParty) return;
		if (!this.auraType) return;
		let value = this.getValue(player, spell, action, sim && sim.actions_mods, mods);

		switch (this.auraType) {
			case AuraType.ModAttackPower:
				stats.melee_ap += value * (remove ? -1 : 1);
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
				if (player.mainhand)
					stats.armor_reduction_mh = getArmorReduction(stats.resistance[SpellSchool.Physical], player.level, player.mainhand.armor_penetration);
				if (player.offhand)
					stats.armor_reduction_oh = getArmorReduction(stats.resistance[SpellSchool.Physical], player.level, player.offhand.armor_penetration);
				break;
			case AuraType.ModDamageDone:
				if (!this.miscValue) return;
				if (remove) value *= -1;
				if (this.miscValue & SchoolMask.Physical) stats.dmg_taken[SpellSchool.Physical] += value;
				if (this.miscValue & SchoolMask.Arcane) stats.dmg_taken[SpellSchool.Arcane] += value;
				if (this.miscValue & SchoolMask.Fire) stats.dmg_taken[SpellSchool.Fire] += value;
				if (this.miscValue & SchoolMask.Frost) stats.dmg_taken[SpellSchool.Frost] += value;
				if (this.miscValue & SchoolMask.Nature) stats.dmg_taken[SpellSchool.Nature] += value;
				if (this.miscValue & SchoolMask.Shadow) stats.dmg_taken[SpellSchool.Shadow] += value;
				if (this.miscValue & SchoolMask.Holy) stats.dmg_taken[SpellSchool.Holy] += value;
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
				break;
			case AuraType.DummyAura:
				if (!sim) return;
				if (spell.name == 'Deep Wounds') Dummy.DeepWounds(sim, spell, this.basePointsF);
				break;
			case AuraType.DispelImmunity:
			case AuraType.PreventsFleeing:
			case AuraType.PeriodicDamage:
			case AuraType.PeriodicLeech:
			case AuraType.PeriodicManaLeech:
			case AuraType.ModStun:
			case AuraType.ModHealingPct:
			case AuraType.ModDecreaseSpeed:
			case AuraType.ModRoot:
			case AuraType.ModConfuse:
			case AuraType.ModStat:
			case AuraType.ModMeleeHaste:
			case AuraType.ModRangedHaste:
			case AuraType.CastingSpeedNotStack:
			case AuraType.ModDisarm:
			case AuraType.ModRangedAttackPower:
			case AuraType.ModSilence:
				// dont care
				break;
			default:
				//console.log('target aura not implemented', this, spell);
				break;
		}

		return true;
	}
}
