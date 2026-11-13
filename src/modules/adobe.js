// #? Adobe — oturum-açma formunun e-posta adımı (authenticationstate). HESABA BİLDİRİM GİTMEZ.
// Sadece "bu e-posta kayıtlı mı" adımı kullanılır; şifre-kurtarma/challenge adımına GİDİLMEZ (bildirim riski yok).
// HTTP 200 + body'de errorCode YOK (requiredActions/id var) = hesap VAR
// HTTP 401 + {"errorCode":"invalid_authentication","errorMessage":"Could not find account..."} = hesap YOK
// 429/diğer = unknown (rate-limit). Doğrulandı: acikburak321@gmail.com -> found, var-olmayan -> not_found.
export default {
  name: 'adobe',
  async run(email) {
    const url = 'https://auth.services.adobe.com/signin/v1/authenticationstate';
    let r;
    try {
      r = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json, text/plain, */*',
          'X-IMS-CLIENTID': 'adobedotcom2',
          'Content-Type': 'application/json;charset=utf-8',
          Origin: 'https://auth.services.adobe.com',
        },
        body: JSON.stringify({ username: email, accountType: 'individual' }),
      });
    } catch (e) {
      return { status: 'error', error: String(e) };
    }
    if (r.status === 429) return { status: 'unknown', error: 'HTTP 429 (rate-limit) — sonra tekrar deneyin' };

    let d;
    try {
      d = await r.json();
    } catch {
      return { status: 'unknown', error: `HTTP ${r.status} (JSON değil)` };
    }

    // Hesap yok: errorCode = invalid_authentication (genelde HTTP 401)
    if (d && d.errorCode) {
      if (d.errorCode === 'invalid_authentication') return { status: 'not_found' };
      return { status: 'unknown', data: { errorCode: d.errorCode } };
    }
    // Hesap var: 200 + geçerli auth-state (errorCode yok)
    if (r.ok && d && (d.requiredActions || d.id)) {
      return { status: 'found', data: { note: 'bu e-postayla kayıtlı Adobe hesabı var', requiredActions: d.requiredActions } };
    }
    return { status: 'unknown', data: { httpStatus: r.status } };
  },
};
