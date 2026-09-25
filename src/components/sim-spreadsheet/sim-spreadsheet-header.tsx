import './sim-spreadsheet-header.scss';
import SimIcon from '@components/sim-icon/sim-icon';
import { useStore } from '@core/shared/store';
import clsx from 'clsx';

function SimSpreadsheetHeader() {
	const store = useStore();
	const { getItems, getEnchants, getItemSet, slot, setSlot } = store;
	let items = getItems();
	let enchants = getEnchants();

	const slots = [
		'mainhand',
		'offhand',
		'twohand',
		'ranged',
		'head',
		'neck',
		'shoulder',
		'back',
		'chest',
		'wrists',
		'hands',
		'waist',
		'legs',
		'feet',
		'finger1',
		'finger2',
		'trinket1',
		'trinket2',
	];

	function clickSlot(slot: string) {
		setSlot(slot);
	}

	function getIcon(item: any, iconSlot: string, img: string, child: boolean, enchant?: string, pieces?: string) {
		if (item && iconSlot.indexOf('_enchant') > -1) item.path = 'spell_holy_greaterheal';
		if (item && iconSlot.indexOf('_tempenchant') > -1) item.path = 'inv_stone_sharpeningstone_05';
		if (item) {
			return (
				<SimIcon
					child={child}
					id={item.id}
					item={slot.indexOf('enchant') == -1}
					rand={item.rand}
					ench={enchant}
					pieces={pieces}
					name={item.name}
					img={item.path}
					greyed={false}
					selected={slot == iconSlot}
					handleClick={() => clickSlot(iconSlot)}></SimIcon>
			);
		}
		return (
			<SimIcon child={child} name={slot} fullimg={img} greyed={true} selected={slot == iconSlot} handleClick={() => clickSlot(iconSlot)}></SimIcon>
		);
	}

	let title = slot
		.replace('hand', ' hand')
		.replace('1', ' 1')
		.replace('2', ' 2')
		.replace('_enchant', ' Enchant')
		.replace('_tempenchant', ' Temp Enchant');
	return (
		<div className="sim-spreadsheet-header">
			<div className="title">{title}</div>
			<div className="container">
				{slots.map((s: string, index: number) => {
					let item, child, tempchild;
					let slotpath = s.replace(/\d+/g, '');
					if (s == 'back') slotpath = 'chest';
					if (s == 'twohand') slotpath = 'mainhand';
					let img = `https://wow.zamimg.com/images/wow/icons/medium/inventoryslot_${slotpath}.jpg`;

					for (let i in items[s]) {
						if (items[s][i].selected) item = items[s][i];
					}

					let pieces = [];
					let itemSet = item && getItemSet(item.id);
					if (item && itemSet) {
						for (let slot in items) {
							for (let obj of items[slot]) {
								if (obj.selected && itemSet.items.includes(obj.id)) pieces.push(obj.id);
							}
						}
					}

					let enchantslot = s + '_enchant';
					let hasEnchant = !!enchants[enchantslot];
					if (hasEnchant) {
						for (let i in enchants[enchantslot]) {
							if (enchants[enchantslot][i].selected) child = enchants[enchantslot][i];
						}
					}

					let tempenchantslot = s + '_tempenchant';
					let hasTempEnchant = !!enchants[tempenchantslot];
					if (hasTempEnchant) {
						for (let i in enchants[tempenchantslot]) {
							if (enchants[tempenchantslot][i].selected) tempchild = enchants[tempenchantslot][i];
						}
					}

					return (
						<div key={index} className={clsx('icon-container', slot.indexOf(s) > -1 && 'selected')}>
							{getIcon(item, s, img, false, child && child.enchant, pieces.join(':'))}
							{hasEnchant && getIcon(child, s + '_enchant', 'https://wow.zamimg.com/images/wow/icons/medium/inventoryslot_enchant.jpg', true)}
							{hasTempEnchant &&
								getIcon(tempchild, s + '_tempenchant', 'https://wow.zamimg.com/images/wow/icons/medium/inventoryslot_enchant.jpg', true)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default SimSpreadsheetHeader;
