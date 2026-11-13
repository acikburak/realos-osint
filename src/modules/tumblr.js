// Tumblr — holehe ref: modules/social_media/tumblr.py (method=register).
// Bilinen uç: POST https://www.tumblr.com/api/v2/register/account/validate  (code 2 = kullanıcı zaten var).
// ANCAK bu uç çalışmak için (a) tumblr.com ana sayfasından tarayıcı taklidi (mobil UA) ile kazınan bir
// Bearer API_TOKEN ve (b) her istekte ayrı X-Csrf başlığı ister. Yani oturum/token + bot-koruması gerektirir.
// DEĞİŞMEZ KURAL #3 gereği (CAPTCHA/bot koruması aşma, token/oturum gerektiren yöntem kullanma) bu yöntemi
// uygulamıyoruz; harness de bu tarayıcı-taklidi isteğini "circumvention" olarak engelledi.
// Sonuç: 'unknown' — auth/token + bot koruması gerekir. Hedefe bildirim gitmese de kural gereği atlanır.
export default {
  name: 'tumblr',
  async run(/* email */) {
    return {
      status: 'unknown',
      error: 'auth/token gerekir: kazınan Bearer API_TOKEN + per-request X-Csrf (bot koruması) — kural #3 gereği atlandı',
    };
  },
};
