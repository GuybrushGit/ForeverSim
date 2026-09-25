import type { Spell } from '@core/game/spell';
import type { CombatResult, EventType } from './enums';
import type { Weapon } from '@core/game/weapon';
import type { Target } from '@core/game/target';

export type SettingsField = {
	id: string;
	label: string;
	type: string;
	value: string | number;
	min?: number;
	max?: number;
	options?: any;
	enabled?: boolean;
};

export type SettingsObject = {
	player: SettingsField[];
	target1: SettingsField[];
	target2: SettingsField[];
	target3: SettingsField[];
	target4: SettingsField[];
	encounter: SettingsField[];
};

export type BuffsField = {
	id: number;
	name: string;
	path: string;
	item?: boolean;
	ischild?: boolean;
	child?: number;
	mod?: number;
	group?: string;
	minlevel?: number;
	maxlevel?: number;
	stats?: any;
	requires?: any;
	selected?: boolean;
	spell?: number;
};

export type BuffsObject = {
	worldbuffs: BuffsField[];
	raidbuffs: BuffsField[];
	consumables: BuffsField[];
	debuffs: BuffsField[];
	others: BuffsField[];
};

export type TalentsObject = {
	i: number;
	n: string;
	s: number[];
	d: string[];
	x: number;
	y: number;
	c: number;
	iconname: string;
	def: number;
	r?: number[];
	enable?: string;
	aura?: any;
	values?: number[];
};

export type TalentsTree = {
	n: string;
	t: TalentsObject[];
};

export type Item = {
	id: number;
	name: string;
	classId?: number;
	subclassId?: number;
	slot?: number;
	requires?: number;
	quality?: number;
	ilvl?: number;
	path?: string;
	stats?: Stats;
	speed?: number;
	maxdmg?: number;
	mindmg?: number;
	proc?: any;
	useSpell?: number;
	rand?: number;
	ench?: string;
	spells?: number[];
	cooldown?: number;
	category_cooldown?: number;
	category_id?: number;
	acquired?: boolean;
	selected?: boolean;
	pinned?: boolean;
};

export type ItemsObject = {
	head: Item[];
	neck: Item[];
	shoulder: Item[];
	back: Item[];
	chest: Item[];
	wrists: Item[];
	hands: Item[];
	waist: Item[];
	legs: Item[];
	feet: Item[];
	finger1: Item[];
	finger2: Item[];
	trinket1: Item[];
	trinket2: Item[];
	ranged: Item[];
	mainhand: Item[];
	offhand: Item[];
	twohand: Item[];
};

export type Enchant = {
	id: number;
	name: string;
	classId: number;
	subclassId: number;
	invType: number;
	enchant: number;
	weapondmg?: number;
	procChance?: number;
	procPPM?: number;
	procSpell?: number;
	procCooldown?: number;
	stats?: any;
	requires?: number;
	procBlock?: number;

	acquired?: boolean;
	selected?: boolean;
	pinned?: boolean;
};

export type PresetObject = {
	type: string;
	name: string;
	value: any;
};

export type AbilityObject = {
	id: number;
	name: string;
	path: string;
	requires?: any;
	minlevel?: number;
	maxlevel?: number;
	value1?: number;
	value2?: number;
	race?: number;
	custom?: boolean;
	item?: boolean;
	threat_flat?: number;
	threat_mod?: number;
	threat_buff?: number;
	phase?: number;
};

export type ConditionObject = {
	resource?: number;
	comparator?: string;
	value?: any;
	union?: any;

	// generated
	minpower?: number;
	maxpower?: number;
	mintimeleft?: number;
	maxtimeleft?: number;
	mintimepassed?: number;
	maxtimepassed?: number;
	minswingtimer?: number;
	maxswingtimer?: number;
	spellid?: number;
	precast?: boolean;
};

export type Stats = {
	health?: number;
	agi?: number;
	str?: number;
	sta?: number;
	int?: number;
	spi?: number;
	melee_ap?: number;
	ranged_ap?: number;
	expertise?: number;
	threat_mod?: number;

	hit_rate?: number;
	crit_rate?: number;
	dodge_rate?: number;
	parry_rate?: number;
	block_rate?: number;

	hit?: number[];
	crit?: number[];
	dmg_done?: number[];
	dmg_taken?: number[];
	dmg_done_mod?: number[];
	dmg_taken_mod?: number[];
	resistance?: number[];
	haste?: number[];
	stat_mod?: number[];

	parry?: number;
	dodge?: number;
	block_amount?: number;
	block_chance?: number;
	defense?: number;
	armor?: number;
};

export type Event = {
	type: EventType;
	step: number;
	value?: number;
	threat?: number;
	result?: CombatResult;
	spell?: Spell;
	weapon?: Weapon;
	target?: Target;
};

export type ItemSet = {
	id: number;
	name: string;
	items: number[];
	sets: any[];
};

export type Profile = {
	id: string;
	name: string;
	level: number;
	race: number;
	class: string;
	classid: number;
	talents: any;
	settings: any;
	buffs: number[];
	items: any;
	enchants: any;
	actions: any[];
};

export type SpellModifier = {
	id: number;
	mask: number;
	type: number;
	op: number;
	value: number;
};
