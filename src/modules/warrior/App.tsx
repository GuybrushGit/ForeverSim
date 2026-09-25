import templateBuffs from './buffs';
import templateItems from '../items';
import templateEnchants from '../enchants';
import templatePresets from './presets';
import templateFilters from './filters';
import templateSettings from './settings';
import templateTalents from './talents';
import templateSpells from '../spells';
import templateSets from '../itemsets';
import { templateAbilities, templatePhases } from './abilities';
import defaultProfile from './default_profile';
import { App } from '../../App';
import { SimulationWorkers } from '@core/simulation-workers';
import { ClassMask } from '@core/shared/enums';

export default function ClassicWarrior() {
	let global = globalThis as any;
	global.templateBuffs = templateBuffs;
	global.templateItems = templateItems;
	global.templateEnchants = templateEnchants;
	global.templatePresets = templatePresets;
	global.templateAbilities = templateAbilities;
	global.templatePhases = templatePhases;
	global.templateSettings = templateSettings;
	global.templateTalents = templateTalents;
	global.templateSpells = templateSpells;
	global.templateSets = templateSets;
	global.templateFilters = templateFilters;
	global.workers = new SimulationWorkers();
	return <App route="warrior" className="Warrior" classId={ClassMask.Warrior} defaultProfile={defaultProfile}></App>;
}
