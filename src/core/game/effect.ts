import { AuraType, ClassFlag, CombatResult, EffectType, EventType, Powers, SchoolMask, SpellIds, SpellModOp, Targets } from '@core/shared/enums';
import type { Player, PlayerStats } from './player';
import type { Simulation } from '@core/simulation';
import { ExecuteAction, type Action } from './action';
import { rng } from '@core/shared/utils';
import type { Spell } from './spell';
import type { SpellModifier } from '@core/shared/types';
import type { Target, TargetStats } from './target';
import type { Weapon } from './weapon';
import templateSpells from '@modules/spells';
import { applyEffectAura as applyEffectAuraImpl } from './effect-aura';
import { applyPeriodicAura as applyPeriodicAuraImpl } from './effect-aura-periodic';
import { applyEffectAuraTarget as applyEffectAuraTargetImpl } from './effect-aura-target';
import { Dummy } from './dummy';

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

	applyEffect(this: Effect, sim: Simulation, spell: Spell, target?: Target, action?: Action, weapon?: Weapon) {
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
					if (spell.classMask && spell.classMask & (1 << ClassFlag.CF_WARRIOR_MORTAL_STRIKE)) dmg += Dummy.Bloodthirst(sim);
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

				if (!this.miscValue && sim.player.power_type == Powers.POWER_MANA) sim.addPower(value, spell);
				else if (this.miscValue == sim.player.power_type) sim.addPower(value, spell);
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
		return applyEffectAuraImpl.call(this, player, stats, spell, sim, remove, action, mods, charges);
	}

	applyPeriodicAura(sim: Simulation, spell: Spell, target?: Target, action?: Action) {
		return applyPeriodicAuraImpl.call(this, sim, spell, target, action);
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
		return applyEffectAuraTargetImpl.call(this, player, stats, spell, _target, sim, remove, action, mods);
	}
}
