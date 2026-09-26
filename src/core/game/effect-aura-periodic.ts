import {
	AuraType,
	CombatResult,
	EffectType,
	EventType,
	Powers,
	SchoolMask,
	SpellAttributes,
	SpellAttributesEx2,
	SpellSchool,
} from '@core/shared/enums';
import type { Simulation } from '@core/simulation';
import { type Action } from './action';
import { rng10k, round } from '@core/shared/utils';
import type { Spell } from './spell';
import templateSpells from '@modules/spells';
import type { Target } from './target';
import type { Effect } from './effect';

export function applyPeriodicAura(this: Effect, sim: Simulation, spell: Spell, target?: Target, action?: Action) {
	if (this.effectType != EffectType.ApplyAura || !this.auraType) return;

	switch (this.auraType) {
		case AuraType.PeriodicEnergize:
			if (!this.miscValue && sim.player.power_type == Powers.POWER_MANA)
				sim.addPower(this.getValue(sim.player, spell, action, sim && sim.actions_mods), spell);
			else if (this.miscValue == sim.player.power_type) sim.addPower(this.getValue(sim.player, spell, action, sim && sim.actions_mods), spell);
			return 0;
		case AuraType.PeriodicDamage:
		case AuraType.PeriodicLeech:
			if (!spell.schoolMask) return;
			if (!target) return;

			let result = CombatResult.Normal as CombatResult;
			let dmg = this.getValue(sim.player, spell, action, sim && sim.actions_mods);
			if (spell.schoolMask & SchoolMask.Physical) {
				if (!(spell.attributesEx2 & SpellAttributesEx2.SPELL_ATTR_CANT_CRIT)) {
					if (rng10k() < (sim.target_stats[target.index].player_crit + (action ? action.crit : 0)) * 100) {
						result = CombatResult.Crit;
						dmg *= 2;
					}
				}
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
				if (modifier > 1) result = CombatResult.Resist;
				if (rng10k() < sim.final_stats.crit[spell.spellSchool] * 100) {
					result = modifier > 1 ? CombatResult.ResistCrit : CombatResult.Crit;
					modifier *= 1.5;
				}
				// missing coefficient
				dmg += sim.final_stats.dmg_done[spell.spellSchool];
				dmg = round(dmg * modifier * sim.final_stats.dmg_done_mod[spell.spellSchool]);
			}

			sim.addEvent(EventType.AuraTick, dmg, round(dmg * sim.final_stats.threat_mod), result, spell);
			break;
		case AuraType.PeriodicTriggerSpell:
			if (!this.triggerSpell) return 0;
			let triggerSpell = templateSpells[this.triggerSpell];
			if (triggerSpell) triggerSpell.cast(sim);
			break;
		case AuraType.DummyAura:
			if (spell.name == 'Deep Wounds') {
				let dmg = sim.aux[spell.id];
				sim.addEvent(EventType.AuraTick, dmg, round(dmg * sim.final_stats.threat_mod), undefined, spell);
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
