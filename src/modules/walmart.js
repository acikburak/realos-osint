// #? Walmart — kayıt/hesap akışı Akamai/PerimeterX bot koruması arkasında.
// DOĞRULAMA (curl, realos-cli UA, spoof YOK):
//   GET https://www.walmart.com/account/api/customer  -> HTTP 307 (bot/edge yönlendirmesi, gövde yok)
//   GET https://www.walmart.com/account/signup        -> HTTP 307 text/plain (sensör/challenge'a yönlendirme)
// E-posta varlık adımına ilerlemek geçerli PX sensör token'ı + oturum çerezi + büyük olasılıkla CAPTCHA ister;
// signup akışında doğrulama e-postası = hedefe bildirim riski.
// => KURAL 2+3 gereği: bot koruması aşılmaz, bildirim riski var -> DAİMA 'unknown'.
// acikburak321@gmail.com için de yöntem uygulanmaz -> unknown.
export default {
  name: 'walmart',
  async run(email) {
    // Zararsız teyit probu: ucun bot koruması/307 verdiğini göster; forma/akışa VERİ GÖNDERME.
    const url = 'https://www.walmart.com/account/api/customer';
    let httpStatus = null;
    try {
      const r = await fetch(url, {
        method: 'GET',
        redirect: 'manual',
        headers: { 'User-Agent': 'realos-cli' },
      });
      httpStatus = r.status; // gözlemde 307 = edge/bot yönlendirmesi
    } catch (e) {
      return { status: 'unknown', error: `auth/captcha gerekir (istek hatası: ${String(e)})` };
    }
    return {
      status: 'unknown',
      error: 'auth/captcha gerekir',
      data: {
        note: 'Walmart hesap/kayıt uçları Akamai/PerimeterX ile korumalı (307/sensör); ilerlemek token+çerez+CAPTCHA ve bildirim riski taşır',
        httpStatus,
      },
    };
  },
};
