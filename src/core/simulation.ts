import type { Action } from './game/action';
import { Combat } from './game/combat';
import { Encounter } from './game/encounter';
import { Player, PlayerStats } from './game/player';
import type { Spell } from './game/spell';
import { Target, TargetStats } from './game/target';
import {
	getBlockChance,
	getCritChance,
	getSpellCritChance,
	getDodgeChance,
	getArmorReduction,
	getParryChance,
	getTargetMissChance,
	getTargetCritChance,
} from './shared/formulas';
import { rng } from './shared/utils';
import { type Event } from './shared/types';
import {
	CombatResult,
	EncounterPosition,
	EventType,
	SpellSchool,
	SpellType,
	BaseStats,
	ClassMask,
	ConditionType,
	SpellAttributesEx2,
} from './shared/enums';
import type { Weapon } from './game/weapon';
import { Aura, ProcSpell } from './game/aura';

export class Simulation {
	// static shared objects
	encounter: Encounter;
	player: Player;
	targets: Target[];

	// dynamic simulation specific data
	// do not modify target or player objects during runtime
	timers: any;
	actionTimers: Map<number, number>;
	auras: Aura[];
	events: Event[];
	aura_stats: PlayerStats; // Stats given by temporary auras
	final_stats: PlayerStats; // Final stats of the player
	target_stats: TargetStats[] = []; // Final stats of the targets
	aux: any; // auxiliary values for specific spells
	form: number;
	form_aura?: Aura;
	duration: number;
	current_phase: number;
	execute_phase_step: number = 0;
	step: number;
	power: number;
	queue?: Action;
	extra_attacks: number;
	delayed_action?: Action;
	can_spell_queue: boolean;
	player_procs: ProcSpell[];
	actions_mods: any;

	constructor(encounter: Encounter, targets: Target[], player: Player) {
		this.encounter = encounter;
		this.targets = targets;
		this.player = player;
		this.step = 1;
		this.power = 0;
		this.duration = ~~rng(this.encounter.duration - this.encounter.durationdelta, this.encounter.duration + this.encounter.durationdelta);
		this.current_phase = 0;
		this.events = [];
		this.player_procs = [];
		this.actions_mods = {};

		// init stats
		this.aura_stats = new PlayerStats(0);
		this.final_stats = structuredClone(player.base_stats);
		for (let target of this.targets) this.target_stats.push(structuredClone(this.targets[target.index].base_stats));
		this.updateFinalStats();

		// init timers
		this.aux = {};
		this.auras = [];
		this.timers = {};
		this.timers.gcd = 0;
		this.timers.mainhand = 0;
		this.timers.offhand = 0;
		this.timers.targets = Array(this.targets.length).fill(0);
		this.timers.actionDelay = 0;
		this.timers.items = 0;

		// holds the time an action was used
		this.actionTimers = new Map<number, number>();
		for (let action of this.player.actions) this.actionTimers.set(action.id, 0);

		this.form = player.base_form;
		this.changeForm(this.form);
		this.timers.form = 0;
		this.extra_attacks = 0;
		this.can_spell_queue = false;
		if (encounter.initialpower) this.power = encounter.initialpower * 10;
		if (player.offhand) this.timers.offhand = Math.round((player.offhand.speed * 1000) / this.final_stats.haste[SpellType.Melee] / 2);

		if (player.class == ClassMask.Warrior) this.execute_phase_step = this.duration - this.duration * 0.18;
		if (encounter.executeperc) this.execute_phase_step = this.duration - this.duration * (this.encounter.executeperc / 100);
	}

