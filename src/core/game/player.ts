import { type AbilityObject, type Item, type SettingsObject, type SpellModifier, type Stats, type TalentsTree } from '../shared/types';
import { Action, BaseStanceAction, ExecuteAction, HoldAction, NextSwingAction, OverpowerAction, RevengeAction } from '@core/game/action';
import { getMaxSpellLevel, getSetting, getTalentByName, round } from '../shared/utils';
import { getAgiPerCrit, getAPPerStrength, getIntPerCrit, getRageConversion, getRAPPerAgi } from '../shared/formulas';
import levelstats from '../shared/levelstats';
import {
	AuraType,
	ClassFlag,
	ClassMask,
	ConditionType,
	EffectType,
	InventoryType,
	Powers,
	Race,
	ShapeshiftForm,
	SpellAttributes,
	SpellIds,
	SpellModOp,
	SpellSchool,
	Targets,
} from '@core/shared/enums';
import { Weapon } from './weapon';
import { Spell } from './spell';
import { Aura, ProcSpell } from './aura';
import templateSpells from '@modules/spells';
import templateSets from '@modules/itemsets';

export class PlayerStats {
	health: number = 0;
	health_mod: number = 1;
	agi: number = 0;
	str: number = 0;
	sta: number = 0;
	int: number = 0;
	spi: number = 0;
	melee_ap_mod: number = 1;
	ranged_ap_mod: number = 1;
	melee_ap: number = 0;
	ranged_ap: number = 0;
	expertise: number = 0;
	threat_mod: number = 1;
	weapon_skill: number[] = Array(21).fill(0);

	// None: 0,
	// Physical: 1,
	// Holy: 2,
	// Fire: 4,
	// Nature: 8,
	// Frost: 16,
	// Shadow: 32,
	// Arcane: 64,
	hit: number[] = Array(8).fill(0);
	crit: number[] = Array(8).fill(0);
	dmg_done: number[] = Array(8).fill(0);
	dmg_taken: number[] = Array(8).fill(0);
	dmg_done_mod: number[] = Array(8).fill(1);
	dmg_taken_mod: number[] = Array(8).fill(1);
	resistance: number[] = Array(8).fill(0);
	resistance_no_stack: number[] = Array(8).fill(0);

	hit_rate: number = 0;
	crit_rate: number = 0;
	dodge_rate: number = 0;
	parry_rate: number = 0;
	block_rate: number = 0;

	// None: 0,
	// Magic: 1,
	// Melee: 2,
	// Ranged: 3,
	haste: number[] = Array(4).fill(1);

	// STAT_STRENGTH: 0,
	// STAT_AGILITY: 1,
	// STAT_STAMINA: 2,
	// STAT_INTELLECT: 3,
	// STAT_SPIRIT: 4,
	stat_mod: number[] = Array(5).fill(1);

	// defensive
	parry: number = 0;
	dodge: number = 0;
	block_amount: number = 0;
	block_chance: number = 0;
	block_damage: number = 0;
	defense: number = 0;

	constructor(level: number) {
		this.defense = level * 5;
		this.weapon_skill = Array(21).fill(level * 5);
	}
}

export class Player {
	settings: SettingsObject;
	talents: TalentsTree[];
	enchants: any;
	buffs: any;
	custom: any;
	abilities: AbilityObject[];

	// general stats
	class: number;
	level: number;
	race: number;
	mainhand?: Weapon;
	offhand?: Weapon;
	shield?: Weapon;
	base_stats: PlayerStats;

	// class specific
	crit_per_rate: number;
	block_per_rate: number;
	dodge_per_rate: number;
	parry_per_rate: number;
	hit_per_rate: number;
	spell_hit_per_rate: number;

	rage_conversion: number;
	agi_per_crit: number;
	int_per_crit: number;
	ap_per_str: number;
	rap_per_agi: number;
	forms: any;
	base_form: number;

	// power
	power_type: number = 0;
	power_max: number = 0;
	power_regen: number = 0;
	power_regen_period: number = 0;
	power_form_change: number = 0;

