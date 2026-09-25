import { Spell } from './spell';
import { CombatResult, ProcFlags, ShapeshiftForm } from '@core/shared/enums';
import type { ConditionObject } from '@core/shared/types';
import type { Simulation } from '@core/simulation';
import type { ProcSpell } from './aura';
import type { Target } from './target';

export class Action {
	id: number = 0;
	name: string = '';
	path: string = '';
	phase?: number;
	conditions: ConditionObject[] = [];
	spell: Spell = new Spell({});
	item: boolean = false;

	// talent stuff
	cost: number = 0;
	crit: number = 0;
	critdmgmod: number = 1;
	flatModifier: number = 0;
	pctModifier: number = 1;
	cooldown: number = 0;
	category_cooldown: number = 0;
	duration: number = 0;
	charges: number = 0;
	casttime: number = 0;
	gcd: number = 0;
	proc?: ProcSpell;

	threat_flat?: number;
	threat_mod?: number;
	threat_buff?: number;

	constructor(obj: any) {
		obj && Object.assign(this, obj);
	}

	removeAuraEffects(sim: Simulation, target?: Target) {
		this.spell.removeAuraEffects(sim, target, this);
	}

	canUse(sim: Simulation) {
		if (this.phase !== undefined && this.phase != sim.current_phase) return false;
		if (this.gcd && sim.timers.gcd > 0) return false;
		if (this.category_cooldown && sim.timers.items > 0) return false;
		let mod_cost = sim.actions_mods[this.spell.id] ? sim.actions_mods[this.spell.id].cost : 1;

		if (sim.power < this.cost * mod_cost) return false;
		let timer = sim.actionTimers.get(this.id);
		if (timer && sim.step - timer < this.cooldown) return false;

		// stackable or weapon damage spells can recast action even if aura already exists
		if (!this.spell.maxStacks && !this.spell.isDamageSpell) {
			let aura = sim.getAura(this.spell.id);
			if (aura && aura.timer) return false;
		}
		if (this.conditions.length && !this.testConditions(sim)) return false;

		return true;
	}

	use(sim: Simulation) {
		// change stance
		if (this.spell.formMask && !(this.spell.formMask & (1 << sim.form))) {
			if (sim.timers.form > 0) return;
			if (this.spell.formMask & (1 << ShapeshiftForm.FORM_BERSERKERSTANCE)) sim.changeForm(ShapeshiftForm.FORM_BERSERKERSTANCE);
			else if (this.spell.formMask & (1 << ShapeshiftForm.FORM_BATTLESTANCE)) sim.changeForm(ShapeshiftForm.FORM_BATTLESTANCE);
			else if (this.spell.formMask & (1 << ShapeshiftForm.FORM_DEFENSIVESTANCE)) sim.changeForm(ShapeshiftForm.FORM_DEFENSIVESTANCE);
			else return;
		}

		let mod_cost = sim.actions_mods[this.spell.id] ? sim.actions_mods[this.spell.id].cost : 1;

		if (sim.power < this.cost * mod_cost) return;

		// spells with a cast bar
		if (this.casttime && !sim.castSpell(sim.step + this.casttime, this.spell, sim)) return;

		sim.removePower(this.cost * mod_cost);
		this.spell.cast(sim, this);
		if (this.proc) this.proc.trigger(sim, ProcFlags.PROC_FLAG_SUCCESSFUL_NONE_SPELL_HIT, CombatResult.Normal);

		if (this.gcd) sim.timers.gcd = this.gcd;
		if (this.cooldown) sim.actionTimers.set(this.id, sim.step);
		if (this.category_cooldown) sim.timers.items = this.category_cooldown;
	}

	precast(sim: Simulation) {
		this.spell.cast(sim, this);
		if (this.proc) this.proc.trigger(sim, ProcFlags.PROC_FLAG_SUCCESSFUL_NONE_SPELL_HIT, CombatResult.Normal);

		if (this.cooldown) sim.actionTimers.set(this.id, sim.step);
		if (this.category_cooldown) sim.timers.items = this.category_cooldown;
	}

	triggerQueue(_sim: Simulation): boolean {
		return false;
	}

	// maybe change this to diff functions and assign a function to each condition obj
	testConditions(sim: Simulation): boolean {
		for (let condition of this.conditions) {
			if (condition.minpower !== undefined && sim.power <= condition.minpower) return false;
			if (condition.maxpower !== undefined && sim.power >= condition.maxpower) return false;
			if (condition.mintimeleft !== undefined && sim.duration - sim.step <= condition.mintimeleft) return false;
			if (condition.maxtimeleft !== undefined && sim.duration - sim.step >= condition.maxtimeleft) return false;
			if (condition.mintimepassed !== undefined && sim.step <= condition.mintimepassed) return false;
			if (condition.maxtimepassed !== undefined && sim.step >= condition.maxtimepassed) return false;
			if (condition.minswingtimer !== undefined && sim.timers.mainhand <= condition.minswingtimer) return false;
			if (condition.maxswingtimer !== undefined && sim.timers.mainhand >= condition.maxswingtimer) return false;
		}
		return true;
	}
}

/*********************************** Custom Actions ****************************************/

