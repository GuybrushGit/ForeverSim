import './sim-dashboard.scss';
import SimDashboardProfiles from './sim-dashboard-profiles';
import SimDashboardPaperdoll from './sim-dashboard-paperdoll';
import SimSpreadsheetTable from '@components/sim-spreadsheet/sim-spreadsheet-table';
import { useStore } from '@core/shared/store';
import { useState } from 'react';
import SimDashboardStatWeights from './sim-dashboard-stat-weights';

function SimDashboard() {
	const store = useStore();
	const { slot, getPlayerClass, getPlayerLevel } = store;
	const [showStatWeights, setShowStatWeights] = useState(false);

	return (
		<div className="sim-dashboard">
			<div className="sim-dashboard-left">
				<p>
					Level {getPlayerLevel()} {getPlayerClass()}
				</p>
				<SimDashboardPaperdoll statWeights={showStatWeights} setStatWeights={setShowStatWeights}></SimDashboardPaperdoll>
				<SimDashboardProfiles></SimDashboardProfiles>
			</div>
			<div key={slot} className="sim-dashboard-right">
				{!showStatWeights && <SimSpreadsheetTable dashboard={true} />}
				{showStatWeights && <SimDashboardStatWeights />}
			</div>
		</div>
	);
}

export default SimDashboard;
