// #7 GitLab — e-posta/terim araması herkese kapalı (403). Açık olan tek yol: TAM kullanıcı adı sorgusu.
// Bu yüzden e-postadan türetilen kullanıcı adı adaylarını tek tek deneriz (herkese açık profil).
function candidates(email) {
  const local = email.split('@')[0].split('+')[0];
  const letters = local.replace(/\d+$/, '');
  const parts = letters.split(/[._-]/).filter(Boolean);
  return [...new Set([local, letters, parts.join(''), parts.join('.'), parts[0]].filter(Boolean))];
}

export default {
  name: 'gitlab',
  async run(email) {
    const hits = [];
    for (const u of candidates(email)) {
      const r = await fetch(`https://gitlab.com/api/v4/users?username=${encodeURIComponent(u)}`);
      if (!r.ok) continue;
      const a = await r.json();
      if (a.length) {
        const d = a[0];
        hits.push({ username: d.username, name: d.name, url: d.web_url, id: d.id, publicEmail: d.public_email || null, state: d.state });
      }
    }
    if (!hits.length) return { status: 'not_found', data: { note: 'kullanıcı adı adaylarında GitLab profili yok' } };
    return { status: 'found', data: { matches: hits } };
  },
};
