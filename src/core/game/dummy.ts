import { ClassFlag, CombatResult, EventType, SpellIds, SpellSchool } from '@core/shared/enums';
import type { Simulation } from '@core/simulation';
import type { Spell } from './spell';
import { round } from '@core/shared/utils';
import { ProcSpell } from './aura';
import templateSpells from '@modules/spells';
import type { Player, PlayerStats } from './player';
import type { Target } from './target';
import { Combat } from './combat';
import type { Action } from './action';
import type { Weapon } from './weapon';

export class Dummy {
	static Execute(sim: Simulation, spell: Spell, value: number, amplitude?: number) {
		// assumed no weapon buffs or dmg_done / dmg_taken
		value += sim.aux[spell.id] * (amplitude || 0);

		if (sim && sim.actions_mods && sim.actions_mods[spell.id]) value *= sim.actions_mods[spell.id].pctMod;
		return (value + sim.final_stats.dmg_done[SpellSchool.Physical]) * sim.final_stats.dmg_done_mod[SpellSchool.Physical];
	}

	static DeepWounds(sim: Simulation, spell: Spell, basePoints?: number) {
		if (!sim.player.mainhand) return;
		sim.aux[spell.id] = round(sim.player.mainhand.getDeepWoundsDamage(sim) * (basePoints || 0) * (sim.player.traits[spell.id] || 1) * 0.25);
	}

	static SweepingStrikes(sim: Simulation, spell: Spell, dmg: number) {
		if (sim.targets.length < 2) return;
		sim.addEvent(EventType.SpellDone, dmg, round(dmg * sim.final_stats.threat_mod), CombatResult.Normal, spell);
	}

	static RestlessStrength(sim: Simulation, spell: Spell, remove?: boolean) {
		let value = 40;
		if (remove) value = sim.aux[spell.id] * -1;
		sim.aux[spell.id] = remove ? 0 : value;
		sim.aura_stats.dmg_done[SpellSchool.Physical] += value;
		if (sim)
			sim.final_stats.dmg_done[SpellSchool.Physical] =
				sim.player.base_stats.dmg_done[SpellSchool.Physical] + sim.aura_stats.dmg_done[SpellSchool.Physical];

		if (!remove) {
			let triggerSpell = templateSpells[SpellIds.ID_ITEMS_RESTLESSSTRENGTHPROC];
			if (!triggerSpell) return;
			sim.player_procs.push(new ProcSpell(triggerSpell, spell.procMask || 0, spell.procChance || 0, spell.procCooldown || 0, spell.procExtra || 0));
		} else {
			for (let index = sim.player_procs.length - 1; index >= 0; index--) {
				if (sim.player_procs[index].spell.id == SpellIds.ID_ITEMS_RESTLESSSTRENGTHPROC) sim.player_procs.splice(index, 1);
			}
		}
	}

	static RestlessStrengthProc(sim: Simulation) {
		sim.aux[SpellIds.ID_ITEMS_RESTLESSSTRENGTH] -= 2;
		sim.aura_stats.dmg_done[SpellSchool.Physical] -= 2;
		if (sim)
			sim.final_stats.dmg_done[SpellSchool.Physical] =
				sim.player.base_stats.dmg_done[SpellSchool.Physical] + sim.aura_stats.dmg_done[SpellSchool.Physical];
	}

	static BrittleArmor(sim: Simulation, spell: Spell, remove?: boolean) {
		let value = [2000, 30];
		if (remove) value = [sim.aux[spell.id][0] * -1, sim.aux[spell.id][1] * -1];
		sim.aux[spell.id] = remove ? [0, 0] : value;
		sim.aura_stats.resistance[SpellSchool.Physical] += value[0];
		sim.aura_stats.defense += value[1];
		sim.updateFinalStats();
	}