	updateFinalStats() {
		// player
		this.final_stats.stat_mod = this.player.base_stats.stat_mod.map((num, index) => num * this.aura_stats.stat_mod[index]);
		this.final_stats.str = ~~((this.player.base_stats.str + this.aura_stats.str) * this.final_stats.stat_mod[BaseStats.STAT_STRENGTH]);
		this.final_stats.agi = ~~((this.player.base_stats.agi + this.aura_stats.agi) * this.final_stats.stat_mod[BaseStats.STAT_AGILITY]);
		this.final_stats.sta = ~~((this.player.base_stats.sta + this.aura_stats.sta) * this.final_stats.stat_mod[BaseStats.STAT_STAMINA]);
		this.final_stats.spi = ~~((this.player.base_stats.spi + this.aura_stats.spi) * this.final_stats.stat_mod[BaseStats.STAT_SPIRIT]);
		this.final_stats.int = ~~((this.player.base_stats.int + this.aura_stats.int) * this.final_stats.stat_mod[BaseStats.STAT_INTELLECT]);

		this.final_stats.defense = this.player.base_stats.defense + this.aura_stats.defense;
		this.final_stats.health_mod = this.player.base_stats.health_mod * this.aura_stats.health_mod;
		this.final_stats.health = (this.player.base_stats.health + this.aura_stats.health + this.final_stats.sta * 10) * this.final_stats.health_mod;
		this.final_stats.melee_ap_mod = this.player.base_stats.melee_ap_mod * this.aura_stats.melee_ap_mod;
		this.final_stats.melee_ap_mod = this.player.base_stats.melee_ap_mod * this.aura_stats.melee_ap_mod;
		this.final_stats.melee_ap =
			(this.player.base_stats.melee_ap + this.aura_stats.melee_ap + this.final_stats.str * this.player.ap_per_str) * this.final_stats.melee_ap_mod;
		this.final_stats.ranged_ap =
			(this.player.base_stats.ranged_ap + this.aura_stats.ranged_ap + this.final_stats.agi * this.player.rap_per_agi) *
			this.final_stats.ranged_ap_mod;
		this.final_stats.block_amount = this.player.base_stats.block_amount + this.aura_stats.block_amount + ~~(this.final_stats.str / 20);

		this.final_stats.hit = this.player.base_stats.hit.map((num, index) => num + this.aura_stats.hit[index]);
		this.final_stats.dmg_done = this.player.base_stats.dmg_done.map((num, index) => num + this.aura_stats.dmg_done[index]);
		this.final_stats.dmg_taken = this.player.base_stats.dmg_taken.map((num, index) => num + this.aura_stats.dmg_taken[index]);
		this.final_stats.dmg_done_mod = this.player.base_stats.dmg_done_mod.map((num, index) => num * this.aura_stats.dmg_done_mod[index]);
		this.final_stats.dmg_taken_mod = this.player.base_stats.dmg_taken_mod.map((num, index) => num * this.aura_stats.dmg_taken_mod[index]);
		this.final_stats.haste = this.player.base_stats.haste.map((num, index) => num * this.aura_stats.haste[index]);
		this.final_stats.resistance = this.player.base_stats.resistance.map((num, index) => num + this.aura_stats.resistance[index]);

		// physical crit is held in target_stats
		this.final_stats.crit[SpellSchool.Arcane] = getSpellCritChance(this, SpellSchool.Arcane);
		this.final_stats.crit[SpellSchool.Fire] = getSpellCritChance(this, SpellSchool.Fire);
		this.final_stats.crit[SpellSchool.Frost] = getSpellCritChance(this, SpellSchool.Frost);
		this.final_stats.crit[SpellSchool.Nature] = getSpellCritChance(this, SpellSchool.Nature);
		this.final_stats.crit[SpellSchool.Shadow] = getSpellCritChance(this, SpellSchool.Shadow);
		this.final_stats.crit[SpellSchool.Holy] = getSpellCritChance(this, SpellSchool.Holy);

		this.final_stats.threat_mod = this.player.base_stats.threat_mod * this.aura_stats.threat_mod;
		this.final_stats.resistance[SpellSchool.Physical] =
			this.player.base_stats.resistance[SpellSchool.Physical] + this.aura_stats.resistance[SpellSchool.Physical];

		// these are never modified in runtime I think
		// expertise
		// weapon_skill
		// resistance_no_stack

		// target stats
		for (let target of this.targets) {
			this.target_stats[target.index].miss_chance = getTargetMissChance(this, target);
			this.target_stats[target.index].crit_chance = getTargetCritChance(this, target);
			this.target_stats[target.index].player_crit = getCritChance(this, target);
			this.target_stats[target.index].player_parry = getParryChance(this, target);
			this.target_stats[target.index].player_dodge = getDodgeChance(this, target);
			this.target_stats[target.index].player_block_chance = getBlockChance(this, target);
			this.target_stats[target.index].player_armor_reduction = getArmorReduction(this.final_stats.resistance[SpellSchool.Physical], target.level);

			if (this.player.mainhand)
				this.target_stats[target.index].armor_reduction_mh = getArmorReduction(
					this.target_stats[target.index].resistance[SpellSchool.Physical],
					this.player.level,
					this.player.mainhand.armor_penetration,
				);
			if (this.player.offhand)
				this.target_stats[target.index].armor_reduction_oh = getArmorReduction(
					this.target_stats[target.index].resistance[SpellSchool.Physical],
					this.player.level,
					this.player.offhand.armor_penetration,
				);
		}
	}