export class NextSwingAction extends Action {
	canUse(sim: Simulation) {
		if (this.phase !== undefined && this.phase != sim.current_phase) return false;
		if (sim.queue) return false;
		let mod_cost = sim.actions_mods[this.spell.id] ? sim.actions_mods[this.spell.id].cost : 1;
		if (sim.power < this.cost * mod_cost) return false;
		return true;
	}
	use(sim: Simulation) {
		sim.queue = this;
	}
	triggerQueue(sim: Simulation): boolean {
		sim.queue = undefined;
		let mod_cost = sim.actions_mods[this.spell.id] ? sim.actions_mods[this.spell.id].cost : 1;
		if (sim.power < this.cost * mod_cost) return false;
		sim.removePower(this.cost * mod_cost);
		this.spell.cast(sim, this);
		return true;
	}
}

export class ExecuteAction extends Action {
	canUse(sim: Simulation) {
		if (this.phase !== undefined && this.phase != sim.current_phase) return false;
		let mod_cost = sim.actions_mods[this.spell.id] ? sim.actions_mods[this.spell.id].cost : 1;
		if (sim.timers.gcd > 0) return false;
		if (sim.power < this.cost * mod_cost) return false;
		return true;
	}

	use(sim: Simulation) {
		// change stance
		if (this.spell.formMask && !(this.spell.formMask & (1 << sim.form))) {
			if (sim.timers.form > 0) return;
			sim.changeForm(ShapeshiftForm.FORM_BERSERKERSTANCE);
		}

		let mod_cost = sim.actions_mods[this.spell.id] ? sim.actions_mods[this.spell.id].cost : 1;
		if (sim.power < this.cost * mod_cost) return;

		sim.aux[this.id] = sim.power - this.cost * mod_cost;
		sim.removePower(sim.power);
		this.spell.cast(sim, this);
		sim.aux[this.id] = 0;

		if (this.gcd) sim.timers.gcd = this.gcd;
	}
}

export class OverpowerAction extends Action {
	canUse(sim: Simulation) {
		if (this.phase !== undefined && this.phase != sim.current_phase) return false;
		if (!sim.timers.dodge) return false;
		if (sim.step - sim.timers.dodge > 5000) return false;
		if (sim.timers.gcd > 0) return false;
		let mod_cost = sim.actions_mods[this.spell.id] ? sim.actions_mods[this.spell.id].cost : 1;
		if (sim.power < this.cost * mod_cost) return false;
		let timer = sim.actionTimers.get(this.id);
		if (timer && sim.step - timer < this.cooldown) return false;
		return true;
	}

	use(sim: Simulation) {
		// change stance
		if (this.spell.formMask && !(this.spell.formMask & (1 << sim.form))) {
			if (sim.timers.form > 0) return;
			sim.changeForm(ShapeshiftForm.FORM_BATTLESTANCE);
		}

		let mod_cost = sim.actions_mods[this.spell.id] ? sim.actions_mods[this.spell.id].cost : 1;
		if (sim.power < this.cost * mod_cost) return;

		sim.timers.dodge = 0;
		sim.removePower(this.cost * mod_cost);
		this.spell.cast(sim, this);

		sim.timers.gcd = this.gcd;
		sim.actionTimers.set(this.id, sim.step);
	}
}

export class RevengeAction extends Action {
	canUse(sim: Simulation) {
		if (this.phase !== undefined && this.phase != sim.current_phase) return false;
		if (
			(sim.timers.inc_dodge && sim.step - sim.timers.inc_dodge <= 5000) ||
			(sim.timers.inc_parry && sim.step - sim.timers.inc_parry <= 5000) ||
			(sim.timers.inc_block && sim.step - sim.timers.inc_block <= 5000)
		) {
			if (sim.timers.gcd > 0) return false;
			let mod_cost = sim.actions_mods[this.spell.id] ? sim.actions_mods[this.spell.id].cost : 1;
			if (sim.power < this.cost * mod_cost) return false;
			let timer = sim.actionTimers.get(this.id);
			if (timer && sim.step - timer < this.cooldown) return false;
			return true;
		}
		return false;
	}

	use(sim: Simulation) {
		// change stance
		if (this.spell.formMask && !(this.spell.formMask & (1 << sim.form))) {
			if (sim.timers.form > 0) return;
			sim.changeForm(ShapeshiftForm.FORM_DEFENSIVESTANCE);
		}

		let mod_cost = sim.actions_mods[this.spell.id] ? sim.actions_mods[this.spell.id].cost : 1;
		if (sim.power < this.cost * mod_cost) return;

		sim.timers.inc_dodge = 0;
		sim.timers.inc_parry = 0;
		sim.timers.inc_block = 0;
		sim.removePower(this.cost * mod_cost);
		this.spell.cast(sim, this);

		sim.timers.gcd = this.gcd;
		sim.actionTimers.set(this.id, sim.step);
	}
}

export class BaseStanceAction extends Action {
	canUse(sim: Simulation) {
		if (this.phase !== undefined && this.phase != sim.current_phase) return false;
		if (sim.form == sim.player.base_form) return false;
		if (sim.timers.form > 0) return false;
		return true;
	}

	use(sim: Simulation) {
		sim.changeForm(sim.player.base_form);
	}
}

export class HoldAction extends Action {
	canUse(sim: Simulation) {
		if (this.phase != sim.current_phase) return false;
		if (this.conditions.length) return this.testConditions(sim);
		return false;
	}

	use(_sim: Simulation) {}

	testConditions(sim: Simulation): boolean {
		let valid = false;
		for (let condition of this.conditions) {
			if (!condition.resource) continue;
			let timer = sim.actionTimers.get(Number(condition.resource));
			if (timer && condition.comparator == '>=' && timer >= Number(condition.value)) valid = true;
			if (timer && condition.comparator == '<=' && timer <= Number(condition.value)) valid = true;
		}
		return valid;
	}
}
