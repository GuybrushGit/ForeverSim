import './sim-form-range.scss';

function SimFormRange(props: { label: string; name: string; min: number; max: number; value: string; handleChange: any }) {
	function inputChange(event: any) {
		let value = event.target.value;
		value = Math.min(props.max, Math.max(props.min, value));
		props.handleChange(props.name, value);
	}

	return (
		<div className="sim-form-range">
			<p>{props.label}</p>
			<input type="range" name={props.name + '-slider'} min={props.min} max={props.max} value={props.value} onInput={inputChange} />
			<input type="number" name={props.name} value={props.value} onInput={inputChange} />
		</div>
	);
}

export default SimFormRange;
