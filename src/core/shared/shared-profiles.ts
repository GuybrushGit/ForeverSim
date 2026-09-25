import { supabase } from './supabase';
import type { Profile } from './types';

const shareCodeAlphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const shareLinkLifetimeMs = 10 * 24 * 60 * 60 * 1000;

function createShareCode(length = 10) {
	const randomValues = new Uint32Array(length);
	crypto.getRandomValues(randomValues);
	return Array.from(randomValues, value => shareCodeAlphabet[value % shareCodeAlphabet.length]).join('');
}

export async function createSharedProfile(profile: Profile) {
	const { data, error } = await supabase
		.from('shared_profiles')
		.insert({
			class: profile.class,
			profile,
			share_code: createShareCode(),
			expires_at: new Date(Date.now() + shareLinkLifetimeMs).toISOString(),
		})
		.select('share_code')
		.single();

	if (error) throw error;
	return data.share_code;
}

export async function getSharedProfile(shareCode: string) {
	const { data, error } = await supabase.from('shared_profiles').select('profile').eq('share_code', shareCode).single();

	if (error) throw error;
	return data.profile as Profile;
}
