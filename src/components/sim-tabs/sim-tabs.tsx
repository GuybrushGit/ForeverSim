import clsx from 'clsx';
import './sim-tabs.scss';

export function SimTabsItem(props: { text: string; selected: boolean; handleClick: any }) {
	return (
		<div className="sim-tabs-item">
			<button className={clsx(props.selected && 'active')} onClick={props.handleClick}>
				{props.text}
			</button>
		</div>
	);
}

export function SimTabs(props: { children: any }) {
	return <div className="sim-tabs">{props.children}</div>;
}