	run() {
		let player = this.player;
		let timers = this.timers;

		this.precast();

		while (this.step < this.duration) {
			// Melee Attacks
			if (player.mainhand && timers.mainhand <= 0) {
				if (!this.queue || !this.queue.triggerQueue(this)) Combat.meleeAttackOutgoing(this, player.mainhand, this.targets[0]);
				timers.mainhand = player.mainhand.use(this.final_stats.haste[SpellType.Melee]);
			}
			if (player.offhand && timers.offhand <= 0) {
				Combat.meleeAttackOutgoing(this, player.offhand, this.targets[0]);
				timers.offhand = player.offhand.use(this.final_stats.haste[SpellType.Melee]);
			}

			// Enemy Attacks
			if (this.encounter.position == EncounterPosition.Front) {
				for (let i = 0; i < timers.targets.length; i++) {
					if (timers.targets[i] <= 0) {
						Combat.meleeAttackIncoming(this, this.targets[i]);
						timers.targets[i] = this.targets[i].speed;
					}
				}
			}

			// Do actions
			if (this.timers.actionDelay <= 0) {
				if (this.delayed_action) {
					if (this.delayed_action.canUse(this)) this.delayed_action.use(this);
					this.delayed_action = undefined;
					this.can_spell_queue = true;
				} else {
					for (let action of player.actions) {
						if (action.canUse(this)) {
							if (action.id == 2) break; // Hold action
							if (!this.can_spell_queue || !action.gcd) {
								this.timers.actionDelay = rng(this.encounter.reactionmin, this.encounter.reactionmax);
								this.delayed_action = action;
							} else {
								action.use(this);
							}
							break;
						}
					}
				}
			}

			// Spell queueing only allowed if gcd just came off
			if (this.timers.gcd <= 0) this.can_spell_queue = false;

			// Extra attacks
			if (this.extra_attacks > 0) {
				timers.mainhand = 0;
				this.extra_attacks--;
				continue;
			}

			// determines how much to increment the step
			let increment = this.getStepIncrement();

			// decrease timers and update step
			this.step += increment;
			timers.gcd -= increment;
			timers.mainhand -= increment;
			timers.offhand -= increment;
			timers.form -= increment;
			timers.actionDelay -= increment;
			timers.items -= increment;
			if (this.encounter.position == EncounterPosition.Front) for (let i = 0; i < timers.targets.length; i++) timers.targets[i] -= increment;

			if (this.execute_phase_step && this.step >= this.execute_phase_step) this.current_phase = 1;
			if (timers.nextaura && timers.nextaura.endtimer == this.step) timers.nextaura.processTimer(this);

			this.regenPower();
		}
	}

	precast() {
		for (let action of this.player.actions) {
			for (let condition of action.conditions) {
				if (condition.resource == ConditionType.Precast) action.precast(this);
			}
		}
	}
	getStepIncrement(): number {
		let next = 1000;
		if (this.player.power_regen_period) next = this.player.power_regen_period - (this.step % this.player.power_regen_period);
		if (this.timers.gcd > 0) next = Math.min(next, this.timers.gcd);
		if (this.timers.mainhand > 0) next = Math.min(next, this.timers.mainhand);
		if (this.timers.offhand > 0) next = Math.min(next, this.timers.offhand);
		if (this.timers.form > 0) next = Math.min(next, this.timers.form);
		if (this.timers.actionDelay > 0) next = Math.min(next, this.timers.actionDelay);
		if (this.timers.items > 0) next = Math.min(next, this.timers.items);
		if (this.timers.nextaura && this.timers.nextaura.endtimer >= this.step) next = Math.min(next, this.timers.nextaura.endtimer - this.step);

		if (this.encounter.position == EncounterPosition.Front)
			for (let i = 0; i < this.timers.targets.length; i++) next = Math.min(next, this.timers.targets[i]);

		return next;
	}

	// step through the timers while casting but dont attack or do actions
	// returns true if it ends on time
	castSpell(finalstep: number, spell: Spell, sim: Simulation): boolean {
		sim.addEvent(EventType.SpellStartCasting, 0, 0, CombatResult.Normal, spell);

		let timers = this.timers;
		while (this.step < finalstep) {
			// Enemy Attacks
			if (this.encounter.position == EncounterPosition.Front) {
				for (let i = 0; i < timers.targets.length; i++) {
					if (timers.targets[i] <= 0) {
						Combat.meleeAttackIncoming(this, this.targets[i]);
						timers.targets[i] = this.targets[i].speed;
					}
				}
			}

			let increment = this.getStepIncrement();
			if (increment > finalstep - this.step) increment = finalstep - this.step;
			this.step += increment;
			timers.gcd -= increment;
			timers.mainhand -= increment;
			timers.offhand -= increment;
			timers.form -= increment;
			timers.actionDelay -= increment;
			timers.items -= increment;
			if (this.encounter.position == EncounterPosition.Front) for (let i = 0; i < timers.targets.length; i++) timers.targets[i] -= increment;

			if (timers.nextaura && timers.nextaura.endtimer == this.step) timers.nextaura.processTimer(this);
			this.regenPower();
		}

		// reset swing timers when done casting
		if (!(spell.attributesEx2 & SpellAttributesEx2.SPELL_ATTR_DO_NOT_RESET_COMBAT_TIMERS)) {
			if (this.player.mainhand) timers.mainhand = this.player.mainhand.use(this.final_stats.haste[SpellType.Melee]);
			if (this.player.offhand) timers.offhand = this.player.offhand.use(this.final_stats.haste[SpellType.Melee]);
		}

		return this.step <= this.duration;
	}

