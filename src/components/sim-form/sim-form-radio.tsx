import './sim-form-radio.scss';

function SimFormRadioField(props: { label: string; name: string; value: string; checked: boolean; handleChange: any }) {
	return (
		<div className="sim-form-radio-field">
			<input type="radio" id={props.name + props.value} name={props.name} value={props.value} checked={props.checked} onChange={props.handleChange} />
			<label htmlFor={props.name + props.value}>{props.label}</label>
		</div>
	);
}

function SimFormRadio(props: { label: string; name: string; value: string; options: any; handleChange: any }) {
	function handleChange(event: any) {
		props.handleChange(props.name, event.target.value);
	}
	return (
		<div className="sim-form-radio">
			<p>{props.label}</p>
			{props.options.map((option: any, index: number) => {
				return (
					<SimFormRadioField
						key={index}
						name={props.name}
						label={option.label}
						value={option.value}
						checked={option.value == props.value}
						handleChange={handleChange}></SimFormRadioField>
				);
			})}
		</div>
	);
}

export default SimFormRadio;
