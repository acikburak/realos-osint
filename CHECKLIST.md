# RealOS — E-posta OSINT Checklist

Kural: Her servis için önce yöntemi öğren → modülü yaz → `acikburak321@gmail.com` ile test et → sonucu buraya not et.
Durum: `[ ]` yapılmadı · `[~]` kısmen · `[x]` çalışıyor · `[-]` iptal/mümkün değil

Teknik kolonu: **API** = açık JSON uç noktası · **ENUM** = kayıt/giriş akışı "hesap var mı" farkı · **BROWSER** = Crawlee + Playwright gerekir · **AUTH** = oturum/çerez/anahtar gerekir
Bildirim: ⚠ = hedefe mail/bildirim gidebilir, kullanılmayacak yöntem

## Faz 1 — Yerel / açık API (token yok, en güvenilir)
| # | Servis | Teknik | Durum | Not |
|---|---|---|---|---|
| 1 | Email Pattern | yerel | [x] | test: kelime+rakam, ücretsiz sağlayıcı, kullanıcı adı adayları: acikburak321, acikburak |
| 2 | Email Service (MX) | DNS | [x] | test: Google (Gmail); SPF + DMARC da okunuyor |
| 3 | Gravatar | API | [x] | test: hesap yok (kontrol: gravatar@automattic.com bulundu) |
| 4 | GitHub | API | [x] | commit e-postasından bulundu: katılım 2024-06-23, 10 repo — Behind the Email ile birebir aynı |
| 5 | Proton Mail | API | [x] | test: yok (kontrol: support@proton.me → anahtar 2022-10-16) |
| 6 | Duolingo | API | [x] | test: hesap var, Google ile giriş, kullanıcı adı gizli — Behind the Email ile aynı |
| 7 | GitLab | API | [x] | e-posta araması 403; tam kullanıcı adıyla sorgu. test: adaylarda yok |
| 8 | Website | DNS/HTTP | [x] | özel alan→site başlığı, <user>.github.io. test: gmail ücretsiz, site yok |

## Faz 2 — Hesap varlığı (ENUM, holehe yöntemleri)
| # | Servis | Teknik | Durum | Not |
|---|---|---|---|---|
| 9 | Spotify | ENUM | [x] | kayıt doğrulama ucu, bildirim yok. test: hesap VAR |
| 10 | Replit | ENUM | [-] | Cloudflare bot koruması (403) — asilmiyor |
| 11 | Quora | ENUM | [-] | bot koruması/formkey (403) — asilmiyor |
| 12 | Pinterest | ENUM | [-] | CSRF/token duvarı (403) — asilmiyor |
| 13 | Adobe | ENUM | [x] | giris e-posta adimi, bildirim yok. test: hesap VAR (PASSWORD,MFA) |
| 14 | Microsoft | ENUM | [x] | GetCredentialType, bildirim yok. test: hesap VAR (IfExists=5) |
| 15 | Microsoft Teams | ENUM/AUTH | [-] | Teams user-search token ister (401) |
| 16 | Amazon | ENUM | [-] | CAPTCHA+bot korumasi+bildirim riski |
| 17 | X (Twitter) | ENUM | [x] | email_available ucu, token/bildirim yok. test: hesap YOK |
| 18 | Tumblr | ENUM | [-] | token+CSRF+bot korumasi — asilmiyor |
| 19 | WordPress | ENUM | [x] | auth-options ucu, bildirim yok. test: hesap YOK |
| 20 | Firefox | ENUM | [x] | account/status ucu, bildirim yok. test: hesap YOK |
| 21 | Patreon | ENUM | [-] | uc artik is_available donmuyor (ayrim yok) |
| 22 | Etsy | ENUM | [-] | DataDome+reCAPTCHA — asilmiyor |
| 23 | Codecademy | ENUM | [-] | register/validate CSRF token+cerez ister |
| 24 | Quizlet | ENUM | [-] | reCAPTCHA+token; temiz uc yok, reset bildirim gonderir |
| 25 | Plex | ENUM | [-] | anonim uc yok; reset/giris bildirimi veya X-Plex-Token ister |
| 26 | VSCO | ENUM | [-] | statik anahtar ucu 403; asilmiyor |
| 27 | Flickr | ENUM | [-] | migration ucu Cognito hatasi, fark yok |
| 28 | Pandora | ENUM | [-] | availability ucu yok; login/bildirim riski |
| 29 | Walmart | ENUM | [-] | Akamai/PerimeterX bot korumasi + bildirim riski |
| 30 | Dropbox | ENUM | [-] | register CSRF token+oturum+bildirim riski |

## Ek — Çapraz kontrol & iptal edilenler
| # | İş | Teknik | Durum | Not |
|---|---|---|---|---|
| X1 | Çapraz kontrol (username→profil) | API | [x] | adayları GitHub/GitLab/Duolingo açık profilinde arar; test: GitHub eşleşti |
| X2 | Telefon (maskeli kurtarma no) | — | [-] | İPTAL: hedefe bildirim gider + bot koruması aşmak gerekir. Kendi no: Google Hesabı→Güvenlik |

