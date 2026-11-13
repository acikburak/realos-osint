// #? Microsoft — login.microsoftonline.com GetCredentialType (pre-auth). Hesap sahibine BİLDİRİM GİTMEZ.
// Sadece "bu kimlik var mı" ayrımı yapar: IfExistsResult alanı.
//   IfExistsResult: 0 = hesap var (managed/AAD) · 5 = hesap var (tüketici MSA) · 6 = her ikisi · 1 = hesap YOK
// Doğrulama (curl): acikburak321@gmail.com -> IfExistsResult 5 (var) · rastgele -> IfExistsResult 1 (yok). Fark NET.
export default {
  name: 'microsoft',
  async run(email) {
    const url = 'https://login.microsoftonline.com/common/GetCredentialType';
    let r;
    try {
      r = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'realos-cli',
        },
        body: JSON.stringify({ username: email, isOtherIdpSupported: true }),
      });
    } catch (e) {
      return { status: 'error', error: String(e) };
    }
    if (!r.ok) return { status: 'unknown', error: `HTTP ${r.status}` };
    const d = await r.json();
    const v = d.IfExistsResult;
    if (v === 0 || v === 5 || v === 6) {
      return { status: 'found', data: { note: 'bu e-postayla kayıtlı Microsoft hesabı var', ifExistsResult: v } };
    }
    if (v === 1) return { status: 'not_found', data: { ifExistsResult: v } };
    return { status: 'unknown', data: { ifExistsResult: v } };
  },
};
