import { AuraType, ClassFlag, EffectType, SchoolMask, Targets } from '@core/shared/enums';
import type { Simulation } from '@core/simulation';
import type { Action } from './action';
import type { Effect } from './effect';
import { Combat } from './combat';
import type { Target } from './target';
import type { Weapon } from './weapon';

export class Spell {
	id: number = 0;
	name: string = '';
	effects: Effect[] = [];
	mechanic?: number;
	schoolMask: number = 0;
	castingTimeIndex?: number;
	itemClass?: number;
	itemSubclassMask?: number;
	classMask?: number;
	classSet?: number;
	attributes: number = 0;
	attributesEx: number = 0;
	attributesEx2: number = 0;
	attributesEx3: number = 0;

	cost: number = 0;
	duration: number = 0;
	casttime: number = 0;
	cooldown: number = 0;
	gcd: boolean = false;
	procChance?: number;
	procCooldown?: number;
	procMask?: number;
	procExtra?: number;
	procCharges?: number;
	path?: string;
	formMask?: number;
	baseLevel?: number;
	maxLevel?: number;
	maxStacks?: number;
	selfTarget: boolean;
	targetCount: number;
	isDamageSpell: boolean;
	isWeaponDamageSpell: boolean;
	isBinary: boolean;
	hasAura: boolean;
	spellSchool: number;

	constructor(obj: any) {
		obj && Object.assign(this, obj);
		this.selfTarget = this.isSelfTarget();
		this.targetCount = this.getTargetCount();
		this.isBinary = this.hasBinaryAura();
		this.isDamageSpell = this.hasDamage();
		this.isWeaponDamageSpell = this.hasWeaponDamage();
		this.hasAura = this.effects.filter(eff => eff.effectType == EffectType.ApplyAura || eff.effectType == EffectType.ApplyAreaAuraParty).length > 0;
		this.spellSchool = Math.log2(this.schoolMask) + 1;
	}

	applyEffects(sim: Simulation, target?: Target, action?: Action, weapon?: Weapon): number {
		let dmg = 0;
		for (let effect of this.effects) dmg += effect.applyEffect(sim, this, target, action, weapon) || 0;
		// only refresh aura after all effects done
		if (this.hasAura) {
			sim.refreshAura(this, target, action, weapon);
			sim.setNextAura();
		}
		return dmg;
	}

	removeAuraEffects(sim: Simulation, target?: Target, action?: Action, charges?: number) {
		for (let effect of this.effects) {
			if (effect.target != Targets.TARGET_UNIT_TARGET_ENEMY && effect.target != Targets.TARGET_ALL_ENEMY_IN_AREA)
				effect.applyEffectAura(sim.player, sim.aura_stats, this, sim, true, action, undefined, charges);
			else if (target) effect.applyEffectAuraTarget(sim.player, sim.target_stats[target.index], this, target, sim, true, action);
		}
	}

	hasDamage() {
		return (
			this.effects.filter(
				eff =>
					eff.effectType == EffectType.WeaponDmg || eff.effectType == EffectType.NormalizedWeaponDmg || eff.effectType == EffectType.SchoolDamage,
			).length > 0
		);
	}

	hasWeaponDamage() {
		return this.effects.filter(eff => eff.effectType == EffectType.WeaponDmg || eff.effectType == EffectType.NormalizedWeaponDmg).length > 0;
	}

	isSelfTarget() {
		if (this.classMask && this.classMask & (1 << ClassFlag.CF_WARRIOR_EXECUTE)) return false;
		return this.effects.filter(eff => eff.target == Targets.TARGET_SELF || eff.target == Targets.TARGET_ALL_PARTY_AROUND_CASTER).length > 0;
	}

	hasBinaryAura() {
		for (let effect of this.effects) {
			switch (effect.auraType) {
				case AuraType.ModDecreaseSpeed:
				case AuraType.ModStun:
				case AuraType.ModStat:
				case AuraType.ModResistance:
					return true;
			}
		}
		return false;
	}

	getTargetCount() {
		let num = 1;
		for (let effect of this.effects) {
			if (effect.targetCount) num = effect.targetCount;
			if (effect.target == Targets.TARGET_CASTER_COORDINATES) num = 10;
			if (effect.target == Targets.TARGET_IN_FRONT_OF_CASTER) num = 10;
		}
		return num;
	}

	tick(sim: Simulation, target?: Target, action?: Action) {
		for (let effect of this.effects) if (effect.auraPeriod) effect.applyPeriodicAura(sim, this, target, action);
	}

	cast(sim: Simulation, action?: Action, target?: Target, weapon?: Weapon) {
		if (this.selfTarget) this.applyEffects(sim, undefined, action, weapon);
		else if (this.schoolMask & SchoolMask.Physical) {
			// Melee spells
			if (target) return Combat.meleeSpellOutgoing(sim, this, sim.targets[target.index], action);
			for (let i = 0; i < Math.min(this.targetCount, sim.targets.length); i++) {
				Combat.meleeSpellOutgoing(sim, this, sim.targets[i], action);
			}
		} else {
			// Magic spells
			if (target) return Combat.magicSpellOutgoing(sim, this, sim.targets[target.index]);
			for (let i = 0; i < Math.min(this.targetCount, sim.targets.length); i++) Combat.magicSpellOutgoing(sim, this, sim.targets[i]);
		}
	}
}

/********************************  TODO LIST  *************************
 *
 * 
	item sets
	crit caps
 *
 * low prio stuff
 * target creature types (troll racial too)
 * add spelldmg to items
 * more presets
 * model
 * logo
 * life giving gem
 * 
 * 
 *
 */
