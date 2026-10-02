const defaultProfile = {
	id: 'warrior0',
	name: 'Fury',
	level: 60,
	class: 'Warrior',
	classid: 1,
	talents: {
		'105927': 1,
		'105928': 5,
		'105930': 1,
		'105932': 2,
		'105933': 5,
		'105937': 5,
		'105939': 5,
		'105947': 2,
		'105949': 0,
		'105950': 3,
		'105952': 2,
		'105953': 3,
		'105954': 4,
		'105956': 3,
		'105958': 3,
		'105974': 2,
		'105977': 1,
		'105978': 2,
		'110857': 2,
	},
	settings: {
		race: '1',
		position: '1',
		targetenabled2: 'no',
		defaultform: '18',
		simulations: '30000',
		aqbooks: 'no',
	},
	buffs: [24932, 9885, 17055, 20906, 20217, 19838, 20048, 10441, 10626, 11198, 11717, 17538, 11405, 17038, 18125, 1293741],
	items: {
		mainhand: {
			'19554': {
				id: 19554,
				path: 'inv_sword_27',
				selected: true,
			},
		},
		offhand: {
			'19554': {
				id: 19554,
				path: 'inv_sword_27',
				selected: true,
			},
		},
		head: {
			'21999': {
				id: 21999,
				path: 'inv_helmet_02',
				selected: true,
			},
		},
		shoulder: {
			'22001': {
				id: 22001,
				path: 'inv_shoulder_30',
				selected: true,
			},
		},
		twohand: {},
		hands: {
			'21998': {
				id: 21998,
				path: 'inv_gauntlets_26',
				selected: true,
			},
		},
		feet: {
			'21995': {
				id: 21995,
				path: 'inv_boots_plate_03',
				selected: true,
			},
		},
		legs: {
			'22000': {
				id: 22000,
				path: 'inv_pants_04',
				selected: true,
			},
		},
		back: {
			'18461': {
				id: 18461,
				path: 'inv_misc_cape_07',
				selected: true,
			},
		},
		chest: {
			'21997': {
				id: 21997,
				path: 'inv_chest_plate03',
				selected: true,
			},
		},
		neck: {
			'18404': {
				id: 18404,
				path: 'inv_jewelry_necklace_09',
				selected: true,
			},
		},
		trinket1: {
			'272437': {
				id: 272437,
				path: 'inv_engineering_90_lightningbox',
				selected: true,
			},
		},
		wrists: {
			'21996': {
				id: 21996,
				path: 'inv_bracer_18',
				selected: true,
			},
		},
		waist: {
			'21994': {
				id: 21994,
				path: 'inv_belt_34',
				selected: true,
			},
		},
		finger1: {
			'19325': {
				id: 19325,
				path: 'inv_jewelry_ring_35',
				selected: true,
			},
		},
		finger2: {
			'18821': {
				id: 18821,
				path: 'inv_jewelry_ring_07',
				selected: true,
			},
		},
		trinket2: {
			'249470': {
				id: 249470,
				path: 'inv_misc_gem_ruby_01',
				selected: true,
			},
		},
		ranged: {
			'19107': {
				id: 19107,
				path: 'inv_weapon_crossbow_07',
				selected: true,
			},
		},
	},
	enchants: {
		offhand_enchant: {
			'20034': {
				id: 20034,
				selected: true,
			},
		},
		hands_enchant: {
			'1248640': {
				id: 1248640,
				selected: true,
			},
		},
		offhand_tempenchant: {
			'22756': {
				id: 22756,
				selected: true,
			},
		},
		mainhand_enchant: {
			'20034': {
				id: 20034,
				selected: true,
			},
		},
		mainhand_tempenchant: {
			'10612': {
				id: 10612,
				selected: true,
			},
		},
		waist_enchant: {
			'1226211': {
				id: 1226211,
				selected: true,
			},
		},
		legs_enchant: {
			'468373': {
				id: 468373,
				selected: true,
			},
		},
		feet_enchant: {
			'20023': {
				id: 20023,
				selected: true,
			},
		},
		wrists_enchant: {
			'20010': {
				id: 20010,
				selected: true,
			},
		},
		chest_enchant: {
			'20025': {
				id: 20025,
				selected: true,
			},
		},
		back_enchant: {
			'1219587': {
				id: 1219587,
				selected: true,
			},
		},
		shoulder_enchant: {
			'24422': {
				id: 24422,
				selected: true,
			},
		},
		neck_enchant: {
			'1249019': {
				id: 1249019,
				selected: true,
			},
		},
		head_enchant: {
			'468373': {
				id: 468373,
				selected: true,
			},
		},
	},
	actions: [
		{
			id: 2687,
			name: 'Bloodrage',
			path: 'ability_racial_bloodrage',
			phase: 0,
			conditions: [],
		},
		{
			id: 11551,
			name: 'Battle Shout',
			path: 'ability_warrior_battleshout',
			phase: 0,
			conditions: [
				{
					resource: 5,
					precast: true,
				},
			],
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
			id: 18499,
			name: 'Berserker Rage',
			path: 'spell_nature_ancestralguardian',
			phase: 0,
			conditions: [],
			item: false,
		},
		{
			id: 23894,
			name: 'Bloodthirst',
			path: 'spell_nature_bloodlust',
			phase: 0,
			conditions: [],
			item: false,
		},
		{
			id: 11585,
			name: 'Overpower',
			path: 'ability_meleedamage',
			phase: 0,
			conditions: [],
		},
		{
			id: 1680,
			name: 'Whirlwind',
			path: 'ability_whirlwind',
			phase: 0,
			conditions: [],
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
					value: '20',
					maxpower: 200,
				},
			],
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
	race: 1,
} as any;

export default defaultProfile;
