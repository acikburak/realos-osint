// #13 Plex — holehe'de MODÜL YOK (megadose/holehe deposunda plex ucu bulunmuyor; teyit edildi).
// Plex için bilinen e-posta-varlığı yollarının TAMAMI kuralları çiğner:
//   • POST https://plex.tv/users/sign_in → giriş denemesi; parola/giriş gerektirir ve "yeni giriş denendi"
//     uyarısı tetikleyebilir (kural 1 + kural 2).
//   • plex.tv parola-sıfırlama → hedef kullanıcıya e-posta/bildirim gönderir (kural 2: bildirim riski).
//   • https://plex.tv/api/v2/user ... → X-Plex-Token (auth) gerektirir (kural 3).
// Bildirim göndermeyen, token/giriş istemeyen anonim bir uç yok → 'unknown'.
export default {
  name: 'plex',
  async run(/* email */) {
    return {
      status: 'unknown',
      error: 'bildirim riski / auth gerekir: Plex için anonim e-posta-varlığı ucu yok; mevcut yollar ya ' +
        'hedefe bildirim (parola sıfırlama / giriş uyarısı) gönderir ya da X-Plex-Token ister (kural 2/3).',
    };
  },
};
