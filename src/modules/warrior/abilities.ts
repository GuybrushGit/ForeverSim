import type { AbilityObject } from '@core/shared/types';

export var templateAbilities = [
	// Base Stance
	{
		id: 1,
		name: 'Return to base stance',
		path: 'spell_nature_enchantarmor',
		custom: true,
	},

	// Hold
	{
		id: 2,
		name: 'Prevent lower priority actions',
		path: 'spell_holy_borrowedtime',
		custom: true,
	},

	// Spearing Strike
	{
		id: 1310222,
	},

	// Bloodthirst
	{
		id: 23881,
	},
	{
		id: 23892,
	},
	{
		id: 23893,
	},
	{
		id: 23894,
	},

	// Mortal Strike
	{
		id: 12294,
	},
	{
		id: 21551,
	},
	{
		id: 21552,
	},
	{
		id: 21553,
	},

	// Whirlwind
	{
		id: 1680,
		threat_mod: 1.25,
	},

	// Overpower
	{
		id: 7384,
		threat_mod: 0.75,
	},
	{
		id: 7887,
		threat_mod: 0.75,
	},
	{
		id: 11584,
		threat_mod: 0.75,
	},
	{
		id: 11585,
		threat_mod: 0.75,
	},

	// Execute
	{
		id: 5308,
		threat_mod: 1.25,
		phase: 1,
	},
	{
		id: 20658,
		threat_mod: 1.25,
		phase: 1,
	},
	{
		id: 20660,
		threat_mod: 1.25,
		phase: 1,
	},
	{
		id: 20661,
		threat_mod: 1.25,
		phase: 1,
	},
	{
		id: 20662,
		threat_mod: 1.25,
		phase: 1,
	},

	// Hamstring
	{
		id: 1715,
		threat_mod: 1.25,
		threat_flat: 20,
	},
	{
		id: 7372,
		threat_mod: 1.25,
		threat_flat: 80,
	},
	{
		id: 7373,
		threat_mod: 1.25,
		threat_flat: 145,
	},

	// Slam
	{
		id: 1464,
	},
	{
		id: 8820,
	},
	{
		id: 11604,
	},
	{
		id: 11605,
	},

	// Heroic Strike
	{
		id: 78,
		threat_flat: 16,
	},
	{
		id: 284,
		threat_flat: 39,
	},
	{
		id: 285,
		threat_flat: 59,
	},
	{
		id: 1608,
		threat_flat: 78,
	},
	{
		id: 11564,
		threat_flat: 98,
	},
	{
		id: 11565,
		threat_flat: 118,
	},
	{
		id: 11566,
		threat_flat: 137,
	},
	{
		id: 11567,
		requires: [{ name: 'aqbooks', value: 'no' }],
		threat_flat: 145,
	},
	{
		id: 25286,
		requires: [{ name: 'aqbooks', value: 'yes' }],
		threat_flat: 175,
	},

	// Cleave
	{
		id: 845,
		threat_flat: 10,
	},
	{
		id: 7369,
		threat_flat: 40,
	},
	{
		id: 11608,
		threat_flat: 60,
	},
	{
		id: 11609,
		threat_flat: 70,
	},
	{
		id: 20569,
		threat_flat: 100,
	},

	// Battle Shout
	{
		id: 6673,
		threat_buff: 1,
	},
	{
		id: 5242,
		threat_buff: 12,
	},
	{
		id: 6192,
		threat_buff: 22,
	},
	{
		id: 11549,
		threat_buff: 32,
	},
	{
		id: 11550,
		threat_buff: 42,
	},
	{
		id: 11551,
		requires: [{ name: 'aqbooks', value: 'no' }],
		threat_buff: 52,
	},
	{
		id: 25289,
		requires: [{ name: 'aqbooks', value: 'yes' }],
		threat_buff: 60,
	},

	// Bloodrage
	{
		id: 2687,
	},

	// Death Wish
	{
		id: 12328,
	},

	// Recklessness
	{
		id: 1719,
	},

	// Thunder Clap
	{
		id: 6343,
		threat_mod: 2.5,
	},
	{
		id: 8198,
		threat_mod: 2.5,
	},
	{
		id: 8204,
		threat_mod: 2.5,
	},
	{
		id: 8205,
		threat_mod: 2.5,
	},
	{
		id: 11580,
		threat_mod: 2.5,
	},
	{
		id: 11581,
		threat_mod: 2.5,
	},

	// Shield Slam
	{
		id: 23922,
		threat_flat: 178,
	},
	{
		id: 23923,
		threat_flat: 203,
	},
	{
		id: 23924,
		threat_flat: 229,
	},
	{
		id: 23925,
		threat_flat: 254,
	},

	// Rage Potion
	{
		id: 6612,
		item: true,
	},
	{
		id: 6613,
		item: true,
	},
	{
		id: 17528,
		item: true,
	},

	// Berserker Rage
	{
		id: 18499,
	},

	// Berserking
	{
		id: 20554,
		race: 8,
	},

	// Blood Fury
	{
		id: 20572,
		race: 2,
	},

	// Eureka
	{
		id: 1259813,
		race: 7,
	},

	// Elune's Light
	{
		id: 1259799,
		race: 4,
	},

	// Sweeping Strikes
	{
		id: 12292,
	},

	// Rend
	{
		id: 772,
	},
	{
		id: 6546,
	},
	{
		id: 6547,
	},
	{
		id: 6548,
	},
	{
		id: 11572,
	},
	{
		id: 11573,
	},
	{
		id: 11574,
	},

	// Last Stand
	{
		//id: 12975,
		id: 12976,
	},

	// Concussion Blow
	{
		id: 12809,
	},

	// Piercing Howl
	{
		id: 12323,
	},

	// Shield Block
	{
		id: 2565,
	},

	// Revenge
	{
		id: 6572,
		threat_mod: 2.25,
	},
	{
		id: 6574,
		threat_mod: 2.25,
	},
	{
		id: 7379,
		threat_mod: 2.25,
	},
	{
		id: 11600,
		threat_mod: 2.25,
	},
	{
		id: 11601,
		requires: [{ name: 'aqbooks', value: 'no' }],
		threat_flat: 243,
		threat_mod: 2.25,
	},
	{
		id: 25288,
		requires: [{ name: 'aqbooks', value: 'yes' }],
		threat_flat: 270,
		threat_mod: 2.25,
	},
] as AbilityObject[];

export var templatePhases = [
	{ id: 0, name: 'Normal Phase' },
	{ id: 1, name: 'Execute Phase' },
];

export default templateAbilities;
