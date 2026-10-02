import './sim-sidebar.scss';
import clsx from 'clsx';
import { SpeedometerIcon, SwordIcon, GearIcon, FadersIcon, ChartBarIcon, ListIcon, XIcon } from '@phosphor-icons/react';
import SimSidebarMeters from './sim-sidebar-meters';
import { useStore } from '@core/shared/store';
import SimDashboardStats from '@components/sim-dashboard/sim-dashboard-stats';
import { Player } from '@core/game/player';
import { getTargetArray, Target } from '@core/game/target';
import { Encounter } from '@core/game/encounter';
import { Simulation } from '@core/simulation';
import { useState } from 'react';

function SimSidebarStatsDrawer() {
	const store = useStore();
	const { getPlayerClassId, getItems, getEnchants, getSettings, getActions, getTalents, getBuffs, getAbilities } = store;
	const data = {
		classid: getPlayerClassId(),
		settings: getSettings(),
		actions: getActions(),
		items: getItems(),
		enchants: getEnchants(),
		talents: getTalents(),
		buffs: getBuffs(),
		abilities: getAbilities(),
	};
	const encounter = new Encounter(data);
	const player = new Player(data);
	const targets: Target[] = getTargetArray(data, player);
	const sim = new Simulation(encounter, targets, player);

	return (
		<div className="sim-sidebar-stats-content">
			<section>
				<h2>Base</h2>
				<SimDashboardStats type="base" sim={sim}></SimDashboardStats>
			</section>
			<section>
				<h2>Defensive</h2>
				<SimDashboardStats type="defensive" sim={sim}></SimDashboardStats>
			</section>
			<section>
				<h2>Mainhand</h2>
				<SimDashboardStats type="mainhand" sim={sim}></SimDashboardStats>
			</section>
			<section>
				<h2>Offhand</h2>
				<SimDashboardStats type="offhand" sim={sim}></SimDashboardStats>
			</section>
		</div>
	);
}

function SimSidebar() {
	const store = useStore();
	const { section, setSection } = store;
	const [statsOpen, setStatsOpen] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);

	function clickEvent(option: string) {
		if (option == 'logs') (globalThis.document.querySelector('.sim-refresh') as HTMLElement)?.click();
		setSection(option);
		setMenuOpen(false);
	}

	function SimSidebarOption(option: { id: string; text: string; icon: any }) {
		let active = section == option.id;
		return (
			<button className={clsx('sim-sidebar-option', active && 'active')} onClick={() => clickEvent(option.id)}>
				<option.icon size={16} />
				<p>{option.text}</p>
			</button>
		);
	}

	return (
		<div className={clsx('sim-sidebar-shell', menuOpen && 'menu-open', statsOpen && 'stats-open')}>
			<div className="sim-sidebar-topbar">
				<button
					aria-label={menuOpen ? 'Close menu' : 'Open menu'}
					aria-expanded={menuOpen}
					aria-controls="sim-sidebar-nav"
					onClick={() => {
						setMenuOpen(!menuOpen);
						setStatsOpen(false);
					}}>
					{menuOpen ? <XIcon size={20} /> : <ListIcon size={20} />}
				</button>
				<button
					aria-label={statsOpen ? 'Hide character stats' : 'Show character stats'}
					aria-expanded={statsOpen}
					aria-controls="sim-sidebar-stats-panel"
					className={clsx(statsOpen && 'active')}
					onClick={() => {
						setStatsOpen(!statsOpen);
						setMenuOpen(false);
					}}>
					<ChartBarIcon size={20} />
				</button>
			</div>
			<div
				className="sim-sidebar-backdrop"
				aria-hidden="true"
				onClick={() => {
					setMenuOpen(false);
					setStatsOpen(false);
				}}></div>
			<div className="sim-sidebar" id="sim-sidebar-nav">
				<p>logo here</p>
				<hr />
				<SimSidebarOption id="dashboard" text="Dashboard" icon={SpeedometerIcon}></SimSidebarOption>
				<SimSidebarOption id="spreadsheet" text="Spreadsheet" icon={SwordIcon}></SimSidebarOption>
				<SimSidebarOption id="settings" text="Settings" icon={GearIcon}></SimSidebarOption>
				<SimSidebarOption id="logs" text="Logs & Stats" icon={FadersIcon}></SimSidebarOption>
				<SimSidebarMeters></SimSidebarMeters>
			</div>
			<button
				className="sim-sidebar-stats-toggle"
				aria-label={statsOpen ? 'Hide character stats' : 'Show character stats'}
				aria-expanded={statsOpen}
				aria-controls="sim-sidebar-stats-panel"
				title={statsOpen ? 'Hide character stats' : 'Show character stats'}
				onClick={() => setStatsOpen(!statsOpen)}>
				<span>
					<ChartBarIcon size={18}></ChartBarIcon>
				</span>
			</button>
			<aside
				id="sim-sidebar-stats-panel"
				className={clsx('sim-sidebar-stats-panel', statsOpen && 'open')}
				aria-label="Character stats"
				aria-hidden={!statsOpen}>
				{statsOpen && <SimSidebarStatsDrawer />}
			</aside>
		</div>
	);
}

export default SimSidebar;
