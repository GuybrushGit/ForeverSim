export const Race = Object.freeze({
	Human: 1,
	Orc: 2,
	Dwarf: 3,
	NightElf: 4,
	Undead: 5,
	Tauren: 6,
	Gnome: 7,
	Troll: 8,
	Skyborne: 9,
} as const);
export type Race = (typeof Race)[keyof typeof Race];
export const GetRace = (value: number): string => {
	const match = Object.entries(Race).find(([, id]) => id === value);
	return match ? match[0] : 'Unknown';
};

export const CreatureType = Object.freeze({
	None: 0,
	Beast: 1,
	Dragonkin: 2,
	Demon: 3,
	Elemental: 4,
	Giant: 5,
	Undead: 6,
	Humanoid: 7,
	Critter: 8,
	Mechanical: 9,
	NotSpecified: 10,
	Totem: 11,
} as const);
export type CreatureType = (typeof CreatureType)[keyof typeof CreatureType];

export const ItemType = Object.freeze({
	Consumable: 0,
	Container: 1,
	Weapon: 2,
	Gem: 3,
	Armor: 4,
	Reagent: 5,
	Projectile: 6,
	Tradegoods: 7,
	ItemEnhancement: 8,
	Recipe: 9,
	CurrencyTokenObsolete: 10,
	Quiver: 11,
	Questitem: 12,
	Key: 13,
	PermanentObsolete: 14,
	Miscellaneous: 15,
	Glyph: 16,
	Battlepet: 17,
	WoWToken: 18,
	Profession: 19,
} as const);
export type ItemType = (typeof ItemType)[keyof typeof ItemType];

export const WeaponType = Object.freeze({
	Axe1H: 0,
	Axe2H: 1,
	Bows: 2,
	Guns: 3,
	Mace1H: 4,
	Mace2H: 5,
	Polearm: 6,
	Sword1H: 7,
	Sword2H: 8,
	Warglaive: 9,
	Staff: 10,
	Bearclaw: 11,
	Catclaw: 12,
	Unarmed: 13,
	Generic: 14,
	Dagger: 15,
	Thrown: 16,
	Obsolete3: 17,
	Crossbow: 18,
	Wand: 19,
	Fishingpole: 20,
} as const);
export type WeaponType = (typeof WeaponType)[keyof typeof WeaponType];
export const GetWeaponType = (value: number): string => {
	const match = Object.entries(WeaponType).find(([, id]) => id === value);
	return match ? match[0] : 'Unknown';
};

export const ArmorType = Object.freeze({
	Generic: 0,
	Cloth: 1,
	Leather: 2,
	Mail: 3,
	Plate: 4,
	Cosmetic: 5,
	Shield: 6,
	Libram: 7,
	Idol: 8,
	Totem: 9,
	Sigil: 10,
	Relic: 11,
} as const);
export type ArmorType = (typeof ArmorType)[keyof typeof ArmorType];
export const GetArmorType = (value: number): string => {
	const match = Object.entries(ArmorType).find(([, id]) => id === value);
	return match ? match[0] : 'Unknown';
};

export const InventoryType = Object.freeze({
	None: 0,
	Head: 1,
	Neck: 2,
	Shoulder: 3,
	Shirt: 4,
	Chest: 5,
	Waist: 6,
	Legs: 7,
	Feet: 8,
	Wrists: 9,
	Hands: 10,
	Ring: 11,
	Trinket: 12,
	Onehand: 13,
	Shield: 14,
	Bow: 15,
	Back: 16,
	Twohand: 17,
	Bag: 18,
	Tabard: 19,
	Robe: 20,
	Mainhand: 21,
	Offhand: 22,
	Held: 23,
	Ammo: 24,
	Thrown: 25,
	Ranged: 26,
	Ranged2: 27,
	Relic: 28,
} as const);
export type InventoryType = (typeof InventoryType)[keyof typeof InventoryType];
export const GetInventoryType = (value: number): string => {
	const match = Object.entries(InventoryType).find(([, id]) => id === value);
	return match ? match[0] : 'Unknown';
};

