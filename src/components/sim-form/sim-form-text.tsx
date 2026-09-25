import './sim-form-text.scss';

function SimFormText(props: { label: string; name: string; type: 'number' | 'text'; value: string; handleChange: any }) {
	function inputChange(event: any) {
		props.handleChange(props.name, event.target.value);
	}

	return (
		<div className="sim-form-text">
			<p>{props.label}</p>
			<input type={props.type} name={props.name} min={0} value={props.value} onChange={inputChange} />
		</div>
	);
}

export default SimFormText;