	static BrittleArmorProc(sim: Simulation) {
		sim.aux[SpellIds.ID_ITEMS_BRITTLEARMOR][0] -= 200;
		sim.aux[SpellIds.ID_ITEMS_BRITTLEARMOR][1] -= 3;
		sim.aura_stats.defense -= 3;
		sim.aura_stats.resistance[SpellSchool.Physical] -= 200;
		sim.updateFinalStats();
	}

	static TacticalMastery(player: Player, spell: Spell) {
		player.power_form_change = 30 * (player.traits[spell.id] || 1);
	}

	static WeaponMaster(player: Player, stats: PlayerStats) {
		let spell1 = templateSpells[12281];
		if (spell1) for (let effect of spell1.effects) effect.applyEffectAura(player, stats, spell1);
		let spell2 = templateSpells[12284];
		if (spell2) for (let effect of spell2.effects) effect.applyEffectAura(player, stats, spell2);
		let spell3 = templateSpells[12700];
		if (spell3) for (let effect of spell3.effects) effect.applyEffectAura(player, stats, spell3);
	}

	static Enrage(player: Player, spell: Spell) {
		let triggerSpell = templateSpells[SpellIds.ID_WARRIOR_ENRAGEPROC];
		if (!triggerSpell) return;
		player.procs.push(new ProcSpell(triggerSpell, spell.procMask || 0, spell.procChance || 0, spell.procCooldown || 0, spell.procExtra || 0));
	}

	static ImpZerkRage(player: Player, spell: Spell) {
		let procTriggerSpell = templateSpells[SpellIds.ID_WARRIOR_ZERKRAGEEFFECT];
		if (!procTriggerSpell) return;
		for (let action of player.actions) {
			if (action.spell.path == spell.path && action.spell.name != spell.name) {
				action.proc = new ProcSpell(procTriggerSpell, spell.procMask || 0, spell.procChance || 0, spell.procCooldown || 0, spell.procExtra || 0);
			}
		}
	}

	static Flurry(player: Player, spell: Spell) {
		let triggerSpell = templateSpells[SpellIds.ID_WARRIOR_FLURRYPROC];
		if (!triggerSpell) return;
		player.procs.push(new ProcSpell(triggerSpell, spell.procMask || 0, spell.procChance || 0, spell.procCooldown || 0, spell.procExtra || 0));
	}

	static CanProcBloodthrill(sim: Simulation, weapon?: Weapon, target?: Target) {
		if (!weapon || weapon.offhand || !target) return false;
		if (
			sim.auras.filter(
				aura =>
					aura.target &&
					aura.target.index == target.index &&
					aura.spell.classMask &&
					aura.spell.classMask & (1 << ClassFlag.CF_WARRIOR_REND) &&
					aura.endtimer > sim.step,
			).length == 0
		)
			return false;
		return true;
	}

	static BloodthrillProc(sim: Simulation) {
		sim.timers.dodge = sim.step;
	}

	static DualWieldSpecRage(player: Player, value: number) {
		if (player.offhand) player.offhand.rage_mod *= 1 + value / 100;
	}

	static DualWieldSpecHit(player: Player, value: number) {
		if (player.offhand) player.offhand.bonushit += value;
	}

	static Whirlwind(sim: Simulation, spell: Spell, target: Target, action: Action) {
		if (sim.player.traits[SpellIds.ID_WARRIOR_RAGINGBLOWS] == 1) Combat.meleeSpellOutgoingOffhand(sim, spell, target, action);
	}

	static Bloodthirst(sim: Simulation) {
		return round((35 * sim.final_stats.melee_ap) / 100);
	}

	static TouchGrave(player: Player, spell: Spell) {
		let triggerSpell = templateSpells[SpellIds.ID_WARRIOR_TOUCHGRAVEPROC];
		if (!triggerSpell) return;
		player.procs.push(new ProcSpell(triggerSpell, spell.procMask || 0, spell.procChance || 0, spell.procCooldown || 0, spell.procExtra || 0));
	}

	static TouchGraveProc(sim: Simulation) {
		return sim.final_stats.health * 0.05;
	}
}