## Faz 4 — Sosyal medya & topluluk (kullanıcı listesi değerlendirmesi)
Çapraz kontrol = kullanıcı adıyla herkese açık profil (e-posta değil). ENUM = e-posta ile hesap varlığı.
| Platform | Yöntem | Durum | Not |
|---|---|---|---|
| Hacker News | çapraz (username) | [x] | açık Firebase API; eklendi |
| Bluesky | çapraz (username) | [x] | açık AT Protocol API; eklendi (<user>.bsky.social) |
| X (Twitter) | ENUM | [x] | Faz 2'de yapıldı (email_available) |
| Quora | ENUM | [-] | Faz 2: bot koruması 403 |
| Tumblr | ENUM | [-] | Faz 2: token+bot koruması |
| Pinterest | ENUM | [-] | Faz 2: CSRF/token 403 |
| Reddit | BROWSER | [ ] | about.json artık bot engelli; Faz 3 tarayıcı |
| YouTube | = Google | [ ] | Faz 3: Google/GHunt (oturum) |
| TikTok | çapraz (username, TARAYICI) | [x] | social.js; başlık "bulunamadı" ayrımı. test: @acikburak YOK |
| Pinterest (tarayıcı) | çapraz (username, TARAYICI) | [x] | social.js; "(user) - Profil" ayrımı. test: acikburak321 VAR ("Burak Acik") |
| Reddit (tekrar) | TARAYICI | [-] | headless'e "Prove your humanity" CAPTCHA; oturum/görünür pencere gerekir |
| Threads (tekrar) | AUTH | [-] | çıkışta login duvarı (/login'e yönlendirir) |
| Telegram | çapraz | [-] | GÜVENİLMEZ: var olan kullanıcı ile olmayan aynı "Contact @X" sayfası |
| LinkedIn | AUTH | [ ] | Faz 3: oturum |
| Instagram | çapraz (username, TARAYICI) | [x] | gerçek tarayıcıyla açık profil; başlık ayrımı. test: @acikburak VAR (Burak Açık, gizli, 241/258). E-posta kurtarma yöntemi İPTAL (bildirim) |
| Facebook | — | [-] | giriş/kurtarma bildirim gönderir; iptal |
| Discord | — | [-] | kayıt hCaptcha korumalı |
| Threads | AUTH | [ ] | Faz 3: Meta/Instagram oturumu |
| Twitch | AUTH | [-] | profil API'si OAuth token ister |
| Mastodon | — | [-] | instance bazlı, e-posta sorgusu yok |
| VK | — | [-] | CAPTCHA + kayıt koruması |
| 4chan | — | [-] | hesap yok (anonim) |
| Telegram | — | [-] | telefon tabanlı, e-posta yok |
| Snapchat | — | [-] | telefon tabanlı |
| WeChat/Weibo/Douyin/Bilibili/Zhihu | — | [-] | telefon tabanlı + ağır koruma (ÇİN) |

## Faz 5 — Geliştirici/oyun & diğer kategoriler (geniş liste)
| Platform | Yöntem | Durum | Not |
|---|---|---|---|
| Docker Hub | çapraz (username) | [x] | açık API; TEST: acikburak VAR (katılım 2026-02-23) |
| Hugging Face | çapraz (username) | [x] | açık API; TEST: acikburak VAR, isim "Burak AÇık", 1 model |
| Steam | çapraz | [-] | vanity→id için API anahtarı ister |
| Roblox | çapraz | [ ] | usernames/users POST; yanıt alınamadı, tekrar bakılacak |
| Bitbucket | çapraz | [-] | kullanıcı API'si kapatıldı (404) |
| Epic/PSN/Xbox | AUTH | [-] | oyuncu API'leri oturum/anahtar ister |
| Medium | çapraz (username) | [x] | RSS feed 200/404; eklendi. test: adaylarda yok |
| Substack | çapraz (username) | [x] | alt alan + son-URL guard; eklendi. test: adaylarda yok |
| Internet Archive | çapraz (username) | [x] | details/@user gövde-doğrulamalı; eklendi. test: adaylarda yok |
| Stack Overflow | çapraz | [-] | DOĞRULUK: yalnız isimle arama, çok kişi aynı adı taşır; eklenmedi |
| Blogger | çapraz | [ ] | eklenebilir, henüz yapılmadı |

## Ek kontroller & altyapı (KİŞİ değil, ALAN ADI/IP ekseni)
Not: Bunlar kişisel e-posta için değil, KURUMSAL alan adı (ör. ad@firma.com) zenginleştirmesi için.
| Kaynak | Ne verir | Durum | Not |
|---|---|---|---|
| crt.sh | alan adının TLS sertifikaları/alt alanlar | [x] | Website'e eklendi (yalnız özel alan). NOT: crt.sh zaman zaman 502 verir, 1 retry var |
| RDAP/ICANN | alan adı tescil kaydı | [x] | Website'e eklendi; registrar+oluşturma+ns. UA 'realos-cli' gerekti |
| DNSDumpster/SecurityTrails | DNS/altyapı | [-] | anahtar/oturum ister |
| Shodan/Censys | IP/servis taraması | [-] | API anahtarı ister (kişi OSINT değil) |
| VirusTotal/urlscan | URL/dosya itibarı | [-] | API anahtarı; kişi OSINT değil |
| Have I Been Pwned | e-posta sızıntı kaydı | [-] | e-posta sorgusu ÜCRETLİ anahtar ister |
| Arama motorları (Google/Bing/DDG/Brave/Mojeek/SearXNG) | web'de dize arama | [ ] | ayrı yetenek; DDG/SearXNG otomasyona uygun |
| OpenStreetMap/Wikidata/GLEIF/NASA FIRMS/Copernicus | coğrafi/kurumsal açık veri | [-] | tipik personel OSINT'i için ilgisiz |

## Faz 6 — Sherlock kuralları (ajanlarla doğrulandı 2026-11-13, sherlock.js motoru)
ÇALIŞIR = bugün var/yok ayrımı doğrulandı (19/19 gerçek+sahte hesapla test GEÇTİ).
| Durum | Siteler |
|---|---|
| [x] ÇALIŞIR (19) | youtube, twitch, snapchat, soundcloud, vimeo, flickr, vk, patreon, behance, dribbble, allmylinks, blogger, goodreads, keybase, hackerrank, linktree, trello, gitea, codewars |
| [-] BOT-KORUMALI (10) | tumblr, last.fm, deviantart, npm, wordpress, letterboxd, lichess, kaggle(reCAPTCHA), leetcode, producthunt(Cloudflare) — curl'e kapalı; tarayıcı ile 2. tur denenebilir |
| [-] ESKİ/GÜVENİLMEZ (2) | pypi (urlProbe herkese 404), telegram (kişisel hesapta false-negative, sadece kanal/bot) |
| [?] TEST EDİLEMEDİ (1) | wattpad (bu ortamdan TLS/bağlantı hatası, bot değil) |
| NOT | vk: Sherlock'un response_url kuralı eski → status_code'a çevrildi |
| BULGU | youtube @acikburak = VAR (kanal "Burak AÇIK") |

## Faz 7 — Sızıntı & aggregatör (2026-11-13)
| Modül | Kaynak | Durum | Not |
|---|---|---|---|
| breach | XposedOrNot açık API | [x] | anahtarsız; test: senin=temiz, test@example.com=215 sızıntı Critical. HIBP ücretli muadili |
| links | aggregatör link üreteci | [x] | Behind the Email/Epieos/That'sThem/IDCrawl/HIBP/WhatsMyName... ELLE açılır; kazıma YOK (ToS/CAPTCHA) |

## Faz 8 — Çoklu-giriş + pivot (2026-11-13)
| Özellik | Durum | Not |
|---|---|---|
| Girdi: e-posta | [x] | tüm modüller + pivot |
| Girdi: kullanıcı adı | [x] | username modülleri doğrudan çalışır (test: acikburak → YouTube/GitHub/Docker/HF) |
| Girdi: isim | [x] | "Burak Açık" → kullanıcı adı adayları türetir. DİKKAT: isim-arama gürültülü, avatar/isimle elle doğrulanmalı |
| Girdi: telefon | [x] | biçim/ülke analizi (TR cep tespiti). Hesap sorgusu YOK (bildirim riski) → links ile elle |
| Pivot | [x] | faz1'de bulunan kullanıcı adı (ör. GitHub) faz2 username modüllerine beslenir |
| src/identify.js | [x] | detectType + buildContext + usernamesFromName/Email |

## Faz 9 — Raporlama (2026-11-13)
| Format | Durum | Kullanım |
|---|---|---|
| JSON (web beslemesi) | [x] | --out=rapor.json · birleşik profil + ham sonuçlar |
| CSV (düz hesap tablosu) | [x] | --out=rapor.csv · tekilleştirilmiş |
| Markdown (okunur rapor) | [x] | --out=rapor.md |
| Birleşik profil | [x] | isim/kullanıcı adı/hesap/sızıntı özeti; url'ye göre tekilleştirme |
| src/report.js | [x] | flattenAccounts + unifiedProfile + render |

## Faz 3 — Zor / oturum gerektiren
| # | Servis | Teknik | Durum | Not |
|---|---|---|---|---|
| 31 | Google | AUTH | [ ] | GHunt yöntemi oturum çerezi ister |
| 32 | LinkedIn | AUTH | [ ] | |
| 33 | TikTok | BROWSER | [ ] | |
| 34 | Data Breach | yerel DB | [ ] | HIBP ücretli anahtar ister; alternatif değerlendirilecek |
