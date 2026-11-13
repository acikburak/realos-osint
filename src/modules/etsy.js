// Etsy — holehe'de modülü YOK (megadose/holehe içinde etsy.py bulunmuyor).
// DOĞRULAMA (curl, 2026-11): https://www.etsy.com/join dahil tüm hesap uçları DataDome bot koruması arkasında:
//   HTTP 403 Forbidden · Server: DataDome · X-DataDome: protected · riskscore ~0.96.
// Herkese açık bir e-posta "var/yok" (enumeration) ucu yok; kayıt/giriş akışı reCAPTCHA + DataDome istiyor.
// DEĞİŞMEZ KURAL #3 (CAPTCHA/bot koruması aşma) gereği => 'unknown'.
export default {
  name: 'etsy',
  async run(/* email */) {
    return {
      status: 'unknown',
      error: 'auth/captcha gerekir: tüm Etsy hesap uçları DataDome + reCAPTCHA arkasında (403), herkese açık enumeration ucu yok',
    };
  },
};