export const ClassMask = Object.freeze({
	Warrior: 0x0001,
	Paladin: 0x0002,
	Hunter: 0x0004,
	Rogue: 0x0008,
	Priest: 0x0010,
	DeathKnight: 0x0020,
	Shaman: 0x0040,
	Mage: 0x0080,
	Warlock: 0x0100,
	Druid: 0x0400,
} as const);
export type ClassMask = (typeof ClassMask)[keyof typeof ClassMask];

export const ItemQuality = Object.freeze({
	Poor: 0,
	Common: 1,
	Uncommon: 2,
	Rare: 3,
	Epic: 4,
	Legendary: 5,
} as const);
export type ItemQuality = (typeof ItemQuality)[keyof typeof ItemQuality];

export const EncounterPosition = Object.freeze({
	Back: 1,
	Front: 2,
} as const);
export type EncounterPosition = (typeof EncounterPosition)[keyof typeof EncounterPosition];

export const CombatResult = Object.freeze({
	Evade: 0,
	Miss: 1,
	Dodge: 2,
	Block: 3,
	Parry: 4,
	Glance: 5,
	Crit: 6,
	Crushing: 7,
	Normal: 8,
	BlockCrit: 9,
	Resist: 10,
	ResistCrit: 11,
} as const);
export type CombatResult = (typeof CombatResult)[keyof typeof CombatResult];
export const GetCombatResult = (value: number): string => {
	const match = Object.entries(CombatResult).find(([, id]) => id === value);
	return match ? match[0] : 'Unknown';
};

export const SpellType = Object.freeze({
	None: 0,
	Magic: 1,
	Melee: 2,
	Ranged: 3,
} as const);
export type SpellType = (typeof SpellType)[keyof typeof SpellType];

export const SpellSchool = Object.freeze({
	None: 0,
	Physical: 1,
	Holy: 2,
	Fire: 3,
	Nature: 4,
	Frost: 5,
	Shadow: 6,
	Arcane: 7,
} as const);
export type SpellSchool = (typeof SpellSchool)[keyof typeof SpellSchool];

export const SchoolMask = Object.freeze({
	None: 0,
	Physical: 1,
	Holy: 2,
	Fire: 4,
	Nature: 8,
	Frost: 16,
	Shadow: 32,
	Arcane: 64,
} as const);
export type SchoolMask = (typeof SchoolMask)[keyof typeof SchoolMask];

export const EffectType = Object.freeze({
	None: 0,
	SchoolDamage: 2,
	Dummy: 3,
	ApplyAura: 6,
	HealthLeech: 9,
	Heal: 10,
	WeaponDmg: 17,
	AddExtraAttacks: 19,
	CreateItem: 24,
	Summon: 28,
	Energize: 30,
	WeaponPercDmg: 31,
	SummonChangeItem: 34,
	ApplyAreaAuraParty: 35,
	Dispel: 38,
	SummonPet: 56,
	SendEvent: 61,
	Threat: 63,
	TriggerSpell: 64,
	InterruptCast: 68,
	ScriptEffect: 77,
	Charge: 96,
	Inebriate: 100,
	DispelMechanic: 108,
	NormalizedWeaponDmg: 121,
	Teleport: 252,
} as const);
export type EffectType = (typeof EffectType)[keyof typeof EffectType];
export const GetEffectType = (value: number): string => {
	const match = Object.entries(EffectType).find(([, id]) => id === value);
	return match ? match[0] : 'Unknown';
};

