import { useEffect, useState } from 'react';
import {
	ArmorType,
	AuraType,
	ClassMask,
	EffectType,
	GetInventoryType,
	InventoryType,
	ItemQuality,
	ItemType,
	SkillType,
	SpellSchool,
	WeaponType,
} from '@core/shared/enums';
import { round } from '@core/shared/utils';

const script1 = document.createElement('script');
script1.src = '/src/generators/data/rawdata.js';
script1.async = true;
document.body.appendChild(script1);

const script2 = document.createElement('script');
script2.src = '/src/generators/data/wow-classic-items.js';
script2.async = true;
document.body.appendChild(script2);

function Loading() {
	return (
		<div className="loader-container">
			<span className="loader"></span>
		</div>
	);
}

async function saveFile(blob: any) {
	const a = document.createElement('a');
	a.download = 'items.ts';
	a.href = URL.createObjectURL(blob);
	a.addEventListener('click', () => {
		setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
	});
	a.click();
}

function addToGear(obj: any, allTheGear: any) {
	if (obj.slot == InventoryType.Ring) {
		allTheGear.finger1.push(obj);
		allTheGear.finger2.push(obj);
	} else if (obj.slot == InventoryType.Trinket) {
		allTheGear.trinket1.push(obj);
		allTheGear.trinket2.push(obj);
	} else if (obj.slot == InventoryType.Onehand) {
		allTheGear.mainhand.push(obj);
		allTheGear.offhand.push(obj);
	} else if (obj.slot == InventoryType.Shield) {
		allTheGear.offhand.push(obj);
	} else {
		if (!allTheGear[GetInventoryType(obj.slot).toLowerCase()]) allTheGear[GetInventoryType(obj.slot).toLowerCase()] = [];
		allTheGear[GetInventoryType(obj.slot).toLowerCase()].push(obj);
	}
}

// #region table management
function loadTable(name: string) {
	return fetch('./src/generators/data/' + name + '.csv')
		.then(response => response.text())
		.then(data => {
			return formatTable(data);
		});
}
function formatTable(data: string): any[] {
	let table = [] as any[];
	var rows = data.split(/\r?\n|\r/);
	var th = rows[0].split(',');
	rows.forEach(row => {
		if (row == rows[0]) return;

		// strip commas inside strings
		let count = 0;
		for (let i = 0; i < row.length; i++) {
			if (row[i] == '"') count++;
			if (row[i] == ',' && count % 2 == 1) {
				row = row.slice(0, i) + row.slice(i + 1);
			}
		}

		let fields = row.split(',');
		let obj = {} as any;
		for (let i = 0; i < fields.length; i++) {
			obj[th[i]] = fields[i];
		}
		table.push(obj);
	});
	return table;
}
function getRow(table: any, id: string) {
	for (let r of table) if (r.ID == id) return r;
}
function getRows(table: any, column: string, id: string) {
	let result = [];
	for (let r of table) if (r[column] == id) result.push(r);
	return result;
}
function getStat(obj: any, type: number, budget: number) {
	let stat = 0;

	if (obj['StatModifier_bonusStat[0]'] == type) stat += Math.round(Number(obj['StatPercentEditor[0]']) * (budget / 10000));
	if (obj['StatModifier_bonusStat[1]'] == type) stat += Math.round(Number(obj['StatPercentEditor[1]']) * (budget / 10000));
	if (obj['StatModifier_bonusStat[2]'] == type) stat += Math.round(Number(obj['StatPercentEditor[2]']) * (budget / 10000));
	if (obj['StatModifier_bonusStat[3]'] == type) stat += Math.round(Number(obj['StatPercentEditor[3]']) * (budget / 10000));
	if (obj['StatModifier_bonusStat[4]'] == type) stat += Math.round(Number(obj['StatPercentEditor[4]']) * (budget / 10000));
	if (obj['StatModifier_bonusStat[5]'] == type) stat += Math.round(Number(obj['StatPercentEditor[5]']) * (budget / 10000));
	if (obj['StatModifier_bonusStat[6]'] == type) stat += Math.round(Number(obj['StatPercentEditor[6]']) * (budget / 10000));
	if (obj['StatModifier_bonusStat[7]'] == type) stat += Math.round(Number(obj['StatPercentEditor[7]']) * (budget / 10000));
	if (obj['StatModifier_bonusStat[8]'] == type) stat += Math.round(Number(obj['StatPercentEditor[8]']) * (budget / 10000));
	if (obj['StatModifier_bonusStat[9]'] == type) stat += Math.round(Number(obj['StatPercentEditor[9]']) * (budget / 10000));
	return stat;
}
function getBudget(obj: any, randprop: any) {
	let budget = 0;
	let invIndex = 0;
	if (obj.slot == InventoryType.Head) invIndex = 0;
	if (obj.slot == InventoryType.Chest) invIndex = 0;
	if (obj.slot == InventoryType.Legs) invIndex = 0;
	if (obj.slot == InventoryType.Robe) invIndex = 0;

	if (obj.slot == InventoryType.Shoulder) invIndex = 1;
	if (obj.slot == InventoryType.Hands) invIndex = 1;
	if (obj.slot == InventoryType.Waist) invIndex = 1;
	if (obj.slot == InventoryType.Feet) invIndex = 1;
	if (obj.slot == InventoryType.Trinket) invIndex = 1;

	if (obj.slot == InventoryType.Wrists) invIndex = 2;
	if (obj.slot == InventoryType.Neck) invIndex = 2;
	if (obj.slot == InventoryType.Ring) invIndex = 2;
	if (obj.slot == InventoryType.Back) invIndex = 2;
	if (obj.slot == InventoryType.Held) invIndex = 2;
	if (obj.slot == InventoryType.Shield) invIndex = 2;

	if (obj.slot == InventoryType.Onehand) invIndex = 3;
	if (obj.slot == InventoryType.Bow) invIndex = 4;
	if (obj.slot == InventoryType.Twohand) invIndex = 0;
	if (obj.slot == InventoryType.Mainhand) invIndex = 3;
	if (obj.slot == InventoryType.Offhand) invIndex = 3;
	if (obj.slot == InventoryType.Thrown) invIndex = 4;
	if (obj.slot == InventoryType.Ranged) invIndex = 4;
	if (obj.slot == InventoryType.Ranged2) invIndex = 4;

	if (obj.quality <= ItemQuality.Uncommon) budget = Number(randprop['Good[' + invIndex + ']']);
	if (obj.quality == ItemQuality.Rare) budget = Number(randprop['Superior[' + invIndex + ']']);
	if (obj.quality >= ItemQuality.Epic) budget = Number(randprop['Epic[' + invIndex + ']']);
	return budget;
}
function getResistance(item: any) {
	let resist = Array(8).fill(0);
	if (Number(item['Resistances[0]'])) resist[SpellSchool.Physical] = Number(item['Resistances[0]']);
	if (Number(item['Resistances[1]'])) resist[SpellSchool.Holy] = Number(item['Resistances[1]']);
	if (Number(item['Resistances[2]'])) resist[SpellSchool.Fire] = Number(item['Resistances[2]']);
	if (Number(item['Resistances[3]'])) resist[SpellSchool.Nature] = Number(item['Resistances[3]']);
	if (Number(item['Resistances[4]'])) resist[SpellSchool.Frost] = Number(item['Resistances[4]']);
	if (Number(item['Resistances[5]'])) resist[SpellSchool.Shadow] = Number(item['Resistances[5]']);
	if (Number(item['Resistances[6]'])) resist[SpellSchool.Arcane] = Number(item['Resistances[6]']);
	return resist;
}

