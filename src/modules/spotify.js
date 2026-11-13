// #9 Spotify — kayıt formunun e-posta doğrulama ucu. Hesap sahibine BİLDİRİM GİTMEZ (sadece "bu mail müsait mi").
// status 20 + "already registered" = hesap VAR · status 1 = müsait = hesap YOK · status 130 = geçersiz biçim
// Not: yanıttaki "country" isteği yapan IP'ye göredir, hedefe göre DEĞİL.
export default {
  name: 'spotify',
  async run(email) {
    const url = `https://spclient.wg.spotify.com/signup/public/v1/account?validate=1&email=${encodeURIComponent(email)}`;
    const r = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!r.ok) return { status: 'unknown', error: `HTTP ${r.status}` };
    const d = await r.json();
    if (d.status === 20) return { status: 'found', data: { note: 'bu e-postayla kayıtlı Spotify hesabı var', requestCountry: d.country } };
    if (d.status === 1) return { status: 'not_found' };
    if (d.status === 130) return { status: 'not_found', data: { note: 'geçersiz e-posta biçimi' } };
    return { status: 'unknown', data: { rawStatus: d.status } };
  },
};