export const AuraType = Object.freeze({
	PeriodicDamage: 3,
	DummyAura: 4,
	ModConfuse: 5,
	PeriodicHeal: 8,
	ModThreat: 10,
	ModStun: 12,
	ModDamageDone: 13,
	ModDamageTaken: 14,
	DamageShield: 15,
	ModInvisibility: 18,
	ObsModHealth: 20,
	ModResistance: 22,
	PeriodicTriggerSpell: 23,
	PeriodicEnergize: 24,
	ModRoot: 26,
	ModSilence: 27,
	ModStat: 29,
	ModSkill: 30,
	ModIncreaseSpeed: 31,
	ModDecreaseSpeed: 33,
	ModIncreaseHealth: 34,
	DispelImmunity: 41,
	ProcTriggerSpell: 42,
	ProcTriggerDamage: 43,
	ModParryPercent: 47,
	ModDodgePercent: 49,
	ModBlockPercent: 51,
	ModWeaponCritPercent: 52,
	PeriodicLeech: 53,
	ModHitChance: 54,
	ModSpellHitChance: 55,
	Transform: 56,
	ModSpellCritChance: 57,
	ModIncreaseSwimSpeed: 58,
	ModDamageDoneCreature: 59,
	ModPacifySilence: 60,
	ModScale: 61,
	PeriodicManaLeech: 64,
	CastingSpeedNotStack: 65,
	ModDisarm: 67,
	SchoolAbsorb: 69,
	ModSpellCritChanceSchool: 71,
	ModLanguage: 75,
	ModMechanicImmunity: 77,
	ModDamagePercentDone: 79,
	WaterBreathing: 82,
	ModRegen: 84,
	ModPowerRegen: 85,
	ModDamagePercentTaken: 87,
	PreventsFleeing: 92,
	InterruptRegen: 94,
	ModSkillTalent: 98,
	ModAttackPower: 99,
	ModResistancePercent: 101,
	ModMeleeAttackPowerVersus: 102,
	ModTotalThreat: 103,
	FeatherFall: 105,
	AddFlatModifier: 107,
	AddPctModifier: 108,
	OverrideClassScripts: 112,
	ModMechanicResistance: 117,
	ModHealingPct: 118,
	ModOffhandDamagePercent: 122,
	ModTargetResistance: 123,
	ModRangedAttackPower: 124,
	ModIncreaseHealthPercent: 133,
	ModHealingDone: 135,
	ModTotalStatPercentage: 137,
	ModMeleeHaste: 138,
	ModRangedHaste: 140,
	ModBaseResistancePct: 142,
	ModAttackPowerPct: 166,
	ModRangedAttackPowerPct: 167,
	ModDamageDoneVersus: 168,
	ModArmorPenetrationPct: 280,
	ModCritPct: 290,
	ModIncreaseSpellPowerPct: 317,
	ModMeleeHaste2: 319,
	ModMeleeHasteRacial: 342,
	OverrideActionbarSpell: 332,
	ModMaxPower: 418,
	Block: 564,
	ModSpellCritChanceSchool2: 552,
	ModResistanceFlatDoesNotStack: 558,
	Expertise: 593,
} as const);
export type AuraType = (typeof AuraType)[keyof typeof AuraType];
export const GetAuraType = (value: number): string => {
	const match = Object.entries(AuraType).find(([, id]) => id === value);
	return match ? match[0] : 'Unknown';
};

export const SpellModOp = Object.freeze({
	SPELLMOD_DAMAGE: 0,
	SPELLMOD_DURATION: 1,
	SPELLMOD_THREAT: 2,
	SPELLMOD_EFFECT1: 3,
	SPELLMOD_CHARGES: 4,
	SPELLMOD_RANGE: 5,
	SPELLMOD_RADIUS: 6,
	SPELLMOD_CRITICAL_CHANCE: 7,
	SPELLMOD_ALL_EFFECTS: 8,
	SPELLMOD_NOT_LOSE_CASTING_TIME: 9,
	SPELLMOD_CASTING_TIME: 10,
	SPELLMOD_COOLDOWN: 11,
	SPELLMOD_EFFECT3: 12,
	SPELLMOD_COST: 14,
	SPELLMOD_CRIT_DAMAGE_BONUS: 15,
	SPELLMOD_RESIST_MISS_CHANCE: 16,
	SPELLMOD_JUMP_TARGETS: 17,
	SPELLMOD_CHANCE_OF_SUCCESS: 18,
	SPELLMOD_ACTIVATION_TIME: 19,
	SPELLMOD_EFFECT_PAST_FIRST: 20,
	SPELLMOD_CASTING_TIME_OLD: 21,
	SPELLMOD_DOT: 22,
	SPELLMOD_SPELL_BONUS_DAMAGE: 24,
	SPELLMOD_MULTIPLE_VALUE: 27,
	SPELLMOD_RESIST_DISPEL_CHANCE: 28,
	MAX_SPELLMOD: 29,
} as const);
export type SpellModOp = (typeof SpellModOp)[keyof typeof SpellModOp];

