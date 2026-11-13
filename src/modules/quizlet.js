// #12 Quizlet — holehe'de MODÜL YOK (megadose/holehe deposunda quizlet ucu bulunmuyor; teyit edildi).
// Quizlet kayıt/giriş akışı Google reCAPTCHA + bot koruması ve JWT/CSRF token ardında çalışır.
// E-posta varlığını sızdıran temiz, anonim, herkese açık bir uç tespit edilemedi:
//   • Kayıt doğrulama akışı CAPTCHA + token ister (kural 3).
//   • Parola-sıfırlama hedef kullanıcıya e-posta gönderir (kural 2: bildirim riski).
// Bu yüzden rastgele/var-olan e-posta arasında güvenli şekilde FARK gözlemlenemez → 'unknown'.
export default {
  name: 'quizlet',
  async run(/* email */) {
    return {
      status: 'unknown',
      error: 'auth/captcha gerekir: Quizlet kayıt akışı reCAPTCHA + token korumalı; temiz anonim ' +
        'e-posta-varlığı ucu yok, parola-sıfırlama ise hedefe bildirim gönderir (kural 2/3).',
    };
  },
};
