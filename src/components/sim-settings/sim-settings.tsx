import './sim-settings.scss';
import { useState } from 'react';
import SimFormText from '@components/sim-form/sim-form-text';
import SimFormRange from '@components/sim-form/sim-form-range';
import SimFormRadio from '@components/sim-form/sim-form-radio';
import SimFormDropdown from '@components/sim-form/sim-form-dropdown';
import SimIcon from '@components/sim-icon/sim-icon';
import type { BuffsField, SettingsField } from '@core/shared/types';
import { useStore } from '@core/shared/store';
import { TargetIcon } from '@phosphor-icons/react';
import SimModal from '@components/sim-modal/sim-modal';
import SimTalents from '@components/sim-talents/sim-talents';
import SimRotation from '@components/sim-rotation/sim-rotation';
// import SimDashboardPaperdoll from '@components/sim-dashboard/sim-dashboard-paperdoll';
// import SimCombatLog from '@components/sim-logs/sim-combat-log';
// import SimLogs from '@components/sim-logs/sim-logs';

function SimSettings() {
	const store = useStore();
	const [selectedTarget, setSelectedTarget] = useState(1);
	const { getSettings, setSettings, getBuffs, setBuffs, getPlayerLevel, getSetting, getBuff, getBuffGroup, getTalentString } = store;
	const [isTalentsModalOpen, setIsTalentsModalOpen] = useState(false);
	let settings = getSettings();
	let buffs = getBuffs();

	function handleInputChange(id: string, value: string) {
		setSettings(id, value);
	}

	function handleClickBuff(id: number, select: boolean) {
		let buff = getBuff(id);
		if (buff.group && select) {
			let group = getBuffGroup(buff.group);
			for (let b of group) setBuffs(b.id, false);
		}
		setBuffs(id, select);
	}

	function buildField(field: SettingsField, index: number) {
		if (field.type == 'range') {
			return (
				<SimFormRange
					key={index}
					name={field.id}
					label={field.label}
					value={field.value.toString()}
					handleChange={handleInputChange}
					min={field.min || 0}
					max={field.max || 0}></SimFormRange>
			);
		}
		if (field.type == 'number' || field.type == 'text') {
			return (
				<SimFormText
					key={index}
					name={field.id}
					label={field.label}
					type={field.type}
					value={field.value.toString()}
					handleChange={handleInputChange}></SimFormText>
			);
		}
		if (field.type == 'radio') {
			return (
				<SimFormRadio
					key={index}
					label={field.label}
					name={field.id}
					value={field.value.toString()}
					options={field.options}
					handleChange={handleInputChange}></SimFormRadio>
			);
		}
		if (field.type == 'dropdown') {
			return (
				<SimFormDropdown
					key={index}
					name={field.id}
					label={field.label}
					value={field.value.toString()}
					options={field.options}
					handleChange={handleInputChange}></SimFormDropdown>
			);
		}
	}

	function buildBuff(buff: BuffsField, index: number) {
		let level = getPlayerLevel();
		if (buff.minlevel && level < buff.minlevel) return;
		if (buff.maxlevel && level > buff.maxlevel) return;
		if (buff.ischild) return;
		if (buff.requires) {
			for (let req in buff.requires) {
				if (getSetting(buff.requires[req].name).value !== buff.requires[req].value) return;
			}
		}
		let child = buff.child && getBuff(buff.child);
		return (
			<SimIcon
				key={index}
				id={buff.id}
				name={buff.name}
				img={buff.path}
				item={!!buff.item}
				greyed={true}
				selected={buff.selected}
				handleClick={handleClickBuff}>
				{child && (
					<SimIcon
						id={child.id}
						name={child.name}
						img={child.path}
						item={!!child.item}
						greyed={true}
						child={true}
						selected={child.selected}
						handleClick={handleClickBuff}></SimIcon>
				)}
			</SimIcon>
		);
	}

	function showTalentsModal() {
		setIsTalentsModalOpen(true);
	}

	function closeTalentsModal() {
		setIsTalentsModalOpen(false);
	}

	function setTarget(t: number) {
		setSelectedTarget(t);
	}

	return (
		<div className="sim-settings">
			<div>
				<div>
					<div className="sim-settings-block">
						<p className="title">Player</p>
						{settings.player.map((field: any, index: number) => {
							return buildField(field, index);
						})}
						<div className="sim-form-text">
							<p>Talents</p>
							<input type="text" value={getTalentString()} name="talents" readOnly></input>
							<button onClick={showTalentsModal}>
								<TargetIcon size={16}></TargetIcon>
								<p style={{ whiteSpace: 'nowrap', paddingLeft: 0 }}>Set Talents</p>
							</button>
						</div>
					</div>
					<div className="sim-settings-block">
						{selectedTarget == 1 && [
							<p className="title" key="1">
								Main Target
							</p>,
							settings.target1.map((field: any, index: number) => {
								return buildField(field, index);
							}),
						]}
						{selectedTarget == 2 && [
							<p className="title" key="2">
								Target 2
							</p>,
							settings.target2.map((field: any, index: number) => {
								return buildField(field, index);
							}),
						]}
						{selectedTarget == 3 && [
							<p className="title" key="3">
								Target 3
							</p>,
							settings.target3.map((field: any, index: number) => {
								return buildField(field, index);
							}),
						]}
						{selectedTarget == 4 && [
							<p className="title" key="4">
								Target 4
							</p>,
							settings.target4.map((field: any, index: number) => {
								return buildField(field, index);
							}),
						]}
						<div className="buttons">
							<button className={selectedTarget == 1 ? 'active' : ''} onClick={() => setTarget(1)}>
								<p>Main Target</p>
							</button>
							<button className={selectedTarget == 2 ? 'active' : ''} onClick={() => setTarget(2)}>
								<p>Target 2</p>
							</button>
							<button className={selectedTarget == 3 ? 'active' : ''} onClick={() => setTarget(3)}>
								<p>Target 3</p>
							</button>
							<button className={selectedTarget == 4 ? 'active' : ''} onClick={() => setTarget(4)}>
								<p>Target 4</p>
							</button>
						</div>
					</div>
					<div className="sim-settings-block">
						<p className="title">Encounter</p>
						{settings.encounter.map((field: any, index: number) => {
							return buildField(field, index);
						})}
					</div>
				</div>
				<div>
					<div className="sim-settings-icons">
						<p className="title">World Buffs</p>
						<div>
							{buffs.worldbuffs.map((buff: any, index: number) => {
								return buildBuff(buff, index);
							})}
						</div>
					</div>
					<div className="sim-settings-icons">
						<p className="title">Raid Buffs</p>
						<div>
							{buffs.raidbuffs.map((buff: any, index: number) => {
								return buildBuff(buff, index);
							})}
						</div>
					</div>
					<div className="sim-settings-icons">
						<p className="title">Debuffs</p>
						<div>
							{buffs.debuffs.map((buff: any, index: number) => {
								return buildBuff(buff, index);
							})}
						</div>
					</div>
					<div className="sim-settings-icons">
						<p className="title">Consumables</p>
						<div>
							{buffs.consumables.map((buff: any, index: number) => {
								return buildBuff(buff, index);
							})}
						</div>
					</div>
					<div className="sim-settings-icons">
						<p className="title">Others</p>
						<div>
							{buffs.others.map((buff: any, index: number) => {
								return buildBuff(buff, index);
							})}
						</div>
					</div>
				</div>
				{/* <SimDashboardPaperdoll></SimDashboardPaperdoll>
				<SimLogs></SimLogs> */}
				<div className="sim-settings-rotation">
					<p className="title">Rotation</p>
					<SimRotation></SimRotation>
				</div>
			</div>
			<SimModal isOpen={isTalentsModalOpen} onClose={closeTalentsModal}>
				<SimTalents></SimTalents>
			</SimModal>
		</div>
	);
}

export default SimSettings;
