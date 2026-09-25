import { useStore } from '@core/shared/store';
import './sim-aura-uptime.scss';

function SimAuraUptime() {
	const store = useStore();
	const { simdata, getSpells } = store;

	let uptimes: any[] = [];
	if (Object.keys(simdata).length == 0) return;
	Object.keys(simdata.spells).forEach(key => {
		if (!simdata.spells[key].uptime) return;
		let ids = key.split('|');
		let spell = getSpells()[ids[0]];
		if (!spell) return;

		uptimes.push({
			name: spell.name + (ids[1] == '1' ? ' MH' : ids[1] == '2' ? ' OH' : '') + (ids[2] !== '' ? ' ' + ids[2] : ''),
			target: ids[2] ? ids[2] : undefined,
			pct: ((simdata.spells[key].uptime / simdata.durationsteps) * 100).toFixed(2),
			color: ids[2] ? 'buff' : 'debuff',
		});
	});
	uptimes.sort((a, b) => a.name.localeCompare(b.name));

	return (
		<div className="sim-aura-uptime">
			<div className="sim-logging-header">
				<h2>Aura Uptime</h2>
			</div>

			<div className="sim-aura-uptime-wrapper">
				<div className="sim-aura-uptime-section">
					<div className="section-title">BUFFS ON PLAYER</div>
					{uptimes
						.filter(a => !a.target)
						.map((aura, index) => {
							return (
								<div key={index} className="uptime-row">
									<div className="uptime-label-row">
										<span>{aura.name}</span>
										<span className="uptime-value">{aura.pct}%</span>
									</div>
									<div className="uptime-bar-wrap">
										<div className={`uptime-bar ${aura.color}`} style={{ width: `${aura.pct}%` }}></div>
									</div>
								</div>
							);
						})}
				</div>

				{uptimes.filter(a => a.target).length > 0 && (
					<div className="sim-aura-uptime-section">
						<div className="section-title">DEBUFFS ON TARGET</div>
						{uptimes
							.filter(a => a.target)
							.map((aura, index) => {
								return (
									<div key={index} className="uptime-row">
										<div className="uptime-label-row">
											<span>{aura.name}</span>
											<span className="uptime-value">{aura.pct}%</span>
										</div>
										<div className="uptime-bar-wrap">
											<div className={`uptime-bar ${aura.color}`} style={{ width: `${aura.pct}%` }}></div>
										</div>
									</div>
								);
							})}
					</div>
				)}
			</div>
		</div>
	);
}

export default SimAuraUptime;
