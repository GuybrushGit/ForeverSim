import { getTargetArray, Target } from './game/target';
import { Player } from './game/player';
import { Simulation } from './simulation';
import { Encounter } from './game/encounter';
import { EncounterPosition, EventType, WorkerEvent } from './shared/enums';
import { round } from './shared/utils';

onmessage = async (params: any) => {
	let encounter = new Encounter(params.data.data);
	let player = new Player(params.data.data, params.data.data.test_slot, params.data.test_item);
	let targets: Target[] = getTargetArray(params.data.data, player);

	let totaltmi = 0;
	let totaldmg = 0;
	let totalthreat = 0;
	let totaldmgtaken = 0;
	let totalduration = 0;
	let totaldurationsteps = 0;
	let updatestep = Math.max(~~(params.data.data.iterations / 100), 25);

	let simdata = {} as any;
	for (let i = 0; i < params.data.data.iterations; i++) {
		let sim = new Simulation(encounter, targets, player);
		sim.run();

		let auras_start = {} as any;
		for (let event of sim.events) {
			// damage done
			if (event.type == EventType.AttackDone || event.type == EventType.SpellDone || event.type == EventType.AuraTick) {
				totaldmg += event.value || 0;
				totalthreat += event.threat || 0;

				let index = '0';
				if (event.type == EventType.AttackDone) index = event.weapon && event.weapon.offhand ? '2' : '1';
				else index = event.spell ? event.spell.id.toString() : '0';

				if (!simdata[index]) simdata[index] = { results: Array(12).fill(0), damage: 0, uptime: 0 };
				if (event.result) simdata[index].results[event.result]++;
				if (event.value) simdata[index].damage += Math.round(event.value);
			}
			// damage received
			if (event.type == EventType.AttackReceived) {
				let index = '3';
				if (!simdata[index]) simdata[index] = { results: Array(12).fill(0), damage: 0, uptime: 0 };
				if (event.result) simdata[index].results[event.result]++;
				if (event.value) simdata[index].damage += Math.round(event.value);
				totaldmgtaken += event.value || 0;
			}
			// aura uptime
			if (event.type == EventType.AuraStart) {
				if (!event.spell) continue;
				let index = `${event.spell.id.toString()}|${!event.weapon ? 0 : event.weapon.offhand ? 2 : 1}|${event.target ? event.target.index : ''}`;
				if (!auras_start[index]) auras_start[index] = event.step;
				totalthreat += event.threat || 0;
			}
			if (event.type == EventType.AuraEnd) {
				if (!event.spell) continue;
				let index = `${event.spell.id.toString()}|${!event.weapon ? 0 : event.weapon.offhand ? 2 : 1}|${event.target ? event.target.index : ''}`;
				if (auras_start[index]) {
					if (!simdata[index]) simdata[index] = { results: Array(12).fill(0), damage: 0, uptime: 0 };
					simdata[index].uptime += event.step - auras_start[index];
					auras_start[index] = 0;
				}
			}
			if (event.type == EventType.Threat) {
				totalthreat += event.threat || 0;
			}
		}

		// uptime for auras still up at the end of fight
		Object.keys(auras_start).forEach(key => {
			if (!simdata[key]) simdata[key] = { results: Array(12).fill(0), damage: 0, uptime: 0 };
			if (auras_start[key]) simdata[key].uptime += sim.duration - auras_start[key];
		});

		totaldurationsteps += sim.duration;
		totalduration += round(sim.duration / 1000);
		if (encounter.position == EncounterPosition.Front) totaltmi += sim.getTMI();

		if (i % updatestep == 0)
			self.postMessage({
				event: WorkerEvent.Update,
				progress: i / params.data.data.iterations,
				dmg: totaldmg,
				threat: totalthreat,
				dmgtaken: totaldmgtaken,
				tmi: totaltmi,
				duration: totalduration,
				test_itemId: params.data.test_item && params.data.test_item.id,
				iterations: params.data.data.iterations,
			});
	}

	self.postMessage({
		event: WorkerEvent.Finished,
		progress: 1,
		dmg: totaldmg,
		threat: totalthreat,
		dmgtaken: totaldmgtaken,
		tmi: totaltmi,
		duration: totalduration,
		durationsteps: totaldurationsteps,
		test_itemId: params.data.test_item && params.data.test_item.id,
		simdata,
		iterations: params.data.data.iterations,
	});
};
