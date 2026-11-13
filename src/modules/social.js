// Sosyal medya (SPA) — kullanıcı adıyla HERKESE AÇIK profil kontrolü, TEK gerçek tarayıcı ile.
// Bu siteler her URL'de 200 döner; ayrım JS render SONRASI başlık/metinden yapılır.
// Bildirim göndermez, koruma atlatmaz: çıkış yapmış ziyaretçinin gördüğü herkese açık profildir.
// Yeni platform eklemek = PLATFORMS dizisine bir satır.
import { chromium } from 'playwright';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const num = (t, re) => t.match(re)?.[1]?.replace(/\s+$/, '') || null;

const PLATFORMS = [
  {
    name: 'instagram',
    url: u => `https://www.instagram.com/${u}/`,
    settleMs: 1500,
    test(title, text) {
      if (/mevcut değil|isn'?t available|not available|page not found/i.test(title)) return null;
      const m = title.match(/^(.*?)\s*\(@(.+?)\)/);
      if (!m) return null;
      return { username: m[2], name: m[1] || null,
        followers: num(text, /([\d.,]+\s*(?:Mn|Bn|M|K)?)\s*takipçi/i),
        following: num(text, /([\d.,]+\s*(?:Mn|Bn|M|K)?)\s*takip(?!çi)/i),
        private: /gizli|is private/i.test(text) };
    },
  },
  {
    name: 'pinterest',
    url: u => `https://www.pinterest.com/${u}/`,
    settleMs: 2000,
    test(title, text) {
      const m = title.match(/^(.*?)\s*\((.+?)\)\s*-\s*(?:Profil|Profile)/);
      if (!m) return null; // var olmayan profilde başlık boş
      return { username: m[2], name: m[1] || null,
        followers: num(text, /([\d.,]+\s*(?:bin|mn|M|K)?)\s*(?:takipçi|followers)/i) };
    },
  },
  {
    name: 'tiktok',
    url: u => `https://www.tiktok.com/@${u}`,
    settleMs: 3000,
    test(title, text) {
      if (/bulunamadı|couldn'?t find|not found/i.test(title)) return null;
      if (!/Takipçiler|Followers/i.test(text)) return null;
      return { name: (text.match(/^(.*?)\s+\d/) || [])[1]?.trim() || null,
        followers: num(text, /([\d.,]+\s*[MKB]?)\s*(?:Takipçiler|Followers)/i),
        following: num(text, /([\d.,]+\s*[MKB]?)\s*(?:Takip ediliyor|Following)/i),
        likes: num(text, /([\d.,]+\s*[MKB]?)\s*(?:Beğeniler|Likes)/i) };
    },
  },
];

function candidates(email) {
  const local = email.split('@')[0].split('+')[0];
  const letters = local.replace(/\d+$/, '');
  const parts = letters.split(/[._-]/).filter(Boolean);
  return [...new Set([local, letters, parts.join(''), parts.join('.'), parts.join('_'), parts[0]].filter(Boolean))];
}

export default {
  name: 'social',
  async run(email, ctx) {
    const cands = ctx?.usernames?.length ? ctx.usernames : candidates(email);
    const browser = await chromium.launch({ headless: true });
    const bctx = await browser.newContext({ userAgent: UA, locale: 'tr-TR', viewport: { width: 1366, height: 768 } });
    await bctx.route('**/*', r => ['image', 'media', 'font'].includes(r.request().resourceType()) ? r.abort() : r.continue());

    const matches = [];
    try {
      for (const plat of PLATFORMS) {
        for (const u of cands) {
          const page = await bctx.newPage();
          try {
            await page.goto(plat.url(u), { waitUntil: 'domcontentloaded', timeout: 20000 });
            await page.waitForTimeout(plat.settleMs);
            const title = await page.title();
            const text = (await page.evaluate(() => document.body?.innerText || '')).replace(/\s+/g, ' ');
            const hit = plat.test(title, text);
            if (hit) { matches.push({ platform: plat.name, matchedCandidate: u, url: plat.url(u).replace(/\/$/, ''), ...hit }); await page.close(); break; }
          } catch { /* sonraki aday */ }
          await page.close();
        }
      }
    } finally {
      await bctx.close(); await browser.close();
    }

    if (!matches.length) return { status: 'not_found', data: { tried: cands, platforms: PLATFORMS.map(p => p.name) } };
    return { status: 'found', data: { matches } };
  },
};