	addPower(amount: number) {
		this.power = Math.min(this.player.power_max, this.power + ~~amount);
		this.addEvent(EventType.PowerChange, ~~amount);
	}

	regenPower() {
		if (!this.player.power_regen) return;
		if (this.step % this.player.power_regen_period != 0) return;
		this.power = Math.min(this.player.power_max, this.power + this.player.power_regen);
		this.addEvent(EventType.PowerChange, this.player.power_regen);
	}

	removePower(amount: number) {
		this.power = Math.max(0, this.power - ~~amount);
		this.addEvent(EventType.PowerChange, ~~amount * -1);
	}

	changeForm(newForm: number) {
		if (this.form_aura) this.form_aura.removeAura(this);
		this.form = newForm;
		this.timers.form = 1000;
		this.form_aura = this.player.forms[newForm];
		if (!this.form_aura) return;
		for (let effect of this.form_aura.spell.effects) effect.applyEffectAura(this.player, this.aura_stats, this.form_aura.spell, this);
		if (this.power > this.player.power_form_change) this.power = this.player.power_form_change;

		this.addEvent(EventType.FormChange, undefined, undefined, undefined, this.form_aura.spell);
	}

	addEvent(type: EventType, value?: number, threat?: number, result?: CombatResult, spell?: Spell, weapon?: Weapon, target?: Target) {
		this.events.push({ type, step: this.step, value, threat, result, spell, weapon, target });
	}

	refreshAura(spell: Spell, target?: Target, action?: Action, weapon?: Weapon) {
		if (spell.duration == 0) return;
		let aura = this.getAura(spell.id, target, weapon);
		if (!aura) aura = this.addAura(spell, target, action, weapon);
		else {
			aura.timer = this.step;
			aura.endtimer = this.step + (aura.period ? aura.period : aura.duration);
		}
		if (spell.procCharges) aura.charges = spell.procCharges;
		if (action && action.charges) aura.charges = action.charges;
		if (spell.maxStacks) aura.charges = Math.min(aura.charges + 1, spell.maxStacks);

		let threat = 0;
		if (action && action.threat_buff) threat = action.threat_buff * 5;

		this.addEvent(EventType.AuraStart, undefined, threat, undefined, spell, weapon, target);
	}

	setNextAura() {
		let lowendtimer = 0;
		this.auras.forEach(aura => {
			let endtimer = aura.endtimer;
			if (!endtimer) return;
			if (!lowendtimer || lowendtimer > endtimer) {
				lowendtimer = endtimer;
				this.timers.nextaura = aura;
			}
		});
	}

	getAura(id: number, target?: Target, weapon?: Weapon) {
		let r;
		this.auras.forEach(aura => {
			if (aura.spell.id == id && (!target || aura.target == target) && (!weapon || aura.weapon == weapon)) {
				r = aura;
				return;
			}
		});
		return r as Aura | undefined;
	}

	addAura(spell: Spell, target?: Target, action?: Action, weapon?: Weapon): Aura {
		let aura = new Aura(this.step, spell, target, action, weapon);
		this.auras.push(aura);
		return aura;
	}

	getTMI() {
		// 1sec bucket
		let window_size = 6;
		let duration_secs = Math.ceil(this.duration / 1000);
		let d = Array(duration_secs).fill(0);
		let ma = Array(duration_secs - 5).fill(0);

		// D(i) == normalized array damage / health
		for (let event of this.events) {
			if (event.type != EventType.AttackReceived) continue;
			d[Math.floor(event.step / 1000)] += (event.value || 0) / this.final_stats.health;
		}

		// MA(i) = sum with j=1 to T/Δt of D(i+j-1)
		for (let i = 0; i < ma.length; i++) {
			for (let j = 0; j < window_size; j++) {
				ma[i] += d[i + j];
			}
		}

		// TMI = 10^4ln(N0/N * sum with i = 1 to N of e^10*MA(i))
		// N = (L - T) / Δt      (60 - 6) / 1
		// N0 = 450 / Δt
		let sum = 0;
		for (let i = 0; i < ma.length; i++) {
			sum += Math.exp(10 * ma[i]);
		}
		let tmi = 10 ^ (4 * Math.log((450 / (duration_secs - window_size)) * sum));
		return tmi;
	}
}
