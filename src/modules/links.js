// Aggregatör bağlantı üreteci — Behind the Email gibi siteleri OTOMATİK KAZIMADAN kullanmak için.
// Bu modül HİÇBİR istek atmaz; sadece önceden doldurulmuş, ELLE açılacak arama URL'leri üretir.
// Neden kazıma değil: bu siteler ToS'ta otomasyonu yasaklar + CAPTCHA/Cloudflare + çoğu giriş ister.
// Kullanıcı bu linkleri kendi tarayıcısında açıp elle bakar (öz-denetim).
const enc = encodeURIComponent;

// Kullanıcı adı adayları (e-posta girişi için)
function usernames(email) {
  const local = email.split('@')[0].split('+')[0];
  const letters = local.replace(/\d+$/, '');
  return [...new Set([local, letters].filter(Boolean))];
}

export default {
  name: 'links',
  async run(email, ctx) {
    const u = ctx?.usernames?.length ? ctx.usernames : (email ? usernames(email) : []);
    email = ctx?.email || email;
    const emailLinks = !email ? {} : {
      'Behind the Email': 'https://behindtheemail.com/',
      'Epieos': 'https://epieos.com/',
      'Holehe Online': 'https://holehe.online/',
      "That'sThem": `https://thatsthem.com/email/${enc(email)}`,
      'IDCrawl': `https://www.idcrawl.com/search?q=${enc(email)}`,
      'Have I Been Pwned': `https://haveibeenpwned.com/account/${enc(email)}`,
      'XposedOrNot': `https://xposedornot.com/`,
      'EmailRep': `https://emailrep.io/${enc(email)}`,
      'Google (tam eşleşme)': `https://www.google.com/search?q=${enc('"' + email + '"')}`,
    };
    const userLinks = {};
    for (const name of u) {
      userLinks[`WhatsMyName (${name})`] = `https://whatsmyname.app/`;
      userLinks[`Namechk (${name})`] = `https://namechk.com/`;
      userLinks[`IDCrawl (${name})`] = `https://www.idcrawl.com/u/${enc(name)}`;
      userLinks[`Google (${name})`] = `https://www.google.com/search?q=${enc('"' + name + '"')}`;
    }
    return {
      status: 'info',
      data: { note: 'elle açılacak aggregatör linkleri (kazıma yok)', email: emailLinks, username: userLinks },
    };
  },
};
