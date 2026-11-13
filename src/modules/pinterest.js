// #? Pinterest — kayıt formunun e-posta kontrolü: GET /_ngjs/resource/EmailExistsResource/get/
// resource_response.data truthy = hesap VAR · boş = hesap YOK · source_field = rate-limit. BİLDİRİM GÖNDERMEZ.
// ANCAK bugün uç CSRF/app-state token (x-app-version, csrftoken çerezi) istiyor: token'sız hem test hem
// var-olmayan e-posta için HTTP 403 "Invalid Resource Request" (fark yok). Kural 3 -> 'unknown' (auth/captcha gerekir).
export default {
  name: 'pinterest',
  async run(email) {
    const data = JSON.stringify({ options: { email }, context: {} });
    const url =
      'https://www.pinterest.com/_ngjs/resource/EmailExistsResource/get/?source_url=%2F&data=' +
      encodeURIComponent(data);
    let r;
    try {
      r = await fetch(url, {
        headers: {
          Accept: 'application/json, text/javascript, */*; q=0.01',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
    } catch (e) {
      return { status: 'error', error: String(e) };
    }
    // Token/app-state olmadan: 403 "Invalid Resource Request" (çerez/CSRF gerekir)
    if (r.status === 403 || r.status === 429 || r.status >= 500) {
      return { status: 'unknown', error: `HTTP ${r.status} — CSRF/app-state token gerekir (auth/captcha gerekir)` };
    }
    let j;
    try {
      j = await r.json();
    } catch {
      return { status: 'unknown', error: `HTTP ${r.status} (token gerekir / JSON değil)` };
    }
    const d = j?.resource_response?.data;
    if (d && String(d).includes('source_field')) {
      return { status: 'unknown', error: 'rate-limit (source_field)' };
    }
    if (d) return { status: 'found', data: { note: 'bu e-postayla kayıtlı Pinterest hesabı var' } };
    if (j?.resource_response) return { status: 'not_found' };
    return { status: 'unknown', data: { raw: j } };
  },
};