// #endregion

// #region item filtering
function isValidClass(item: any) {
	if (item.classId == ItemType.Gem && item.subclassId == 3) return true;
	if (item.classId == ItemType.Armor && item.subclassId < 7 && item.subclassId != 5) return true;
	if (
		item.classId == ItemType.Weapon &&
		item.subclassId != WeaponType.Fishingpole &&
		item.subclassId != WeaponType.Warglaive &&
		item.subclassId != WeaponType.Catclaw &&
		item.subclassId != WeaponType.Wand &&
		item.subclassId != WeaponType.Obsolete3 &&
		WeaponType.Bearclaw
	)
		return true;
	return false;
}
function isValidInventoryType(item: any) {
	if (item.slot == InventoryType.None) return false;
	if (item.slot == InventoryType.Shirt) return false;
	if (item.slot == InventoryType.Bag) return false;
	if (item.slot == InventoryType.Tabard) return false;
	if (item.slot == InventoryType.Held) return false;
	if (item.slot == InventoryType.Ammo) return false;
	if (item.slot == InventoryType.Ranged2) return false;
	if (item.slot == InventoryType.Relic) return false;
	if (item.slot == InventoryType.Thrown) return false;
	return true;
}
function isValidQuality(item: any) {
	if (item.quality == ItemQuality.Poor) return false;
	if (item.quality == ItemQuality.Common) return false;
	return true;
}
function forceInclude(obj: any) {
	let include = false;

	if (obj.id == 21568) include = true;
	if (obj.id == 18706) include = true;
	if (obj.id == 19024) include = true;
	if (obj.id == 21567) include = true;
	if (obj.id == 19949) include = true;
	if (obj.id == 23570) include = true;
	if (obj.id == 21670) include = true;
	if (obj.id == 20130) include = true;
	if (obj.id == 21180) include = true;
	if (obj.id == 12905) include = true;
	if (obj.id == 18638) include = true;
	if (obj.id == 16309) include = true;
	if (obj.id == 15138) include = true;
	if (obj.id == 19951) include = true;

	return include;
}
function forceExclude(obj: any) {
	let exclude = false;

	if (obj.name.includes('90')) exclude = true;
	if (obj.name.includes('DEPRECATED')) exclude = true;

	if (obj.id == 16336) exclude = true;
	if (obj.id == 17780) exclude = true;
	if (obj.id == 11905) exclude = true;
	if (obj.id == 10455) exclude = true;
	if (obj.id == 13213) exclude = true;
	if (obj.id == 21891) exclude = true;
	if (obj.id == 13171) exclude = true;
	if (obj.id == 22988) exclude = true;
	if (obj.id == 16007) exclude = true;
	if (obj.id == 12802) exclude = true;
	if (obj.id == 20522) exclude = true;
	if (obj.id == 12106) exclude = true;
	if (obj.id == 12104) exclude = true;

	if (obj.id == 10577) exclude = true;
	if (obj.id == 20177) exclude = true;
	if (obj.id == 20179) exclude = true;
	if (obj.id == 22736) exclude = true;
	if (obj.id == 16959) exclude = true;
	if (obj.id == 16960) exclude = true;
	if (obj.id == 19347) exclude = true;
	if (obj.id == 22406) exclude = true;
	if (obj.id == 23124) exclude = true;
	if (obj.id == 19570) exclude = true;
	if (obj.id == 19571) exclude = true;
	if (obj.id == 22809) exclude = true;
	if (obj.id == 13000) exclude = true;
	if (obj.id == 22394) exclude = true;
	if (obj.id == 19360) exclude = true;
	if (obj.id == 19169) exclude = true;
	if (obj.id == 20581) exclude = true;
	if (obj.id == 19101) exclude = true;
	if (obj.id == 944) exclude = true;
	if (obj.id == 20220) exclude = true;
	if (obj.id == 20069) exclude = true;
	if (obj.id == 19102) exclude = true;
	if (obj.id == 21188) exclude = true;
	if (obj.id == 20654) exclude = true;
	if (obj.id == 21125) exclude = true;
	if (obj.id == 13249) exclude = true;
	if (obj.id == 21273) exclude = true;
	if (obj.id == 19566) exclude = true;
	if (obj.id == 19567) exclude = true;
	if (obj.id == 21275) exclude = true;
	if (obj.id == 20536) exclude = true;
	if (obj.id == 873) exclude = true;
	if (obj.id == 10844) exclude = true;
	if (obj.id == 22458) exclude = true;
	if (obj.id == 17743) exclude = true;
	if (obj.id == 20504) exclude = true;
	if (obj.id == 18878) exclude = true;
	if (obj.id == 11750) exclude = true;
	if (obj.id == 11932) exclude = true;
	if (obj.id == 13161) exclude = true;
	if (obj.id == 13937) exclude = true;
	if (obj.id == 17113) exclude = true;
	if (obj.id == 18311) exclude = true;
	if (obj.id == 18531) exclude = true;
	if (obj.id == 18534) exclude = true;
	if (obj.id == 18717) exclude = true;
	if (obj.id == 19355) exclude = true;
	if (obj.id == 19356) exclude = true;
	if (obj.id == 19357) exclude = true;
	if (obj.id == 22208) exclude = true;
	if (obj.id == 22333) exclude = true;
	if (obj.id == 22335) exclude = true;
	if (obj.id == 18803) exclude = true;
	if (obj.id == 18842) exclude = true;
	if (obj.id == 19402) exclude = true;
	if (obj.id == 19890) exclude = true;
	if (obj.id == 19964) exclude = true;
	if (obj.id == 19965) exclude = true;
	if (obj.id == 19864) exclude = true;
	if (obj.id == 19903) exclude = true;
	if (obj.id == 22713) exclude = true;
	if (obj.id == 19884) exclude = true;
	if (obj.id == 19909) exclude = true;
	if (obj.id == 20258) exclude = true;
	if (obj.id == 19963) exclude = true;
	if (obj.id == 20260) exclude = true;
	if (obj.id == 20257) exclude = true;
	if (obj.id == 21704) exclude = true;
	if (obj.id == 20629) exclude = true;
	if (obj.id == 11824) exclude = true;
	if (obj.id == 20505) exclude = true;
	if (obj.id == 22326) exclude = true;
	if (obj.id == 3837) exclude = true;
	if (obj.id == 20622) exclude = true;
	if (obj.id == 3841) exclude = true;
	if (obj.id == 3845) exclude = true;
	if (obj.id == 18312) exclude = true;
	if (obj.id == 9366) exclude = true;
	if (obj.id == 3843) exclude = true;
	if (obj.id == 11749) exclude = true;
	if (obj.id == 12964) exclude = true;
	if (obj.id == 3847) exclude = true;
	if (obj.id == 18692) exclude = true;
	if (obj.id == 13360) exclude = true;
	if (obj.id == 17710) exclude = true;
	if (obj.id == 17719) exclude = true;
	if (obj.id == 17943) exclude = true;
	if (obj.id == 13205) exclude = true;
	if (obj.id == 14528) exclude = true;
	if (obj.id == 17718) exclude = true;
	if (obj.id == 17719) exclude = true;
	if (obj.id == 18485) exclude = true;
	if (obj.id == 19915) exclude = true;
	if (obj.id == 7713) exclude = true;
	if (obj.id == 7723) exclude = true;

	return exclude;
}
// #endregion

