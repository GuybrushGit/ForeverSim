import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import './sim-dashboard-stat-weights.scss';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '@core/shared/store';
import { round } from '@core/shared/utils';

function SimDashboardStatWeights() {
	const store = useStore();
	const { getPlayerClassId, getSettings, getActions, getItems, getEnchants, getTalents, getBuffs, getAbilities } = store;
	const [scale, setScale] = useState('DPS');
	const [calculating, setCalculating] = useState(false);

	const dps = useMemo(() => {
		return Array(6).fill(0);
	}, []);

	useEffect(() => {
		if (!dps[0]) calcWeights();
		else setWeights();
	}, [scale]);

	const dpsBar = useRef(null);
	const dpsScale = useRef(null);
	const apBar = useRef(null);
	const apScale = useRef(null);
	const strBar = useRef(null);
	const strScale = useRef(null);
	const agiBar = useRef(null);
	const agiScale = useRef(null);
	const critBar = useRef(null);
	const critScale = useRef(null);
	const hitBar = useRef(null);
	const hitScale = useRef(null);

	function calcWeights() {
		setCalculating(true);
		runTest({}, 0);
		runTest({ melee_ap: 20 }, 1);
		runTest({ str: 20 }, 2);
		runTest({ agi: 20 }, 3);
		runTest({ crit: [0, 2, 0, 0, 0, 0, 0, 0] }, 4);
		runTest({ hit: [0, 1, 0, 0, 0, 0, 0, 0] }, 5);
	}

	function runTest(stats: any, worker_index: number) {
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
				custom: stats,
				worker_index,
			},
			(states: any[]) => {
				states.forEach((s: any, idx: number) => {
					if (!s.duration) return;
					dps[idx] = s.dmg / s.duration;
				});
				setWeights();
			},
			(states: any[]) => {
				states.forEach((s: any, idx: number) => {
					if (!s.duration) return;
					dps[idx] = s.dmg / s.duration;
				});
				setWeights();
				setCalculating(false);
			},
		);
	}

	function setWeights() {
		if (!dpsBar.current) return;
		if (!dpsScale.current) return;
		if (!apBar.current) return;
		if (!apScale.current) return;
		if (!strBar.current) return;
		if (!strScale.current) return;
		if (!agiBar.current) return;
		if (!agiScale.current) return;
		if (!critBar.current) return;
		if (!critScale.current) return;
		if (!hitBar.current) return;
		if (!hitScale.current) return;

		let baseline = dps[0];
		let apDPS = (dps[1] - baseline) / 20;
		let strDPS = (dps[2] - baseline) / 20;
		let agiDPS = (dps[3] - baseline) / 20;
		let critDPS = (dps[4] - baseline) / 2;
		let hitDPS = dps[5] - baseline;

		let compare = 1;
		if (scale == 'AP') compare = apDPS;
		if (scale == 'STR') compare = strDPS;
		if (scale == 'AGI') compare = agiDPS;

		(dpsScale.current as HTMLElement).innerText = round(compare).toFixed(2);
		(apScale.current as HTMLElement).innerText = round(apDPS / compare).toFixed(2);
		(strScale.current as HTMLElement).innerText = round(strDPS / compare).toFixed(2);
		(agiScale.current as HTMLElement).innerText = round(agiDPS / compare).toFixed(2);
		(critScale.current as HTMLElement).innerText = round(critDPS / compare).toFixed(2);
		(hitScale.current as HTMLElement).innerText = round(hitDPS / compare).toFixed(2);

		let max = scale == 'AP' ? 4 : 2;
		(dpsBar.current as HTMLElement).style.width = (compare / max) * 100 + '%';
		(apBar.current as HTMLElement).style.width = (apDPS / compare / max) * 100 + '%';
		(strBar.current as HTMLElement).style.width = (strDPS / compare / max) * 100 + '%';
		(agiBar.current as HTMLElement).style.width = (agiDPS / compare / max) * 100 + '%';
		(critBar.current as HTMLElement).style.width = (critDPS / compare / max) * 100 + '%';
		(hitBar.current as HTMLElement).style.width = (hitDPS / compare / max) * 100 + '%';
	}

	return (
		<div className="sim-dashboard-stat-weights">
			<div className="stat-weights-heading">
				<h2>Stat Weights</h2>
			</div>

			<div className="weights-grid">
				<section className="weights-panel">
					<div className="weight-list">
						<div className="weight-row" key={'dps'}>
							<div className="weight-label">
								<span>+1 DPS</span>
							</div>
							<div className="weight-bar">
								<span style={{ width: 0 }} ref={dpsBar}></span>
							</div>
							<strong ref={dpsScale}>{'1.00'}</strong>
							<div className="weight-scale">{scale}</div>
						</div>
						<div className="weight-row" key={'ap'}>
							<div className="weight-label">
								<span>+1 Attack Power</span>
							</div>
							<div className="weight-bar">
								<span style={{ width: 0 }} ref={apBar}></span>
							</div>
							<strong ref={apScale}>{'1.00'}</strong>
							<div className="weight-scale">{scale}</div>
						</div>
						<div className="weight-row" key={'str'}>
							<div className="weight-label">
								<span>+1 Strength</span>
							</div>
							<div className="weight-bar">
								<span style={{ width: 0 }} ref={strBar}></span>
							</div>
							<strong ref={strScale}>{'1.00'}</strong>
							<div className="weight-scale">{scale}</div>
						</div>
						<div className="weight-row" key={'agi'}>
							<div className="weight-label">
								<span>+1 Agility</span>
							</div>
							<div className="weight-bar">
								<span style={{ width: 0 }} ref={agiBar}></span>
							</div>
							<strong ref={agiScale}>{'1.00'}</strong>
							<div className="weight-scale">{scale}</div>
						</div>
						<div className="weight-row" key={'crit'}>
							<div className="weight-label">
								<span>+1% Crit</span>
							</div>
							<div className="weight-bar">
								<span style={{ width: 0 }} ref={critBar}></span>
							</div>
							<strong ref={critScale}>{'1.00'}</strong>
							<div className="weight-scale">{scale}</div>
						</div>
						<div className="weight-row" key={'hit'}>
							<div className="weight-label">
								<span>+1% Hit</span>
							</div>
							<div className="weight-bar">
								<span style={{ width: 0 }} ref={hitBar}></span>
							</div>
							<strong ref={hitScale}>{'1.00'}</strong>
							<div className="weight-scale">{scale}</div>
						</div>
					</div>
				</section>

				<aside className="weights-side">
					<section className="settings-panel">
						<div className="panel-header">
							<h3>Scale to</h3>
						</div>
						<div className="panel-buttons">
							<button key="sDPS" className={scale == 'DPS' ? 'selected' : ''} onClick={() => setScale('DPS')}>
								DPS
							</button>
							<button key="sAP" className={scale == 'AP' ? 'selected' : ''} onClick={() => setScale('AP')}>
								Attack Power
							</button>
							<button key="sSTR" className={scale == 'STR' ? 'selected' : ''} onClick={() => setScale('STR')}>
								Strength
							</button>
							<button key="sAGI" className={scale == 'AGI' ? 'selected' : ''} onClick={() => setScale('AGI')}>
								Agility
							</button>
						</div>
						<div className="panel-bottom">
							<button disabled={calculating} onClick={() => calcWeights()}>
								<ArrowsClockwiseIcon size="14"></ArrowsClockwiseIcon> Refresh
							</button>
						</div>
					</section>
				</aside>
			</div>
		</div>
	);
}

export default SimDashboardStatWeights;
