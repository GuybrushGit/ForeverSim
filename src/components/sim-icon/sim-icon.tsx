import clsx from 'clsx';
import './sim-icon.scss';

function SimIcon(props: {
	id?: number | string;
	name?: string;
	bg?: string;
	img?: string;
	fullimg?: string;
	item?: boolean;
	rand?: string;
	ench?: string;
	pieces?: string;
	child?: boolean;
	greyed?: boolean;
	selected?: boolean;
	handleClick?: any;
	children?: any;
	rank?: string;
	definition?: string;
}) {
	function handler(event: any) {
		event.preventDefault();
		if (props.handleClick) {
			event.stopPropagation();
			props.handleClick(props.id, !props.selected);
		}
	}
	return (
		<div className={clsx('sim-icon', props.child && 'child', props.greyed && 'greyed', props.selected && 'selected')} onClick={handler}>
			{props.bg && <img src={props.bg} alt={props.name} />}
			{props.img && <img src={`https://wow.zamimg.com/images/wow/icons/large/${props.img}.jpg`} alt={props.name} />}
			{props.fullimg && <img src={props.fullimg} alt={props.name} />}
			{props.id && (
				<a
					href={`https://forever.wowhead.com/${props.item ? 'item' : 'spell'}=${props.id}${props.rand ? '&rand=' + props.rand : ''}${props.rank && props.definition ? '?def=' + props.definition + '&rank=' + props.rank : ''}${props.ench ? '&ench=' + props.ench : ''}${
						props.pieces ? '&pcs=' + props.pieces : ''
					}`}
					className="wh-tooltip"
					onClick={e => e.preventDefault()}></a>
			)}
			{props.children}
		</div>
	);
}

export default SimIcon;
