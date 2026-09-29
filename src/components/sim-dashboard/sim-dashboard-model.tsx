import './sim-dashboard-model.scss';
import { useStore } from '@core/shared/store';
import type { Item } from '@core/shared/types';
import { generateModels } from 'wow-model-viewer';
import { useEffect, useRef, useState } from 'react';

type ClassicModelInstance = { destroy: () => void };
const generateClassicModel = generateModels as unknown as (
	aspect: number,
	containerSelector: string,
	character: { race: number; gender: number; items: [number, number][] },
	env: 'classic',
) => Promise<ClassicModelInstance>;

function SimDashboardModel() {
	const { getPlayerRace, getItems } = useStore();
	const modelContainer = useRef<HTMLDivElement>(null);
	const modelInstance = useRef<ClassicModelInstance | null>(null);
	const [modelError, setModelError] = useState(false);
	const playerRace = getPlayerRace();
	const items = getItems();
	const viewerSlots: Record<string, number> = {
		head: 1,
		neck: 2,
		shoulder: 3,
		shirt: 4,
		chest: 5,
		waist: 6,
		legs: 7,
		feet: 8,
		wrists: 9,
		hands: 10,
		finger1: 11,
		finger2: 12,
		trinket1: 13,
		trinket2: 14,
		back: 15,
		mainhand: 21,
		offhand: 22,
		ranged: 18,
		tabard: 19,
		twohand: 21,
	};
	const modelItems = Object.entries(items).flatMap(([slot, slotItems]) => {
		const viewerSlot = viewerSlots[slot];
		if (!viewerSlot) return [];
		return (slotItems as Item[])
			.filter(item => item.selected && Number(item.displayid) && Number(item.displayid) > 0)
			.map(item => [viewerSlot, item.displayid!] as [number, number]);
	});
	const modelItemsKey = modelItems.map(([slot, displayId]) => `${slot}:${displayId}`).join(',');

	useEffect(() => {
		const container = modelContainer.current;
		if (!container) return;

		let cancelled = false;
		setModelError(false);
		container.replaceChildren();
		//(globalThis as any).CONTENT_PATH = '/ForeverSim/modelviewer/classicplus/';
		(globalThis as any).CONTENT_PATH = '/modelviewer/classicplus/';

		generateClassicModel(0.65, '#sim-paperdoll-model', { race: Number(playerRace) || 1, gender: 1, items: modelItems }, 'classic')
			.then(model => {
				if (cancelled) model.destroy();
				else modelInstance.current = model;
			})
			.catch(error => {
				console.error('Unable to initialize character model', error);
				if (!cancelled) setModelError(true);
			});

		return () => {
			cancelled = true;
			modelInstance.current?.destroy();
			modelInstance.current = null;
		};
	}, [playerRace, modelItemsKey]);

	return (
		<div id="sim-paperdoll-model" className="sim-dashboard-model" ref={modelContainer} aria-label="Character model">
			{modelError && (
				<span className="model-error">Model only when running locally unless someone can find me a host with all the texture files</span>
			)}
		</div>
	);
}

export default SimDashboardModel;