// #region effect management
var procData = [
	{ id: 811, ppm: 0.8 },
	{ id: 17068, ppm: 0.8 },
	{ id: 871, ppm: 1.8 },
	{ id: 19170, ppm: 0.4 },
	{ id: 11684, ppm: 0.8 },
	{ id: 23221, ppm: 2 },
	{ id: 6622, ppm: 1.8 },
	{ id: 19019, ppm: 6 },
	{ id: 17075, ppm: 0.6 },
	{ id: 17068, ppm: 0.8 },
	{ id: 871, ppm: 1.8 },
	{ id: 19170, ppm: 0.4 },
	{ id: 23221, ppm: 2 },
	{ id: 19019, ppm: 6 },
	{ id: 17075, ppm: 0.6 },
	{ id: 19918, ppm: 4 },
	{ id: 17182, ppm: 0.7 },
	{ id: 17076, ppm: 2 },
	{ id: 11815, chance: 2, cooldown: 2000 },
	{ id: 19289, chance: 2 },
	{ id: 22321, chance: 2 },
	{ id: 7284, chance: 5 },
	{ id: 9425, ppm: 0.5 },
	{ id: 19968, chance: 100 },
	{ id: 12631, chance: 100 },
	{ id: 17111, chance: 100 },
];
function addEffect(e: any, obj: any, spellShapeshift: any, spellEffect: any) {
	let shapeshift = getRows(spellShapeshift, 'SpellID', e.SpellID)[0];
	if (shapeshift && shapeshift['ShapeshiftMask[0]'] == 145) return;
	if (e.Effect == 6 && e.EffectAura == AuraType.ModAttackPower) {
		obj.stats.melee_ap = (obj.stats.melee_ap || 0) + Number(e.EffectBasePoints) + 1;
		obj.stats.ranged_ap = (obj.stats.ranged_ap || 0) + Number(e.EffectBasePoints) + 1;
	}
	if (e.Effect == 6 && e.EffectAura == AuraType.ModMeleeAttackPowerVersus && e['EffectMiscValue[0]'] & 32) {
		obj.stats.melee_ap = (obj.stats.melee_ap || 0) + Number(e.EffectBasePoints) + 1;
		obj.stats.ranged_ap = (obj.stats.ranged_ap || 0) + Number(e.EffectBasePoints) + 1;
	}
	if (e.Effect == 6 && e.EffectAura == AuraType.ModMeleeAttackPowerVersus && e['EffectMiscValue[0]'] & 256) {
		obj.stats.melee_ap = (obj.stats.melee_ap || 0) + Number(e.EffectBasePoints) + 1;
		obj.stats.ranged_ap = (obj.stats.ranged_ap || 0) + Number(e.EffectBasePoints) + 1;
	}
	if (e.Effect == 6 && e.EffectAura == AuraType.ModHitChance) {
		if (!obj.stats.hit) obj.stats.hit = Array(8).fill(0);
		obj.stats.hit[SpellSchool.Physical] += Number(e.EffectBasePoints) + Number(e.EffectDieSides);
	}
	if (e.Effect == 6 && e.EffectAura == AuraType.ModDodgePercent) {
		obj.stats.parry = (obj.stats.parry || 0) + Number(e.EffectBasePoints) + 1;
	}
	if (e.Effect == 6 && e.EffectAura == AuraType.ModParryPercent) {
		obj.stats.parry = (obj.stats.parry || 0) + Number(e.EffectBasePoints) + 1;
	}
	if (e.Effect == 6 && e.EffectAura == AuraType.ModWeaponCritPercent) {
		if (!obj.stats.crit) obj.stats.crit = Array(8).fill(0);
		obj.stats.crit[SpellSchool.Physical] += Number(e.EffectBasePoints) + Number(e.EffectDieSides);
	}
	if (e.Effect == 6 && e.EffectAura == AuraType.ModSpellCritChanceSchool) {
		if (!obj.stats.crit) obj.stats.crit = Array(8).fill(0);
		obj.stats.crit[SpellSchool.Arcane] += Number(e.EffectBasePoints) + Number(e.EffectDieSides);
		obj.stats.crit[SpellSchool.Fire] += Number(e.EffectBasePoints) + Number(e.EffectDieSides);
		obj.stats.crit[SpellSchool.Frost] += Number(e.EffectBasePoints) + Number(e.EffectDieSides);
		obj.stats.crit[SpellSchool.Shadow] += Number(e.EffectBasePoints) + Number(e.EffectDieSides);
		obj.stats.crit[SpellSchool.Nature] += Number(e.EffectBasePoints) + Number(e.EffectDieSides);
		obj.stats.crit[SpellSchool.Holy] += Number(e.EffectBasePoints) + Number(e.EffectDieSides);
	}
	if (e.Effect == 6 && e.EffectAura == AuraType.ModMeleeHaste) {
		if (!obj.stats.haste) obj.stats.haste = Array(4).fill(1);
		obj.stats.haste[SpellSchool.Physical] += Number(e.EffectBasePoints) + Number(e.EffectDieSides);
	}
	if (e.Effect == 6 && e.EffectAura == AuraType.Expertise) obj.stats.expertise = Math.abs(e.EffectBasePoints);
	if (e.Effect == 6 && e.EffectAura == AuraType.ModHealingDone) obj.stats.healing = Number(e.EffectBasePoints) + 1;
	if (e.Effect == 6 && e.EffectAura == AuraType.Block) obj.stats.block_amount = Number(e.EffectBasePoints) + 1;
	if (e.Effect == 6 && e.EffectAura == AuraType.ModBlockPercent) obj.stats.block_chance = Number(e.EffectBasePoints) + 1;
	if (e.Effect == 6 && e.EffectAura == AuraType.ModSkill && e['EffectMiscValue[0]'] == SkillType.SKILL_DEFENSE)
		obj.stats.defense = Number(e.EffectBasePoints) + 1;

	if (
		e.Effect == 6 &&
		e.EffectAura == AuraType.ModSkill &&
		e['EffectMiscValue[0]'] != SkillType.SKILL_DEFENSE &&
		e['EffectMiscValue[0]'] != SkillType.SKILL_CROSSBOWS &&
		e['EffectMiscValue[0]'] != 393 && // skinning
		e['EffectMiscValue[0]'] != SkillType.SKILL_BOWS &&
		e['EffectMiscValue[0]'] != SkillType.SKILL_GUNS
	) {
		let id;
		if (e['EffectMiscValue[0]'] == SkillType.SKILL_DAGGERS) id = WeaponType.Dagger;
		if (e['EffectMiscValue[0]'] == SkillType.SKILL_UNARMED) id = WeaponType.Unarmed;
		if (e['EffectMiscValue[0]'] == SkillType.SKILL_STAVES) id = WeaponType.Staff;
		if (e['EffectMiscValue[0]'] == SkillType.SKILL_POLEARMS) id = WeaponType.Polearm;
		if (e['EffectMiscValue[0]'] == SkillType.SKILL_AXES) id = WeaponType.Axe1H;
		if (e['EffectMiscValue[0]'] == SkillType.SKILL_SWORDS) id = WeaponType.Sword1H;
		if (e['EffectMiscValue[0]'] == SkillType.SKILL_MACES) id = WeaponType.Mace1H;
		if (e['EffectMiscValue[0]'] == SkillType.SKILL_2H_AXES) id = WeaponType.Axe2H;
		if (e['EffectMiscValue[0]'] == SkillType.SKILL_2H_SWORDS) id = WeaponType.Sword2H;
		if (e['EffectMiscValue[0]'] == SkillType.SKILL_2H_MACES) id = WeaponType.Mace2H;
		if (id) {
			if (!obj.stats) obj.stats = {};
			if (!obj.stats.weapon_skill) obj.stats.weapon_skill = Array(21).fill(0);
			obj.stats.weapon_skill[id] = Number(e.EffectBasePoints) + 1;
		}
	}

	// proc spells
	if (e.Effect == 6 && e.EffectAura == AuraType.ProcTriggerSpell) {
		obj.proc = {};
		obj.proc.spell = Number(e.EffectTriggerSpell);

		let spellEffects = getRows(spellEffect, 'SpellID', e.EffectTriggerSpell);
		for (let spEffect of spellEffects) {
			switch (Number(spEffect.Effect)) {
				case EffectType.SchoolDamage:
				case EffectType.HealthLeech:
				case EffectType.AddExtraAttacks:
					obj.proc = {};
					obj.proc.spell = Number(e.EffectTriggerSpell);
					break;
				case EffectType.ApplyAura:
					if (spEffect.EffectAura == AuraType.PeriodicDamage) {
						obj.proc = {};
						obj.proc.spell = Number(e.EffectTriggerSpell);
						break;
					}
					break;
			}
		}
	}
}
// #endregion

