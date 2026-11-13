// #? Quora — kayıt formunun e-posta "validate" ucu. Hedefe BİLDİRİM GİTMEZ (sadece "bu mail kayıtlı mı").
// Yöntem: önce fr.quora.com sayfasından formkey+revision çekilir, sonra server_call_POST'a validate isteği atılır;
// yanıtta "Un compte a" (hesap var) aranır. ANCAK bugün fr.quora.com bot-koruması arkasında HTTP 403 döndürüyor:
// formkey/revision alınamıyor, ayrıca holehe'deki __hmac sabiti artık geçersiz. Kural 3 -> 'unknown' (auth/captcha gerekir).
export default {
  name: 'quora',
  async run(email) {
    const base = 'https://fr.quora.com';
    let page;
    try {
      page = await fetch(base, { headers: { Accept: 'text/html,application/xhtml+xml' } });
    } catch (e) {
      return { status: 'error', error: String(e) };
    }
    if (!page.ok) {
      return { status: 'unknown', error: `HTTP ${page.status} — bot-koruması; formkey alınamadı (auth/captcha gerekir)` };
    }
    const html = await page.text();
    const formkey = html.split('formkey": "')[1]?.split('"')[0];
    const revision = html.split('revision": "')[1]?.split('"')[0];
    if (!formkey) {
      return { status: 'unknown', error: 'formkey bulunamadı — bot-koruması (auth/captcha gerekir)' };
    }
    const body = new URLSearchParams({
      json: JSON.stringify({ args: [], kwargs: { value: email } }),
      formkey,
      __method: 'validate',
    });
    let resp;
    try {
      resp = await fetch(`${base}/webnode2/server_call_POST`, {
        method: 'POST',
        headers: {
          Accept: 'application/json, text/javascript, */*; q=0.01',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          Origin: base,
        },
        body: body.toString(),
      });
    } catch (e) {
      return { status: 'error', error: String(e) };
    }
    if (!resp.ok) {
      return { status: 'unknown', error: `HTTP ${resp.status} — validate reddedildi (auth/captcha gerekir)`, data: { revision } };
    }
    const txt = await resp.text();
    // "Un compte a (été créé...)" = hesap VAR
    if (txt.includes('Un compte a')) return { status: 'found', data: { note: 'bu e-postayla kayıtlı Quora hesabı var' } };
    if (txt.length > 0) return { status: 'not_found' };
    return { status: 'unknown', error: 'boş yanıt (auth/captcha gerekir)' };
  },
};
