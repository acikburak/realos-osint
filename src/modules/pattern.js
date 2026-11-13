// #1 Email Pattern — tamamen yerel, ağ isteği yok.
const FREE = ['gmail.com', 'googlemail.com', 'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
  'yahoo.com', 'icloud.com', 'me.com', 'proton.me', 'protonmail.com', 'yandex.com', 'yandex.com.tr',
  'gmx.com', 'mail.com', 'aol.com', 'zoho.com'];
const DISPOSABLE = ['mailinator.com', 'guerrillamail.com', '10minutemail.com', 'temp-mail.org', 'yopmail.com'];
const ROLE = ['info', 'admin', 'support', 'contact', 'sales', 'careers', 'hr', 'noreply', 'no-reply', 'office'];

export default {
  name: 'pattern',
  async run(email) {
    const [local, domain] = email.split('@');
    const base = local.split('+')[0];
    const digits = base.match(/\d+$/)?.[0] ?? null;
    const letters = base.replace(/\d+$/, '');
    const parts = letters.split(/[._-]/).filter(Boolean);

    let shape = 'tek kelime';
    if (parts.length >= 2) shape = 'ad<ayraç>soyad';
    else if (digits) shape = 'kelime+rakam';

    const year = digits && digits.length === 4 && +digits >= 1950 && +digits <= 2015 ? digits
      : digits && digits.length === 2 ? `19${digits} / 20${digits} olabilir` : null;

    return {
      status: 'info',
      data: {
        local: base,
        domain,
        plusTag: local.includes('+') ? local.split('+')[1] : null,
        shape,
        parts,
        trailingDigits: digits,
        possibleBirthYear: year,
        providerType: FREE.includes(domain) ? 'ücretsiz' : DISPOSABLE.includes(domain) ? 'geçici' : 'kurumsal/özel alan',
        roleAccount: ROLE.includes(base),
        usernameCandidates: [...new Set([base, letters, parts.join(''), parts.join('_'), parts.join('.')].filter(Boolean))],
      },
    };
  },
};