export const ProcFlags = Object.freeze({
	PROC_FLAG_NONE: 0x00000000,
	PROC_FLAG_KILLED: 0x00000001,
	PROC_FLAG_KILL: 0x00000002,
	PROC_FLAG_SUCCESSFUL_MELEE_HIT: 0x00000004,
	PROC_FLAG_TAKEN_MELEE_HIT: 0x00000008,
	PROC_FLAG_SUCCESSFUL_MELEE_SPELL_HIT: 0x00000010,
	PROC_FLAG_TAKEN_MELEE_SPELL_HIT: 0x00000020,
	PROC_FLAG_SUCCESSFUL_RANGED_HIT: 0x00000040,
	PROC_FLAG_TAKEN_RANGED_HIT: 0x00000080,
	PROC_FLAG_SUCCESSFUL_RANGED_SPELL_HIT: 0x00000100,
	PROC_FLAG_TAKEN_RANGED_SPELL_HIT: 0x00000200,
	PROC_FLAG_SUCCESSFUL_NONE_POSITIVE_SPELL: 0x00000400,
	PROC_FLAG_TAKEN_NONE_POSITIVE_SPELL: 0x00000800,
	PROC_FLAG_SUCCESSFUL_NONE_SPELL_HIT: 0x00001000,
	PROC_FLAG_TAKEN_NONE_SPELL_HIT: 0x00002000,
	PROC_FLAG_SUCCESSFUL_POSITIVE_SPELL: 0x00004000,
	PROC_FLAG_TAKEN_POSITIVE_SPELL: 0x00008000,
	PROC_FLAG_SUCCESSFUL_NEGATIVE_SPELL_HIT: 0x00010000,
	PROC_FLAG_TAKEN_NEGATIVE_SPELL_HIT: 0x00020000,
	PROC_FLAG_ON_DO_PERIODIC: 0x00040000,
	PROC_FLAG_ON_TAKE_PERIODIC: 0x00080000,
	PROC_FLAG_TAKEN_ANY_DAMAGE: 0x00100000,
	PROC_FLAG_ON_TRAP_ACTIVATION: 0x00200000,
	PROC_FLAG_TAKEN_OFFHAND_HIT: 0x00400000,
	PROC_FLAG_SUCCESSFUL_OFFHAND_HIT: 0x00800000,
	PROC_FLAG_SUCCESSFUL_AOE: 0x01000000,
	PROC_FLAG_SUCCESSFUL_SPELL_CAST: 0x02000000,
	PROC_FLAG_SUCCESSFUL_MANA_SPELL_CAST: 0x04000000,
	PROC_FLAG_SUCCESSFUL_CURE_SPELL_CAST: 0x08000000,
	PROC_FLAG_SUCCESSFUL_PERIODIC_SPELL_HIT: 0x10000000,
	PROC_FLAG_TAKEN_PERIODIC_SPELL_HIT: 0x20000000,
	PROC_FLAG_SUCCESSFUL_MELEE_SWING_HIT: 0x40000000,
} as const);
export type ProcFlags = (typeof ProcFlags)[keyof typeof ProcFlags];

export const ShapeshiftForm = Object.freeze({
	FORM_NONE: 0,
	FORM_BATTLESTANCE: 16,
	FORM_DEFENSIVESTANCE: 17,
	FORM_BERSERKERSTANCE: 18,
} as const);
export type ShapeshiftForm = (typeof ShapeshiftForm)[keyof typeof ShapeshiftForm];

export const SpellFamily = Object.freeze({
	SPELLFAMILY_GENERIC: 0,
	SPELLFAMILY_UNK1: 1,
	SPELLFAMILY_MAGE: 3,
	SPELLFAMILY_WARRIOR: 4,
	SPELLFAMILY_WARLOCK: 5,
	SPELLFAMILY_PRIEST: 6,
	SPELLFAMILY_DRUID: 7,
	SPELLFAMILY_ROGUE: 8,
	SPELLFAMILY_HUNTER: 9,
	SPELLFAMILY_PALADIN: 10,
	SPELLFAMILY_SHAMAN: 11,
	SPELLFAMILY_UNK2: 12,
	SPELLFAMILY_POTION: 13,
	SPELLFAMILY_DEATHKNIGHT: 15,
	SPELLFAMILY_UNK3: 17,
} as const);
export type SpellFamily = (typeof SpellFamily)[keyof typeof SpellFamily];

