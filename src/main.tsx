import './index.scss';
import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import React from 'react';

const SpellGenerator = React.lazy(() => import('./generators/SpellGenerator.tsx'));
const ItemGenerator = React.lazy(() => import('./generators/ItemGenerator.tsx'));
const EnchantGenerator = React.lazy(() => import('./generators/EnchantGenerator.tsx'));
const ItemSetGenerator = React.lazy(() => import('./generators/ItemSetGenerator.tsx'));
const ClassicWarrior = React.lazy(() => import('./modules/warrior/App.tsx'));
// const ClassicHunter = React.lazy(() => import('./modules/hunter/App.tsx'));

const router = createBrowserRouter(
	createRoutesFromElements(
		<Route>
			<Route path="/" element={<ClassicWarrior />} />
			<Route path="/warrior" element={<ClassicWarrior />} />
			<Route path="/share/:shareId" element={<ClassicWarrior />} />
			{/* <Route path="/hunter" element={<ClassicHunter />} /> */}
			<Route path="/items" element={<ItemGenerator />} />
			<Route path="/spells" element={<SpellGenerator />} />
			<Route path="/enchants" element={<EnchantGenerator />} />
			<Route path="/sets" element={<ItemSetGenerator />} />
		</Route>,
	),
	{ basename: import.meta.env.BASE_URL },
);

function Loading() {
	return (
		<div className="loader-container">
			<span className="loader"></span>
		</div>
	);
}

createRoot(document.getElementById('root')!).render(
	// <StrictMode>
	<Suspense fallback={<Loading />}>
		<RouterProvider router={router} />
	</Suspense>,
	// </StrictMode>,
);
