// #8 Website — e-postaya bağlı herkese açık siteyi bulur.
// İki yol:
//  (a) Kurumsal/özel alan (gmail vb. değilse): http(s)://domain ana sayfasının başlığını çeker → kurum sitesi.
//  (b) Kişisel site kalıbı: <kullanıcıadı>.github.io gibi barındırma sayfaları.
const FREE = new Set(['gmail.com','googlemail.com','outlook.com','hotmail.com','live.com','msn.com',
  'yahoo.com','icloud.com','me.com','proton.me','protonmail.com','yandex.com','gmx.com','mail.com','aol.com','zoho.com']);

async function title(url) {
  try {
    const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(8000) });
    if (!r.ok) return null;
    const html = await r.text();
    return { url: r.url, status: r.status, title: html.match(/<title[^>]*>([^<]{0,120})/i)?.[1]?.trim() || null };
  } catch { return null; }
}

export default {
  name: 'website',
  async run(email) {
    const [local, domain] = email.split('@');
    const base = local.split('+')[0];
    const letters = base.replace(/\d+$/, '');
    const found = [];

    // (a) özel alan adıysa kurum sitesi
    if (!FREE.has(domain)) {
      for (const u of [`https://${domain}`, `https://www.${domain}`]) {
        const t = await title(u);
        if (t) { found.push({ type: 'alan adı sitesi', ...t }); break; }
      }
    }
    // (b) kişisel barındırma kalıpları
    for (const host of [`https://${letters}.github.io`, `https://${base}.github.io`]) {
      const t = await title(host);
      if (t) found.push({ type: 'kişisel sayfa', ...t });
    }

    // Özel alan adı zenginleştirmesi (ücretsiz sağlayıcıda anlamsız): tescil kaydı + sertifika/alt alanlar
    let registration = null, subdomains = null;
    if (!FREE.has(domain)) {
      [registration, subdomains] = await Promise.all([rdap(domain), crtsh(domain)]);
    }

    if (!found.length && !registration && !subdomains)
      return { status: 'not_found', data: { domain, note: FREE.has(domain) ? 'ücretsiz sağlayıcı — alan adından site çıkmaz' : 'site bulunamadı' } };
    return { status: 'found', data: { sites: found, registration, subdomains } };
  },
};

// RDAP — alan adı tescil kaydı (açık, anahtarsız). rdap.org yetkili sunucuya yönlendirir.
async function rdap(domain) {
  try {
    const r = await fetch(`https://rdap.org/domain/${domain}`, { redirect: 'follow', headers: { 'User-Agent': 'realos-cli', Accept: 'application/rdap+json' }, signal: AbortSignal.timeout(8000) });
    if (!r.ok) return null;
    const d = await r.json();
    const ev = Object.fromEntries((d.events ?? []).map(e => [e.eventAction, e.eventDate?.slice(0, 10)]));
    return {
      registrar: d.entities?.find(e => e.roles?.includes('registrar'))?.vcardArray?.[1]?.find(x => x[0] === 'fn')?.[3] ?? null,
      created: ev.registration ?? null,
      expires: ev.expiration ?? null,
      nameservers: (d.nameservers ?? []).map(n => n.ldhName?.toLowerCase()),
    };
  } catch { return null; }
}

// crt.sh — Sertifika Şeffaflığı kayıtlarından alt alan adları (açık, anahtarsız).
async function crtsh(domain) {
  try {
    // crt.sh zaman zaman 502 döner; bir kez yeniden dene.
    let r;
    for (let i = 0; i < 2; i++) {
      r = await fetch(`https://crt.sh/?q=${encodeURIComponent(domain)}&output=json`, { signal: AbortSignal.timeout(15000) });
      if (r.ok) break;
    }
    if (!r || !r.ok) return null;
    const rows = await r.json();
    const names = new Set();
    for (const row of rows) for (const n of (row.name_value ?? '').split('\n')) if (n && !n.startsWith('*')) names.add(n.toLowerCase());
    const list = [...names].slice(0, 40);
    return list.length ? { count: names.size, sample: list } : null;
  } catch { return null; }
}
