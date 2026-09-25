import type { SettingsField, SettingsObject } from '@core/shared/types';

const templateSettings = {
	player: [
		{
			id: 'playerLevel',
			label: 'Level',
			type: 'range',
			min: 1,
			max: 60,
			value: 60,
		},
		{
			id: 'race',
			label: 'Race',
			type: 'dropdown',
			value: 1,
			options: [
				{
					value: 1,
					label: 'Human',
				},
				{
					value: 3,
					label: 'Dwarf',
				},
				{
					value: 7,
					label: 'Gnome',
				},
				{
					value: 4,
					label: 'Night Elf',
				},
				{
					value: 5,
					label: 'Undead',
				},
				{
					value: 2,
					label: 'Orc',
				},
				{
					value: 6,
					label: 'Tauren',
				},
				{
					value: 8,
					label: 'Troll',
				},
				{
					value: 9,
					label: 'Skyborne',
				},
			],
		},
		{
			id: 'defaultform',
			label: 'Default Stance',
			type: 'radio',
			value: 18,
			options: [
				{
					value: 16,
					label: 'Battle',
				},
				{
					value: 17,
					label: 'Defensive',
				},
				{
					value: 18,
					label: 'Berserker',
				},
			],
		},
		{
			id: 'aqbooks',
			label: 'AQ Books',
			type: 'radio',
			value: 'no',
			options: [
				{
					value: 'yes',
					label: 'Yes',
				},
				{
					value: 'no',
					label: 'No',
				},
			],
		},
		{
			id: 'position',
			label: 'Position',
			type: 'radio',
			value: 1,
			options: [
				{
					value: 1,
					label: 'Back',
				},
				{
					value: 2,
					label: 'Front',
				},
			],
		},
	] as SettingsField[],
	target1: [
		{
			id: 'targetlevel1',
			label: 'Level',
			type: 'range',
			min: 1,
			max: 63,
			value: 63,
		},
		{
			id: 'targetarmor1',
			label: 'Armor Type',
			type: 'radio',
			options: [
				{
					value: '3731',
					label: 'Warrior [3731]',
				},
				{
					value: '3009',
					label: 'Paladin [3009]',
				},
			],
			value: 3731,
		},
		{
			id: 'targetmagic1',
			label: 'Magic Resistance',
			type: 'number',
			value: 25,
		},
		{
			id: 'targetspeed1',
			label: 'Attack Speed',
			type: 'number',
			value: '2.0',
		},
		{
			id: 'targetdmg1',
			label: 'Weapon Damage',
			type: 'number',
			value: 1000,
		},
		{
			id: 'targettype1',
			label: 'Type',
			type: 'dropdown',
			value: 0,
			options: [
				{
					value: 0,
					label: 'None',
				},
				{
					value: 1,
					label: 'Beast',
				},
				{
					value: 2,
					label: 'Dragonkin',
				},
				{
					value: 3,
					label: 'Demon',
				},
				{
					value: 4,
					label: 'Elemental',
				},
				{
					value: 5,
					label: 'Giant',
				},
				{
					value: 6,
					label: 'Undead',
				},
				{
					value: 7,
					label: 'Humanoid',
				},
				{
					value: 9,
					label: 'Mechanical',
				},
			],
		},
	] as SettingsField[],
	target2: [
		{
			id: 'targetenabled2',
			label: 'Enabled',
			type: 'radio',
			value: 'no',
			options: [
				{
					value: 'yes',
					label: 'Yes',
				},
				{
					value: 'no',
					label: 'No',
				},
			],
		},
		{
			id: 'targetlevel2',
			label: 'Level',
			type: 'range',
			min: 1,
			max: 63,
			value: 63,
		},
		{
			id: 'targetarmor2',
			label: 'Armor Type',
			type: 'radio',
			options: [
				{
					value: '3731',
					label: 'Warrior [3731]',
				},
				{
					value: '3009',
					label: 'Paladin [3009]',
				},
			],
			value: 3731,
		},
		{
			id: 'targetmagic2',
			label: 'Magic Resistance',
			type: 'number',
			value: 25,
		},
		{
			id: 'targetspeed2',
			label: 'Attack Speed',
			type: 'number',
			value: '2.0',
		},
		{
			id: 'targetdmg2',
			label: 'Weapon Damage',
			type: 'number',
			value: 1000,
		},
		{
			id: 'targettype2',
			label: 'Type',
			type: 'dropdown',
			value: 0,
			options: [
				{
					value: 0,
					label: 'None',
				},
				{
					value: 1,
					label: 'Beast',
				},
				{
					value: 2,
					label: 'Dragonkin',
				},
				{
					value: 3,
					label: 'Demon',
				},
				{
					value: 4,
					label: 'Elemental',
				},
				{
					value: 5,
					label: 'Giant',
				},
				{
					value: 6,
					label: 'Undead',
				},
				{
					value: 7,
					label: 'Humanoid',
				},
				{
					value: 9,
					label: 'Mechanical',
				},
			],
		},
	] as SettingsField[],
	target3: [
		{
			id: 'targetenabled3',
			label: 'Enabled',
			type: 'radio',
			value: 'no',
			options: [
				{
					value: 'yes',
					label: 'Yes',
				},
				{
					value: 'no',
					label: 'No',
				},
			],
		},
		{
			id: 'targetlevel3',
			label: 'Level',
			type: 'range',
			min: 1,
			max: 63,
			value: 63,
		},
		{
			id: 'targetarmor3',
			label: 'Armor Type',
			type: 'radio',
			options: [
				{
					value: '3731',
					label: 'Warrior [3731]',
				},
				{
					value: '3009',
					label: 'Paladin [3009]',
				},
			],
			value: 3731,
		},
		{
			id: 'targetmagic3',
			label: 'Magic Resistance',
			type: 'number',
			value: 25,
		},
		{
			id: 'targetspeed3',
			label: 'Attack Speed',
			type: 'number',
			value: '2.0',
		},
		{
			id: 'targetdmg3',
			label: 'Weapon Damage',
			type: 'number',
			value: 1000,
		},
		{
			id: 'targettype3',
			label: 'Type',
			type: 'dropdown',
			value: 0,
			options: [
				{
					value: 0,
					label: 'None',
				},
				{
					value: 1,
					label: 'Beast',
				},
				{
					value: 2,
					label: 'Dragonkin',
				},
				{
					value: 3,
					label: 'Demon',
				},
				{
					value: 4,
					label: 'Elemental',
				},
				{
					value: 5,
					label: 'Giant',
				},
				{
					value: 6,
					label: 'Undead',
				},
				{
					value: 7,
					label: 'Humanoid',
				},
				{
					value: 9,
					label: 'Mechanical',
				},
			],
		},
	] as SettingsField[],
	target4: [
		{
			id: 'targetenabled4',
			label: 'Enabled',
			type: 'radio',
			value: 'no',
			options: [
				{
					value: 'yes',
					label: 'Yes',
				},
				{
					value: 'no',
					label: 'No',
				},
			],
		},
		{
			id: 'targetlevel4',
			label: 'Level',
			type: 'range',
			min: 1,
			max: 63,
			value: 63,
		},
		{
			id: 'targetarmor4',
			label: 'Armor Type',
			type: 'radio',
			options: [
				{
					value: '3731',
					label: 'Warrior [3731]',
				},
				{
					value: '3009',
					label: 'Paladin [3009]',
				},
			],
			value: 3731,
		},
		{
			id: 'targetmagic4',
			label: 'Magic Resistance',
			type: 'number',
			value: 25,
		},
		{
			id: 'targetspeed4',
			label: 'Attack Speed',
			type: 'number',
			value: '2.0',
		},
		{
			id: 'targetdmg4',
			label: 'Weapon Damage',
			type: 'number',
			value: 1000,
		},
		{
			id: 'targettype4',
			label: 'Type',
			type: 'dropdown',
			value: 0,
			options: [
				{
					value: 0,
					label: 'None',
				},
				{
					value: 1,
					label: 'Beast',
				},
				{
					value: 2,
					label: 'Dragonkin',
				},
				{
					value: 3,
					label: 'Demon',
				},
				{
					value: 4,
					label: 'Elemental',
				},
				{
					value: 5,
					label: 'Giant',
				},
				{
					value: 6,
					label: 'Undead',
				},
				{
					value: 7,
					label: 'Humanoid',
				},
				{
					value: 9,
					label: 'Mechanical',
				},
			],
		},
	] as SettingsField[],
	encounter: [
		{
			id: 'simulations',
			label: 'Simulations',
			type: 'number',
			value: 10000,
		},
		{
			id: 'duration',
			label: 'Duration',
			type: 'number',
			value: 60,
		},
		{
			id: 'durationdelta',
			label: 'Duration Variation (+/-)',
			type: 'number',
			value: 10,
		},
		{
			id: 'executeperc',
			label: 'Execute Duration Percentage',
			type: 'number',
			value: 20,
		},
		{
			id: 'initialpower',
			label: 'Initial Rage',
			type: 'range',
			min: 0,
			max: 100,
			value: 0,
		},
		{
			id: 'reactionmin',
			label: 'Reaction Min',
			type: 'number',
			value: 200,
		},
		{
			id: 'reactionmax',
			label: 'Reaction Max',
			type: 'number',
			value: 300,
		},
	] as SettingsField[],
} as SettingsObject;

export default templateSettings;
