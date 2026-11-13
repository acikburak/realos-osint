// #? Flickr — holehe referansı (megadose/holehe: medias/flickr.py) "migration" ucunu kullanır.
// Uç: GET https://identity-api.flickr.com/migration?email=<email>  (HESABA BİLDİRİM GİTMEZ — sadece hesap durumu sorgusu).
// holehe yorumu: JSON'da state_code === '5' = hesap VAR · aksi = hesap YOK.
// DOĞRULAMA (curl, realos-cli UA, header spoof YOK):
//   acikburak321@gmail.com -> {"stat":"fail","code":11,"message":"application error - cognito error"}
//   var-olmayan mail        -> {"stat":"fail","code":11,"message":"application error - cognito error"}
//   => İki yanıt AYNI; uç artık Cognito'ya taşınmış ve yalnız tarayıcı Origin/Referer spoof'u ile cevap veriyor.
//   KURAL 3 gereği bot/akış koruması aşılmaz; ayırt edici fark olmadığından sonuç 'unknown'.
// Not: Kod ileriye dönük olarak gerçek state_code mantığını da uygular; uç tekrar ayırt edici yanıt verirse
//      found/not_found döner. Bugün canlı sonuç 'unknown'.
export default {
  name: 'flickr',
  async run(email) {
    const url = `https://identity-api.flickr.com/migration?email=${encodeURIComponent(email)}`;
    let r;
    try {
      r = await fetch(url, { headers: { Accept: '*/*', 'User-Agent': 'realos-cli' } });
    } catch (e) {
      return { status: 'unknown', error: `istek hatası: ${String(e)}` };
    }
    let d;
    try {
      d = await r.json();
    } catch {
      return { status: 'unknown', error: `HTTP ${r.status} (JSON değil)` };
    }
    // Uç devre dışı / Cognito hatası: ayırt edici sinyal yok -> unknown
    if (d && (d.stat === 'fail' || d.code === 11)) {
      return {
        status: 'unknown',
        error: 'auth/akış koruması gerekir',
        data: { note: 'migration ucu Cognito hatası veriyor; gerçek ve var-olmayan mail için yanıt aynı (fark yok)', raw: d.message || d.code },
      };
    }
    if (d && String(d.state_code) === '5') {
      return { status: 'found', data: { note: 'bu e-postayla kayıtlı Flickr/Yahoo hesabı var (state_code 5)' } };
    }
    if (d && 'state_code' in d) {
      return { status: 'not_found', data: { stateCode: d.state_code } };
    }
    return { status: 'unknown', data: { httpStatus: r.status, raw: d } };
  },
};
