import './sim-rotation.scss';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import SimRotationAction from './sim-rotation-action';
import SimMenu, { SimMenuItem } from '@components/sim-menu/sim-menu';
import { ArrowDownIcon, ArrowUpIcon, DownloadSimpleIcon, PlusIcon } from '@phosphor-icons/react';
import { type PresetObject } from '@core/shared/types';
import { useState } from 'react';
import { SimTabs, SimTabsItem } from '@components/sim-tabs/sim-tabs';
import { Action } from '@core/game/action';
import { useStore } from '@core/shared/store';
import SimRotationActionModal from './sim-rotation-action-modal';
import { ConditionType } from '@core/shared/enums';

export default function SimRotation() {
	const store = useStore();
	const [phase, setPhase] = useState(0);
	const [isActionModalOpen, setIsActionModalOpen] = useState(false);
	const { getActions, setActions, getPhases, getPresets } = store;
	let actions = getActions();
	let phases = getPhases();
	let presets = getPresets();

	function handleOnDragEnd(result: any) {
		if (!result.destination) return;
		const newActions = Array.from(actions);
		const [draggedItem] = newActions.splice(result.source.index, 1);
		newActions.splice(result.destination.index, 0, draggedItem);
		setActions(newActions);
	}

	function removeAction(action: any) {
		let newActions = actions.filter((a: any) => a !== action);
		setActions(newActions);
	}

	function updateActions() {
		generateCondition();
		setActions([...actions]);
	}

	function loadPreset(actions: Action[]) {
		setActions(actions);
	}

	function changePhase(id: number) {
		setPhase(id);
	}

	function openActionModal() {
		setIsActionModalOpen(true);
	}

	function closeActionModal() {
		setIsActionModalOpen(false);
	}

	function generateCondition() {
		for (let action of actions) {
			for (let condition of action.conditions) {
				delete condition.minpower;
				delete condition.maxpower;
				delete condition.mintimeleft;
				delete condition.maxtimeleft;
				delete condition.mintimepassed;
				delete condition.maxtimepassed;
				delete condition.minswingtimer;
				delete condition.maxswingtimer;

				if (!condition.resource) continue;
				switch (condition.resource) {
					case ConditionType.Power:
						if (condition.comparator == '>=') condition.minpower = Number(condition.value) * 10;
						if (condition.comparator == '<=') condition.maxpower = Number(condition.value) * 10;
						break;
					case ConditionType.TimeRemaining:
						if (condition.comparator == '>=') condition.mintimeleft = Number(condition.value) * 1000;
						if (condition.comparator == '<=') condition.maxtimeleft = Number(condition.value) * 1000;
						break;
					case ConditionType.TimeElapsed:
						if (condition.comparator == '>=') condition.mintimepassed = Number(condition.value) * 1000;
						if (condition.comparator == '<=') condition.maxtimepassed = Number(condition.value) * 1000;
						break;
					case ConditionType.MainHandSwing:
						if (condition.comparator == '>=') condition.minswingtimer = Number(condition.value) * 1000;
						if (condition.comparator == '<=') condition.maxswingtimer = Number(condition.value) * 1000;
						break;
					case ConditionType.Precast:
						condition.precast = true;
						break;
				}
			}
		}
	}

	return (
		<div className="sim-rotation">
			<SimTabs>
				{phases.map((p: any) => {
					return <SimTabsItem key={p.id} text={p.name} selected={p.id == phase} handleClick={() => changePhase(p.id)}></SimTabsItem>;
				})}
			</SimTabs>
			<p className="dnd-label">
				Highest Priority <ArrowUpIcon></ArrowUpIcon>
			</p>
			<DragDropContext onDragEnd={handleOnDragEnd}>
				<Droppable droppableId="actionsDroppable">
					{provided => {
						return (
							<ul ref={provided.innerRef} {...provided.droppableProps}>
								{actions.map((action: any, index: number) => {
									if (action.phase !== undefined && phase != action.phase) return;
									return (
										<Draggable key={action.id + '_' + index} draggableId={'id' + action.id.toString()} index={index}>
											{provided => (
												<li ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps}>
													<SimRotationAction action={action} updateActions={updateActions} removeAction={removeAction}></SimRotationAction>
												</li>
											)}
										</Draggable>
									);
								})}
								{provided.placeholder}
							</ul>
						);
					}}
				</Droppable>
			</DragDropContext>
			<p className="dnd-label" style={{ bottom: '0px' }}>
				Lowest Priority <ArrowDownIcon></ArrowDownIcon>
			</p>
			<div className="buttons">
				<button onClick={openActionModal}>
					<PlusIcon size={16}></PlusIcon>
					<p>Add Action</p>
				</button>
				<SimMenu icon={<DownloadSimpleIcon size={18}></DownloadSimpleIcon>} text="Load Preset" expandUp={true}>
					{presets.map((preset: PresetObject) => {
						if (preset.type == 'rotation') {
							return <SimMenuItem key={preset.name} text={preset.name} handleClick={() => loadPreset(preset.value)}></SimMenuItem>;
						}
					})}
				</SimMenu>
			</div>
			<SimRotationActionModal isOpen={isActionModalOpen} onClose={closeActionModal} phase={phase}></SimRotationActionModal>
		</div>
	);
}