export const SpellAttributes = Object.freeze({
	SPELL_ATTR_ON_NEXT_SWING: 0x00000004,
	SPELL_ATTR_IMPOSSIBLE_DODGE_PARRY_BLOCK: 0x00200000,
} as const);
export type SpellAttributes = (typeof SpellAttributes)[keyof typeof SpellAttributes];

export const SpellAttributesEx = Object.freeze({
	SPELL_ATTR_EX_DISCOUNT_POWER_ON_MISS: 0x08000000,
} as const);
export type SpellAttributesEx = (typeof SpellAttributesEx)[keyof typeof SpellAttributesEx];

export const SpellAttributesEx2 = Object.freeze({
	SPELL_ATTR_EX2_IGNORE_LOS: 0x00000004,
	SPELL_ATTR_DO_NOT_RESET_COMBAT_TIMERS: 0x00020000,
} as const);
export type SpellAttributesEx2 = (typeof SpellAttributesEx2)[keyof typeof SpellAttributesEx2];

export const SpellAttributesEx3 = Object.freeze({
	SPELL_ATTR_EX3_BLOCKABLE_SPELL: 0x00000008,
} as const);
export type SpellAttributesEx3 = (typeof SpellAttributesEx3)[keyof typeof SpellAttributesEx3];

export const Targets = Object.freeze({
	TARGET_NONE: 0,
	TARGET_SELF: 1,
	TARGET_UNIT_TARGET_ENEMY: 6,
	TARGET_ALL_ENEMY_IN_AREA: 15,
	TARGET_ALL_PARTY_AROUND_CASTER: 20,
	TARGET_SINGLE_FRIEND: 21,
	TARGET_CASTER_COORDINATES: 22,
	TARGET_IN_FRONT_OF_CASTER: 24,
	TARGET_DUELVSPLAYER: 25,
} as const);
export type Targets = (typeof Targets)[keyof typeof Targets];

export const ClassFlag = Object.freeze({
	CF_WARRIOR_CHARGE: 0,
	CF_WARRIOR_HAMSTRING: 1,
	CF_WARRIOR_OVERPOWER: 2,
	CF_WARRIOR_PUMMEL: 3,
	CF_WARRIOR_RECKLESSNESS: 4,
	CF_WARRIOR_REND: 5,
	CF_WARRIOR_HEROIC_STRIKE: 6, // used for ww and shield slam too
	CF_WARRIOR_THUNDER_CLAP: 7,
	CF_WARRIOR_BLOODRAGE: 8,
	CF_WARRIOR_DISARM: 9,
	CF_WARRIOR_REVENGE: 10,
	CF_WARRIOR_SHIELD_BASH: 11,
	CF_WARRIOR_SHIELD_BLOCK: 12,
	CF_WARRIOR_SHIELD_WALL: 13,
	CF_WARRIOR_SUNDER_ARMOR: 14,
	CF_WARRIOR_TAUNT: 15,
	CF_WARRIOR_BATTLE_SHOUT: 16,
	CF_WARRIOR_DEMORALIZING_SHOUT: 17,
	CF_WARRIOR_INTIMIDATING_SHOUT: 18,
	CF_WARRIOR_CHALLENGING_SHOUT: 19,
	CF_WARRIOR_INNER_RAGE: 20,
	CF_WARRIOR_SLAM: 21,
	CF_WARRIOR_CLEAVE: 22,
	CF_WARRIOR_STANCES: 23,
	CF_WARRIOR_CHARGE_STUN: 24,
	CF_WARRIOR_MORTAL_STRIKE: 25,
	CF_WARRIOR_CONCUSSION_BLOW: 26,
	CF_WARRIOR_MOCKING_BLOW: 27,
	CF_WARRIOR_BERSERKER_RAGE: 28,
	CF_WARRIOR_EXECUTE: 29,
	CF_WARRIOR_INTERCEPT: 30,
	CF_WARRIOR_RETALIATION: 31,
	CF_WARRIOR_SHIELD_SLAM: 32,
} as const);
export type ClassFlag = (typeof ClassFlag)[keyof typeof ClassFlag];

