import type { Simulation } from '@core/simulation';
import type { Action } from './action';
import type { Spell } from './spell';
import { rng10k } from '@core/shared/utils';
import { EffectType, EventType, SpellAttributesEx2, SpellIds, type CombatResult } from '@core/shared/enums';
import type { Target } from './target';
import { Dummy } from './dummy';
import type { Weapon } from './weapon';

export class Aura {
	spell: Spell;
	action?: Action;
	target?: Target;
	weapon?: Weapon;
	timer: number;
	duration: number;
	period: number;
	charges: number;
	endtimer: number;
	dummy: any;

	constructor(step: number, spell: Spell, target?: Target, action?: Action, weapon?: Weapon) {
		this.timer = step;
		this.duration = action ? action.duration : spell.duration;
		this.period = 0;
		this.charges = 0;
		this.spell = spell;
		this.action = action;
		this.target = target;
		this.weapon = weapon;

		spell.effects.forEach(effect => {
			if (effect.effectType == EffectType.ApplyAura && effect.auraPeriod) this.period = effect.auraPeriod;
			if (spell.id == SpellIds.ID_WARRIOR_SWEEPINGSTRIKES) this.dummy = Dummy.SweepingStrikes;
		});

		this.endtimer = step + (this.period ? this.period : this.duration);
	}

	removeCharge(sim: Simulation) {
		this.charges--;
		if (this.charges <= 0) this.removeAura(sim);
	}

	removeAura(sim: Simulation) {
		this.timer = 0;
		this.endtimer = 0;
		this.spell.removeAuraEffects(sim, this.target, this.action, this.charges);
		this.charges = 0;
		sim.setNextAura();
		sim.addEvent(EventType.AuraEnd, undefined, undefined, undefined, this.spell, this.weapon, this.target);
	}

	processTimer(sim: Simulation) {
		if (this.period) {
			this.spell.tick(sim, this.target, this.action);
			this.endtimer = sim.step + this.period;
			if (sim.step - this.timer >= this.duration) this.removeAura(sim);
			else sim.setNextAura();
		} else {
			this.removeAura(sim);
		}
	}

	triggerProc(sim: Simulation, flag: number, result: CombatResult, dmg?: number) {
		if (!this.timer) return;
		if (!this.spell.procMask) return;
		if (!(this.spell.procMask & flag)) return;
		if (this.spell.procExtra && !(this.spell.procExtra & (1 << result))) return;
		if (this.spell.procChance && this.spell.procChance < 100 && rng10k() >= this.spell.procChance * 100) return;
		if (!this.spell.procChance || this.spell.procChance == 0) console.log('0 chance proc found ', this);

		if (this.charges) this.removeCharge(sim);

		// sweeping strikes
		if (this.dummy && dmg) this.dummy(sim, this.spell, dmg);
	}
}

export class ProcSpell {
	spell: Spell;
	mask: number;
	chance: number;
	cooldown: number;
	extra: number;

	constructor(spell: Spell, mask: number, chance: number, cooldown: number, extra: number) {
		this.spell = spell;
		this.mask = mask;
		this.chance = chance;
		this.cooldown = cooldown;
		this.extra = extra;
	}

	trigger(sim: Simulation, flag: number, result: CombatResult, target?: Target, weapon?: Weapon) {
		if (!(this.mask & flag)) return;
		if (this.extra && !(this.extra & (1 << result))) return;
		if (!this.extra && 22 & (1 << result)) return; // dont proc anything if attack missed / dodged, unsure if this is right
		let timer = sim.actionTimers.get(this.spell.id);
		if (this.cooldown && timer && sim.step - timer < this.cooldown) return false;
		if (this.chance < 100 && rng10k() >= this.chance * 100) return;
		if (this.chance == 0) console.log('0 chance proc found ', this);

		// Bloodthrill only when rend exists
		if (this.spell.id == SpellIds.ID_WARRIOR_BLOODTHRILLPROC && !Dummy.CanProcBloodthrill(sim, weapon, target)) return;

		// prevents Deep Wounds from missing
		if (this.spell.attributesEx2 & SpellAttributesEx2.SPELL_ATTR_EX2_IGNORE_LOS) {
			this.spell.applyEffects(sim, target);
			return;
		}

		this.spell.cast(sim, undefined, target);
		if (this.cooldown) sim.actionTimers.set(this.spell.id, sim.step);
	}
}