	// other
	items: Item[];
	passive_auras: Spell[];
	spell_mods: SpellModifier[];
	actions: Action[];
	procs: ProcSpell[];
	traits: any;

	constructor(data: any, test_slot?: string, test_item?: any) {
		this.settings = data.settings;
		this.talents = data.talents;
		this.enchants = data.enchants;
		this.abilities = data.abilities;
		this.buffs = data.buffs;

		this.class = data.classid;
		this.level = Number(getSetting(this.settings, 'playerLevel').value);
		this.race = Number(getSetting(this.settings, 'race').value);
		this.base_form = Number(getSetting(this.settings, 'defaultform')?.value || 0);
		this.base_stats = new PlayerStats(this.level);
		this.agi_per_crit = getAgiPerCrit(this.class, this.level);
		this.int_per_crit = getIntPerCrit(this.class, this.level);
		this.ap_per_str = getAPPerStrength(this.class);
		this.rap_per_agi = getRAPPerAgi(this.class);
		this.rage_conversion = getRageConversion(this.level);

		this.crit_per_rate = 14 * ((this.level - 8) / 52);
		this.block_per_rate = 5 * ((this.level - 8) / 52);
		this.dodge_per_rate = 12 * ((this.level - 8) / 52);
		this.parry_per_rate = 15 * ((this.level - 8) / 52);
		this.hit_per_rate = 10 * ((this.level - 8) / 52);
		this.spell_hit_per_rate = 8 * ((this.level - 8) / 52);

		this.actions = [];
		this.procs = [];
		this.passive_auras = [];
		this.spell_mods = [];
		this.forms = {};
		this.traits = {};
		this.items = this.getItems(data.items, test_slot, test_item);

		// inits
		this.addForms();
		this.addPower();
		this.addWeapons(data.items, test_slot, test_item);
		this.addRaceStats();
		this.addTalents();
		this.addItems();
		this.addEnchants(test_slot, test_item);
		this.addSets();
		this.addBuffs();
		if (data.custom) this.addStats(data.custom);

		this.buildSpellMods();
		this.addActions(data.actions);
		this.applyPassiveAuras();
	}

