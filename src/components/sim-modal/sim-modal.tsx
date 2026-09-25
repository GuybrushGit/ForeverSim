import './sim-modal.scss';
import { XIcon } from '@phosphor-icons/react';
import type { PropsWithChildren } from 'react';

type SimModalProps = PropsWithChildren<{
	isOpen?: boolean;
	onClose?: () => void;
}>;

function SimModal({ children, isOpen = false, onClose }: SimModalProps) {
	if (!isOpen) return null;

	return (
		<div className="sim-modal-backdrop" onClick={onClose}>
			<div className="sim-modal" onClick={event => event.stopPropagation()}>
				<XIcon size={20} weight="bold" onClick={onClose} className="sim-modal-close"></XIcon>
				{children}
			</div>
		</div>
	);
}

export default SimModal;
