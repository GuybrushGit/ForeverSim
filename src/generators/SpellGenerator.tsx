import { useEffect, useState } from 'react';
import type { BuffsObject, Enchant, Item } from '@core/shared/types';
import templateEnchants from '@modules/enchants';
import templateItems from '@modules/items';
import templateSets from '@modules/itemsets';

import templateTalents from '@modules/warrior/talents';
import templateBuffs from '@modules/warrior/buffs';
import templateAbilities from '@modules/warrior/abilities';

import { AuraType, ClassFlag, CombatResult, EffectType, GetAuraType, GetEffectType, ProcFlags, SpellAttributes } from '@core/shared/enums';

function Loading() {
	return (
		<div className="loader-container">
			<span className="loader"></span>
		</div>
	);
}

async function saveFile(blob: any) {
	const a = document.createElement('a');
	a.download = 'spells.ts';
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
	let //allTheEnchants = {} as any,
		// items: any[],
		// itemEffect: any[],
		// itemSparse: any[],
		// spellCategories: any[],
		spellEffect: any[],
		spellMisc: any[],
		spellName: any[],
		spellDuration: any[],
		spellShapeshift: any[],
		//shieldBlockValue: any[],
		spellEquippedItems: any[],
		icons: any[],
		spellPower: any[],
		spellCooldowns: any[],
		spellCastTimes: any[],
		spellClassOptions: any[],
		spellAuraOptions: any[],
		//spellItemEnchantment: any[],
		spellLevels: any[];
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
			// items = values[0];
			// itemEffect = values[1];
			// itemSparse = values[2];
			// spellCategories = values[3];
			spellEffect = values[4];
			spellMisc = values[5];
			spellName = values[6];
			spellDuration = values[7];
			spellShapeshift = values[8];
			//shieldBlockValue = values[9];
			spellEquippedItems = values[10];
			icons = values[11];
			spellPower = values[12];
			spellClassOptions = values[13];
			spellCastTimes = values[14];
			spellCooldowns = values[15];
			spellAuraOptions = values[16];
			spellLevels = values[17];
			//spellItemEnchantment = values[18];
		});
	}, []);

	function createSpell(id: number) {
		let name = getRow(spellName, id.toString());
		if (!name) return;
		let spell = { id: id, name: name.Name_lang } as any;

		// misc
		let misc = getRows(spellMisc, 'SpellID', id.toString());

		//if (id == 12165 || id == 12700 || id == 12856) debugger;
		let equippedItems = getRows(spellEquippedItems, 'SpellID', id.toString());
		if (equippedItems.length && Number(equippedItems[0].EquippedItemClass)) spell.itemClass = Number(equippedItems[0].EquippedItemClass);
		if (equippedItems.length && Number(equippedItems[0].EquippedItemSubclass)) spell.itemSubclassMask = Number(equippedItems[0].EquippedItemSubclass);

		// cost
		let power = getRows(spellPower, 'SpellID', id.toString());
		if (power.length && Number(power[0].ManaCost)) spell.cost = Number(power[0].ManaCost);

		// school mask
		if (misc.length && Number(misc[0].SchoolMask) > 0) spell.schoolMask = Number(misc[0].SchoolMask);

		// attributes
		if (misc.length && Number(misc[0]['Attributes[0]']) > 0) spell.attributes = Number(misc[0]['Attributes[0]']);
		if (misc.length && Number(misc[0]['Attributes[1]']) > 0) spell.attributesEx = Number(misc[0]['Attributes[1]']);
		if (misc.length && Number(misc[0]['Attributes[2]']) > 0) spell.attributesEx2 = Number(misc[0]['Attributes[2]']);
		if (misc.length && Number(misc[0]['Attributes[3]']) > 0) spell.attributesEx3 = Number(misc[0]['Attributes[3]']);

		// spell mask
		let classOptions = getRows(spellClassOptions, 'SpellID', id.toString());
		if (classOptions.length && Number(classOptions[0]['SpellClassMask[0]'])) spell.classMask = Number(classOptions[0]['SpellClassMask[0]']);
		if (classOptions.length && Number(classOptions[0].SpellClassSet)) spell.classSet = Number(classOptions[0].SpellClassSet);

		// duration
		let duration = misc.length ? getRows(spellDuration, 'ID', misc[0].DurationIndex.toString()) : [];
		if (duration.length && Number(duration[0].Duration) > 0) spell.duration = Number(duration[0].Duration);

		// cast time
		let casttime = misc.length ? getRows(spellCastTimes, 'ID', misc[0].CastingTimeIndex.toString()) : [];
		if (casttime.length && Number(casttime[0].Base) > 0) spell.casttime = Number(casttime[0].Base);

		// cooldown
		let cooldown = getRows(spellCooldowns, 'SpellID', id.toString());
		if (cooldown.length && Number(cooldown[0].CategoryRecoveryTime) > 0) spell.cooldown = Number(cooldown[0].CategoryRecoveryTime);
		if (cooldown.length && Number(cooldown[0].RecoveryTime) > 0) spell.cooldown = Number(cooldown[0].RecoveryTime);
		if (cooldown.length && Number(cooldown[0].StartRecoveryTime) > 0) spell.gcd = true;

		// proc chance
		let procChance = getRows(spellAuraOptions, 'SpellID', id.toString());
		if (procChance.length && Number(procChance[0].ProcChance) > 0) spell.procChance = Number(procChance[0].ProcChance);
		if (procChance.length && Number(procChance[0].ProcCategoryRecovery) > 0) spell.procCooldown = Number(procChance[0].ProcCategoryRecovery);
		if (procChance.length && Number(procChance[0].ProcCharges) > 0) spell.procCharges = Number(procChance[0].ProcCharges);
		if (procChance.length && Number(procChance[0]['ProcTypeMask[0]']) > 0) spell.procMask = Number(procChance[0]['ProcTypeMask[0]']);
		if (procChance.length && Number(procChance[0].CumulativeAura) > 0) spell.maxStacks = Number(procChance[0].CumulativeAura);

		// icon
		let icon = getRows(icons, 'ID', misc[0].SpellIconFileDataID.toString());
		if (icon.length && icon[0].path) spell.path = icon[0].path;

		// custom icons
		if (spell.id == 23690 || spell.id == 23691) spell.path = 'spell_nature_ancestralguardian';
		if (spell.path == 'temp') console.log('spell with temp path found: ', spell);

		// stance
		let form = getRows(spellShapeshift, 'SpellID', id.toString());
		if (form.length && Number(form[0]['ShapeshiftMask[0]'])) spell.formMask = Number(form[0]['ShapeshiftMask[0]']);

		// level
		let level = getRows(spellLevels, 'SpellID', id.toString());
		if (level.length && Number(level[0].BaseLevel)) spell.baseLevel = Number(level[0].BaseLevel);
		if (level.length && Number(level[0].MaxLevel)) spell.maxLevel = Number(level[0].MaxLevel);

		let rows = getRows(spellEffect, 'SpellID', id.toString());
		rows.forEach(e => {
			let obj = { effectType: Number(e.Effect) } as any;
			if (Number(e.EffectAura)) obj.auraType = Number(e.EffectAura);
			if (Number(e.EffectAuraPeriod)) obj.auraPeriod = Number(e.EffectAuraPeriod);
			if (Number(e.EffectBasePointsF)) obj.basePointsF = Number(e.EffectBasePointsF);
			if (Number(e.Variance)) obj.variance = Number(e.Variance);
			if (Number(e.EffectTriggerSpell)) obj.triggerSpell = Number(e.EffectTriggerSpell);
			if (Number(e.EffectRealPointsPerLevel)) obj.pointsPerLevel = Number(e.EffectRealPointsPerLevel);
			if (Number(e.EffectChainTargets)) obj.targetCount = Number(e.EffectChainTargets);
			if (Number(e.EffectChainAmplitude)) obj.amplitude = Number(e.EffectChainAmplitude);
			if (Number(e['EffectMiscValue[0]'])) obj.miscValue = Number(e['EffectMiscValue[0]']);
			if (Number(e['EffectSpellClassMask[0]'])) obj.classMask = Number(e['EffectSpellClassMask[0]']);
			if (Number(e['ImplicitTarget[0]'])) obj.target = Number(e['ImplicitTarget[0]']);

			// Berserking
			// if (id == 20554) {
			// 	obj.effectType = EffectType.ApplyAura;
			// 	obj.auraType = AuraType.ModMeleeHaste;
			// 	obj.basePointsF = 9;
			// }

			// Expose Armor
			if (spell.classMask == 524288 && spell.classSet == 8) {
				obj.basePointsF = -2250;
			}

			// Sunder Armor
			if (spell.classMask == 16384) {
				obj.basePointsF = -2250;
			}

			// Deep Wounds
			if (spell.name == 'Deep Wounds' && spell.attributes == 262544) {
				obj.effectType = EffectType.ApplyAura;
				obj.auraType = AuraType.DummyAura;
				obj.auraPeriod = 3000;
				spell.duration = 12000;
				if (spell.id == 12162) obj.basePointsF = 0.2;
				if (spell.id == 12850) obj.basePointsF = 0.4;
				if (spell.id == 12868) obj.basePointsF = 0.6;
			}

			if (obj.auraType) if (!GetEffectType(obj.effectType)) return;
			if (obj.Effect == EffectType.ApplyAura && !GetAuraType(obj.auraType)) {
				console.log(`${name} aura not implemented: `, obj);
				return;
			}
			if (!spell.effects) spell.effects = [];
			spell.effects.push(obj);
		});

		/***  custom stuff  ***/

		// Last Stand
		if (id == 12976) {
			spell.cooldown = 600000;
			spell.effects[0].basePointsF = 30;
			spell.effects[0].auraType = AuraType.ModIncreaseHealthPercent;
		}
		// Blood Fury
		// if (id == 20572) {
		// 	spell.cooldown = 120000;
		// }
		// Flurry
		if (spell.name == 'Flurry' && spell.attributes == 262336) {
			spell.procMask = ProcFlags.PROC_FLAG_SUCCESSFUL_MELEE_HIT | ProcFlags.PROC_FLAG_SUCCESSFUL_MELEE_SPELL_HIT;
			spell.procExtra = (1 << CombatResult.Crit) | (1 << CombatResult.BlockCrit);
		}

		// Enrage
		if (spell.name == 'Enrage' && spell.attributes == 262352) {
			spell.procExtra = (1 << CombatResult.Crit) | (1 << CombatResult.BlockCrit) | (1 << CombatResult.ResistCrit);
		}

		// Deep Wounds
		if (spell.name == 'Deep Wounds' && spell.attributes == 464) {
			spell.procExtra = (1 << CombatResult.Crit) | (1 << CombatResult.BlockCrit);
		}

		// Rage Pot
		if (id == 17528) {
			spell.cooldown = 120000;
		}

		// Shield Specialization
		if (id == 12727) {
			spell.procExtra = (1 << CombatResult.Block) | (1 << CombatResult.BlockCrit);
		}

		// Shield Block
		if (id == 2565) {
			spell.procExtra = (1 << CombatResult.Block) | (1 << CombatResult.BlockCrit);
		}

		// Shield Slam
		if (spell.name == 'Shield Slam') {
			spell.classMask = 1 << ClassFlag.CF_WARRIOR_SHIELD_SLAM;
		}

		// Swarmguard
		if (spell.id == 26481) {
			spell.duration = 30000;
		}

		// warrior talents
		if (spell.id == 12320) spell.effects[0].basePointsF = 1;
		if (spell.id == 1290261) spell.effects = spell.effects.slice(0, -2);
		if (spell.id == 12284) spell.effects[0].basePointsF = 3;
		if (spell.id == 12281) spell.procChance = 1;
		if (spell.id == 12862) {
			spell.effects[0].basePointsF = -250;
			spell.effects[1].basePointsF = -250;
			spell.effects[2].basePointsF = -1500;
		}
		if (spell.id == 12322) spell.procChance = 12;
		if (spell.id == 1310316) spell.procChance = 50;
		if (spell.id == 1310316) spell.procExtra = (1 << CombatResult.Dodge) | (1 << CombatResult.Parry);

		if (spell.id == 1310236) spell.effects[0].basePointsF = 100;
		if (spell.id == 12329) spell.effects[0].basePointsF = -10;
		if (spell.id == 12880) spell.effects[0].basePointsF = 2;
		if (spell.id == 1225295) spell.effects[0].basePointsF = 1;
		if (spell.id == 23690) spell.effects[0].basePointsF = 50;
		if (spell.id == 12297) spell.effects[0].basePointsF = 4;
		if (spell.id == 12298) spell.effects[0].basePointsF = 1;
		if (spell.id == 12298) spell.effects[1].basePointsF = 20;
		if (spell.id == 12966) spell.effects[0].basePointsF = 5;
		if (spell.id == 12299) spell.effects[0].basePointsF = 2;
		if (spell.id == 12287) spell.effects[0].basePointsF = -20;
		if (spell.id == 12797) spell.effects[0].basePointsF = 20;
		if (spell.id == 12797) spell.effects[0].miscValue = 8;
		if (spell.id == 1259813) spell.effects[1].miscValue = 8;
		if (spell.id == 12792) spell.effects[0].basePointsF = 5;
		if (spell.id == 12308) spell.effects[0].basePointsF = -10;
		if (spell.id == 29787) spell.effects[0].basePointsF = -10;
		if (spell.id == 16538) spell.effects[0].basePointsF = 2;
		if (spell.id == 1289682) spell.effects[0].basePointsF = 4;

		if (spell.id == 23584) spell.effects[1].basePointsF = 20;
		if (spell.id == 23584) spell.effects[2].basePointsF = 2;

		if (spell.name == 'Shield Slam') spell.classMask = 64;
		if (spell.name == 'Whirlwind') spell.classMask = 64;
		if (spell.id == 1310222) spell.classMask = 64;

		if (spell.name == 'Bloodthirst') spell.effects = spell.effects.slice(0, -1);
		if (spell.id == 1289682) spell.procMask = 1073741828;
		if (spell.id == 1289682) spell.procChance = 4;

		if (spell.effects && spell.effects.length) return spell;
	}

	async function generateData() {
		let spells = {} as any;

		// talents
		templateTalents.forEach(tree => {
			tree.t.forEach(talent => {
				talent.s.forEach(id => {
					let spell = createSpell(id);
					if (spell) spells[id] = spell;
				});
			});
		});

		// buffs
		for (let type in templateBuffs) {
			templateBuffs[type as keyof BuffsObject].forEach(buff => {
				let spell = createSpell(buff.id);
				if (spell) spells[spell.id] = spell;
			});
		}

		// enchants
		for (let slot in templateEnchants) {
			templateEnchants[slot].forEach((enchant: Enchant) => {
				if (enchant.procSpell) {
					let spell = createSpell(enchant.procSpell);
					if (spell) spells[spell.id] = spell;
				}
				if (enchant.procBlock) {
					let spell = createSpell(enchant.procBlock);
					if (spell) spells[spell.id] = spell;
				}
			});
		}

		// items
		for (let slot in templateItems) {
			templateItems[slot as keyof typeof templateItems].forEach((item: Item) => {
				if (item.useSpell) {
					let spell = createSpell(item.useSpell);
					if (spell) spells[spell.id] = spell;
				}
				if (item.proc && item.proc.spell) {
					let spell = createSpell(item.proc.spell);
					if (spell) spells[spell.id] = spell;
				}
			});
		}

		// sets
		for (let set of templateSets) {
			for (let s of set.sets) {
				let spell = createSpell(s.spell);
				if (spell) spells[spell.id] = spell;
			}
		}

		// racials
		let racials = [20597, 20598, 20574, 20575, 1259721, 1259719, 1259799, 20582, 20550, 20557, 20554, 1260189, 1259813, 20591, 1259710, 1259707];

		for (let racial of racials) {
			let spell = createSpell(racial);
			if (spell) spells[racial] = spell;
		}

		// warrior abilities
		for (let action of templateAbilities) {
			if (action.id < 5) continue;
			let spell = createSpell(action.id);
			if (spell) spells[action.id] = spell;
		}

		// stances
		spells[7376] = createSpell(7376);
		spells[21156] = createSpell(21156);
		spells[7381] = createSpell(7381);

		// extra
		spells[29288] = createSpell(29288);
		spells[29284] = createSpell(29284);
		spells[12281] = createSpell(12281);
		spells[12284] = createSpell(12284);
		spells[12700] = createSpell(12700);
		spells[12880] = createSpell(12880);
		spells[23690] = createSpell(23690);
		spells[12966] = createSpell(12966);
		spells[1289681] = createSpell(1289681);
		spells[1260198] = createSpell(1260198);

		// proc spells
		for (let i in spells) {
			for (let effect of spells[i].effects) {
				if (effect.triggerSpell) {
					let spell = createSpell(effect.triggerSpell);
					if (spell) spells[effect.triggerSpell] = spell;
				}
			}
		}

		// overrides
		for (let i in spells) {
			for (let effect of spells[i].effects) {
				if (effect.auraType == AuraType.OverrideActionbarSpell && effect.basePointsF) {
					let spell = createSpell(effect.basePointsF);
					if (spell) spells[effect.basePointsF] = spell;
				}
			}
		}

		setWorking(false);
		let jsonstring = JSON.stringify(spells, null, 2);
		jsonstring = jsonstring.replaceAll('": {', '": new Spell({');
		jsonstring = jsonstring.replaceAll('    {', '    new Effect({');
		jsonstring = jsonstring.replaceAll('  }', '  })');

		//console.log(jsonstring);
		let str = 'import { Effect } from "@core/game/effect";import { Spell } from "@core/game/spell";const templateSpells = ';
		str += jsonstring;
		str += ' as any;export default templateSpells;';
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