export const SpellIds = Object.freeze({
	ID_WARRIOR_BLOODTHIRST: 23894,
	ID_WARRIOR_BLOODFURY: 23234,
	ID_WARRIOR_SWEEPINGSTRIKES: 12292,
	ID_WARRIOR_TACTICALMASTERY: 12295,
	ID_WARRIOR_WEAPONMASTER: 1290261,
	ID_WARRIOR_UNBRIDLEDWRATH: 12964,
	ID_WARRIOR_ENRAGE: 12317,
	ID_WARRIOR_ENRAGEPROC: 12880,
	ID_WARRIOR_IMPZERKRAGE: 20500,
	ID_WARRIOR_ZERKRAGEEFFECT: 23690,
	ID_WARRIOR_FLURRY: 12319,
	ID_WARRIOR_FLURRYPROC: 12966,
	ID_WARRIOR_SHIELDSPECPROC: 1310318,
	ID_WARRIOR_MASTERDEFENSE: 1310316,
	ID_WARRIOR_SPEARINGSTRIKE: 1310222,
	ID_WARRIOR_BLOODTHRILL: 1289682,
	ID_WARRIOR_BLOODTHRILLPROC: 1282733,
	ID_WARRIOR_DUALWIELDSPEC: 23584,
	ID_WARRIOR_BLOODCRAZE: 16487,
	ID_WARRIOR_BLOODCRAZEPROC: 437713,
	ID_WARRIOR_RAGINGBLOWS: 1310315,
	ID_WARRIOR_WHIRLWIND: 1680,
	ID_WARRIOR_TOUCHGRAVE: 1260189,
	ID_WARRIOR_TOUCHGRAVEPROC: 1260198,
	ID_WARRIOR_EUREKA: 1259813,

	ID_ITEMS_RESTLESSSTRENGTH: 24661,
	ID_ITEMS_RESTLESSSTRENGTHPROC: 29288,
	ID_ITEMS_BRITTLEARMOR: 29284,
	ID_ITEMS_BRITTLEARMORPROC: 24590,
} as const);
export type SpellIds = (typeof SpellIds)[keyof typeof SpellIds];

export const Powers = Object.freeze({
	POWER_MANA: 0,
	POWER_RAGE: 1,
	POWER_FOCUS: 2,
	POWER_ENERGY: 3,
	POWER_HAPPINESS: 4,
} as const);
export type Powers = (typeof Powers)[keyof typeof Powers];

export const BaseStats = Object.freeze({
	STAT_STRENGTH: 0,
	STAT_AGILITY: 1,
	STAT_STAMINA: 2,
	STAT_INTELLECT: 3,
	STAT_SPIRIT: 4,
} as const);
export type BaseStats = (typeof BaseStats)[keyof typeof BaseStats];

export const EventType = Object.freeze({
	AttackDone: 1,
	AuraStart: 2,
	AuraCharge: 3,
	AuraEnd: 4,
	SpellDone: 5,
	AttackReceived: 6,
	PowerChange: 7,
	SpellStartCasting: 8,
	AuraTick: 9,
	FormChange: 10,
	ExtraAttack: 11,
	Custom: 12,
	Threat: 13,
} as const);
export type EventType = (typeof EventType)[keyof typeof EventType];

export const WorkerEvent = Object.freeze({
	Update: 0,
	Finished: 1,
	Error: 2,
} as const);
export type WorkerEvent = (typeof WorkerEvent)[keyof typeof WorkerEvent];

export const SkillType = Object.freeze({
	SKILL_NONE: 0,
	SKILL_SWORDS: 43,
	SKILL_AXES: 44,
	SKILL_BOWS: 45,
	SKILL_GUNS: 46,
	SKILL_MACES: 54,
	SKILL_2H_SWORDS: 55,
	SKILL_DEFENSE: 95,
	SKILL_STAVES: 136,
	SKILL_2H_MACES: 160,
	SKILL_UNARMED: 162,
	SKILL_2H_AXES: 172,
	SKILL_DAGGERS: 173,
	SKILL_THROWN: 176,
	SKILL_CROSSBOWS: 226,
	SKILL_WANDS: 228,
	SKILL_POLEARMS: 229,
	SKILL_SHIELD: 433,
	SKILL_FIST_WEAPONS: 473,
} as const);
export type SkillType = (typeof SkillType)[keyof typeof SkillType];

export const ConditionType = Object.freeze({
	Power: 1,
	TimeRemaining: 2,
	TimeElapsed: 3,
	MainHandSwing: 4,
	Precast: 5,
} as const);
export type ConditionType = (typeof ConditionType)[keyof typeof ConditionType];
