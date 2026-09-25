import './sim-logs.scss';
import { useEffect, useState } from 'react';
import { useStore } from '@core/shared/store';
import { Encounter } from '@core/game/encounter';
import { Player } from '@core/game/player';
import { getTargetArray, Target } from '@core/game/target';
import { Simulation } from '@core/simulation';
import SimCombatLog from './sim-combat-log';
import type { Event } from '@core/shared/types';
import SimAuraUptime from './sim-aura-uptime';
import SimSpellStats from './sim-spell-stats';

function SimLogs() {
	const store = useStore();
	const { getPlayerClassId, getSettings, getActions, getItems, getEnchants, getTalents, getBuffs, getAbilities } = store;
	const [events, setEvents] = useState([] as Event[]);

	useEffect(() => {
		if (events.length) return;

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
	}, [events.length, getSettings, getActions, getItems, getEnchants, getTalents, getBuffs]);

	return (
		<div className="sim-logging">
			<SimCombatLog events={events}></SimCombatLog>
			<SimAuraUptime></SimAuraUptime>
			<SimSpellStats></SimSpellStats>
		</div>
	);
}

export default SimLogs;