// #region suffix management
// function getItemSuffixes(id: string, quality: number, type: string) {
// 	let global = globalThis as any;
// 	let item_template = global.item_template;
// 	let item_enchantment_template = global.item_enchantment_template;
// 	let suffixes = global.suffixes;
// 	let result = [];
// 	let ench;
// 	for (let j = 0; j < item_template.length; j++) {
// 		if (item_template[j][0] == id) ench = item_template[j][1];
// 	}
// 	for (let i = 0; i < item_enchantment_template.length; i++) {
// 		if (item_enchantment_template[i][0] == ench) {
// 			result.push(item_enchantment_template[i][1]);
// 		}
// 	}
// 	let high = { id: 0, s: '' };
// 	for (let x = 0; x < result.length; x++) {
// 		for (let y = 0; y < suffixes.length; y++) {
// 			if (
// 				(type == 'tiger' && result[x] >= 669 && result[x] <= 753) || // of the Tiger
// 				(type == 'strength' &&
// 					(result[x] == 6 ||
// 						result[x] == 23 ||
// 						result[x] == 24 ||
// 						result[x] == 97 ||
// 						result[x] == 115 ||
// 						result[x] == 136 ||
// 						result[x] == 155 ||
// 						result[x] == 189 ||
// 						result[x] == 190 ||
// 						result[x] == 191 ||
// 						result[x] == 192 ||
// 						result[x] == 193 ||
// 						result[x] == 219 ||
// 						result[x] == 220 ||
// 						(result[x] >= 307 && result[x] <= 332))) || // of Strength
// 				(type == 'bear' && result[x] >= 1179 && result[x] <= 1263) || // of the Bear
// 				(type == 'striking' &&
// 					quality >= 3 &&
// 					(result[x] == 2149 ||
// 						result[x] == 2150 ||
// 						result[x] == 2151 ||
// 						result[x] == 2154 ||
// 						result[x] == 2157 ||
// 						result[x] == 2158 ||
// 						result[x] == 2163))
// 			) {
// 				// of Striking
// 				if (suffixes[y].id == result[x] && suffixes[y].id > high.id) {
// 					high = suffixes[y];
// 				}
// 			}
// 		}
// 	}
// 	return high;
// }
// function getSuffixObject(item: any, sparse: any, type: string, description: string) {
// 	let suff = getItemSuffixes(item.id, sparse.OverallQualityID, type);
// 	if (suff.s) {
// 		let clone = structuredClone(item);
// 		(suff.s as any).forEach((s: any) => {
// 			if (/[+-]\d+ Strength/.test(s)) {
// 				clone.stats.str = Number(s);
// 			}
// 			if (/[+-]\d+ Agility/.test(s)) {
// 				clone.stats.agi = Number(s);
// 			}
// 			if (/[+-]\d+ Stamina/.test(s)) {
// 				clone.stats.sta = Number(s);
// 			}
// 		});

