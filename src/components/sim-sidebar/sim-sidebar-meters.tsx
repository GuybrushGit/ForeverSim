import { useRef } from 'react';
import './sim-sidebar-meters.scss';
import { useStore } from '@core/shared/store';
import { round } from '@core/shared/utils';

function SimSidebarMeters() {
	const store = useStore();
	const { getPlayerClassId, getSettings, getActions, getItems, getEnchants, getTalents, getBuffs, getAbilities, setSimdata } = store;

	const dpsInputRef = useRef(null);
	const tpsInputRef = useRef(null);
	const tmiInputRef = useRef(null);
	const dtpsInputRef = useRef(null);
	const timeInputRef = useRef(null);
	const progressBarRef = useRef(null);

	function refresh() {
		let starttime = Date.now();
		if (!dpsInputRef.current) return;
		if (!tpsInputRef.current) return;
		if (!tmiInputRef.current) return;
		if (!dtpsInputRef.current) return;
		if (!timeInputRef.current) return;
		if (!progressBarRef.current) return;
		const dpsInput = dpsInputRef.current as HTMLElement;
		const tpsInput = tpsInputRef.current as HTMLElement;
		const tmiInput = tmiInputRef.current as HTMLElement;
		const dtpsInput = dtpsInputRef.current as HTMLElement;
		const timeInput = timeInputRef.current as HTMLElement;
		const progressBar = progressBarRef.current as HTMLElement;
		dpsInput.innerText = '';
		tpsInput.innerText = '';
		dtpsInput.innerText = '';
		tmiInput.innerText = '';

		(globalThis as any).workers.start(
			{
				classid: getPlayerClassId(),
				settings: getSettings(),
				actions: getActions(),
				items: getItems(),
				enchants: getEnchants(),
				talents: getTalents(),
				buffs: getBuffs(),
				abilities: getAbilities(),
			},
			(states: any[]) => {
				let progress = 0;
				let totalduration = 0;
				let totaldmg = 0;
				let totalthreat = 0;
				let totaldmgtaken = 0;
				let totaltmi = 0;
				states.forEach(s => {
					progress += s.progress * 100;
					totalduration += s.duration;
					totaldmg += s.dmg;
					totalthreat += s.threat;
					totaldmgtaken += s.dmgtaken;
					totaltmi += s.tmi;
				});
				let perc = ~~(progress / states.length);
				let dps = round(totaldmg / totalduration);
				let tps = round(totalthreat / totalduration);

				dpsInput.innerText = dps.toString();
				tpsInput.innerText = tps.toString();
				if (totaldmgtaken) dtpsInput.innerText = round(totaldmgtaken / totalduration).toString();
				if (totaltmi) {
					let iterations = (globalThis as any).workers.states.reduce((a: any, b: any) => a + b.iterations * b.progress, 0);
					tmiInput.innerText = round(totaltmi / iterations).toString();
				}

				progressBar.style.width = perc + '%';
				timeInput.innerText = '-';
			},
			(states: any[]) => {
				let totalduration = 0;
				let totaldmg = 0;
				let totalthreat = 0;
				let totaldmgtaken = 0;
				let totaltmi = 0;
				states.forEach(s => {
					totalduration += s.duration;
					totaldmg += s.dmg;
					totalthreat += s.threat;
					totaldmgtaken += s.dmgtaken;
					totaltmi += s.tmi;
				});
				let dps = round(totaldmg / totalduration);
				let tps = round(totalthreat / totalduration);

				dpsInput.innerText = dps.toString();
				tpsInput.innerText = tps.toString();
				if (totaldmgtaken) dtpsInput.innerText = round(totaldmgtaken / totalduration).toString();
				if (totaltmi) {
					let iterations = (globalThis as any).workers.states.reduce((a: any, b: any) => a + b.iterations, 0);
					tmiInput.innerText = round(totaltmi / iterations).toString();
				}

				progressBar.style.width = '0%';
				timeInput.innerText = round((Date.now() - starttime) / 1000) + ' s';

				mergeData(states);
			},
		);
	}

	// merges simdata from all the different workers
	function mergeData(states: any[]) {
		let spells: Record<string, { results: number[]; damage: number; threat: number; uptime: number }> = {};
		states.forEach((state: any) => {
			if (!state?.simdata || Object.keys(state.simdata).length === 0) return;
			Object.entries(state.simdata).forEach(([key, value]: [string, any]) => {
				if (key == 'iterations') return;
				if (!spells[key]) {
					spells[key] = {
						results: Array(12).fill(0),
						damage: 0,
						threat: 0,
						uptime: 0,
					};
				}
				spells[key].results = spells[key].results.map((total, index) => total + (value.results?.[index] ?? 0));
				spells[key].damage += value.damage ?? 0;
				spells[key].uptime += value.uptime ?? 0;
			});
		});

		let simdata = {
			spells: spells,
			iterations: 0,
			durationsteps: 0,
		};
		states.forEach((state: any) => {
			simdata.iterations += state.iterations;
			simdata.durationsteps += state.durationsteps;
		});

		setSimdata(simdata);
	}

	return (
		<div className="sim-sidebar-meters">
			<div className="dps">
				<p className="value" ref={dpsInputRef}></p>
				<p className="label">DPS</p>
			</div>
			<div className="tps">
				<p className="value" ref={tpsInputRef}></p>
				<p className="label">TPS</p>
			</div>
			<div className="tmi">
				<p className="value" ref={tmiInputRef}></p>
				<p className="label">TMI</p>
			</div>
			<div className="dtps">
				<p className="value" ref={dtpsInputRef}></p>
				<p className="label">DTPS</p>
			</div>
			<div className="time">
				<p ref={timeInputRef}></p>
			</div>
			<button className="sim-refresh" onClick={refresh}>
				Simulate
				<div className="progress" style={{ width: '0' }} ref={progressBarRef}></div>
			</button>
		</div>
	);
}

export default SimSidebarMeters;
