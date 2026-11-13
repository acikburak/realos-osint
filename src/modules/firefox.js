// Firefox = Mozilla accounts — resmi hesap durumu ucu. Kayıt/giriş AKIŞI DEĞİL, sadece "bu mail kayıtlı mı".
// Hedefe BİLDİRİM GİTMEZ (şifre sıfırlama/giriş uyarısı tetiklemez). holehe ref: modules/software/firefox.py
// Uç: POST https://api.accounts.firefox.com/v1/account/status  body {"email":...}  -> {"exists":true|false}
// Doğrulandı (curl): matt tarzı var-olan hesap exists:true · var-olmayan exists:false — net ayrım.
export default {
  name: 'firefox',
  async run(email) {
    const url = 'https://api.accounts.firefox.com/v1/account/status';
    let r;
    try {
      r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': 'realos-cli' },
        body: JSON.stringify({ email }),
      });
    } catch (e) {
      return { status: 'error', error: String(e) };
    }
    if (!r.ok) return { status: 'unknown', error: `HTTP ${r.status}` };
    let d;
    try { d = await r.json(); } catch { return { status: 'unknown', error: 'JSON parse edilemedi' }; }
    if (d.exists === true) return { status: 'found', data: { note: 'bu e-postayla kayıtlı Mozilla/Firefox hesabı var' } };
    if (d.exists === false) return { status: 'not_found' };
    return { status: 'unknown', data: { raw: d } };
  },
};
