// Sherlock tarzı kullanıcı-adı kontrol motoru — yalnızca ALT AJANLARCA BUGÜN DOĞRULANMIŞ kurallar.
// Kaynak: Sherlock data.json kuralları (2026-11-13 doğrulandı). BOT-KORUMALI/ESKİ olanlar burada YOK.
// Yöntem: düz HTTP GET, gerçekçi UA, sahte token yok, bildirim yok. Herkese açık profil varlığı.
//   type 'status'  : VAR ⇒ HTTP 200, YOK ⇒ 404
//   type 'message' : YOK ⇒ gövde needle İÇERİR; VAR ⇒ içermez (genelde 200)
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// show: kullanıcıya gösterilecek URL · probe: kontrol için istenecek URL (yoksa show) · needle: 'message' için "yok" göstergesi
const RULES = [
  { name: 'youtube',    show: u => `https://www.youtube.com/@${u}`,          type: 'status' },
  { name: 'twitch',     show: u => `https://www.twitch.tv/${u}`,            type: 'message', needle: "Twitch is the world&#39;s leading video platform" },
  { name: 'snapchat',   show: u => `https://www.snapchat.com/add/${u}`,      type: 'status' },
  { name: 'soundcloud', show: u => `https://soundcloud.com/${u}`,            type: 'status' },
  { name: 'vimeo',      show: u => `https://vimeo.com/${u}`,                 type: 'status' },
  { name: 'flickr',     show: u => `https://www.flickr.com/people/${u}`,     type: 'status' },
  { name: 'vk',         show: u => `https://vk.com/${u}`,                    type: 'status' }, // Sherlock response_url eski; status_code ile çalışır
  { name: 'patreon',    show: u => `https://www.patreon.com/${u}`,           type: 'status' },
  { name: 'behance',    show: u => `https://www.behance.net/${u}`,           type: 'status' },
  { name: 'dribbble',   show: u => `https://dribbble.com/${u}`,              type: 'message', needle: 'Whoops, that page is gone.' },
  { name: 'allmylinks', show: u => `https://allmylinks.com/${u}`,            type: 'message', needle: 'Page not found' },
  { name: 'blogger',    show: u => `https://${u}.blogspot.com`,              type: 'status' },
  { name: 'goodreads',  show: u => `https://www.goodreads.com/${u}`,         type: 'status' },
  { name: 'keybase',    show: u => `https://keybase.io/${u}`,                type: 'status' },
  { name: 'hackerrank', show: u => `https://www.hackerrank.com/${u}`,        type: 'message', needle: 'Something went wrong' },
  { name: 'linktree',   show: u => `https://linktr.ee/${u}`,                 type: 'message', needle: '"statusCode":404' },
  { name: 'trello',     show: u => `https://trello.com/${u}`, probe: u => `https://trello.com/1/Members/${u}`, type: 'message', needle: 'model not found' },
  { name: 'gitea',      show: u => `https://gitea.com/${u}`,                 type: 'status' },
  { name: 'codewars',   show: u => `https://www.codewars.com/users/${u}`,    type: 'status' },
];

function candidates(email) {
  const local = email.split('@')[0].split('+')[0];
  const letters = local.replace(/\d+$/, '');
  const parts = letters.split(/[._-]/).filter(Boolean);
  return [...new Set([local, letters, parts.join(''), parts.join('.'), parts.join('_'), parts[0]].filter(Boolean))];
}

async function check(rule, u) {
  const url = (rule.probe || rule.show)(u);
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html,application/json' }, redirect: 'follow', signal: AbortSignal.timeout(12000) });
    if (rule.type === 'status') return r.status === 200;
    // message
    if (r.status === 404) return false;
    const body = await r.text();
    return !body.includes(rule.needle);
  } catch { return null; } // ağ hatası → belirsiz
}

export { RULES, check }; // doğrulama testleri için

export default {
  name: 'sherlock',
  async run(email, ctx) {
    const cands = ctx?.usernames?.length ? ctx.usernames : candidates(email);
    const results = await Promise.all(RULES.map(async rule => {
      for (const u of cands) {
        const ok = await check(rule, u);
        if (ok === true) return { platform: rule.name, username: u, url: rule.show(u) };
      }
      return null;
    }));
    const matches = results.filter(Boolean);
    if (!matches.length) return { status: 'not_found', data: { tried: cands, checked: RULES.length } };
    return { status: 'found', data: { count: matches.length, matches } };
  },
};
