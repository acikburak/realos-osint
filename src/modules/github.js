// #4 GitHub — açık REST API, token yok (arama: 10 istek/dk, diğer: 60 istek/saat).
// Yöntem 1: Profilinde e-postayı herkese açık gösteren kullanıcıyı ara  (search/users)
// Yöntem 2: Bu e-postayla atılmış herkese açık commit'leri ara           (search/commits)
// Bulunan kullanıcı adı ile profil + son aktivite çekilir.
const API = 'https://api.github.com';
const HEADERS = { 'User-Agent': 'realos-cli', Accept: 'application/vnd.github+json' };

async function gh(path) {
  const res = await fetch(API + path, { headers: HEADERS });
  if (res.status === 403 || res.status === 429) throw new Error('GitHub istek limiti doldu, biraz bekleyip tekrar dene');
  if (!res.ok) return null;
  return res.json();
}

export default {
  name: 'github',
  async run(email) {
    const q = encodeURIComponent(email);
    const [users, commits] = await Promise.all([
      gh(`/search/users?q=${q}+in:email`),
      gh(`/search/commits?q=author-email:${q}&sort=author-date&order=desc&per_page=5`),
    ]);

    const fromProfile = users?.items?.[0]?.login;
    const fromCommit = commits?.items?.find(c => c.author?.login)?.author?.login;
    const login = fromProfile || fromCommit;
    if (!login) return { status: 'not_found', data: { method: 'profil e-postası + commit araması' } };

    const [user, events] = await Promise.all([
      gh(`/users/${login}`),
      gh(`/users/${login}/events/public?per_page=1`),
    ]);

    return {
      status: 'found',
      data: {
        foundVia: fromProfile ? 'profil e-postası' : 'commit e-postası',
        username: login,
        name: user?.name,
        profile: user?.html_url,
        avatar: user?.avatar_url,
        bio: user?.bio,
        company: user?.company,
        location: user?.location,
        blog: user?.blog || null,
        followers: user?.followers,
        following: user?.following,
        publicRepos: user?.public_repos,
        joined: user?.created_at?.slice(0, 10),
        profileUpdated: user?.updated_at?.slice(0, 10),
        lastPublicEvent: events?.[0]?.created_at?.slice(0, 10) ?? null,
        commitsWithThisEmail: commits?.total_count ?? 0,
        latestCommit: commits?.items?.[0]
          ? `${commits.items[0].commit.author.date.slice(0, 10)} — ${commits.items[0].repository.full_name}`
          : null,
      },
    };
  },
};
