// WordPress.com — herkese açık auth-options ucu (giriş ekranının "bu mailin giriş yöntemleri" sorgusu).
// Hedefe BİLDİRİM GİTMEZ. holehe ref: modules/cms/wordpress.py
// Uç: GET https://public-api.wordpress.com/rest/v1.1/users/{email}/auth-options?http_envelope=1&locale=fr
// http_envelope=1 => gerçek durum HTTP 200 içinde {code, body} olarak sarılır.
//   body.email_verified === true            -> hesap VAR (found)
//   body.error "unknown_user"/"email_login_not_allowed" -> hesap YOK (not_found)
// Doğrulandı (curl): matt@wordpress.com -> email_verified:true · test/rastgele mail -> unknown_user. Net ayrım.
export default {
  name: 'wordpress',
  async run(email) {
    const url = `https://public-api.wordpress.com/rest/v1.1/users/${encodeURIComponent(email)}/auth-options?http_envelope=1&locale=fr`;
    let r;
    try {
      r = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'realos-cli' } });
    } catch (e) {
      return { status: 'error', error: String(e) };
    }
    let d;
    try { d = await r.json(); } catch { return { status: 'unknown', error: 'JSON parse edilemedi' }; }
    const body = d && d.body ? d.body : d; // http_envelope sarmalayıcısını aç
    if (body && body.email_verified === true) return { status: 'found', data: { note: 'bu e-postayla WordPress.com hesabı var' } };
    if (body && body.email_verified === false) return { status: 'not_found', data: { note: 'hesap var ama mail doğrulanmamış biçimde raporlandı' } };
    const err = body && body.error;
    if (err === 'unknown_user' || err === 'email_login_not_allowed') return { status: 'not_found' };
    return { status: 'unknown', data: { raw: body } };
  },
};
