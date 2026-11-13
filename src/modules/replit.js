// #? Replit — kayıt formunun e-posta kontrolü: POST /data/user/exists  {"email":"..."} -> {"exists": true/false}
// Bu uç hesaba BİLDİRİM GÖNDERMEZ. ANCAK replit.com Cloudflare bot-koruması arkasında:
// hem test hem var-olmayan e-posta için HTTP 403 "Sorry, you have been blocked" döndü (fark yok).
// Kural 3 gereği yöntem güvenilmez -> 'unknown' (auth/captcha gerekir). Uç çalışırsa found/not_found döner.
export default {
  name: 'replit',
  async run(email) {
    const url = 'https://replit.com/data/user/exists';
    let r;
    try {
      r = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'content-type': 'application/json',
          'x-requested-with': 'XMLHttpRequest',
          Origin: 'https://replit.com',
        },
        body: JSON.stringify({ email }),
      });
    } catch (e) {
      return { status: 'error', error: String(e) };
    }
    // Cloudflare bot-koruması: 403 (ve çoğu 5xx) = engellendi, ayırt edilemez
    if (r.status === 403 || r.status === 429 || r.status >= 500) {
      return { status: 'unknown', error: `HTTP ${r.status} — Cloudflare bot-koruması; auth/captcha gerekir` };
    }
    let d;
    try {
      d = await r.json();
    } catch {
      return { status: 'unknown', error: `HTTP ${r.status} (Cloudflare/JSON değil) — auth/captcha gerekir` };
    }
    if (typeof d.exists === 'boolean') {
      return d.exists
        ? { status: 'found', data: { note: 'bu e-postayla kayıtlı Replit hesabı var' } }
        : { status: 'not_found' };
    }
    return { status: 'unknown', data: { raw: d } };
  },
};
