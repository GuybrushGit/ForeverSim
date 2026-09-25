import SimIcon from '@components/sim-icon/sim-icon';
import './sim-rotation-action.scss';
import { DotsSixVerticalIcon, TrashIcon, PlusIcon } from '@phosphor-icons/react';
import type { ConditionObject } from '@core/shared/types';
import SimRotationCondition from './sim-rotation-condition';
import { useStore } from '@core/shared/store';
import { getTalentByName } from '@core/shared/utils';
import clsx from 'clsx';
import templateSpells from '@modules/spells';

function SimRotationAction(props: { action: any; updateActions: any; removeAction: any }) {
	let disabled = false;
	let canPrecast = false;

	const store = useStore();
	const { getTalents, getAbilities, getPlayerRace, getItems, getSetting } = store;

	const race = getPlayerRace();
	const talents = getTalents();
	const talent = getTalentByName(talents, props.action.name) as any;
	if (talent && !talent.c) disabled = true;
	const abilities = getAbilities();
	for (let ability of abilities) {
		if (ability.id == props.action.id && ability.race && ability.race != race) disabled = true;
		if (ability.id == props.action.id && ability.requires) {
			for (let req in ability.requires) {
				let set = getSetting(ability.requires[req].name);
				if (set && set.value !== ability.requires[req].value) disabled = true;
			}
		}
	}

	let spell = templateSpells[props.action.id];
	if (spell && spell.hasAura && !spell.isDamageSpell) canPrecast = true;

	if (props.action.item) {
		let enabled = false;
		const items = getItems();
		Object.entries(items).forEach(([_slot, itemList]: [string, any]) => {
			itemList.forEach((item: any) => {
				if (item.selected && item.useSpell && props.action.id == item.useSpell) enabled = true;
			});
		});
		if (!enabled) disabled = true;
	}

	function addCondition() {
		props.action.conditions.push({});
		props.updateActions();
	}

	function removeCondition(condition: ConditionObject) {
		props.action.conditions = props.action.conditions.filter((c: ConditionObject) => c !== condition);
		props.updateActions();
	}

	return (
		<div className="sim-rotation-action">
			<div className={clsx('action-wrapper', disabled ? 'disabled' : '')}>
				<div className="top">
					<SimIcon id={props.action.id} img={props.action.path} name={props.action.name}></SimIcon>
					<span className="action-title">{props.action.name}</span>
					<div className="buttons">
						<button onClick={addCondition}>
							<PlusIcon size={16}></PlusIcon> Add Condition
						</button>
						<button onClick={() => props.removeAction(props.action)}>
							<TrashIcon size={16}></TrashIcon> Delete
						</button>
						<DotsSixVerticalIcon size={24} className="drag-icon" />
					</div>
				</div>
				<div className="bottom">
					{props.action.conditions.map((condition: ConditionObject, index: number) => {
						return (
							<SimRotationCondition
								key={index}
								condition={condition}
								updateActions={props.updateActions}
								removeCondition={removeCondition}
								hold={props.action.id == 2}
								precast={canPrecast}
								phase={props.action.phase}></SimRotationCondition>
						);
					})}
				</div>
			</div>
		</div>
	);
}

export default SimRotationAction;
