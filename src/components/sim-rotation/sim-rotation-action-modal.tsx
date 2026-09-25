import { useState } from 'react';
import { useStore } from '@core/shared/store';
import './sim-rotation-action-modal.scss';
import SimModal from '@components/sim-modal/sim-modal';
import type { AbilityObject } from '@core/shared/types';
import SimIcon from '@components/sim-icon/sim-icon';
import { SimTabs, SimTabsItem } from '@components/sim-tabs/sim-tabs';
import templateSpells from '@modules/spells';
import { ConditionType } from '@core/shared/enums';
import { getMaxSpellLevel } from '@core/shared/utils';

export default function SimRotationActionModal(props: { isOpen: boolean; onClose: () => void; phase: number }) {
	const store = useStore();
	const [filterText, setFilterText] = useState('');
	const normalizedFilter = filterText.trim().toLowerCase();

	const [tab, setTab] = useState(0);
	const { getItems, getAbilities, getSetting, getSpell, getPlayerLevel, getActions, setActions, getPlayerRace } = store;
	let items = getItems();
	let actions = getActions();
	let abilities = getAbilities();
	let level = getPlayerLevel();
	let race = getPlayerRace();

	function addAction(id: number, name: string, path: string, item: any = undefined) {
		let phase;
		let conditions: any[] = [];
		if (item && item.useSpell) {
			let spell = templateSpells[item.useSpell];
			let timeleft = spell.duration;
			for (let action of actions) {
				if (action.item && action.conditions.length > 0)
					for (let condition of action.conditions) {
						if (condition.resource == ConditionType.TimeRemaining) timeleft += condition.maxtimeleft;
					}
			}
			if (spell && spell.duration)
				conditions.push({ comparator: '<=', resource: ConditionType.TimeRemaining, value: timeleft / 1000, maxtimeleft: timeleft });
		}
		if (!item) phase = props.phase;
		actions.push({ id: id, name: name, path: path, phase: phase, conditions: conditions, item: !!item });
		setActions([...actions]);
		props.onClose();
	}

	return (
		<SimModal isOpen={props.isOpen} onClose={props.onClose}>
			<div className="sim-rotation-action-modal">
				<h3>Add Action</h3>
				<div className="filter">
					<input type="text" placeholder="Search" value={filterText} onInput={event => setFilterText(event.currentTarget.value)} />
				</div>
				<SimTabs>
					<SimTabsItem text="Class" selected={tab == 0} handleClick={() => setTab(0)}></SimTabsItem>
					<SimTabsItem text="Items" selected={tab == 1} handleClick={() => setTab(1)}></SimTabsItem>
					<SimTabsItem text="Custom" selected={tab == 2} handleClick={() => setTab(2)}></SimTabsItem>
					<SimTabsItem text="Racial" selected={tab == 3} handleClick={() => setTab(3)}></SimTabsItem>
				</SimTabs>
				<div className="actions">
					{Object.entries(items).map((itemList: any) => {
						return itemList[1].map((item: any) => {
							if (normalizedFilter && !item.name.includes(normalizedFilter)) return null;
							if (tab == 1 && item.selected && item.useSpell) {
								let spell = getSpell(item.useSpell);
								return (
									<div className="action" key={spell.id} onClick={() => addAction(spell.id, item.name, item.path, item)}>
										<SimIcon key={spell.id} id={spell.id} name={item.name} img={item.path}></SimIcon>
										<p>{item.name}</p>
									</div>
								);
							}
						});
					})}
					{abilities.map((ability: AbilityObject) => {
						let spell = getSpell(ability.id);
						if (spell && spell.baseLevel && level < spell.baseLevel) return null;
						if (spell && !ability.requires && level > getMaxSpellLevel(spell.id, templateSpells, abilities)) return null;

						if (spell && ability.requires) {
							for (let req in ability.requires) {
								if (getSetting(ability.requires[req].name).value !== ability.requires[req].value) return null;
							}
						}

						if (ability.phase && ability.phase != props.phase) return null;
						if (ability.race && tab != 3) return null;
						if (ability.custom && tab != 2) return null;
						if (ability.item && tab != 1) return null;
						if (!ability.custom && !ability.race && !ability.item && tab != 0) return null;
						if (ability.race && race != ability.race) return null;

						const name = (ability.name || spell?.name || '').toLowerCase();
						if (normalizedFilter && !name.includes(normalizedFilter)) return null;

						return (
							<div className="action" key={ability.id} onClick={() => addAction(ability.id, ability.name || spell.name, ability.path || spell.path)}>
								<SimIcon key={ability.id} id={ability.id} name={ability.name || spell.name} img={ability.path || spell.path}></SimIcon>
								<p>{ability.name || spell.name}</p>
							</div>
						);
					})}
				</div>
			</div>
		</SimModal>
	);
}
