// #? Dropbox — kayıt (register) akışındaki e-posta kontrolü CSRF token + oturum çerezi ister.
// DOĞRULAMA (curl, realos-cli UA, spoof YOK):
//   GET https://www.dropbox.com/register -> HTTP 200, gövdede CSRF "token" alanı mevcut.
//   Herhangi bir register/check POST'u bu token + oturum çerezi olmadan reddedilir; token sayfadan sökülüp
//   gönderilse bile bu oturum/token gerektiren bir yöntemdir.
// => KURAL 3 gereği: oturum/token gerektiren yöntem -> DAİMA 'unknown' (auth/token gerekir).
// Ayrıca register akışında e-posta gönderimi aşamasına ilerlemek hedefe bildirim riski taşır (KURAL 2).
// acikburak321@gmail.com için de yöntem uygulanmaz -> unknown.
export default {
  name: 'dropbox',
  async run(email) {
    // Zararsız teyit probu: register sayfasının CSRF token ile oturum-bağımlı olduğunu göster; POST YAPMA.
    const url = 'https://www.dropbox.com/register';
    let httpStatus = null;
    let tokenRequired = null;
    try {
      const r = await fetch(url, { method: 'GET', headers: { 'User-Agent': 'realos-cli' } });
      httpStatus = r.status;
      const body = await r.text();
      tokenRequired = /token/i.test(body); // gözlemde true = CSRF token var
    } catch (e) {
      return { status: 'unknown', error: `auth/token gerekir (istek hatası: ${String(e)})` };
    }
    return {
      status: 'unknown',
      error: 'auth/token gerekir',
      data: {
        note: 'Dropbox register e-posta kontrolü CSRF token + oturum çerezi ister; token/oturum gerektiren yöntem KURAL 3 ile yasak, ayrıca bildirim riski var',
        httpStatus,
        tokenRequired,
      },
    };
  },
};
