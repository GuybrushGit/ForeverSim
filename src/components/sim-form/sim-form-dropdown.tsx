import './sim-form-dropdown.scss';

function SimFormDropdown(props: { label?: string; name: string; value: string; handleChange: any; options: any }) {
	function inputChange(event: any) {
		props.handleChange(props.name, event.target.value);
	}

	return (
		<div className="sim-form-dropdown">
			{props.label && <p>{props.label}</p>}
			<select dir="rtl" name={props.name} onChange={inputChange} value={props.value}>
				{props.options.map((option: any, index: number) => {
					return (
						<option key={index} value={option.value}>
							{option.label}
						</option>
					);
				})}
			</select>
		</div>
	);
}

export default SimFormDropdown;
