import { useStore } from '@core/shared/store';
import './sim-spell-stats.scss';
import { CombatResult } from '@core/shared/enums';

function SimSpellStats() {
	const store = useStore();
	const { simdata, getSpells } = store;
	let spells = simdata.spells;
	if (!spells || Object.keys(spells).length == 0) return <></>;

	let outgoing: any[] = [];
	let incoming: any[] = [];
	let overall: any[] = [];

	let hits = 0;
	let crits = 0;
	let casts = 0;
	let hitstaken = 0;
	let hitsavoided = 0;
	let hitsblocked = 0;

	Object.keys(spells).forEach(key => {
		if (spells[key].uptime) return;

		let name = 'Unknown';
		if (key == '1') name = 'Main Hand';
		else if (key == '2') name = 'Off Hand';
		else if (key == '3') return;
		else name = getSpells()[key] && getSpells()[key].name;

		let counter = spells[key].results.reduce((a: number, b: number) => a + b, 0);
		if (!counter) return;

		let obj = {
			Name: name,
			Casts: counter,
			DPS: ((spells[key].damage / simdata.durationsteps) * 1000).toFixed(2),
			Results: {
				Miss: spells[key].results[CombatResult.Miss],
				Dodge: spells[key].results[CombatResult.Dodge],
				Block: spells[key].results[CombatResult.Block],
				Parry: spells[key].results[CombatResult.Parry],
				Glance: spells[key].results[CombatResult.Glance],
				Crit: spells[key].results[CombatResult.Crit],
				Crushing: spells[key].results[CombatResult.Crushing],
				Normal: spells[key].results[CombatResult.Normal],
				BlockCrit: spells[key].results[CombatResult.BlockCrit],
				Resist: spells[key].results[CombatResult.Resist],
				ResistCrit: spells[key].results[CombatResult.ResistCrit],
			},
		};

		outgoing.push(obj);
		casts += obj.Casts;
		crits += obj.Results.Crit + obj.Results.BlockCrit;
		hits += obj.Results.Block + obj.Results.Glance + obj.Results.Crit + obj.Results.Normal + obj.Results.BlockCrit;
	});

	if (spells['3']) {
		let obj = {
			Name: 'Melee Attack',
			Casts: spells['3'].results.reduce((a: number, b: number) => a + b, 0),
			DPS: ((spells['3'].damage / simdata.durationsteps) * 1000).toFixed(2),
			Results: {
				Miss: spells['3'].results[CombatResult.Miss],
				Dodge: spells['3'].results[CombatResult.Dodge],
				Block: spells['3'].results[CombatResult.Block],
				Parry: spells['3'].results[CombatResult.Parry],
				Glance: spells['3'].results[CombatResult.Glance],
				Crit: spells['3'].results[CombatResult.Crit],
				Crushing: spells['3'].results[CombatResult.Crushing],
				Normal: spells['3'].results[CombatResult.Normal],
				BlockCrit: spells['3'].results[CombatResult.BlockCrit],
				Resist: spells['3'].results[CombatResult.Resist],
				ResistCrit: spells['3'].results[CombatResult.ResistCrit],
			},
		};

		incoming.push(obj);
		hitstaken += obj.Casts;
		hitsavoided += obj.Results.Miss + obj.Results.Dodge + obj.Results.Parry + obj.Results.Resist + obj.Results.ResistCrit;
		hitsblocked += obj.Results.Block + obj.Results.BlockCrit;
	}

	overall.push({ label: 'Hit rate', value: ((hits / casts) * 100).toFixed(2) + '%' });
	overall.push({ label: 'Crit rate', value: ((crits / casts) * 100).toFixed(2) + '%' });
	if (hitstaken > 0) {
		overall.push({ label: 'Attacks avoided', value: ((hitsavoided / hitstaken) * 100).toFixed(2) + '%' });
		overall.push({ label: 'Block rate', value: ((hitsblocked / hitstaken) * 100).toFixed(2) + '%' });
	}

	return (
		<div className="sim-spell-stats">
			<div className="sim-logging-header">
				<h2>Overall Stats</h2>
			</div>

			<div className="sim-overview-grid">
				{overall.map((item, index) => (
					<div key={index} className="stat-box">
						<div className="stat-value">{item.value}</div>
						<div className="stat-label">{item.label}</div>
					</div>
				))}
			</div>

			<div className="sim-spell-stats-wrapper">
				<div className="sim-spell-section">
					<div className="section-title">Outgoing</div>

					{outgoing.map((spell, index) => (
						<div key={index} className="spell-row">
							<div className="spell-head">
								<div className="spell-name">{spell.Name}</div>
								<div className="spell-dps">
									{spell.DPS} <span>DPS</span>
								</div>
								<div className="spell-casts">
									{((spell.Casts as number) / (simdata.iterations as number)).toFixed(2)} <span>casts</span>
								</div>
							</div>
							<div className="spell-bar-wrap">
								{Object.entries(spell.Results).map(([result, value]) => {
									return (
										<div
											key={`${spell.Name}-${result}`}
											className={`${result.toLowerCase()}-bar`}
											style={{ width: `${((value as number) / spell.Casts) * 100}%` }}></div>
									);
								})}
							</div>
							<div className="legend">
								{Object.entries(spell.Results).map(([result, value]) => {
									if (value !== 0)
										return (
											<span key={result} className={'legend-item ' + result.toLowerCase()}>
												<i></i>
												{result} {(((value as number) / spell.Casts) * 100).toFixed(2)}%
											</span>
										);
								})}
							</div>
						</div>
					))}
				</div>

				{incoming.length > 0 && (
					<div className="sim-spell-section">
						<div className="section-title">Incoming</div>

						<div className="spell-row">
							{incoming.map((spell, index) => (
								<div key={index} className="spell-row">
									<div className="spell-head">
										<div className="spell-name">{spell.Name}</div>
										<div className="spell-dps">
											{spell.DPS} <span>DPS</span>
										</div>
										<div className="spell-casts">
											{((spell.Casts as number) / (simdata.iterations as number)).toFixed(2)} <span>swings</span>
										</div>
									</div>
									<div className="spell-bar-wrap">
										{Object.entries(spell.Results).map(([result, value]) => {
											return (
												<div
													key={`${spell.Name}-${result}`}
													className={`${result.toLowerCase()}-bar`}
													style={{ width: `${((value as number) / spell.Casts) * 100}%` }}></div>
											);
										})}
									</div>
									<div className="legend">
										{Object.entries(spell.Results).map(([result, value]) => {
											if (value !== 0)
												return (
													<span key={result} className={'legend-item ' + result.toLowerCase()}>
														<i></i>
														{result} {(((value as number) / spell.Casts) * 100).toFixed(2)}%
													</span>
												);
										})}
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default SimSpellStats;
