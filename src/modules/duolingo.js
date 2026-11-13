// #6 Duolingo — açık kullanıcı API'si: /users?email=
// Hesap yoksa {"users":[]}. Hesap varsa bir kullanıcı nesnesi döner; Duolingo bazı hesaplarda
// kullanıcı adı/isim alanlarını boşaltıyor ama giriş yöntemi (Google/Facebook/Apple) ve avatar görünür.
export default {
  name: 'duolingo',
  async run(email) {
    const res = await fetch(`https://www.duolingo.com/2017-06-30/users?email=${encodeURIComponent(email)}`);
    if (!res.ok) return { status: 'unknown', error: `HTTP ${res.status}` };
    const users = (await res.json()).users ?? [];
    if (!users.length) return { status: 'not_found' };

    const u = users[0];
    const login = [u.hasGoogleId && 'Google', u.hasFacebookId && 'Facebook', u.hasAppleId && 'Apple'].filter(Boolean);
    return {
      status: 'found',
      data: {
        username: u.username || '(gizli)',
        name: u.name || '(gizli)',
        profile: u.username ? `https://www.duolingo.com/profile/${u.username}` : null,
        loginWith: login.length ? login.join(', ') : 'e-posta/şifre',
        avatar: u.picture ? 'https:' + u.picture : null,
        streak: u.streak,
        plus: u.hasPlus,
        recentlyActive: u.hasRecentActivity15,
        courses: u.courses?.map(c => `${c.learningLanguage} (${c.xp} XP)`) ?? [],
        createdAt: u.creationDate ? new Date(u.creationDate * 1000).toISOString().slice(0, 10) : null,
      },
    };
  },
};
