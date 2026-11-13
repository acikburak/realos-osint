// #? Pandora — herkese açık bir "e-posta müsait mi / hesap var mı" ucu YOK.
// Denenen aday uç: POST https://www.pandora.com/api/v1/auth/emailAvailability
//   DOĞRULAMA (curl): -> HTTP 404 {"message":"Service method not found","errorString":"INVALID_REQUEST"}  (böyle bir method yok).
// Tek enumerasyon vektörü auth/login hatalarının ayrımıdır (var-olmayan vs. yanlış şifre), ki bu:
//   - KURAL 1'i ihlal eder (login için şifre adımı gerekir) ve
//   - KURAL 2 kapsamında bildirim/"yeni giriş denemesi" + hesap kilitleme riski taşır.
// Signup akışı (account/sign-in -> HTTP 302) da oturum/çerez + register adımı ister.
// => KURAL 1+2 gereği DAİMA 'unknown' (bildirim riski). acikburak321@gmail.com için de yöntem uygulanmaz -> unknown.
export default {
  name: 'pandora',
  async run(email) {
    // Zararsız teyit probu: availability method'unun bulunmadığını göster; login/register'a VERİ GÖNDERME.
    const url = 'https://www.pandora.com/api/v1/auth/emailAvailability';
    let httpStatus = null;
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'realos-cli' },
        body: JSON.stringify({ email }),
      });
      httpStatus = r.status; // gözlemde 404 = böyle bir availability ucu yok
    } catch (e) {
      return { status: 'unknown', error: `bildirim riski — login gerekir (istek hatası: ${String(e)})` };
    }
    return {
      status: 'unknown',
      error: 'bildirim riski (login gerekir)',
      data: {
        note: 'Pandora\'da herkese açık availability ucu yok; enumerasyon yalnız login hata ayrımıyla olur ki bu şifre adımı + bildirim/kilitleme riski demektir',
        httpStatus,
      },
    };
  },
};
