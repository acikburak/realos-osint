# Modül şablonu (hesap-varlığı / ENUM)

Her modül tek bir ES module dosyasıdır: `src/modules/<servis>.js`
Dönüş sözleşmesi: `{ status, data?, error? }`
  status: 'found' (hesap var) | 'not_found' (yok) | 'unknown' (belirsiz/engellendi) | 'error'

ÖRNEK (spotify.js — çalışan referans):

```js
export default {
  name: 'spotify',
  async run(email) {
    const url = `https://spclient.wg.spotify.com/signup/public/v1/account?validate=1&email=${encodeURIComponent(email)}`;
    const r = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!r.ok) return { status: 'unknown', error: `HTTP ${r.status}` };
    const d = await r.json();
    if (d.status === 20) return { status: 'found', data: { note: '...' } };
    if (d.status === 1) return { status: 'not_found' };
    return { status: 'unknown', data: { rawStatus: d.status } };
  },
};
```

Kurallar (DEĞİŞMEZ):
1. SADECE herkese açık / kayıt-doğrulama uçları. Giriş denemesi için gerçek şifre girme.
2. HEDEFE BİLDİRİM GİDEN yöntem YASAK: şifre sıfırlama maili, SMS, "giriş denendi" uyarısı tetikleyen hiçbir akış kullanma. Şüpheliyse o servisi `unknown` bırak ve raporda "bildirim riski" yaz.
3. CAPTCHA / bot koruması aşma, oturum-çerez-token gerektiren yöntem kullanma. Gerekiyorsa `unknown` ve raporda "auth/captcha gerekir" yaz.
4. Node 18+ global `fetch` kullan, ek paket yok. User-Agent gerekiyorsa 'realos-cli' gibi genel bir ad ver; e-posta adresini User-Agent'a KOYMA.
5. Doğrulama: modülü hem test e-postası hem de rastgele var-olmayan bir e-posta ile curl'leyip FARKI gör. Fark yoksa yöntem güvenilmez → `unknown`.
```
