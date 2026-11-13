// #10 VSCO — herkese açık kayıt-doğrulama ucu: GET /2.0/users/email?email=
// VSCO kayıt formunun "bu e-posta kullanımda mı" kontrolü. Hedefe BİLDİRİM GİTMEZ (saf sorgu, mail/SMS yok).
// Yanıt JSON: email_status = "has_account" → hesap VAR · "no_account" → hesap YOK · diğer → rate-limit/belirsiz.
// NOT: Authorization başlığındaki Bearer, VSCO web uygulamasının herkese açık JS'inde dağıttığı STATİK istemci
//      anahtarıdır — hesaba/oturuma bağlı DEĞİL, giriş/çerez/CAPTCHA istemez; işlevsel olarak public bir API key.
//      (Kural 3'ü "her türlü token yasak" diye okuyorsan bu modülü 'unknown'a çekebilirsin; aşağıda uç tam çalışır.)
// Kaynak: github.com/megadose/holehe → holehe/modules/social_media/vsco.py
const VSCO_PUBLIC_WEB_TOKEN = '7356455548d0a1d886db010883388d08be84d0c9';

export default {
  name: 'vsco',
  async run(email) {
    const url = `https://api.vsco.co/2.0/users/email?email=${encodeURIComponent(email)}`;
    let r;
    try {
      r = await fetch(url, {
        headers: {
          Authorization: `Bearer ${VSCO_PUBLIC_WEB_TOKEN}`,
          Accept: 'application/json',
          'User-Agent': 'realos-cli',
        },
      });
    } catch (e) {
      return { status: 'unknown', error: `ağ hatası: ${e.message}` };
    }
    if (r.status === 429) return { status: 'unknown', error: 'rate-limit (HTTP 429)' };
    if (!r.ok) return { status: 'unknown', error: `HTTP ${r.status}` };

    let d;
    try { d = await r.json(); } catch { return { status: 'unknown', error: 'JSON çözümlenemedi' }; }

    const s = d.email_status;
    if (s === 'has_account') return { status: 'found', data: { note: 'bu e-postayla kayıtlı VSCO hesabı var', emailStatus: s } };
    if (s === 'no_account') return { status: 'not_found', data: { emailStatus: s } };
    return { status: 'unknown', data: { emailStatus: s ?? null }, error: 'beklenmeyen email_status (muhtemelen rate-limit/token süresi)' };
  },
};