	// #region init player
	addForms() {
		if (this.class == ClassMask.Warrior) {
			this.forms[ShapeshiftForm.FORM_BATTLESTANCE] = new Aura(0, templateSpells[21156]);
			this.forms[ShapeshiftForm.FORM_DEFENSIVESTANCE] = new Aura(0, templateSpells[7376]);
			this.forms[ShapeshiftForm.FORM_BERSERKERSTANCE] = new Aura(0, templateSpells[7381]);
		}
	}
	addPower() {
		if (this.class == ClassMask.Warrior) {
			this.power_type = Powers.POWER_RAGE;
			this.power_max = 1000;
			this.power_regen_period = 3000;
		} else {
			this.power_max = 9999999; // todo
			this.power_regen_period = 3000;
			this.power_type = Powers.POWER_MANA;
		}
	}
	addWeapons(items: any, test_slot?: string, test_item?: any) {
		for (let slot in items) {
			for (let item of items[slot]) {
				if (slot == test_slot && item.rand && item.id != test_item.id && item.rand != test_item.rand) continue;
				if (slot == test_slot && !item.rand && item.id != test_item.id) continue;
				if (slot !== test_slot && !item.selected) continue;

				if (slot == 'mainhand') this.mainhand = new Weapon(item, false, false, templateSpells);
				if (slot == 'twohand') this.mainhand = new Weapon(item, false, true, templateSpells);
				if (slot == 'offhand') {
					if (item.slot == InventoryType.Shield) this.shield = new Weapon(item, true, false, templateSpells);
					else this.offhand = new Weapon(item, true, false, templateSpells);
				}
			}
		}
	}
	addRaceStats() {
		let racials = Array(10);
		racials[Race.Human] = [20597, 20598];
		racials[Race.Orc] = [20574, 20575];
		racials[Race.Dwarf] = [1259721, 1259719];
		racials[Race.NightElf] = [1259799, 20582];
		racials[Race.Tauren] = [20550];
		racials[Race.Troll] = [20557, 20554];
		racials[Race.Undead] = [1260189];
		racials[Race.Gnome] = [1259813];
		racials[Race.Skyborne] = [1259710, 1259707];

		for (let id of racials[this.race]) {
			let spell = templateSpells[id];
			if (!spell) continue;
			this.passive_auras.push(spell);
		}

		for (let line of levelstats) {
			let stats = line.split(',');
			if (stats[0] == String(this.race) && stats[2] == String(this.level)) {
				this.base_stats.melee_ap += this.level * 3 - 20;
				this.base_stats.str += Number(stats[3]);
				this.base_stats.agi += Number(stats[4]);
				this.base_stats.sta += Number(stats[5]);
				this.base_stats.int += Number(stats[6]);
				this.base_stats.spi += Number(stats[7]);
			}
		}
	}
	addTalents() {
		for (let tree of this.talents) {
			for (let tal of tree.t) {
				let spell = templateSpells[tal.s[tal.c - 1]];
				if (tal.c && spell) {
					this.passive_auras.push(spell);
					if (!tal.values && tal.c > 0) {
						this.traits[tal.s[tal.c - 1]] = tal.c;
						for (let effect of spell.effects) if (effect.triggerSpell) this.traits[effect.triggerSpell] = tal.c;

						if (spell.id == SpellIds.ID_WARRIOR_WEAPONMASTER) {
							this.traits[12281] = tal.c;
							this.traits[12284] = tal.c;
							this.traits[12700] = tal.c;
						}

						if (spell.id == SpellIds.ID_WARRIOR_ENRAGE) {
							this.traits[SpellIds.ID_WARRIOR_ENRAGEPROC] = tal.c;
						}
						if (spell.id == SpellIds.ID_WARRIOR_IMPZERKRAGE) {
							this.traits[SpellIds.ID_WARRIOR_ZERKRAGEEFFECT] = tal.c;
						}
						if (spell.id == SpellIds.ID_WARRIOR_FLURRY) {
							this.traits[SpellIds.ID_WARRIOR_FLURRYPROC] = tal.c;
						}
					}
				}
			}
		}
	}
	addStats(stats: Stats | undefined, modifier: number = 1) {
		if (!stats) return;
		let base: any = this.base_stats;
		for (let key in stats) {
			let value = (stats as any)[key];
			if (key == 'armor') base.resistance[SpellSchool.Physical] += round(value * modifier) || 0;
			if (value == null || !(key in base)) continue;
			if (Array.isArray(value)) {
				for (let i = 0; i < value.length; i++) {
					base[key][i] += round(value[i] * modifier) || 0;
				}
			} else if (key == 'dodge_rate') base.dodge += round((value * modifier) / this.dodge_per_rate) || 0;
			else if (key == 'parry_rate') base.parry += round((value * modifier) / this.parry_per_rate) || 0;
			else if (key == 'block_rate') base.block += round((value * modifier) / this.block_per_rate) || 0;
			else if (key == 'crit_rate') {
				base.crit[SpellSchool.Physical] += round((value * modifier) / this.crit_per_rate) || 0;
				base.crit[SpellSchool.Arcane] += round((value * modifier) / this.crit_per_rate) || 0;
				base.crit[SpellSchool.Fire] += round((value * modifier) / this.crit_per_rate) || 0;
				base.crit[SpellSchool.Frost] += round((value * modifier) / this.crit_per_rate) || 0;
				base.crit[SpellSchool.Shadow] += round((value * modifier) / this.crit_per_rate) || 0;
				base.crit[SpellSchool.Nature] += round((value * modifier) / this.crit_per_rate) || 0;
				base.crit[SpellSchool.Holy] += round((value * modifier) / this.crit_per_rate) || 0;
			} else if (key == 'hit_rate') {
				base.hit[SpellSchool.Physical] += round((value * modifier) / this.hit_per_rate) || 0;
				base.hit[SpellSchool.Arcane] += round((value * modifier) / this.spell_hit_per_rate) || 0;
				base.hit[SpellSchool.Fire] += round((value * modifier) / this.spell_hit_per_rate) || 0;
				base.hit[SpellSchool.Frost] += round((value * modifier) / this.spell_hit_per_rate) || 0;
				base.hit[SpellSchool.Shadow] += round((value * modifier) / this.spell_hit_per_rate) || 0;
				base.hit[SpellSchool.Nature] += round((value * modifier) / this.spell_hit_per_rate) || 0;
				base.hit[SpellSchool.Holy] += round((value * modifier) / this.spell_hit_per_rate) || 0;
			} else if (key == 'armor') {
				base.resistance[SpellSchool.Physical] += round(value * modifier) || 0;
			} else {
				base[key] += round(value * modifier) || 0;
			}
		}
	}
	addItems() {
		for (let id in this.items) {
			this.addStats(this.items[id].stats);
		}
	}
	addEnchants(test_slot?: string, test_item?: any) {
		for (let slot in this.enchants) {
			for (let enchant of this.enchants[slot]) {
				if (slot == test_slot && enchant.id != test_item.id) continue;
				if (slot !== test_slot && !enchant.selected) continue;

				// add enchant
				if (enchant.stats) this.addStats(enchant.stats);
				if (enchant.procSpell) {
					let cooldown = enchant.procCooldown || 0;
					let spell = templateSpells[enchant.procSpell];
					if (slot.indexOf('offhand') > -1 && this.offhand) {
						let chance = enchant.procChance;
						if (!chance) chance = ~~((this.offhand.speed * (enchant.procPPM || 1)) / 0.6);
						this.offhand.procs.push(new ProcSpell(spell, 20, chance, cooldown, 0));
					}
					if (slot.indexOf('twohand') > -1 && this.mainhand && this.mainhand.twohand) {
						let chance = enchant.procChance;
						if (!chance) chance = ~~((this.mainhand.speed * (enchant.procPPM || 1)) / 0.6);
						this.mainhand.procs.push(new ProcSpell(spell, 20, chance, cooldown, 0));
					}
					if (slot.indexOf('mainhand') > -1 && this.mainhand && !this.mainhand.twohand) {
						let chance = enchant.procChance;
						if (!chance) chance = ~~((this.mainhand.speed * (enchant.procPPM || 1)) / 0.6);
						this.mainhand.procs.push(new ProcSpell(spell, 20, chance, cooldown, 0));
					}
				}
				if (enchant.procBlock) {
					if (slot.indexOf('offhand') > -1 && this.shield) {
						let chance = enchant.procChance;
						let spell = templateSpells[enchant.procBlock];
						this.shield.procs.push(new ProcSpell(spell, 40, chance, spell.cooldown, 0));
					}
				}
				if (enchant.weapondmg) {
					if (slot.indexOf('offhand') > -1 && this.offhand) {
						this.offhand.bonusdmg += enchant.weapondmg;
					}
					if (slot.indexOf('twohand') > -1 && this.mainhand && this.mainhand.twohand) {
						this.mainhand.bonusdmg += enchant.weapondmg;
					}
					if (slot.indexOf('mainhand') > -1 && this.mainhand && !this.mainhand.twohand) {
						this.mainhand.bonusdmg += enchant.weapondmg;
					}
				}
			}
		}
	}
	addSets() {
		for (let set of templateSets) {
			let count = this.items.filter(item => set.items.includes(item.id)).length;
			for (let s of set.sets) {
				if (s.count <= count) this.passive_auras.push(templateSpells[s.spell]);
			}
		}
	}
	addBuffs() {
		for (let type in this.buffs) {
			fields: for (let field of this.buffs[type]) {
				if (!field.selected) continue;
				if (field.minlevel && this.level < field.minlevel) continue;
				if (field.maxlevel && this.level > field.maxlevel) continue;
				if (field.requires) {
					for (let req in field.requires) {
						if (getSetting(this.settings, field.requires[req].name).value !== field.requires[req].value) continue fields;
					}
				}

				let spell = templateSpells[field.id];
				if (!spell) continue;
				this.passive_auras.push(spell);
			}
		}
	}
	addActions(actionSettings: Action[]) {
		for (let action of actionSettings) {
			actions: for (let ability of this.abilities) {
				if (ability.id != action.id) continue;
				let spell = templateSpells[ability.id];
				if (spell && spell.baseLevel && this.level < spell.baseLevel) continue;
				if (spell && !ability.requires && this.level > getMaxSpellLevel(spell.id, templateSpells, this.abilities)) continue;
				if (ability.requires) {
					for (let req in ability.requires) {
						if (getSetting(this.settings, ability.requires[req].name).value !== ability.requires[req].value) continue actions;
					}
				}
				let talent = getTalentByName(this.talents, ability.name || spell.name) as any;
				if (talent && !talent.c) continue;

				if (ability.race && ability.race != this.race) continue;

				if (!spell) spell = new Spell({});
				let newAction;
				if (spell.classMask && spell.classMask & (1 << ClassFlag.CF_WARRIOR_EXECUTE)) newAction = new ExecuteAction(action);
				else if (spell.classMask && spell.classMask & (1 << ClassFlag.CF_WARRIOR_OVERPOWER)) newAction = new OverpowerAction(action);
				else if (spell.classMask && spell.classMask & (1 << ClassFlag.CF_WARRIOR_REVENGE)) newAction = new RevengeAction(action);
				else if (spell.attributes & SpellAttributes.SPELL_ATTR_ON_NEXT_SWING) newAction = new NextSwingAction(action);
				else if (ability.id == 1) newAction = new BaseStanceAction(action);
				else if (ability.id == 2) newAction = new HoldAction(action);
				else newAction = new Action(action);
				newAction.spell = spell;
				newAction.cost = newAction.spell.cost;
				newAction.duration = newAction.spell.duration;
				newAction.cooldown = newAction.spell.cooldown;
				newAction.casttime = newAction.spell.casttime;
				if (newAction.spell.gcd) newAction.gcd = 1500;

				if (ability.threat_flat) newAction.threat_flat = ability.threat_flat;
				if (ability.threat_mod) newAction.threat_mod = ability.threat_mod;
				if (ability.threat_buff) newAction.threat_buff = ability.threat_buff;

				// apply modifiers from talents
				for (let mod of this.spell_mods) {
					let mult = this.traits[mod.id] || 1;
					if (spell.classMask && mod.mask & spell.classMask && mod.type == AuraType.AddFlatModifier)
						switch (mod.op) {
							case SpellModOp.SPELLMOD_COST:
								newAction.cost += mod.value * mult;
								break;
							case SpellModOp.SPELLMOD_ALL_EFFECTS:
								newAction.flatModifier += mod.value * mult;
								break;
							case SpellModOp.SPELLMOD_CRITICAL_CHANCE:
								newAction.crit += mod.value * mult;
								break;
							case SpellModOp.SPELLMOD_COOLDOWN:
								newAction.cooldown += mod.value * mult;
								break;
							case SpellModOp.SPELLMOD_DURATION:
								newAction.duration += mod.value * mult;
								break;
							case SpellModOp.SPELLMOD_CHARGES:
								newAction.charges = (newAction.spell.procCharges || 0) + mod.value * mult;
								break;
							case SpellModOp.SPELLMOD_CASTING_TIME:
								newAction.casttime += mod.value * mult;
								break;
							case SpellModOp.SPELLMOD_CASTING_TIME_OLD:
								newAction.gcd += mod.value * mult;
								break;
							default:
								console.log('SpellModOp not implemented', this);
						}
					if (spell.classMask && mod.mask & spell.classMask && mod.type == AuraType.AddPctModifier)
						switch (mod.op) {
							case SpellModOp.SPELLMOD_DOT:
							case SpellModOp.SPELLMOD_ALL_EFFECTS:
								newAction.pctModifier *= 1 + (mod.value * mult) / 100;
								break;
							case SpellModOp.SPELLMOD_DURATION:
								newAction.duration *= 1 + (mod.value * mult) / 100;
								break;
							case SpellModOp.SPELLMOD_COST:
								newAction.cost *= 1 + (mod.value * mult) / 100;
								break;
							case SpellModOp.SPELLMOD_CRIT_DAMAGE_BONUS:
								newAction.critdmgmod *= 1 + (mod.value * mult) / 100;
								break;
							case SpellModOp.SPELLMOD_RADIUS:
								break;
							default:
								console.log('SpellModOp not implemented', this);
						}
				}

				this.actions.push(newAction);
			}

			// item on use effects
			for (let item of this.items) {
				if (!item.useSpell) continue;
				if (item.useSpell != action.id) continue;
				let spell = templateSpells[item.useSpell];
				if (!spell) continue;

				let newAction = new Action(action);
				newAction.spell = spell;
				newAction.cooldown = item.cooldown || 0;
				newAction.category_cooldown = item.category_cooldown || 0;
				newAction.duration = newAction.spell.duration || 0;
				newAction.casttime = newAction.spell.casttime || 0;
				if (newAction.spell.gcd) newAction.gcd = 1500;
				this.actions.push(newAction);
			}
		}

		// if on use item is equipped but no action exists add it anyway
		for (let item of this.items) {
			if (!item.useSpell) continue;
			let spell = templateSpells[item.useSpell];
			if (!spell) continue;
			if (this.actions.filter(action => action.id == item.useSpell).length > 0) continue;

			let newAction = new Action({ id: spell.id, name: item.name, path: item.path, item: true });
			newAction.spell = spell;
			newAction.cooldown = item.cooldown || 0;
			newAction.category_cooldown = item.category_cooldown || 0;
			newAction.duration = newAction.spell.duration || 0;
			newAction.casttime = newAction.spell.casttime || 0;
			if (newAction.spell.gcd) newAction.gcd = 1500;
			newAction.conditions = [];

			let timeleft = spell.duration;
			for (let action of this.actions) {
				if (action.item && action.conditions.length > 0)
					for (let condition of action.conditions) {
						if (condition.resource == ConditionType.TimeRemaining) timeleft += condition.maxtimeleft;
					}
			}

			if (spell && spell.duration)
				newAction.conditions.push({ comparator: '<=', resource: ConditionType.TimeRemaining, value: timeleft / 1000, maxtimeleft: timeleft });

			this.actions.push(newAction);
		}
	}
	getItems(items: any, test_slot?: string, test_item?: any) {
		let list = [];
		for (let slot in items) {
			for (let item of items[slot]) {
				if (slot == test_slot && item.rand && item.id != test_item.id && item.rand != test_item.rand) continue;
				if (slot == test_slot && !item.rand && item.id != test_item.id) continue;
				if (slot !== test_slot && !item.selected) continue;

				list.push(item);
			}
		}
		return list;
	}
	// #endregion

