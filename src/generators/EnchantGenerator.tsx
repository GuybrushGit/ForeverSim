import { useEffect, useState } from 'react';
import type { Enchant } from '@core/shared/types';
import {
	ArmorType,
	AuraType,
	BaseStats,
	GetInventoryType,
	InventoryType,
	ItemType,
	SchoolMask,
	SkillType,
	SpellSchool,
	WeaponType,
} from '@core/shared/enums';

function Loading() {
	return (
		<div className="loader-container">
			<span className="loader"></span>
		</div>
	);
}

async function saveFile(blob: any) {
	const a = document.createElement('a');
	a.download = 'enchants.ts';
	a.href = URL.createObjectURL(blob);
	a.addEventListener('click', () => {
		setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
	});
	a.click();
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
// #endregion

export default function SpellGenerator() {
	let allTheEnchants = {} as any,
		//items: any[],
		//itemEffect: any[],
		//itemSparse: any[],
		//spellCategories: any[],
		spellEffect: any[],
		spellMisc: any[],
		spellName: any[],
		//spellDuration: any[],
		//spellShapeshift: any[],
		//shieldBlockValue: any[],
		spellEquippedItems: any[],
		// icons: any[],
		// spellPower: any[],
		// spellCooldowns: any[],
		// spellCastTimes: any[],
		spellClassOptions: any[],
		//spellAuraOptions: any[],
		spellItemEnchantment: any[];
	//spellLevels: any[];
	const [working, setWorking] = useState(false);

	useEffect(() => {
		let promises = [];
		promises.push(loadTable('item'));
		promises.push(loadTable('itemeffect'));
		promises.push(loadTable('itemsparse'));
		promises.push(loadTable('spellcategories'));
		promises.push(loadTable('spelleffect'));
		promises.push(loadTable('spellmisc'));
		promises.push(loadTable('spellname'));
		promises.push(loadTable('spellduration'));
		promises.push(loadTable('spellshapeshift'));
		promises.push(loadTable('shieldblockvalue'));
		promises.push(loadTable('spellequippeditems'));
		promises.push(loadTable('icons'));
		promises.push(loadTable('spellpower'));
		promises.push(loadTable('spellclassoptions'));
		promises.push(loadTable('spellcasttimes'));
		promises.push(loadTable('spellcooldowns'));
		promises.push(loadTable('spellauraoptions'));
		promises.push(loadTable('spelllevels'));
		promises.push(loadTable('spellitemenchantment'));

		Promise.all(promises).then(values => {
			//items = values[0];
			// itemEffect = values[1];
			// itemSparse = values[2];
			// spellCategories = values[3];
			spellEffect = values[4];
			spellMisc = values[5];
			spellName = values[6];
			// spellDuration = values[7];
			//spellShapeshift = values[8];
			//shieldBlockValue = values[9];
			spellEquippedItems = values[10];
			// icons = values[11];
			// spellPower = values[12];
			spellClassOptions = values[13];
			// spellCastTimes = values[14];
			// spellCooldowns = values[15];
			// spellAuraOptions = values[16];
			// spellLevels = values[17];
			spellItemEnchantment = values[18];
		});
	}, []);

	function generateData() {
		for (let effect of spellEffect) {
			if (Number(effect.Effect) == 53 || Number(effect.Effect) == 54 || Number(effect.Effect) == 92) {
				let enchant = getRow(spellItemEnchantment, effect['EffectMiscValue[0]']);
				let effectType = Number(enchant['Effect[0]']);

				//if (Number(effect['EffectMiscValue[0]']) == 564) debugger;

				//if (effectType == 1 || effectType == 2 || effectType == 3 || effectType == 5) {
				let spell = getRows(spellMisc, 'SpellID', effect.SpellID);
				let name = getRow(spellName, spell[0].SpellID);
				if (name.Name_lang.substr(0, 2) == 'QA') continue;
				if (name.Name_lang.substr(0, 4) == 'Copy') continue;
				if (name.Name_lang.substr(0, 4) == 'Test') continue;

				let equippedItems = getRows(spellEquippedItems, 'SpellID', effect.SpellID);

				let classOptions = getRows(spellClassOptions, 'SpellID', effect.SpellID);
				if (
					classOptions.length &&
					Number(classOptions[0].SpellClassSet) != 4 && // warrior
					Number(classOptions[0].SpellClassSet) != 0 &&
					(Number(classOptions[0].SpellClassSet) != 11 || Number(effect.Effect) != 92) // shaman
				)
					continue;

				let subclassId = 0,
					classId = 0,
					invType = 0;
				let obj = { id: Number(effect.SpellID), name: name.Name_lang } as Enchant;
				if (equippedItems.length) {
					if (Number(equippedItems[0].EquippedItemClass)) classId = Number(equippedItems[0].EquippedItemClass);
					if (Number(equippedItems[0].EquippedItemSubclass)) subclassId = Number(equippedItems[0].EquippedItemSubclass);
					if (Number(equippedItems[0].EquippedItemInvTypes)) invType = Number(equippedItems[0].EquippedItemInvTypes);
				}

				if (Number(effect['EffectMiscValue[0]'])) obj.enchant = Number(effect['EffectMiscValue[0]']);

				if (effectType == 2) obj.weapondmg = Number(enchant['EffectPointsMin[0]']);

				if (effectType == 1) {
					obj.procSpell = Number(enchant['EffectArg[0]']);
					if (Number(enchant['EffectPointsMin[0]'])) obj.procChance = Number(enchant['EffectPointsMin[0]']);
					if (!obj.procChance) obj.procPPM = 1;
					if (obj.id == 20032 || obj.id == 13898) obj.procPPM = 6;
					if (obj.name == 'Windfury Totem Effect') obj.procCooldown = 200;
				}

				if (effectType == 3 && Number(enchant['EffectArg[0]'])) {
					let spellid = enchant['EffectArg[0]'];
					obj.stats = {};

					let statEffects = getRows(spellEffect, 'SpellID', spellid);
					for (let stEff of statEffects) {
						switch (Number(stEff.EffectAura)) {
							case AuraType.ModStat:
								if (Number(stEff['EffectMiscValue[0]']) == BaseStats.STAT_STRENGTH) obj.stats.str = Number(stEff.EffectBasePointsF);
								if (Number(stEff['EffectMiscValue[0]']) == BaseStats.STAT_AGILITY) obj.stats.agi = Number(stEff.EffectBasePointsF);
								if (Number(stEff['EffectMiscValue[0]']) == BaseStats.STAT_STAMINA) obj.stats.sta = Number(stEff.EffectBasePointsF);
								if (Number(stEff['EffectMiscValue[0]']) == BaseStats.STAT_INTELLECT) obj.stats.int = Number(stEff.EffectBasePointsF);
								if (Number(stEff['EffectMiscValue[0]']) == BaseStats.STAT_SPIRIT) obj.stats.spi = Number(stEff.EffectBasePointsF);
								if (Number(stEff['EffectMiscValue[0]']) == -1) {
									obj.stats.str = Number(stEff.EffectBasePointsF);
									obj.stats.agi = Number(stEff.EffectBasePointsF);
									obj.stats.sta = Number(stEff.EffectBasePointsF);
									obj.stats.int = Number(stEff.EffectBasePointsF);
									obj.stats.spi = Number(stEff.EffectBasePointsF);
								}
								break;
							case AuraType.ModResistance:
								let misc = Number(stEff['EffectMiscValue[0]']);
								if (misc > 0) obj.stats.resistance = Array(8).fill(0);
								if (misc & SchoolMask.Physical) obj.stats.resistance[SpellSchool.Physical] = Number(stEff.EffectBasePointsF);
								if (misc & SchoolMask.Holy) obj.stats.resistance[SpellSchool.Holy] = Number(stEff.EffectBasePointsF);
								if (misc & SchoolMask.Fire) obj.stats.resistance[SpellSchool.Fire] = Number(stEff.EffectBasePointsF);
								if (misc & SchoolMask.Nature) obj.stats.resistance[SpellSchool.Nature] = Number(stEff.EffectBasePointsF);
								if (misc & SchoolMask.Frost) obj.stats.resistance[SpellSchool.Frost] = Number(stEff.EffectBasePointsF);
								if (misc & SchoolMask.Shadow) obj.stats.resistance[SpellSchool.Shadow] = Number(stEff.EffectBasePointsF);
								if (misc & SchoolMask.Arcane) obj.stats.resistance[SpellSchool.Arcane] = Number(stEff.EffectBasePointsF);
								break;
							case AuraType.ModAttackPower:
								obj.stats.melee_ap = Number(stEff.EffectBasePointsF);
								obj.stats.ranged_ap = Number(stEff.EffectBasePointsF);
								break;
							case AuraType.ModMeleeHaste:
								obj.stats.haste = Array(4).fill(1);
								obj.stats.haste[SpellSchool.Physical] += Number(stEff.EffectBasePointsF);
								break;
							case AuraType.ModWeaponCritPercent:
								if (!obj.stats.crit) obj.stats.crit = Array(8).fill(0);
								obj.stats.crit[SpellSchool.Physical] += Number(stEff.EffectBasePointsF);
								break;
							case AuraType.ModHitChance:
								if (!obj.stats.hit) obj.stats.hit = Array(8).fill(0);
								obj.stats.hit[SpellSchool.Physical] += Number(stEff.EffectBasePointsF);
								break;
							case AuraType.ModThreat:
								obj.stats.threat_mod = Number(stEff.EffectBasePointsF);
								break;
							case AuraType.Block:
								obj.stats.block_amount = Number(stEff.EffectBasePointsF);
								break;
							case AuraType.ModSkill:
								if (Number(stEff['EffectMiscValue[0]']) == SkillType.SKILL_DEFENSE) obj.stats.defense = Number(stEff.EffectBasePointsF);
								break;
							case AuraType.ModIncreaseHealth:
								obj.stats.health = Number(stEff.EffectBasePointsF);
								break;
							case AuraType.ModBlockPercent:
								obj.stats.block_chance = Number(stEff.EffectBasePointsF);
								break;
							case AuraType.ModDodgePercent:
								obj.stats.dodge = Number(stEff.EffectBasePointsF);
								break;
							case AuraType.ModDamageDoneCreature:
								obj.weapondmg = Number(stEff.EffectBasePointsF);
								break;
							case AuraType.ModMeleeAttackPowerVersus:
								obj.stats.melee_ap = Number(stEff.EffectBasePointsF);
								obj.stats.ranged_ap = Number(stEff.EffectBasePointsF);
								break;
							case AuraType.ProcTriggerDamage:
								// only shield spikes?
								obj.procBlock = Number(spellid);
								obj.procChance = 100;
								break;
							case 13:
							case 31:
							case 35:
							case 42:
							case 55:
							case 57:
							case 77:
							case 85:
							case 137:
							case 131:
							case 124:
							case 130:
							case 180:
							case 154:
							case 135:
							case 140:
								// do nothing
								break;
							default:
								console.log(spellid + ' - ' + obj.name + ' - ' + stEff.EffectAura);
						}
					}

					if (Object.keys(obj.stats).length == 0 && !obj.procBlock) continue;
				}

				if (effectType == 5) {
					obj.stats = {};
					switch (Number(enchant['EffectArg[0]'])) {
						case BaseStats.STAT_STRENGTH:
							obj.stats.str = Number(enchant['EffectPointsMin[0]']);
							break;
						case BaseStats.STAT_AGILITY:
							obj.stats.agi = Number(enchant['EffectPointsMin[0]']);
							break;
						case BaseStats.STAT_STAMINA:
							obj.stats.sta = Number(enchant['EffectPointsMin[0]']);
							break;
						case BaseStats.STAT_INTELLECT:
							obj.stats.int = Number(enchant['EffectPointsMin[0]']);
							break;
						case BaseStats.STAT_SPIRIT:
							obj.stats.spi = Number(enchant['EffectPointsMin[0]']);
							break;
					}
				}

				let mainhandonly = false;
				if (Number(effect.Effect) == 92) {
					classId = 2;
					subclassId = 3;
					mainhandonly = true;
				}
				if (classOptions.length && Number(classOptions[0].SpellClassSet) == 11) mainhandonly = true;

				let temp = Number(effect.Effect) != 53;
				if (classId == ItemType.Weapon && subclassId & (1 << WeaponType.Axe1H)) {
					if (temp) {
						addEnchant(obj, 'mainhand_temp');
						if (!mainhandonly) addEnchant(obj, 'offhand_temp');
					} else {
						addEnchant(obj, 'mainhand_');
						if (!mainhandonly) addEnchant(obj, 'offhand_');
					}
				}
				if (classId == ItemType.Weapon && subclassId & (1 << WeaponType.Axe2H)) {
					if (temp) addEnchant(obj, 'twohand_temp');
					else addEnchant(obj, 'twohand_');
				}
				if (classId == ItemType.Armor && subclassId & (1 << ArmorType.Shield)) {
					addEnchant(obj, 'offhand_');
				}
				if (classId == ItemType.Armor) {
					for (let i = 0; i < 29; i++) {
						if (Number(i) == 20) {
							continue;
						}
						if (invType & (1 << Number(i))) addEnchant(obj, GetInventoryType(i).toLocaleLowerCase() + '_');
					}
					for (let i in InventoryType) {
						if (isNaN(Number(i))) continue;
						if (Number(i) == 20) continue;
					}
				}
			}
		}

		setWorking(false);
		let jsonstring = JSON.stringify(allTheEnchants, null, 2);
		let str = 'const templateEnchants = ';
		str += jsonstring;
		str += ' as any;export default templateEnchants;';
		const blob = new Blob([str], { type: 'application/json' });
		saveFile(blob);
	}

	function addEnchant(enchant: any, slot: string) {
		slot += 'enchant';
		if (!allTheEnchants[slot]) allTheEnchants[slot] = [];
		allTheEnchants[slot].push(enchant);
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