// 		clone.name += ' ' + description;
// 		clone.rand = suff.id;
// 		return clone;
// 	}
// }
// #endregion

export default function ItemGenerator() {
	let items: any[],
		itemEffect: any[],
		itemSparse: any[],
		//spellCategories: any[],
		spellEffect: any[],
		//spellMisc: any[],
		//spellDuration: any[],
		spellShapeshift: any[],
		shieldBlockValue: any[],
		icons: any[],
		randproppoints: any[],
		itemdamageonehand: any[],
		itemdamagetwohand: any[],
		itemdamageranged: any[],
		itemxitemeffect: any[],
		itemarmorshield: any[],
		armorlocation: any[],
		itemarmorquality: any[],
		itemarmortotal: any[];

	const [working, setWorking] = useState(false);

	useEffect(() => {
		let promises = [];
		promises.push(loadTable('item'));
		promises.push(loadTable('itemeffect'));
		promises.push(loadTable('itemsparse'));
		promises.push(loadTable('spellcategories'));
		promises.push(loadTable('spelleffect'));
		promises.push(loadTable('spellmisc'));
		promises.push(loadTable('spellduration'));
		promises.push(loadTable('spellshapeshift'));
		promises.push(loadTable('shieldblockvalue'));
		promises.push(loadTable('icons'));
		promises.push(loadTable('randproppoints'));
		promises.push(loadTable('itemdamageonehand'));
		promises.push(loadTable('itemdamagetwohand'));
		promises.push(loadTable('itemdamageranged'));
		promises.push(loadTable('itemxitemeffect'));
		promises.push(loadTable('itemarmorshield'));
		promises.push(loadTable('armorlocation'));
		promises.push(loadTable('itemarmorquality'));
		promises.push(loadTable('itemarmortotal'));

		Promise.all(promises).then(values => {
			items = values[0];
			itemEffect = values[1];
			itemSparse = values[2];
			//spellCategories = values[3];
			spellEffect = values[4];
			//spellMisc = values[5];
			//spellDuration = values[6];
			spellShapeshift = values[7];
			shieldBlockValue = values[8];
			icons = values[9];
			randproppoints = values[10];
			itemdamageonehand = values[11];
			itemdamagetwohand = values[12];
			itemdamageranged = values[13];
			itemxitemeffect = values[14];
			itemarmorshield = values[15];
			armorlocation = values[16];
			itemarmorquality = values[17];
			itemarmortotal = values[18];
		});
	}, []);

	function generateData() {
		var allTheGear = {
			finger1: [],
			finger2: [],
			trinket1: [],
			trinket2: [],
			mainhand: [],
			offhand: [],
		} as any;

		if (!items) {
			setWorking(false);
			return;
		}
		for (let item of items) {
			let obj = {} as any;
			obj.id = Number(item.ID);
			//if (obj.id == 20150) debugger;
			//else continue;

			let sparse = getRow(itemSparse, obj.id);
			if (!sparse) continue;
			if (sparse.AllowableClass != '-1' && !(ClassMask.Warrior & Number(sparse.AllowableClass))) continue;

			//if (obj.id == 23054 || obj.id == 19122) debugger;

			obj.classId = Number(item.ClassID);
			obj.subclassId = Number(item.SubclassID);
			obj.slot = Number(item.InventoryType);
			obj.requires = Number(item.RequiredLevel) || 0;
			obj.quality = Number(sparse.OverallQualityID);
			obj.ilvl = Number(sparse.ItemLevel);
			obj.name = sparse.Display_lang.replaceAll('"', '');
			if (!isValidClass(obj)) continue;
			if (!isValidInventoryType(obj)) continue;
			if (!isValidQuality(obj)) continue;

			// damage
			if (Number(sparse.ItemDelay)) obj.speed = Number(sparse.ItemDelay) / 1000;

			let dpsrow;
			if (obj.slot == InventoryType.Twohand) dpsrow = getRow(itemdamagetwohand, sparse.ItemLevel);
			if (obj.slot == InventoryType.Bow || obj.slot == InventoryType.Ranged || obj.slot == InventoryType.Ranged2)
				dpsrow = getRow(itemdamageranged, sparse.ItemLevel);
			if (obj.slot == InventoryType.Onehand || obj.slot == InventoryType.Offhand || obj.slot == InventoryType.Mainhand)
				dpsrow = getRow(itemdamageonehand, sparse.ItemLevel);

			if (dpsrow) {
				let dps = Number(dpsrow['Quality[' + sparse.OverallQualityID + ']']);
				obj.mindmg = round(dps * obj.speed * (1 - Number(sparse.DmgVariance) / 2));
				obj.maxdmg = round(dps * obj.speed * (1 + Number(sparse.DmgVariance) / 2));
			}
			//let dmgModifier = Number(sparse.QualityModifier) * Number(obj.speed);
			// if (Number(sparse['MinDamage[0]'])) obj.mindmg = Number(sparse['MinDamage[0]']) + dmgModifier;
			// if (Number(sparse['MaxDamage[0]'])) obj.maxdmg = Number(sparse['MaxDamage[0]']) + dmgModifier;
			// if (Number(sparse['MinDamage[1]'])) obj.mindmg += Number(sparse['MinDamage[1]']);
			// if (Number(sparse['MaxDamage[1]'])) obj.maxdmg += Number(sparse['MaxDamage[1]']);

			if (obj.classId == ItemType.Weapon && (!obj.mindmg || !obj.maxdmg)) continue;

			let icon = getRow(icons, item.IconFileDataID);
			if (icon) obj.path = icon.path;

			// stats
			let budget = 0;
			let randprop = getRow(randproppoints, sparse.ItemLevel);
			if (randprop) budget = getBudget(obj, randprop);

			obj.stats = {};
			let agi = getStat(sparse, 3, budget);
			let str = getStat(sparse, 4, budget);
			let sta = getStat(sparse, 7, budget);
			let spi = getStat(sparse, 6, budget);
			let int = getStat(sparse, 5, budget);
			let ap = getStat(sparse, 38, budget);
			let hitrate = getStat(sparse, 31, budget);
			let critrate = getStat(sparse, 32, budget);
			let block = getStat(sparse, 48, budget);
			let defense = getStat(sparse, 12, budget);
			let dodgerate = getStat(sparse, 13, budget);
			let parryrate = getStat(sparse, 14, budget);
			let blockrate = getStat(sparse, 15, budget);
			let spdmg = getStat(sparse, 42, budget);
			let armor = getStat(sparse, 50, budget);
			let expertise = getStat(sparse, 37, budget);
			let rap = getStat(sparse, 39, budget);
			if (agi) obj.stats.agi = agi;
			if (str) obj.stats.str = str;
			if (sta) obj.stats.sta = sta;
			if (spi) obj.stats.spi = spi;
			if (int) obj.stats.int = int;
			if (ap) obj.stats.melee_ap = ap;
			if (ap) obj.stats.ranged_ap = ap;
			if (rap) obj.stats.ranged_ap = rap;
			if (block) obj.stats.block_amount = block;
			if (defense) obj.stats.defense = defense;
			if (dodgerate) obj.stats.dodge_rate = dodgerate;
			if (parryrate) obj.stats.parry_rate = parryrate;
			if (blockrate) obj.stats.block_rate = blockrate;
			if (expertise) obj.stats.expertise = expertise;
			if (critrate) obj.stats.crit_rate = critrate;
			if (hitrate) obj.stats.hit_rate = hitrate;
			if (armor) obj.stats.armor = armor;
			if (spdmg) {
				obj.stats.dmg_done_mod = Array(8).fill(0);
				obj.stats.dmg_done_mod[SpellSchool.Arcane] = spdmg;
				obj.stats.dmg_done_mod[SpellSchool.Fire] = spdmg;
				obj.stats.dmg_done_mod[SpellSchool.Frost] = spdmg;
				obj.stats.dmg_done_mod[SpellSchool.Shadow] = spdmg;
				obj.stats.dmg_done_mod[SpellSchool.Nature] = spdmg;
				obj.stats.dmg_done_mod[SpellSchool.Holy] = spdmg;
			}

			// resistances
			if (
				Number(item['Resistances[0]']) ||
				Number(item['Resistances[1]']) ||
				Number(item['Resistances[2]']) ||
				Number(item['Resistances[3]']) ||
				Number(item['Resistances[4]']) ||
				Number(item['Resistances[5]']) ||
				Number(item['Resistances[6]'])
			)
				obj.stats.resistance = getResistance(item);

			if (obj.slot == InventoryType.Shield) {
				let armorShield = getRow(itemarmorshield, sparse.ItemLevel);
				if (armorShield) {
					obj.stats.armor = obj.stats.armor || 0;
					obj.stats.armor += Number(armorShield['Quality[' + sparse.OverallQualityID + ']']);
				}
			} else {
				let total = 0,
					locationMod = 0,
					qualityMod = 0;
				let armorLocation = getRow(armorlocation, item.InventoryType);
				if (armorLocation && obj.subclassId == ArmorType.Cloth) locationMod = Number(armorLocation['Clothmodifier']);
				if (armorLocation && obj.subclassId == ArmorType.Leather) locationMod = Number(armorLocation['Leathermodifier']);
				if (armorLocation && obj.subclassId == ArmorType.Mail) locationMod = Number(armorLocation['Chainmodifier']);
				if (armorLocation && obj.subclassId == ArmorType.Plate) locationMod = Number(armorLocation['Platemodifier']);

				let armorQuality = getRow(itemarmorquality, sparse.ItemLevel);
				if (armorQuality) qualityMod = Number(armorQuality['Qualitymod[' + sparse.OverallQualityID + ']']);

				let armorTotal = getRow(itemarmortotal, sparse.ItemLevel);
				if (armorTotal && obj.subclassId == ArmorType.Cloth) total = Number(armorTotal['Cloth']);
				if (armorTotal && obj.subclassId == ArmorType.Leather) total = Number(armorTotal['Leather']);
				if (armorTotal && obj.subclassId == ArmorType.Mail) total = Number(armorTotal['Mail']);
				if (armorTotal && obj.subclassId == ArmorType.Plate) total = Number(armorTotal['Plate']);

				obj.stats.armor = obj.stats.armor || 0;
				obj.stats.armor += Number(~~(total * qualityMod * locationMod));
			}

			// spells
			let itemxeffects = getRows(itemxitemeffect, 'ItemID', obj.id);
			if (itemxeffects.length) {
				itemxeffects.forEach(itemxeffect => {
					let spell = getRow(itemEffect, itemxeffect['ItemEffectID']);
					if (spell) {
						let effects = getRows(spellEffect, 'SpellID', spell.SpellID);

						// On Use
						if (spell.TriggerType == '0') {
							obj.useSpell = Number(spell.SpellID);
							if (spell.CoolDownMSec && Number(spell.CoolDownMSec) > 0) obj.cooldown = Number(spell.CoolDownMSec);
							if (
								spell.CategoryCoolDownMSec &&
								spell.SpellCategoryID &&
								Number(spell.SpellCategoryID) == 1141 &&
								Number(spell.CategoryCoolDownMSec) > 0
							)
								obj.category_cooldown = Number(spell.CategoryCoolDownMSec);
						}

						// On Equip
						if (spell.TriggerType == '1') effects.forEach(e => addEffect(e, obj, spellShapeshift, spellEffect));
						// On Proc
						if (spell.TriggerType == '2') obj.proc = { spell: Number(spell.SpellID) };

						for (let c of procData) {
							if (c.id == obj.id) {
								if (!obj.proc) continue;
								if (c.ppm) obj.proc.ppm = c.ppm;
								if (c.chance) obj.proc.chance = c.chance;
								if (c.cooldown) obj.proc.cooldown = c.cooldown;
							}
						}
					}
				});
			}

			if (obj.classId == ItemType.Armor && obj.subclassId == ArmorType.Shield) {
				let shieldblock = getRows(shieldBlockValue, 'Level', obj.ilvl)[0];
				let blockvalue = shieldblock[obj.quality == ItemQuality.Epic ? 'Epic' : obj.quality == ItemQuality.Rare ? 'Superior' : 'Good'];
				obj.stats.block_amount = (obj.stats.block_amount || 0) + Number(blockvalue);
			}

			// if (Number(sparse.RandomSelect)) {
			// 	let tiger = getSuffixObject(obj, sparse, 'tiger', 'of the Tiger');
			// 	let bear = getSuffixObject(obj, sparse, 'bear', 'of the Bear');
			// 	let strength = getSuffixObject(obj, sparse, 'strength', 'of Strength');
			// 	let striking = getSuffixObject(obj, sparse, 'striking', 'of Striking');

			// 	if (tiger) addToGear(tiger, allTheGear);
			// 	if (bear) addToGear(bear, allTheGear);
			// 	if (strength) addToGear(strength, allTheGear);
			// 	if (striking) addToGear(striking, allTheGear);

			// 	if (tiger || bear || strength || striking) continue;
			// }

			// custom stuff
			if (obj.id == 20130) obj.useSpell = 24427;
			if (obj.id == 867) obj.stats.melee_ap = 20;
			if (obj.id == 12548) obj.requires = 51;
			if (forceExclude(obj)) continue;
			if (!forceInclude(obj) && !obj.proc && !obj.useSpell && Object.keys(obj.stats).length === 0) continue;

			addToGear(obj, allTheGear);
		}

		setWorking(false);
		let str = "import type { ItemsObject } from '@core/shared/types';const templateItems = ";
		str += JSON.stringify(allTheGear, null, 2);
		str += ' as ItemsObject;export default templateItems;';
		const blob = new Blob([str], { type: 'application/json' });
		saveFile(blob);
	}

	return (
		<>
			{working && <Loading />}
			{!working && (
				<div style={{ width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
					<button
						onClick={() => {
							setWorking(true);
							setTimeout(() => {
								generateData();
							});
						}}>
						Generate Data
					</button>
				</div>
			)}
		</>
	);
}