	// #region auras
	buildSpellMods() {
		spell: for (let spell of this.passive_auras) {
			for (let effect of spell.effects) {
				if (effect.effectType != EffectType.ApplyAura || !effect.classMask) continue;
				if (effect.auraType != AuraType.AddFlatModifier && effect.auraType != AuraType.AddPctModifier) continue;
				let value = effect.basePointsF || 0;
				const talent = getTalentByName(this.talents, spell.name) as any;
				if (talent && talent.c && talent.values) {
					value = talent.values[talent.c - 1];
				}
				for (let ability of this.abilities) if (ability.id == spell.id) continue spell;
				this.spell_mods.push({
					id: spell.id,
					mask: effect.classMask,
					type: effect.auraType,
					op: effect.miscValue,
					value: value,
				} as SpellModifier);
			}
		}
	}
	applyPassiveAuras() {
		spell: for (let spell of this.passive_auras) {
			let mods: SpellModifier[] = [];
			for (let ability of this.abilities) if (ability.id == spell.id) continue spell;

			for (let i of this.spell_mods) if (spell.classMask && i.mask & spell.classMask) mods.push(i);

			for (let effect of spell.effects) {
				if (effect.target == Targets.TARGET_UNIT_TARGET_ENEMY || effect.target == Targets.TARGET_ALL_ENEMY_IN_AREA) continue;
				effect.applyEffectAura(this, this.base_stats, spell, undefined, false, undefined, mods, undefined);
			}
		}
	}
	// #endregion
}
