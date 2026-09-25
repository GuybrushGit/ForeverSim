import { CombatResult, EventType, GetCombatResult } from '@core/shared/enums';
import './sim-combat-log.scss';
import type { Event } from '@core/shared/types';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useStore } from '@core/shared/store';
import { Encounter } from '@core/game/encounter';
import { Player } from '@core/game/player';
import { getTargetArray, Target } from '@core/game/target';
import { Simulation } from '@core/simulation';

function SimCombatLog(props: { events: Event[] }) {
	const store = useStore();
	const [filter, setFilter] = useState('');
	const { getPlayerClassId, getSettings, getActions, getItems, getEnchants, getTalents, getBuffs, getAbilities } = store;
	const [events, setEvents] = useState<Event[]>(props.events);

	useEffect(() => {
		setEvents(props.events);
	}, [props.events]);
	function filterChange(event: any) {
		setFilter(event.target.value);
	}
	function getEventString(event: Event) {
		let msg = '';
		let incoming = false;
		let color = 'transparent';
		let value = event.value;
		let result = 'hit';
		if (event.result && event.result != CombatResult.Normal) result = GetCombatResult(event.result).toLowerCase();

		switch (event.type) {
			case EventType.AuraStart:
				color = 'lightgreen';
				msg = `<span class="aura">${event.spell && event.spell.name}</span> aura started`;
				break;
			case EventType.AuraEnd:
				color = 'lightgreen';
				msg = `<span class="aura">${event.spell && event.spell.name}</span> aura ended`;
				break;
			case EventType.AuraCharge:
				color = 'lightgreen';
				msg = `<span class="aura">${event.spell && event.spell.name}</span> charge removed`;
				break;
			case EventType.PowerChange:
				msg = `Rage ${(event.value || 0) < 0 ? 'lost' : 'gained'} <span class="power">${event.value}</span>`;
				break;
			case EventType.FormChange:
				color = '#a1587a';
				msg = `Form changed to <span class="form">${event.spell && event.spell.name}</span>`;
				break;

			case EventType.AttackDone:
				msg = `${event.weapon && event.weapon.offhand ? 'Off' : 'Main'} attack <span class="${result}">${result}</span> ${value ? `for <span class="dmg">${value}</span>` : ''}`;
				break;
			case EventType.SpellDone:
				color = 'Tomato';
				msg = `<span class="spell">${event.spell && event.spell.name}</span> <span class="${result}">${result}</span> ${value ? `for <span class="dmgspell">${value}</span>` : ''}`;
				break;
			case EventType.AttackReceived:
				incoming = true;
				msg = `Incoming attack <span class="${result}">${result}</span> ${value ? `for <span class="dmg">${value}</span>` : ''}`;
				break;
			case EventType.SpellStartCasting:
				color = 'DarkOrchid';
				msg = `Start casting <span class="spell">${event.spell && event.spell.name}</span>`;
				break;
			case EventType.AuraTick:
				color = 'Tomato';
				msg = `<span class="spell">${event.spell && event.spell.name}</span> tick <span class="${result}">${result}</span> for <span class="dmgspell">${value}</span>`;
				break;
			case EventType.ExtraAttack:
				color = 'Tomato';
				msg = `<span class="spell">${event.value}</span> extra attack added`;
				break;
			case EventType.Custom:
				color = 'Tomato';
				msg = `<span class="spell">${event.value}</span>`;
				break;
			case EventType.Threat:
				color = 'Tomato';
				msg = `<span class="spell">Threat ${event.threat && event.threat < 0 ? 'decreased by' : 'increased by'} ${event.threat}</span>`;
				break;
		}
		return { color, msg, incoming };
	}
	function refreshLog() {
		const data = {
			classid: getPlayerClassId(),
			settings: getSettings(),
			actions: getActions(),
			items: getItems(),
			enchants: getEnchants(),
			talents: getTalents(),
			buffs: getBuffs(),
			abilities: getAbilities(),
		};

		const encounter = new Encounter(data);
		const player = new Player(data);
		const targets: Target[] = getTargetArray(data, player);
		const sim = new Simulation(encounter, targets, player);

		sim.run();
		setEvents(sim.events);
	}
	return (
		<div className="sim-combat-log">
			<div className="sim-logging-header">
				<h2>Combat Log</h2>
			</div>
			<div className="sim-combat-log-filter">
				<button onClick={refreshLog}>
					<ArrowsClockwiseIcon size="16"></ArrowsClockwiseIcon>
				</button>
				<input type="text" placeholder="Search" onChange={filterChange}></input>
			</div>

			<div className="sim-combat-log-scroll">
				{events.map((event, index) => {
					let obj = getEventString(event);
					if (filter && !obj.msg.toLocaleLowerCase().includes(filter.toLocaleLowerCase())) return;
					return (
						<div key={index} className={clsx('log-row', obj.incoming && 'incoming')} style={{ borderLeft: '2px solid ' + obj.color }}>
							<span className="log-time">{(event.step / 1000).toFixed(3).padStart(6, '0')}</span>
							<span dangerouslySetInnerHTML={{ __html: obj.msg }}></span>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default SimCombatLog;
