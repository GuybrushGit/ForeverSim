const defaultProfile = {
	id: 'warrior0',
	name: 'DW Fury',
	race: 1,
	buffs: [24932, 9885, 17055, 20906, 20217, 19838, 20048, 10441, 10626, 11198, 9907, 11405, 17038, 18125, 1293741, 1250986],
	class: 'Warrior',
	items: {
		back: {
			'13340': {
				id: 13340,
				path: 'inv_misc_cape_20',
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
		head: {
			'12640': {
				id: 12640,
				path: 'inv_helmet_36',
				selected: true,
			},
		},
		legs: {
			'22385': {
				id: 22385,
				path: 'inv_pants_04',
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
		chest: {
			'11726': {
				id: 11726,
				path: 'inv_chest_chain_15',
				selected: true,
			},
		},
		hands: {
			'21998': {
				id: 21998,
				path: 'inv_gauntlets_26',
				selected: true,
			},
		},
		waist: {
			'13142': {
				id: 13142,
				path: 'inv_belt_33',
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
		wrists: {
			'13400': {
				id: 13400,
				path: 'inv_bracer_17',
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
			'275972': {
				id: 275972,
				path: 'inv_jewelry_ring_25',
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
		twohand: {},
		mainhand: {
			'19554': {
				id: 19554,
				path: 'inv_sword_27',
				selected: true,
			},
		},
		shoulder: {
			'277117': {
				id: 277117,
				path: 'inv_shoulder_02',
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
		trinket2: {
			'249470': {
				id: 249470,
				path: 'inv_misc_gem_ruby_01',
				selected: true,
			},
		},
	},
	level: 60,
	actions: [
		{
			id: 18499,
			item: false,
			name: 'Berserker Rage',
			path: 'spell_nature_ancestralguardian',
			phase: 0,
			conditions: [
				{
					value: '80',
					resource: 1,
					comparator: '<=',
					maxpower: 800,
				},
			],
		},
		{
			id: 2687,
			name: 'Bloodrage',
			path: 'ability_racial_bloodrage',
			phase: 0,
			conditions: [
				{
					value: '70',
					resource: 1,
					comparator: '<=',
					maxpower: 700,
				},
			],
		},
		{
			id: 11551,
			name: 'Battle Shout',
			path: 'ability_warrior_battleshout',
			phase: 0,
			conditions: [
				{
					precast: true,
					resource: 5,
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
					value: '30',
					resource: 2,
					comparator: '<=',
					maxtimeleft: 30000,
				},
				{
					value: '20',
					resource: 1,
					comparator: '<=',
					maxpower: 200,
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
					value: '30',
					resource: 2,
					comparator: '<=',
					maxtimeleft: 30000,
				},
			],
		},
		{
			id: 23894,
			name: 'Bloodthirst',
			path: 'spell_nature_bloodlust',
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
			id: 11585,
			name: 'Overpower',
			path: 'ability_meleedamage',
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
					value: '25',
					resource: 1,
					comparator: '<=',
					maxpower: 250,
				},
			],
		},
		{
			id: 11581,
			name: 'Thunder Clap',
			path: 'spell_nature_thunderclap',
			phase: 0,
			conditions: [
				{
					resource: 1,
					comparator: '>=',
					value: '15',
					minpower: 150,
				},
			],
			item: false,
		},
		{
			id: 1259813,
			item: false,
			name: 'Eureka!',
			path: 'inv_gnometoy',
			phase: 1,
			conditions: [],
		},
		{
			id: 1259799,
			item: false,
			name: "Elune's Light",
			path: 'spell_nature_moonglow',
			phase: 1,
			conditions: [],
		},
		{
			id: 20572,
			item: false,
			name: 'Blood Fury',
			path: 'racial_orc_berserkerstrength',
			phase: 1,
			conditions: [],
		},
		{
			id: 20554,
			item: false,
			name: 'Berserking',
			path: 'racial_troll_berserk',
			phase: 1,
			conditions: [],
		},
		{
			id: 2687,
			name: 'Bloodrage',
			path: 'ability_racial_bloodrage',
			phase: 1,
			conditions: [
				{
					value: '70',
					resource: 1,
					comparator: '<=',
					maxpower: 700,
				},
			],
		},
		{
			id: 17528,
			name: 'Mighty Rage',
			path: 'ability_warrior_innerrage',
			phase: 1,
			conditions: [
				{
					value: '30',
					resource: 2,
					comparator: '<=',
					maxtimeleft: 30000,
				},
				{
					value: '20',
					resource: 1,
					comparator: '<=',
					maxpower: 200,
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
					value: '30',
					resource: 2,
					comparator: '<=',
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
		{
			id: 11574,
			name: 'Rend',
			path: 'ability_gouge',
			phase: 0,
			conditions: [
				{
					resource: 1,
					comparator: '>=',
					value: '25',
					minpower: 250,
				},
			],
			item: false,
		},
	],
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
		'105951': 1,
		'105952': 2,
		'105953': 3,
		'105954': 5,
		'105956': 3,
		'105958': 2,
		'105974': 1,
		'105977': 1,
		'105978': 2,
		'110857': 2,
	},
	enchants: {
		back_enchant: {
			'1219587': {
				id: 1219587,
				selected: true,
			},
		},
		feet_enchant: {
			'20023': {
				id: 20023,
				selected: true,
			},
		},
		head_enchant: {
			'468373': {
				id: 468373,
				selected: true,
			},
		},
		legs_enchant: {
			'468373': {
				id: 468373,
				selected: true,
			},
		},
		neck_enchant: {
			'1249019': {
				id: 1249019,
				selected: true,
			},
		},
		chest_enchant: {
			'20025': {
				id: 20025,
				selected: true,
			},
		},
		hands_enchant: {
			'1248640': {
				id: 1248640,
				selected: true,
			},
		},
		waist_enchant: {
			'1226211': {
				id: 1226211,
				selected: true,
			},
		},
		wrists_enchant: {
			'20010': {
				id: 20010,
				selected: true,
			},
		},
		offhand_enchant: {
			'20034': {
				id: 20034,
				selected: true,
			},
		},
		mainhand_enchant: {
			'20034': {
				id: 20034,
				selected: true,
			},
		},
		shoulder_enchant: {
			'24422': {
				id: 24422,
				selected: true,
			},
		},
		offhand_tempenchant: {
			'22756': {
				id: 22756,
				selected: true,
			},
		},
		mainhand_tempenchant: {
			'10612': {
				id: 10612,
				selected: true,
			},
		},
	},
	settings: {
		race: '1',
		aqbooks: 'no',
		position: '1',
		defaultform: '18',
		playerLevel: 60,
		simulations: '10000',
		initialpower: 0,
		targetenabled2: 'no',
	},
} as any;

export default defaultProfile;
