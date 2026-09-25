import { useStore } from './core/shared/store';
import { useEffect } from 'react';
import SimSidebar from '@components/sim-sidebar/sim-sidebar';
import SimSettings from '@components/sim-settings/sim-settings';
import SimSpreadsheet from '@components/sim-spreadsheet/sim-spreadsheet';
import SimLogs from '@components/sim-logs/sim-logs';
import SimDashboard from '@components/sim-dashboard/sim-dashboard';
import { getSharedProfile } from '@core/shared/shared-profiles';
import type { Profile } from '@core/shared/types';
import { useParams } from 'react-router-dom';

export function App(props: { route: string; className: string; classId: number; defaultProfile?: Profile }) {
	const store = useStore();
	const { shareId } = useParams();

	useEffect(() => {
		let cancelled = false;
		store.setRoute(props.route);

		async function initializeProfile() {
			if (shareId) {
				try {
					const sharedProfile = await getSharedProfile(shareId);
					if (cancelled || sharedProfile.class !== props.className) return;
					const id = `${props.route}-shared-${shareId}`;
					store.addProfile({ ...sharedProfile, id });
					store.setProfile(id);
					return;
				} catch (error) {
					console.error(error);
				}
			}

			const profileList = store.getProfileList();
			if (Object.keys(profileList).length == 0) {
				const id = props.route + '0';
				const defaultProfile = props.defaultProfile ?? {
					name: 'Default',
					level: 60,
					race: 1,
					class: props.className,
					classid: props.classId,
					talents: {},
					settings: {},
					buffs: [],
					items: {},
					enchants: {},
					actions: [],
				};
				store.setProfileList({
					[id]: {
						...structuredClone(defaultProfile),
						id,
					},
				});
				store.setProfile(id);
			}

			if (!store.profile || store.profile.indexOf(props.route) == -1) {
				store.setProfile(props.route + '0');
			}
		}

		initializeProfile();
		return () => {
			cancelled = true;
		};
	}, [props.route, props.className, props.classId, shareId]);

	if (store.profile == '') return <div></div>;

	return (
		<>
			<SimSidebar></SimSidebar>
			<div className="section-container">
				{store.section == 'dashboard' && <SimDashboard></SimDashboard>}
				{store.section == 'spreadsheet' && <SimSpreadsheet></SimSpreadsheet>}
				{store.section == 'settings' && <SimSettings></SimSettings>}
				{store.section == 'logs' && <SimLogs></SimLogs>}
			</div>
		</>
	);
}
