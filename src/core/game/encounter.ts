import { getSetting } from '@core/shared/utils';

export class Encounter {
	iterations: number;
	duration: number;
	durationdelta: number;
	executeperc: number;
	position: number;
	initialpower: number;
	reactionmin: number;
	reactionmax: number;

	constructor(data: any) {
		this.iterations = Number(getSetting(data.settings, 'simulations').value);
		this.duration = Number(getSetting(data.settings, 'duration').value) * 1000;
		this.durationdelta = Number(getSetting(data.settings, 'durationdelta').value) * 1000;
		this.executeperc = Number(getSetting(data.settings, 'executeperc').value);
		this.position = Number(getSetting(data.settings, 'position').value);
		this.initialpower = Number(getSetting(data.settings, 'initialpower').value);
		this.reactionmin = Number(getSetting(data.settings, 'reactionmin').value);
		this.reactionmax = Number(getSetting(data.settings, 'reactionmax').value);
	}
}
