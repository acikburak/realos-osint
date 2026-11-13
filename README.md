# RealOS — Çoklu-Giriş Dijital Ayak İzi OSINT Aracı

Yerel, CLI tabanlı OSINT aracı. Bir **e-posta / kullanıcı adı / telefon / isim** girdisinden, o kimliğe bağlı herkese açık hesapları, veri sızıntılarını ve profil bilgilerini çıkarır. Behind the Email'in self-hosted, kurallı muadili.

---

## 1. Amaç / İlke (DEĞİŞMEZ)
Bir personelin/kimliğin dijital ayak izini **yalnızca herkese açık kaynaklardan** çıkarmak (maruziyet denetimi, öz-denetim, yetkili güvenlik incelemesi).

**Tasarımın değişmez kuralları — yeni modül eklerken korunacak:**
1. **Sadece herkese açık veri.** Kapalı/korumalı alan kırılmaz.
2. **Hedefe bildirim YOK.** Şifre sıfırlama/kurtarma gibi hedefe mail/SMS gönderen yöntem kullanılmaz.
3. **Bot koruması aşılmaz.** CAPTCHA çözme, oturum/çerez çalma, sahte token/başlık yok.
4. **Tamamen yerel.** Veri bu makinede kalır; dışarı sadece sorgular çıkar.
5. **KVKK.** Yalnızca yetkili olunan kimlikler için.

---

## 2. Kurulum
```bash
npm install                      # bağımlılıklar (sadece playwright)
npx playwright install chromium  # tarayıcı modülleri için (social.js)
```
Gereken: Node 18+ (global `fetch`). Test: Node 26'da çalışır.

## 3. Kullanım
```bash
node src/cli.js <girdi> [--only=modul1,modul2] [--json] [--out=dosya.json|csv|md]

node src/cli.js acikburak321@gmail.com         # e-posta (tüm modüller + pivot)
node src/cli.js acikburak                        # kullanıcı adı
node src/cli.js "Burak Açık"                      # isim -> kullanıcı adı adayları (GÜRÜLTÜLÜ)
node src/cli.js +905551112233                     # telefon (biçim/ülke analizi)
node src/cli.js acikburak321@gmail.com --out=rapor.json   # web beslemesi
```
Çıktı: ✔ bulundu · ✘ yok · ? belirsiz(bot/koruma) · ℹ bilgi

---

## 4. Mimari
```
src/
  cli.js          # giriş noktası: tür tespiti, dağıtım, PİVOT, rapor
  identify.js     # detectType + buildContext + usernamesFromEmail/Name
  report.js       # JSON/CSV/Markdown + birleşik profil + güven etiketi
  fetch-url.js    # tek URL'yi gerçek tarayıcıyla getirme (yardımcı CLI)
  browser/fetch.js# Playwright sarmalayıcı (headless/headful, kalıcı profil)
  modules/
    index.js      # modül kaydı + sınıflama (USERNAME_MODULES / PHONE_MODULES)
    *.js          # her modül: { name, run(primary, ctx) -> {status, data?} }
```
**Modül sözleşmesi:** `export default { name, async run(primary, ctx) }`, dönüş `{ status: 'found'|'not_found'|'info'|'unknown'|'error', data?, error? }`.
`ctx = { input, type, email, usernames[], phones[], names[] }`. E-posta modülleri `primary`(=email) kullanır; kullanıcı-adı modülleri `ctx.usernames` kullanır.

**Pivot:** Faz 1 (e-posta/sızıntı modülleri) çalışır → bulunan kullanıcı adları (ör. GitHub) `ctx.usernames`'e eklenir → Faz 2 (kullanıcı-adı modülleri) zenginleştirilmiş adaylarla çalışır.

---

## 5. Modül envanteri (durum)

### E-posta ile — ÇALIŞIR (teyitli, gerçek+sahte kontrol)
- **pattern** (biçim analizi), **mx** (sağlayıcı/SPF/DMARC), **github** (commit e-postası), **spotify**, **microsoft** (GetCredentialType), **adobe**, **duolingo**, **breach** (XposedOrNot sızıntı)
- "yok" diyen çalışanlar: **gravatar, proton, firefox, wordpress, twitter, gitlab, website**

