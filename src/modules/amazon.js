// #? Amazon — kayıt/giriş akışı (ap/signin, ap/register) e-posta varlığını password adımına geçerek sızdırabilir,
// ANCAK bu akış bot korumalı: dinamik form token'ları (appActionToken, metadata1) + CAPTCHA + 503 ister,
// ve e-posta gönderimi aşamasına ilerlemek hedefe bildirim riski taşır.
// Doğrulama (curl): /ap/signin -> HTTP 503 · signin landing sayfası "automated access" (bot) uyarısı veriyor.
// DEĞİŞMEZ KURAL 2+3 gereği: CAPTCHA/bot koruması aşılmaz, bildirim riski var -> daima 'unknown'.
export default {
  name: 'amazon',
  async run(email) {
    // Zararsız teyit probu: giriş ucunun bot koruması/503 verdiğini göster, forma veri GÖNDERME.
    const url = 'https://www.amazon.com/ap/signin';
    let httpStatus = null;
    try {
      const r = await fetch(url, { method: 'GET', headers: { 'User-Agent': 'realos-cli' } });
      httpStatus = r.status;
    } catch (e) {
      return { status: 'unknown', error: `auth/captcha gerekir (istek hatası: ${String(e)})` };
    }
    return {
      status: 'unknown',
      error: 'auth/captcha gerekir',
      data: {
        note: 'Amazon giriş/kayıt akışı CAPTCHA + dinamik form token ile korumalı (503/bot sayfası) ve ilerlemek bildirim riski taşır',
        httpStatus,
      },
    };
  },
};
