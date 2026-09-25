import { XIcon } from '@phosphor-icons/react';
import './sim-rotation-condition.scss';
import type { ConditionObject } from '@core/shared/types';
import { useStore } from '@core/shared/store';
import { ClassMask, ConditionType } from '@core/shared/enums';

function SimRotationCondition(props: {
	condition: ConditionObject;
	updateActions: any;
	removeCondition: any;
	hold: boolean;
	precast: boolean;
	phase: string;
}) {
	const store = useStore();
	const { getActions, getSpell, getPlayerClassId } = store;
	let actions = getActions();
	let classid = getPlayerClassId();

	const resources = [
		{ id: ConditionType.Power, label: classid == ClassMask.Warrior ? 'Rage' : 'Mana' },
		{ id: ConditionType.TimeRemaining, label: 'Time remaining' },
		{ id: ConditionType.TimeElapsed, label: 'Time elapsed' },
		{ id: ConditionType.MainHandSwing, label: 'Mainhand swing timer' },
		{ id: ConditionType.Precast, label: 'Precast' },
	];
	const comparators = [
		{ id: '>=', label: '>=' },
		{ id: '<=', label: '<=' },
	];

	function resourceChange(event: any) {
		props.condition.resource = Number(event.target.value);
		props.updateActions();
	}
	function comparatorChange(event: any) {
		props.condition.comparator = event.target.value;
		props.updateActions();
	}
	function valueChange(event: any) {
		props.condition.value = event.target.value;
		props.updateActions();
	}

	function getLine() {
		return (
			<>
				<select name="resource" onChange={resourceChange} defaultValue={props.condition.resource}>
					<option key={-1} value={''}></option>
					{props.hold &&
						actions.map((action: any, index: number) => {
							if (action.phase !== undefined && action.phase != props.phase) return;
							if (!getSpell(action.id) || !getSpell(action.id).cooldown) return;
							return (
								<option key={index} value={action.id.toString()}>
									{action.name} cooldown
								</option>
							);
						})}

					{!props.hold &&
						resources.map((resource: any, index: number) => {
							if (resource.id == ConditionType.Precast && !props.precast) return;
							return (
								<option key={index} value={resource.id}>
									{resource.label}
								</option>
							);
						})}
				</select>

				{props.condition.resource && props.condition.resource != ConditionType.Precast && (
					<select name="resource" onChange={comparatorChange} defaultValue={props.condition.comparator}>
						<option key={-1} value={''}></option>
						{comparators.map((comparator: any, index: number) => {
							return (
								<option key={index} value={comparator.id}>
									{comparator.label}
								</option>
							);
						})}
					</select>
				)}

				{props.condition.resource && props.condition.resource != ConditionType.Precast && props.condition.comparator && (
					<input type="number" name="value" value={props.condition.value} onChange={valueChange}></input>
				)}
			</>
		);
	}

	return (
		<div className="sim-rotation-condition">
			<XIcon size={14} weight="bold" onClick={() => props.removeCondition(props.condition)} style={{ cursor: 'pointer' }}></XIcon>
			{getLine()}
		</div>
	);
}

export default SimRotationCondition;
