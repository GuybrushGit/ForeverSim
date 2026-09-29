import { Simulation } from '@core/simulation';
import './sim-dashboard-stats.scss';
import { EncounterPosition, SpellSchool, SpellType } from '@core/shared/enums';
import { round } from '@core/shared/utils';

function SimDashboardStats(props: { type: 'base' | 'defensive' | 'mainhand' | 'offhand'; sim: Simulation }) {
	let stats = props.sim.final_stats;
	let mh = props.sim.player.mainhand;
	let oh = props.sim.player.offhand;
	let target_stats = props.sim.target_stats[0];
	function getCritCap(weaponIndex: number) {
		const miss = target_stats.player_dw_miss_chance[weaponIndex];
		const block = props.sim.encounter.position === EncounterPosition.Front ? target_stats.parry + target_stats.block_chance[weaponIndex] : 0;
		return Math.max(0, round(100 - miss - target_stats.dodge[weaponIndex] - target_stats.player_glance_chance[weaponIndex] - block));
	}

	return (
		<div className="sim-dashboard-stats">
			{props.type == 'base' && [
				<div key="health">
					<p>Health</p>
					<p>{Math.floor(stats.health)}</p>
				</div>,
				<div key="str">
					<p>Strength</p>
					<p>{Math.floor(stats.str)}</p>
				</div>,
				<div key="agi">
					<p>Agility</p>
					<p>{Math.floor(stats.agi)}</p>
				</div>,
				<div key="sta">
					<p>Stamina</p>
					<p>{Math.floor(stats.sta)}</p>
				</div>,
				<div key="int">
					<p>Intellect</p>
					<p>{Math.floor(stats.int)}</p>
				</div>,
				<div key="spi">
					<p>Spirit</p>
					<p>{Math.floor(stats.spi)}</p>
				</div>,
				<div key="meleeap">
					<p>Melee AP</p>
					<p>{Math.floor(stats.melee_ap)}</p>
				</div>,
				<div key="haste">
					<p>Melee Haste</p>
					<p>{round(stats.haste[SpellType.Melee] * 100)}%</p>
				</div>,
				<div key="dmgdone">
					<p>Damage done</p>
					<p>{round(stats.dmg_done_mod[SpellSchool.Physical] * 100)}%</p>
				</div>,
			]}

			{props.type == 'mainhand' &&
				mh && [
					<div key="mhdmg">
						<p>MH Dmg</p>
						<p>
							{mh.mindmg} - {mh.maxdmg}
						</p>
					</div>,
					<div key="mhspeed">
						<p>MH Speed</p>
						<p>{mh.speed}</p>
					</div>,
					<div key="mhmiss">
						<p>MH Miss</p>
						<p>{target_stats.player_miss_chance[0]}%</p>
					</div>,
					<div key="dwmiss">
						<p>DW Miss</p>
						<p>{round(target_stats.player_dw_miss_chance[0])}%</p>
					</div>,
					<div key="mhcrit">
						<p>MH Crit</p>
						<p>{round(target_stats.player_crit + mh.bonuscrit)}%</p>
					</div>,
					<div key="mhcritcap">
						<p>MH Crit Cap</p>
						<p>{getCritCap(mh.index)}%</p>
					</div>,
					<div key="mhskill">
						<p>MH Skill</p>
						<p>{stats.weapon_skill[mh.type]}</p>
					</div>,
					<div key="mhdodge">
						<p>MH Dodge</p>
						<p>{target_stats.dodge[0]} %</p>
					</div>,
					<div key="mhparry">
						<p>MH Parry</p>
						<p>{target_stats.parry} %</p>
					</div>,
				]}
			{props.type == 'offhand' &&
				oh && [
					<div key="ohdmg">
						<p>OH Dmg</p>
						<p>
							{oh.mindmg} - {oh.maxdmg}
						</p>
					</div>,
					<div key="ohspeed">
						<p>OH Speed</p>
						<p>{oh.speed}</p>
					</div>,
					<div key="ohmiss">
						<p>OH Miss</p>
						<p>{target_stats.player_dw_miss_chance[1]}%</p>
					</div>,
					<div key="ohcrit">
						<p>OH Crit</p>
						<p>{round(target_stats.player_crit + oh.bonuscrit)}%</p>
					</div>,
					<div key="ohcritcap">
						<p>OH Crit Cap</p>
						<p>{getCritCap(oh.index)}%</p>
					</div>,
					<div key="ohskill">
						<p>OH Skill</p>
						<p>{stats.weapon_skill[oh.type]}</p>
					</div>,
					<div key="ohdodge">
						<p>OH Dodge</p>
						<p>{target_stats.dodge[1]} %</p>
					</div>,
					<div key="ohparry">
						<p>OH Parry</p>
						<p>{target_stats.parry} %</p>
					</div>,
				]}

			{props.type == 'defensive' && [
				<div key="armor">
					<p>Armor</p>
					<p>{Math.floor(stats.resistance[SpellSchool.Physical])}</p>
				</div>,
				<div key="defense">
					<p>Defense</p>
					<p>{stats.defense}</p>
				</div>,
				<div key="blockvalue">
					<p>Block Amount</p>
					<p>{stats.block_amount}</p>
				</div>,
				<div key="block">
					<p>Block Chance</p>
					<p>{props.sim.player.shield ? target_stats.player_block_chance : 0}%</p>
				</div>,
				<div key="dodge">
					<p>Dodge</p>
					<p>{target_stats.player_dodge}%</p>
				</div>,
				<div key="parry">
					<p>Parry</p>
					<p>{target_stats.player_parry}%</p>
				</div>,
				<div key="resistance" className="sim-dashboard-stats-resistance">
					<p>Resistance</p>
					<p style={{ textAlign: 'right', lineHeight: '16px' }}>
						<span>Ar {stats.resistance[SpellSchool.Arcane] + stats.resistance_no_stack[SpellSchool.Arcane]} - </span>
						<span>Fi {stats.resistance[SpellSchool.Fire] + stats.resistance_no_stack[SpellSchool.Fire]} - </span>
						<span>Fr {stats.resistance[SpellSchool.Frost] + stats.resistance_no_stack[SpellSchool.Frost]}</span>
						<br />
						<span>Na {stats.resistance[SpellSchool.Nature] + stats.resistance_no_stack[SpellSchool.Nature]} - </span>
						<span>Sh {stats.resistance[SpellSchool.Shadow] + stats.resistance_no_stack[SpellSchool.Shadow]} - </span>
						<span>Ho {stats.resistance[SpellSchool.Holy] + stats.resistance_no_stack[SpellSchool.Holy]}</span>
					</p>
				</div>,
			]}
		</div>
	);
}

export default SimDashboardStats;
