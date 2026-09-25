const defaultProfile = {
	id: 'warrior0',
	name: 'Default',
	level: 60,
	race: 1,
	class: 'Warrior',
	classid: 1,
	talents: {
		'105927': 1,
		'105928': 5,
		'105929': 3,
		'105930': 1,
		'105931': 5,
		'105932': 2,
		'105933': 5,
		'105936': 3,
		'105937': 5,
		'105939': 5,
		'105950': 3,
		'105952': 2,
		'105953': 2,
		'105954': 3,
		'105956': 3,
		'105958': 2,
		'105977': 1,
	},
	settings: {
		targetenabled2: 'yes',
		initialpower: 0,
		duration: '60',
		position: '1',
		targetarmor1: '3009',
		defaultform: '16',
		aqbooks: 'yes',
		race: '7',
		simulations: '10000',
		targetlevel2: 60,
	},
	buffs: [
		355363, 24425, 23768, 355366, 1304690, 22817, 1304751, 1304753, 24932, 9885, 17055, 20906, 20217, 25291, 20048, 25362, 11597, 9907, 11717, 10667,
		17538, 3164, 24799,
	],
	items: {
		head: {
			'23244': {
				id: 23244,
				path: 'inv_helmet_09',
				selected: true,
			},
		},
		mainhand: {
			'18828': {
				id: 18828,
				path: 'inv_axe_02',
				selected: true,
			},
		},
		offhand: {
			'18828': {
				id: 18828,
				path: 'inv_axe_02',
				selected: true,
			},
		},
		twohand: {},
		shoulder: {
			'23243': {
				id: 23243,
				path: 'inv_shoulder_11',
				selected: true,
			},
		},
		chest: {
			'22872': {
				id: 22872,
				path: 'inv_chest_plate16',
				selected: true,
			},
		},
		hands: {
			'22868': {
				id: 22868,
				path: 'inv_gauntlets_26',
				selected: true,
			},
		},
		legs: {
			'22873': {
				id: 22873,
				path: 'inv_pants_06',
				selected: true,
			},
		},
		feet: {
			'22858': {
				id: 22858,
				path: 'inv_boots_plate_09',
				selected: true,
			},
		},
	},
	enchants: {},
	actions: [
		{
			id: 2687,
			name: 'Bloodrage',
			path: 'ability_racial_bloodrage',
			phase: 0,
			conditions: [],
		},
		{
			id: 25289,
			name: 'Battle Shout',
			path: 'ability_warrior_battleshout',
			phase: 0,
			conditions: [],
		},
		{
			id: 17528,
			name: 'Mighty Rage',
			path: 'ability_warrior_innerrage',
			phase: 0,
			conditions: [
				{
					resource: 2,
					comparator: '<=',
					value: '30',
					maxtimeleft: 30000,
				},
			],
		},
		{
			id: 12328,
			name: 'Death Wish',
			path: 'spell_shadow_deathpact',
			phase: 0,
			conditions: [
				{
					resource: 2,
					comparator: '<=',
					value: '30',
					maxtimeleft: 30000,
				},
			],
		},
		{
			id: 11585,
			name: 'Overpower',
			path: 'ability_meleedamage',
			phase: 0,
			conditions: [],
		},
		{
			id: 23894,
			name: 'Bloodthirst',
			path: 'spell_nature_bloodlust',
			phase: 0,
			conditions: [],
		},
		{
			id: 25286,
			name: 'Heroic Strike',
			path: 'ability_rogue_ambush',
			phase: 0,
			conditions: [
				{
					resource: 1,
					comparator: '>=',
					value: '40',
					minpower: 400,
				},
			],
		},
		{
			id: 2,
			name: 'Prevent lower priority actions',
			path: 'spell_holy_borrowedtime',
			phase: 0,
			conditions: [
				{
					resource: 2687,
					comparator: '<=',
					value: '2',
				},
			],
		},
		{
			id: 2,
			name: 'Prevent lower priority actions',
			path: 'spell_holy_borrowedtime',
			phase: 0,
			conditions: [
				{
					resource: 11585,
					comparator: '<=',
					value: '2',
				},
			],
			item: false,
		},
		{
			id: 1,
			name: 'Return to base stance',
			path: 'spell_nature_enchantarmor',
			phase: 0,
			conditions: [
				{
					resource: 1,
					comparator: '<=',
					value: '10',
					maxpower: 100,
				},
			],
		},
		{
			id: 1680,
			name: 'Whirlwind',
			path: 'ability_whirlwind',
			phase: 0,
			conditions: [],
		},
		{
			id: 1259813,
			name: 'Eureka!',
			path: 'inv_gnometoy',
			phase: 1,
			conditions: [],
			item: false,
		},
		{
			id: 1259799,
			name: "Elune's Light",
			path: 'spell_nature_moonglow',
			phase: 1,
			conditions: [],
			item: false,
		},
		{
			id: 20572,
			name: 'Blood Fury',
			path: 'racial_orc_berserkerstrength',
			phase: 1,
			conditions: [],
			item: false,
		},
		{
			id: 20554,
			name: 'Berserking',
			path: 'racial_troll_berserk',
			phase: 1,
			conditions: [],
			item: false,
		},
		{
			id: 2687,
			name: 'Bloodrage',
			path: 'ability_racial_bloodrage',
			phase: 1,
			conditions: [],
		},
		{
			id: 17528,
			name: 'Mighty Rage',
			path: 'ability_warrior_innerrage',
			phase: 1,
			conditions: [
				{
					resource: 2,
					comparator: '<=',
					value: '30',
					maxtimeleft: 30000,
				},
			],
		},
		{
			id: 12328,
			name: 'Death Wish',
			path: 'spell_shadow_deathpact',
			phase: 1,
			conditions: [
				{
					resource: 2,
					comparator: '<=',
					value: '30',
					maxtimeleft: 30000,
				},
			],
		},
		{
			id: 20662,
			name: 'Execute',
			path: 'inv_sword_48',
			phase: 1,
			conditions: [],
		},
	],
} as any;

export default defaultProfile;
