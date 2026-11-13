// #11 Codecademy — holehe yöntemi: POST /register/validate, yanıtta "is already taken" → hesap VAR.
// AMA bu uç İKİ AŞAMALI EL SIKIŞMA ister: önce GET https://www.codecademy.com/register ile sayfadan
// <meta name="csrf-token"> değeri VE sunucunun verdiği oturum çerezi alınır; sonra POST /register/validate
// bu çerez + X-CSRF-Token çifti ile yapılır. (Public sayfadan alınır, giriş gerektirmez — ama yine de
// oturum-çerez-token çiftidir ve holehe bunu "frequent_rate_limit" olarak işaretler.)
//
// DEĞİŞMEZ KURAL 3: oturum/çerez/token gerektiren yöntem KULLANILMAZ → bu modül bilerek 'unknown' döner.
// (Yöntem hedefe bildirim GÖNDERMEZ; tek engel kural 3. İstersen el sıkışmayı uygulayıp açabilirsin.)
// Kaynak: github.com/megadose/holehe → holehe/modules/programing/codecademy.py
export default {
  name: 'codecademy',
  async run(/* email */) {
    return {
      status: 'unknown',
      error: 'auth/token gerekir: /register/validate ucu CSRF token + oturum çerezi el sıkışması ister (kural 3). ' +
        'Yöntem hedefe bildirim göndermez, sadece token gerektirdiği için devre dışı.',
    };
  },
};
