// Patreon — holehe'nin kullandığı kayıt "e-posta müsait mi" ucu: POST /api/email/available
//   body {"data":{"attributes":{"email":...},"relationships":{}}}  ->  data.is_available (true=müsait=YOK)
// holehe ref: modules/social_media/patreon.py
// DOĞRULAMA (curl, 2026-11): uç artık HEM test HEM rastgele mail için AYNI 404 "Not Found" (code 1) dönüyor;
//   is_available alanı hiç gelmiyor => gerçek mail ile var-olmayan mail arasında FARK YOK => güvenilmez.
//   Bu yüzden ayrım yapılabildiği durumda sonuç verilir, aksi halde 'unknown'. Bildirim gönderilmez (giriş/sıfırlama yok).
export default {
  name: 'patreon',
  async run(email) {
    const url = 'https://www.patreon.com/api/email/available?json-api-version=1.0';
    let r;
    try {
      r = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.api+json',
          Accept: '*/*',
          Origin: 'https://www.patreon.com',
          Referer: 'https://www.patreon.com/signup',
          'User-Agent': 'realos-cli',
        },
        body: JSON.stringify({ data: { attributes: { email }, relationships: {} } }),
      });
    } catch (e) {
      return { status: 'error', error: String(e) };
    }
    let d;
    try { d = await r.json(); } catch { return { status: 'unknown', error: `yanıt JSON değil (HTTP ${r.status})` }; }
    const avail = d && d.data && d.data.is_available;
    if (avail === true) return { status: 'not_found' };          // mail müsait => hesap yok
    if (avail === false) return { status: 'found', data: { note: 'bu e-postayla Patreon hesabı var' } };
    // is_available yok => uç değişmiş/kaldırılmış, test & rastgele mail ayırt edilemiyor
    return { status: 'unknown', error: 'uç artık is_available dönmüyor (müsait/dolu ayrımı yok)', data: { raw: d } };
  },
};
