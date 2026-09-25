import clsx from 'clsx';
import './sim-dashboard-profiles.scss';
import { PencilIcon, PlusIcon, TrashIcon, LinkIcon, SpinnerGapIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { useStore } from '@core/shared/store';
import type { Profile } from '@core/shared/types';
import { createSharedProfile } from '@core/shared/shared-profiles';
import SimModal from '@components/sim-modal/sim-modal';
import SimFormText from '@components/sim-form/sim-form-text';

function SimDashboardProfile(props: {
	id: string;
	name: string;
	level: string;
	class: string;
	talents: string;
	selected?: boolean;
	hasDelete: boolean;
	handleDelete: any;
	handleEdit: any;
	handleShare: any;
	isSharing: boolean;
}) {
	const [editable, setEditable] = useState(false);
	const store = useStore();
	const { setProfile } = store;

	function handleClick() {
		setProfile(props.id);
	}
	function deleteProfile(event: any) {
		event.stopPropagation();
		props.handleDelete(props.id);
	}
	async function exportProfile(event: any) {
		event.stopPropagation();
		await props.handleShare(props.id);
	}
	function startEditing(event: any) {
		event.stopPropagation();
		setEditable(true);
	}
	function endEditing(event: any) {
		props.handleEdit(props.id, event.target.value);
		setEditable(false);
	}
	function handleKeyDown(event: any) {
		if (event.keyCode == 13) endEditing(event);
	}
	return (
		<div className={clsx('sim-dashboard-profile', props.selected && 'selected')} onClick={handleClick}>
			{!editable && <div className="name">{props.name}</div>}
			{editable && <input type="text" autoFocus defaultValue={props.name} onBlur={endEditing} onKeyDown={handleKeyDown}></input>}
			{props.selected && [
				<div className="level" key="level">
					Level {props.level} {props.class}
				</div>,
				<div className="talents" key="talents">
					{props.talents}
				</div>,
				<div className="buttons" key="buttons">
					<button onClick={startEditing}>
						<PencilIcon size={14}></PencilIcon>
						<p>Edit Name</p>
					</button>
					<button onClick={exportProfile} disabled={props.isSharing}>
						{props.isSharing ? <SpinnerGapIcon className="sim-share-spinner" size={14}></SpinnerGapIcon> : <LinkIcon size={14}></LinkIcon>}
						<p>Share Link</p>
					</button>
					{props.hasDelete && (
						<button onClick={deleteProfile}>
							<TrashIcon size={16}></TrashIcon>
						</button>
					)}
				</div>,
			]}
		</div>
	);
}

function SimDashboardProfiles() {
	const store = useStore();
	const { profile, getProfileList, setProfile, setProfileList, getTalentString, route } = store;
	const [shareLink, setShareLink] = useState('');
	const [shareError, setShareError] = useState(false);
	const [isSharing, setIsSharing] = useState(false);
	let profileList = getProfileList();

	function addProfile() {
		let maxid = 0;
		for (let i in profileList) {
			maxid = Math.max(maxid, Number(i.replace(/^\D+/g, '')));
		}
		let newname = route + (maxid + 1);
		profileList[newname] = structuredClone(profileList[profile]);
		profileList[newname].id = newname;
		profileList[newname].name = 'Copy of ' + profileList[profile].name;

		setProfile(newname);
		setProfileList(profileList);
	}

	function deleteProfile(delprofile: any) {
		delete profileList[delprofile];
		let pList = Object.values(profileList);
		if (profile == delprofile) setProfile((pList[pList.length - 1] as Profile).id);
		setProfileList(profileList);
	}

	function doneEditing(profile: string, value: string) {
		profileList[profile].name = value;
		setProfileList(profileList);
	}

	async function shareProfile(profileId: string) {
		setIsSharing(true);
		setShareLink('');
		setShareError(false);
		try {
			const shareId = await createSharedProfile(profileList[profileId]);
			const shareUrl = new URL(`/warrior/share/${shareId}`, window.location.origin);
			await navigator.clipboard.writeText(shareUrl.toString());
			setShareLink(shareUrl.toString());
		} catch (error) {
			console.error(error);
			setShareError(true);
		} finally {
			setIsSharing(false);
		}
	}

	async function copyShareLink() {
		await navigator.clipboard.writeText(shareLink);
	}

	return (
		<div className="sim-dashboard-profiles">
			<div className="sim-dashboard-profiles-header">
				<div className="section-title">PROFILES</div>
				<button onClick={addProfile}>
					<PlusIcon size={16}></PlusIcon>
					<p>Add Profile</p>
				</button>
			</div>
			<div className="container">
				{Object.values(profileList).map((obj: any) => {
					return (
						<SimDashboardProfile
							key={obj.id}
							id={obj.id}
							name={obj.name}
							level={obj.level}
							class={obj.class}
							talents={getTalentString()}
							selected={obj.id == profile}
							hasDelete={Object.values(profileList).length > 1}
							handleDelete={deleteProfile}
							handleEdit={doneEditing}
							handleShare={shareProfile}
							isSharing={isSharing}></SimDashboardProfile>
					);
				})}
			</div>
			<SimModal
				isOpen={isSharing || shareLink !== '' || shareError}
				onClose={() => {
					setShareLink('');
					setShareError(false);
				}}>
				{isSharing ? (
					<div className="sim-share-modal sim-share-loading">
						<SpinnerGapIcon className="sim-share-spinner" size={28}></SpinnerGapIcon>
						<p>Creating share link...</p>
					</div>
				) : shareError ? (
					<div className="sim-share-modal">
						<h3>Unable to share profile</h3>
						<p>Check your connection and try again.</p>
					</div>
				) : (
					<div className="sim-share-modal">
						<SimFormText name="share" label="" type="text" value={shareLink} handleChange={null}></SimFormText>
						<button onClick={copyShareLink}>Copy link</button>
					</div>
				)}
			</SimModal>
		</div>
	);
}

export default SimDashboardProfiles;
