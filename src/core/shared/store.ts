import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const global = globalThis as any;
export const useStore = create()(
	persist(
		(set, get: any) => ({
			section: 'dashboard',
			slot: 'mainhand',
			route: '',
			setSection: (obj: string) => set(() => ({ section: obj })),
			setSlot: (obj: string) => set(() => ({ slot: obj })),
			setRoute: (obj: string) => set(() => ({ route: obj })),

			// profiles
			profile: '',
			profileList: {} as any,
			setProfile: (obj: string) => set(() => ({ profile: obj })),
			getProfileList: () => {
				let route = get().route;
				if (!route) return {};
				return Object.fromEntries(Object.entries(get().profileList).filter(([, profile]: [string, any]) => profile.id.includes(route)));
			},
			setProfileList: (obj: any) =>
				set((state: any) => {
					const profileList = Object.fromEntries(
						Object.entries(state.profileList)
							.filter(([, profile]: [string, any]) => !profile.id.includes(state.route))
							.concat(Object.entries(obj)),
					);
					return { profileList };
				}),
			addProfile: (profile: any) =>
				set((state: any) => ({
					profileList: { ...state.profileList, [profile.id]: profile },
				})),

			// settings
			getPlayerRace: () => {
				return get().profileList[get().profile].race;
			},
			getPlayerClass: () => {
				return get().profileList[get().profile].class;
			},
			getPlayerClassId: () => {
				return get().profileList[get().profile].classid;
			},
			getPlayerLevel: () => {
				return get().profileList[get().profile].level;
			},
			getSettings: () => {
				let profileSettings = get().profileList[get().profile].settings;
				for (let type in global.templateSettings) {
					for (let setting of global.templateSettings[type]) {
						if (profileSettings[setting.id] !== undefined) setting.value = profileSettings[setting.id];
					}
				}
				return global.templateSettings;
			},
			getSetting(id: string): any {
				let settings = get().getSettings();
				for (let type in settings) {
					for (let i in settings[type]) {
						if (settings[type][i].id == id) return settings[type][i];
					}
				}
			},
			setSettings: (id: string, value: string) =>
				set(() => {
					let profile = get().profile;
					let profileList = get().profileList;
					profileList[profile].settings[id] = value;
					if (id == 'playerLevel') profileList[profile].level = Number(value);
					if (id == 'race') profileList[profile].race = Number(value);
					return { profileList };
				}),

			// buffs
			getBuffs: () => {
				let profileBuffs = get().profileList[get().profile].buffs;
				for (let type in global.templateBuffs) {
					for (let buff of global.templateBuffs[type]) {
						buff.selected = false;
						if (profileBuffs.includes(buff.id)) buff.selected = true;
					}
				}
				return global.templateBuffs;
			},
			getBuff: (id: number) => {
				let buffs = get().getBuffs();
				for (let type in buffs) {
					for (let buff of buffs[type]) {
						if (buff.id == id) return buff;
					}
				}
			},
			getBuffGroup: (group: string) => {
				let g = [];
				let buffs = get().getBuffs();
				for (let type in buffs) {
					for (let buff of buffs[type]) {
						if (buff.group == group) g.push(buff);
					}
				}
				return g;
			},
			setBuffs: (id: number, select: boolean) =>
				set(() => {
					let profile = get().profile;
					let profileList = get().profileList;
					if (!select) profileList[profile].buffs = profileList[profile].buffs.filter((buff: number) => buff != id);
					else profileList[profile].buffs.push(id);
					return { profileList };
				}),

			// talents
			getTalents: () => {
				let profileTalents = get().profileList[get().profile].talents;
				for (let tree of global.templateTalents) {
					for (let talent of tree.t) {
						talent.c = 0;
						if (profileTalents[talent.i]) talent.c = profileTalents[talent.i];
					}
				}
				return global.templateTalents;
			},
			getTalentString(): string {
				let talents = get().profileList[get().profile].talents;
				let counts = [] as number[];
				let trees = get().getTalents();
				trees.forEach((tree: any) => {
					let count = 0;
					tree.t.forEach((talent: any) => {
						if (talents[talent.i]) count += talents[talent.i];
					});
					counts.push(count);
				});
				return counts.join(' / ');
			},
			setTalent: (id: number, count: number) =>
				set(() => {
					let profile = get().profile;
					let profileList = get().profileList;
					profileList[profile].talents[id] = count;
					return { profileList };
				}),
			setTalents: (talents: any) =>
				set(() => {
					let profile = get().profile;
					let profileList = get().profileList;
					profileList[profile].talents = talents;
					return { profileList };
				}),

			// items
			getItems: () => {
				if (!get().profile) return global.templateItems;
				let profileItems = get().profileList[get().profile].items;
				for (let slot in global.templateItems) {
					for (let item of global.templateItems[slot]) {
						delete item.selected;
						delete item.pinned;
						delete item.acquired;
						if (profileItems[slot]) {
							for (let j in profileItems[slot]) {
								if (j == item.id.toString() && (!item.rand || item.rand == profileItems[slot][j].rand)) {
									if (profileItems[slot][j].selected) item.selected = true;
									if (profileItems[slot][j].pinned) item.pinned = true;
									if (profileItems[slot][j].acquired) item.acquired = true;
								}
							}
						}
					}
				}
				return global.templateItems;
			},
			setItem: (slot: string, id: number, item: any) =>
				set(() => {
					let profile = get().profile;
					let profileList = get().profileList;
					if (!profileList[profile].items[slot]) profileList[profile].items[slot] = {};
					profileList[profile].items[slot][id] = item;
					for (let id in profileList[profile].items[slot]) {
						let item = profileList[profile].items[slot][id];
						if (!item.selected && !item.pinned && !item.acquired) delete profileList[profile].items[slot][id];
					}
					return { profileList };
				}),
			clearSlot: (slot: string) =>
				set(() => {
					let profile = get().profile;
					let profileList = get().profileList;
					if (profileList[profile].items[slot]) {
						for (let id in profileList[profile].items[slot]) {
							let item = profileList[profile].items[slot][id];
							item.selected = false;
							if (!item.selected && !item.pinned && !item.acquired) delete profileList[profile].items[slot][id];
						}
					}
					if (profileList[profile].enchants[slot]) {
						for (let id in profileList[profile].enchants[slot]) {
							let enchant = profileList[profile].enchants[slot][id];
							enchant.selected = false;
							if (!enchant.selected && !enchant.pinned && !enchant.acquired) delete profileList[profile].enchants[slot][id];
						}
					}
					return { profileList };
				}),
			getItemSet: (itemId: number) => {
				for (let set of global.templateSets) {
					if (set.items.includes(itemId)) return set;
				}
			},

			// enchants
			getEnchants: () => {
				if (!get().profile) return global.templateEnchants;
				let profileEnchants = get().profileList[get().profile].enchants;
				for (let slot in global.templateEnchants) {
					for (let item of global.templateEnchants[slot]) {
						delete item.selected;
						delete item.pinned;
						delete item.acquired;
						if (profileEnchants[slot]) {
							for (let j in profileEnchants[slot]) {
								if (j == item.id.toString() && (!item.rand || item.rand == profileEnchants[slot][j].rand)) {
									if (profileEnchants[slot][j].selected) item.selected = true;
									if (profileEnchants[slot][j].pinned) item.pinned = true;
									if (profileEnchants[slot][j].acquired) item.acquired = true;
								}
							}
						}
					}
				}
				return global.templateEnchants;
			},
			setEnchant: (slot: string, id: number, item: any) =>
				set(() => {
					let profile = get().profile;
					let profileList = get().profileList;
					if (!profileList[profile].enchants[slot]) profileList[profile].enchants[slot] = {};
					profileList[profile].enchants[slot][id] = item;
					for (let id in profileList[profile].enchants[slot]) {
						let item = profileList[profile].enchants[slot][id];
						if (!item.selected && !item.pinned && !item.acquired) delete profileList[profile].enchants[slot][id];
					}
					return { profileList };
				}),

			// actions
			getActions: () => {
				return get().profileList[get().profile].actions;
			},
			getPhases: () => {
				return global.templatePhases;
			},
			getAbilities: () => {
				return global.templateAbilities;
			},
			getPresets: () => {
				return global.templatePresets;
			},
			setActions: (actions: any[]) =>
				set(() => {
					let profile = get().profile;
					let profileList = get().profileList;
					profileList[profile].actions = actions;
					return { profileList };
				}),

			// spells
			getSpells: () => {
				return global.templateSpells;
			},
			getSpell: (id: number) => {
				return global.templateSpells[id];
			},

			// sim data
			simdata: {},
			setSimdata: (obj: any) => set(() => ({ simdata: obj })),
		}),
		{
			name: 'sim-storage',
		},
	),
) as any;
