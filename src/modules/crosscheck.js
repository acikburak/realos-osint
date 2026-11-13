// Çapraz kontrol — e-postadan türetilen kullanıcı adı adaylarını HERKESE AÇIK profillerde arar.
// Hiçbir koruma kırılmaz, hiçbir hesaba bildirim gitmez: sadece herkesin görebildiği profil sayfaları okunur.
// Mantık: bir servis e-posta aramasında kullanıcı adını gizliyorsa (ör. Duolingo), adayları tek tek deneyip
// avatar/isim eşleşmesiyle doğru profili yakalamaya çalışırız.

function candidates(email) {
  const local = email.split('@')[0].split('+')[0];
  const letters = local.replace(/\d+$/, '');
  const parts = letters.split(/[._-]/).filter(Boolean);
  return [...new Set([
    local, letters, parts.join(''), parts.join('_'), parts.join('.'),
    parts.join('-'), parts[0],
  ].filter(Boolean))];
}

// Her kaynak: aday kullanıcı adını herkese açık profil olarak sorgular.
const SOURCES = {
  async github(u) {
    const r = await fetch(`https://api.github.com/users/${u}`, { headers: { 'User-Agent': 'realos-cli' } });
    if (r.status !== 200) return null;
    const d = await r.json();
    return { url: d.html_url, name: d.name, avatar: d.avatar_url, extra: `${d.public_repos} repo, katılım ${d.created_at?.slice(0, 10)}` };
  },
  async gitlab(u) {
    const r = await fetch(`https://gitlab.com/api/v4/users?username=${u}`);
    if (!r.ok) return null;
    const a = await r.json();
    if (!a.length) return null;
    return { url: a[0].web_url, name: a[0].name, avatar: a[0].avatar_url, extra: `id ${a[0].id}` };
  },
  async duolingo(u) {
    const r = await fetch(`https://www.duolingo.com/2017-06-30/users?username=${u}`);
    if (!r.ok) return null;
    const a = (await r.json()).users ?? [];
    if (!a.length) return null;
    const d = a[0];
    return { url: `https://www.duolingo.com/profile/${u}`, name: d.name || null, avatar: d.picture ? 'https:' + d.picture : null, extra: `streak ${d.streak}` };
  },
  async hackernews(u) {
    // Herkese açık Firebase API: hesap yoksa null döner.
    const r = await fetch(`https://hacker-news.firebaseio.com/v0/user/${u}.json`);
    if (!r.ok) return null;
    const d = await r.json();
    if (!d || !d.id) return null;
    return { url: `https://news.ycombinator.com/user?id=${u}`, name: null, avatar: null,
      extra: `karma ${d.karma}, katılım ${new Date(d.created * 1000).toISOString().slice(0, 10)}` };
  },
  async bluesky(u) {
    // Varsayılan handle kalıbı: <kullanıcıadı>.bsky.social
    const r = await fetch(`https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${u}.bsky.social`);
    if (!r.ok) return null;
    const d = await r.json();
    if (d.error || !d.did) return null;
    return { url: `https://bsky.app/profile/${u}.bsky.social`, name: d.displayName || null, avatar: d.avatar || null,
      extra: `${d.followersCount ?? 0} takipçi, ${d.postsCount ?? 0} gönderi` };
  },
  async dockerhub(u) {
    // Herkese açık API: hesap yoksa 404.
    const r = await fetch(`https://hub.docker.com/v2/users/${u}/`);
    if (r.status !== 200) return null;
    const d = await r.json();
    if (!d.username) return null;
    return { url: `https://hub.docker.com/u/${u}`, name: d.full_name || null, avatar: d.gravatar_url || null,
      extra: `katılım ${d.date_joined?.slice(0, 10)}${d.company ? ', ' + d.company : ''}${d.location ? ', ' + d.location : ''}` };
  },
  async huggingface(u) {
    // Herkese açık API: hesap yoksa 404.
    const r = await fetch(`https://huggingface.co/api/users/${u}/overview`);
    if (r.status !== 200) return null;
    const d = await r.json();
    if (!d.user) return null;
    return { url: `https://huggingface.co/${u}`, name: d.fullname || null, avatar: d.avatarUrl || null,
      extra: `${d.numModels ?? 0} model, ${d.numDatasets ?? 0} veri seti` };
  },
  async medium(u) {
    // RSS feed: hesap varsa 200 + <title>, yoksa 404. Doğruluk: gövdede <title> şartı.
    const r = await fetch(`https://medium.com/feed/@${u}`);
    if (r.status !== 200) return null;
    const body = await r.text();
    const t = body.match(/<title>(?:<!\[CDATA\[)?([^<\]]{1,120})/)?.[1]?.trim();
    if (!t) return null;
    return { url: `https://medium.com/@${u}`, name: t.replace(/^Stories by /, '') || null, avatar: null, extra: 'Medium profili' };
  },
  async substack(u) {
    // <user>.substack.com. Doğruluk guard'ı: son URL hâlâ bu alt alanda olmalı (park/yönlendirme = yok).
    let r;
    try { r = await fetch(`https://${u}.substack.com/`, { redirect: 'follow' }); } catch { return null; }
    if (!r.ok) return null;
    const host = new URL(r.url).hostname;
    if (host !== `${u}.substack.com`) return null; // parked/redirected → yanlış pozitifi engelle
    const t = (await r.text()).match(/<title[^>]*>([^<]{1,120})/i)?.[1]?.trim();
    return { url: `https://${u}.substack.com`, name: t || null, avatar: null, extra: 'Substack yayını' };
  },
  async archive(u) {
    // archive.org/details/@user. Doğruluk guard'ı: gövde kullanıcı adını içermeli.
    const r = await fetch(`https://archive.org/details/@${u}`);
    if (r.status !== 200) return null;
    const body = await r.text();
    if (!body.includes(`@${u}`)) return null;
    return { url: `https://archive.org/details/@${u}`, name: null, avatar: null, extra: 'Internet Archive profili' };
  },
};

export default {
  name: 'crosscheck',
  async run(email, ctx) {
    const cands = ctx?.usernames?.length ? ctx.usernames : candidates(email);
    const hits = [];
    for (const [source, fn] of Object.entries(SOURCES)) {
      for (const u of cands) {
        try {
          const found = await fn(u);
          if (found) hits.push({ source, username: u, ...found });
        } catch { /* yoksay */ }
      }
    }
    if (!hits.length) return { status: 'not_found', data: { tried: cands } };
    return { status: 'found', data: { tried: cands, matches: hits } };
  },
};
