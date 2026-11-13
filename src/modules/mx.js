// #2 Email Service — alan adının DNS kayıtlarından e-posta sağlayıcısını bulur.
// MX = e-postayı kabul eden sunucu, SPF (TXT) = kimin adına mail gönderebileceği.
import { promises as dns } from 'node:dns';

const PROVIDERS = [
  [/google\.com$|googlemail\.com$/, 'Google (Gmail / Workspace)'],
  [/outlook\.com$|protection\.outlook\.com$/, 'Microsoft (Outlook / 365)'],
  [/yahoodns\.net$/, 'Yahoo'],
  [/icloud\.com$/, 'Apple iCloud'],
  [/protonmail\.ch$/, 'Proton Mail'],
  [/yandex\.(net|ru)$/, 'Yandex'],
  [/zoho\.(com|eu)$/, 'Zoho'],
  [/mimecast\.com$/, 'Mimecast (filtre)'],
  [/pphosted\.com$/, 'Proofpoint (filtre)'],
];

export default {
  name: 'mx',
  async run(email) {
    const domain = email.split('@')[1];
    let mx;
    try {
      mx = (await dns.resolveMx(domain)).sort((a, b) => a.priority - b.priority);
    } catch {
      return { status: 'not_found', data: { domain, note: 'MX kaydı yok — bu alan mail alamaz' } };
    }
    const hosts = mx.map(r => r.exchange.toLowerCase());
    const provider = PROVIDERS.find(([re]) => hosts.some(h => re.test(h)))?.[1] ?? 'kendi sunucusu / bilinmiyor';

    const txt = await dns.resolveTxt(domain).catch(() => []);
    const spf = txt.map(t => t.join('')).find(t => t.startsWith('v=spf1')) ?? null;
    const dmarc = (await dns.resolveTxt('_dmarc.' + domain).catch(() => [])).map(t => t.join(''))[0] ?? null;

    return {
      status: 'found',
      data: { domain, provider, mx: hosts, spf, dmarc },
    };
  },
};
