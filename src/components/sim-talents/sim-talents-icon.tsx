import './sim-talents-icon.scss';
import SimIcon from '@components/sim-icon/sim-icon';
import clsx from 'clsx';

function SimTalentsIcon(props: {
	data: any;
	greyed: boolean;
	definition: string;
	count: number;
	required: any;
	handleRightClick: any;
	handleLeftClick: any;
}) {
	return (
		<div
			className={clsx('sim-talents-icon', props.count >= props.data.s.length && 'maxed')}
			data-count={props.count}
			onClick={e => {
				e.preventDefault();
				props.handleLeftClick(props.data);
			}}
			onContextMenu={e => {
				e.preventDefault();
				props.handleRightClick(props.data);
			}}>
			<SimIcon
				name={props.data.n}
				img={props.data.iconname.toLowerCase()}
				id={props.data.s[Math.max(0, props.data.c - 1)]}
				greyed={props.greyed}
				definition={props.definition}
				rank={props.count.toString()}
				selected={!!props.count}>
				{props.required && <div className={clsx('arrow', props.required.y < props.data.y - 1 ? 'long' : '')}></div>}
			</SimIcon>
		</div>
	);
}

export default SimTalentsIcon;
