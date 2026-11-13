// Kimlik türü tespiti + bağlam kurma. Araç artık e-posta/kullanıcı adı/telefon/isim kabul eder.
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE = /^\+?[\d][\d\s().-]{6,}$/;

// Türkçe karakterleri sadeleştir (kullanıcı adı adayları için)
const deTr = s => s.toLowerCase()
  .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
  .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c');

export function detectType(value) {
  const v = value.trim();
  if (EMAIL.test(v)) return 'email';
  if (PHONE.test(v) && (v.match(/\d/g) || []).length >= 7) return 'phone';
  if (/\s/.test(v) && /[a-zA-ZğüşöçıİĞÜŞÖÇ]/.test(v)) return 'name';
  return 'username';
}

// E-postadan kullanıcı adı adayları
export function usernamesFromEmail(email) {
  const local = email.split('@')[0].split('+')[0];
  const letters = local.replace(/\d+$/, '');
  const parts = letters.split(/[._-]/).filter(Boolean);
  return [...new Set([local, letters, parts.join(''), parts.join('.'), parts.join('_'), parts[0]].filter(Boolean))];
}

// İsimden kullanıcı adı adayları: "Burak Açık" -> burakacik, acikburak, b.acik, burak_acik...
export function usernamesFromName(name) {
  const parts = deTr(name).split(/\s+/).filter(Boolean);
  if (parts.length < 2) return [...new Set([deTr(name).replace(/\s+/g, '')])];
  const [first, ...rest] = parts;
  const last = rest[rest.length - 1];
  return [...new Set([
    first + last, last + first, first + '.' + last, first + '_' + last,
    first[0] + last, first + last[0], first, last,
  ].filter(Boolean))];
}

// Tek bir girdiden tam bağlam kur
export function buildContext(value) {
  const type = detectType(value);
  const ctx = { input: value.trim(), type, email: null, usernames: [], phones: [], names: [] };
  if (type === 'email') { ctx.email = value.toLowerCase().trim(); ctx.usernames = usernamesFromEmail(ctx.email); }
  else if (type === 'username') { ctx.usernames = [value.trim()]; }
  else if (type === 'name') { ctx.names = [value.trim()]; ctx.usernames = usernamesFromName(value); }
  else if (type === 'phone') { ctx.phones = [value.replace(/[^\d+]/g, '')]; }
  return ctx;
}
