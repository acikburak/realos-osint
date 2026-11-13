// #? Twitter / X — kayıt formunun e-posta müsaitlik ucu: api.twitter.com/i/users/email_available.json
// Hesap sahibine BİLDİRİM GİTMEZ (sadece "bu mail kayıtlı mı"). Oturum/token GEREKMEZ (HTTP 200).
//   taken:true  = e-posta başka bir hesaba ait  -> hesap VAR
//   taken:false & valid:true = müsait           -> hesap YOK
// Doğrulama (curl): test@gmail.com -> taken:true (var) · rastgele -> taken:false (yok). Fark NET.
export default {
  name: 'twitter',
  async run(email) {
    const url = `https://api.twitter.com/i/users/email_available.json?email=${encodeURIComponent(email)}`;
    let r;
    try {
      r = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'realos-cli' } });
    } catch (e) {
      return { status: 'error', error: String(e) };
    }
    if (!r.ok) return { status: 'unknown', error: `HTTP ${r.status}` };
    const d = await r.json();
    if (d.taken === true) {
      return { status: 'found', data: { note: 'bu e-posta bir X/Twitter hesabına bağlı', msg: d.msg } };
    }
    if (d.taken === false && d.valid === true) return { status: 'not_found' };
    return { status: 'unknown', data: { valid: d.valid, taken: d.taken, msg: d.msg } };
  },
};
