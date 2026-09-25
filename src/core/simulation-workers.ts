import { WorkerEvent } from './shared/enums';
import { getSetting } from './shared/utils';

const MAX_WORKERS = 10;
export class SimulationWorkers {
	maxWorkers: number;
	states: any[] = [];
	workers: any[] = [];
	update: any;
	finish: any;

	// spreadsheet stuff
	parallel: boolean = false;
	counter: number = 0;
	maxCounter: number = 0;
	data: any;
	itemData: any;
	iterations: number = 0;

	constructor() {
		this.maxWorkers = Math.min(MAX_WORKERS, navigator.hardwareConcurrency || MAX_WORKERS);
		for (let i = 0; i < this.maxWorkers; i++) {
			let worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
			worker.onerror = err => {
				console.log(err);
				worker.terminate();
			};
			worker.onmessage = (event: any) => {
				const type = event.data.event;
				this.states[i] = event.data;
				switch (type) {
					case WorkerEvent.Update:
						// update
						this.update(this.states);
						break;
					case WorkerEvent.Finished:
						if (!this.states.filter(state => state.event === WorkerEvent.Update).length) {
							// all threads done
							if (!this.parallel) this.finish(this.states);
							else {
								if (this.counter >= this.maxCounter) this.finish(this.states);
								else {
									this.update(this.states);
									this.compareItems();
								}
							}
						}
						break;
					default:
						worker.terminate();
				}
			};
			this.workers.push(worker);
		}
	}

	start(data: any, update: any, finish: any) {
		this.parallel = false;
		this.states = Array(this.maxWorkers).fill({ progress: 0, dmg: 0, threat: 0, duration: 0 });
		this.update = update;
		this.finish = finish;
		data.iterations = Number(getSetting(data.settings, 'simulations').value);

		if (data.iterations == 1) this.workers[0].postMessage({ data });
		else if (data.worker_index !== undefined) this.workers[data.worker_index].postMessage({ data });
		else {
			data.iterations = ~~(data.iterations / this.workers.length);
			this.workers.forEach(worker => worker.postMessage({ data }));
		}
	}
	compareItems(data?: any, iterations?: number, update?: any, finish?: any) {
		this.parallel = true;
		if (update) this.update = update;
		if (finish) this.finish = finish;
		if (iterations) this.iterations = iterations;
		if (data) {
			this.counter = 0;
			this.data = data;
			this.data.iterations = this.iterations;
			this.itemData = this.data.test_slot.includes('enchant') ? this.data.enchants[this.data.test_slot] : this.data.items[this.data.test_slot];
			this.maxCounter = this.itemData.length;
		}
		if (data && data.threshold) {
			this.itemData = this.itemData.filter((item: any) => item.dps > data.threshold);
			this.maxCounter = this.itemData.length;
		}
		if (data && data.pinned) {
			this.itemData = this.itemData.filter((item: any) => item.pinned);
			this.maxCounter = this.itemData.length;
		}

		this.states = [];
		for (let i = 0; i < this.maxWorkers; i++) this.states.push({ progress: 0, dmg: 0, threat: 0, duration: 0 });

		for (let i = 0; i < this.maxWorkers; i++) {
			if (i + this.counter >= this.maxCounter) {
				this.states[i].event = WorkerEvent.Finished;
			} else {
				this.workers[i].postMessage({ data: this.data, test_item: this.itemData[i + this.counter] });
			}
		}

		this.counter += this.maxWorkers;
	}
}
