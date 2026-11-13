// #3 Gravatar — e-postanın hash'i ile herkese açık avatar/profil.
// Gravatar e-postayı değil hash'ini kullanır: avatar için MD5, profil API'si için SHA-256.
import { createHash } from 'node:crypto';

const hash = (alg, s) => createHash(alg).update(s).digest('hex');

export default {
  name: 'gravatar',
  async run(email) {
    const md5 = hash('md5', email);
    const sha = hash('sha256', email);

    // d=404 → avatar yoksa varsayılan resim yerine 404 döner
    const avatarRes = await fetch(`https://gravatar.com/avatar/${md5}?d=404&s=200`, { method: 'HEAD' });
    const hasAvatar = avatarRes.status === 200;

    const profRes = await fetch(`https://api.gravatar.com/v3/profiles/${sha}`, { headers: { 'User-Agent': 'realos-cli' } });
    const p = profRes.ok ? await profRes.json() : null;

    if (!hasAvatar && !p) return { status: 'not_found', data: { md5, sha256: sha } };

    return {
      status: 'found',
      data: {
        avatar: hasAvatar ? `https://gravatar.com/avatar/${md5}?s=400` : null,
        profile: p?.profile_url ?? null,
        displayName: p?.display_name ?? null,
        location: p?.location ?? null,
        jobTitle: p?.job_title ?? null,
        company: p?.company ?? null,
        about: p?.description ?? null,
        accounts: p?.verified_accounts?.map(a => `${a.service_label}: ${a.url}`) ?? [],
      },
    };
  },
};
