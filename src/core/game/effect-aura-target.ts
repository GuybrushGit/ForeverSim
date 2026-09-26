import { AuraType, EffectType, SchoolMask, SpellSchool } from '@core/shared/enums';
import type { Player } from './player';
import type { Simulation } from '@core/simulation';
import { type Action } from './action';
import type { Spell } from './spell';
import { getArmorReduction } from '@core/shared/formulas';
import type { SpellModifier } from '@core/shared/types';
import type { Target, TargetStats } from './target';
import { Dummy } from './dummy';
import type { Effect } from './effect';

export function applyEffectAuraTarget(this: Effect, player: Player, stats: TargetStats, spell: Spell, _target: Target, sim?: Simulation, remove?: boolean, action?: Action, mods?: SpellModifier[]) {
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
