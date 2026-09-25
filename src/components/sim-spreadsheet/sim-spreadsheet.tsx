import SimSpreadsheetHeader from './sim-spreadsheet-header';
import SimSpreadsheetTable from './sim-spreadsheet-table';
import './sim-spreadsheet.scss';

function SimSpreadsheet() {
	return (
		<div className="sim-spreadsheet">
			<SimSpreadsheetHeader></SimSpreadsheetHeader>
			<SimSpreadsheetTable dashboard={false} />
		</div>
	);
}

export default SimSpreadsheet;
