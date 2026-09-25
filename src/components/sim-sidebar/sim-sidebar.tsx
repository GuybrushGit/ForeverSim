import './sim-sidebar.scss';
import clsx from 'clsx';
import { SpeedometerIcon, SwordIcon, GearIcon, FadersIcon } from '@phosphor-icons/react';
import SimSidebarMeters from './sim-sidebar-meters';
import { useStore } from '@core/shared/store';

function SimSidebar() {
	const store = useStore();
	const { section, setSection } = store;

	function clickEvent(option: string) {
		if (option == 'logs') (globalThis.document.querySelector('.sim-refresh') as HTMLElement)?.click();
		setSection(option);
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
		<div className="sim-sidebar">
			<p>logo here</p>
			<hr />
			<SimSidebarOption id="dashboard" text="Dashboard" icon={SpeedometerIcon}></SimSidebarOption>
			<SimSidebarOption id="spreadsheet" text="Spreadsheet" icon={SwordIcon}></SimSidebarOption>
			<SimSidebarOption id="settings" text="Settings" icon={GearIcon}></SimSidebarOption>
			<SimSidebarOption id="logs" text="Logs & Stats" icon={FadersIcon}></SimSidebarOption>
			<SimSidebarMeters></SimSidebarMeters>
		</div>
	);
}

export default SimSidebar;