### Kullanıcı adı ile — ÇALIŞIR
- **crosscheck**: GitHub, GitLab, Duolingo, HackerNews, Bluesky, Docker Hub, Hugging Face, Medium, Substack, Internet Archive
- **sherlock**: 19 doğrulanmış site (youtube, twitch, snapchat, soundcloud, vimeo, flickr, vk, patreon, behance, dribbble, allmylinks, blogger, goodreads, keybase, hackerrank, linktree, trello, gitea, codewars)
- **social** (gerçek tarayıcı): Instagram, Pinterest, TikTok

### Yardımcı
- **links**: Behind the Email/Epieos/HIBP/WhatsMyName... için ELLE açılacak linkler (kazıma yok)
- **phone**: biçim/ülke/hat analizi (hesap sorgusu YOK — bildirim riski)

### DEVRE DIŞI (ilke/teknik) — `CHECKLIST.md`'de gerekçeli
- Bot-korumalı: msteams, amazon, replit, pinterest(email), quora, tumblr, etsy, vsco, codecademy, quizlet, plex, flickr(email), pandora, walmart, dropbox, npm, lichess, kaggle, leetcode, producthunt, last.fm, deviantart, wordpress(username), letterboxd
- İş siteleri (LinkedIn/Indeed/Fiverr vb.): kayıt-doğrulama ucu yok veya bildirim riski → EKLENMEDİ

---

## 6. Güven seviyeleri (ÖNEMLİ — doğruluk)
Raporda her hesap etiketli:
- **e-posta (kesin):** adrese doğrudan bağlı (github-commit, spotify, microsoft, breach...)
- **kullanıcı adı (teyit gerek):** handle tahminiyle bulundu; aynı isimli BAŞKASI olabilir → avatar/isim ile elle doğrula.

İsim girişi "aday üretici"dir, gürültülüdür — sonuçlar kesin değildir.

---

## 7. Rapor / Entegrasyon (web sitesi)
```bash
node src/cli.js <girdi> --out=rapor.json   # ÖNERİLEN web beslemesi
```
JSON şeması:
```json
{
  "profil": {
    "girdi","tür","isimler":[],"kullaniciAdlari":[],
    "hesapSayisi","kesinSayisi","teyitGerekSayisi",
    "platformlar":[], "sizinti": {"adet","risk","skor"} | null,
    "hesaplar": [ {"güven","platform","kullaniciAdi","isim","url","detay"} ]
  },
  "hamSonuclar": [ ...her modülün tam çıktısı... ]
}
```
Sitede: `profil.hesaplar`'ı tabloya (güven sütununa göre renklendir), `profil.sizinti`'yi uyarı rozetine. CSV = düz tablo (Excel), MD = okunur rapor.

---

## 8. Bekleyen işler (sonraki ajan için)
- **Faz 3 — GHunt/Google (e-posta ile YouTube/Maps/Photos):** Oturum çerezi gerektirir. `src/browser/fetch.js` içinde `profileDir` (kalıcı profil) desteği hazır. Karar bekleyen: hangi Google hesabı (burner önerilir). Şifre kullanıcıdan, araç sadece oturumu kullanır.
- **Bot-korumalı siteler 2. tur:** Bazıları (Steam, tumblr, last.fm) `social.js` tarzı gerçek tarayıcıyla denenebilir. Steam: `steamcommunity.com/id/{vanity}`, ayrım "could not be found" metni.
- **WhatsMyName (~640 site):** açık JSON kural listesi → `sherlock.js` motoruna beslenebilir (kuralları doğrulayarak).
- **Doğruluk:** Kullanıcının gerçek hesap listesiyle (ground-truth) karşılaştırma yapılmadı; yapılmalı.
- **Kalıcılık:** Arama geçmişi için SQLite eklenebilir (şu an her çalıştırma anlık).

## 9. Referans dosyalar
- `CHECKLIST.md` — her kaynağın durumu + gerekçesi (tam kayıt)
- `SHERLOCK-EKSIK.txt` — Sherlock'un kapsayıp bizde olmayan ~467 site
- `src/modules/_TEMPLATE.md` — yeni modül sözleşmesi + kurallar

## 10. Güvenlik notu
Bu araç yalnızca yetkili maruziyet denetimi / öz-denetim içindir. Üçüncü şahısları rızası olmadan profillemek KVKK'ya ve ilkelere aykırıdır. Bildirim gönderen veya koruma aşan yöntemler bilinçli olarak dışarıda bırakılmıştır.
