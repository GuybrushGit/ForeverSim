import { useState } from 'react';
import './sim-menu.scss';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'motion/react';

export function SimMenuItem(props: { text: string; background?: string; handleClick?: any }) {
	return (
		<div className="sim-menu-item" onClick={props.handleClick}>
			{props.background && (
				<div className="bg" style={{ backgroundImage: `url(https://wow.zamimg.com/images/wow/icons/large/${props.background}.jpg)` }}></div>
			)}
			{props.text}
		</div>
	);
}

export function SimMenu(props: { text: string; expandUp?: boolean; icon?: any; children: any }) {
	const [active, setActive] = useState(false);

	function clickEvent() {
		setActive(!active);
	}

	return (
		<div className="sim-menu" onClick={clickEvent} style={{ zIndex: active ? '15' : '10' }}>
			<button className={clsx(active && 'active')}>
				{props.icon}
				<p>{props.text}</p>
			</button>
			<AnimatePresence>
				{active ? (
					<motion.div key="box" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: props.expandUp ? -30 : 0 }} exit={{ opacity: 0, y: -10 }}>
						<div className={clsx('sim-menu-container', props.expandUp && 'expandUp')}>{props.children}</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	);
}

export default SimMenu;
