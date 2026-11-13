// #? Microsoft Teams — holehe'deki teams modülü: teams.microsoft.com .../externalsearchv3 (kullanıcı arama).
// SORUN: bu uç yetkili bir Skype/Bearer TOKEN ister (kimlik doğrulamış bir hesabın oturumu gerekir).
// Token olmadan HTTP 401 döner. DEĞİŞMEZ KURAL 3 gereği oturum/token gerektiren yöntem KULLANILMAZ.
// Doğrulama (curl): .../acikburak321@gmail.com/externalsearchv3 (token'sız) -> HTTP 401.
// Bu yüzden modül daima 'unknown' döner: "auth/token gerekir".
export default {
  name: 'msteams',
  async run(email) {
    const url = `https://teams.microsoft.com/api/mt/emea/beta/users/${encodeURIComponent(email)}/externalsearchv3`;
    let r;
    try {
      // Bilerek token EKLENMEZ (kuralca yasak). 401'i teyit edip 'unknown' döneriz.
      r = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'realos-cli' } });
    } catch (e) {
      return { status: 'unknown', error: `auth/token gerekir (istek hatası: ${String(e)})` };
    }
    return {
      status: 'unknown',
      error: 'auth/token gerekir',
      data: { note: 'Teams user-search ucu yetkili Skype/Bearer token ister; token\'sız erişim yok', httpStatus: r.status },
    };
  },
};
