// Raporlama — JSON (web beslemesi), CSV (düz hesap tablosu), Markdown (okunur rapor).
// Ayrıca "birleşik profil": isim/kullanıcı adı/hesap/sızıntı özeti.

// Kullanıcı-adı tahminine dayanan modüller (teyit gerektirir); gerisi e-posta ile doğrudan bağlı.
const USERNAME_METHOD = new Set(['crosscheck', 'sherlock', 'social']);
const güvenSkoru = { 'e-posta (kesin)': 2, 'kullanıcı adı (teyit gerek)': 1 };

// Tüm modül sonuçlarından bulunan hesapları tek düz listeye çıkar
export function flattenAccounts(results) {
  const rows = [];
  for (const r of results) {
    const d = r.data ?? {};
    const güven = USERNAME_METHOD.has(r.module) ? 'kullanıcı adı (teyit gerek)' : 'e-posta (kesin)';
    // çok-eşleşmeli modüller (crosscheck, sherlock, social)
    if (Array.isArray(d.matches)) {
      for (const m of d.matches) {
        rows.push({ güven, kategori: r.module, platform: m.platform || m.source || r.module,
          kullaniciAdi: m.username || m.matchedCandidate || '', url: m.url || '',
          isim: m.name || '', detay: m.extra || [m.followers && m.followers + ' takipçi', m.private && 'gizli'].filter(Boolean).join(', ') });
      }
    } else if (r.status === 'found') {
      // tekil e-posta modülleri (github, spotify, microsoft...)
      rows.push({ güven, kategori: r.module, platform: r.module,
        kullaniciAdi: d.username || '', url: d.profile || d.url || '',
        isim: d.name || d.displayName || '', detay: d.note || d.joined || d.requiredActions?.join('+') || '' });
    }
  }
  // Tekilleştir: aynı url (yoksa platform+kullanıcı). Önce YÜKSEK GÜVEN, sonra en dolu detay.
  const seen = new Map();
  for (const row of rows) {
    const key = row.url || `${row.platform}:${row.kullaniciAdi}`;
    const prev = seen.get(key);
    const better = !prev
      || güvenSkoru[row.güven] > güvenSkoru[prev.güven]
      || (güvenSkoru[row.güven] === güvenSkoru[prev.güven] && (row.detay.length + row.isim.length) > (prev.detay.length + prev.isim.length));
    if (better) seen.set(key, row);
  }
  return [...seen.values()];
}

// Birleşik kimlik profili
export function unifiedProfile(ctx, results) {
  const accounts = flattenAccounts(results);
  const names = [...new Set(accounts.map(a => a.isim).filter(Boolean))];
  const usernames = [...new Set(accounts.map(a => a.kullaniciAdi).filter(Boolean))];
  const breach = results.find(r => r.module === 'breach' && r.status === 'found')?.data ?? null;
  const kesin = accounts.filter(a => a.güven.startsWith('e-posta'));
  const teyitGerek = accounts.filter(a => !a.güven.startsWith('e-posta'));
  return {
    girdi: ctx.input, tür: ctx.type,
    isimler: names, kullaniciAdlari: usernames,
    hesapSayisi: accounts.length,
    kesinSayisi: kesin.length, teyitGerekSayisi: teyitGerek.length,
    platformlar: [...new Set(accounts.map(a => a.platform))],
    sizinti: breach ? { adet: breach.breachCount, risk: breach.riskLabel, skor: breach.riskScore } : null,
    hesaplar: accounts,
  };
}

export function toJSON(ctx, results) {
  return JSON.stringify({ profil: unifiedProfile(ctx, results), hamSonuclar: results }, null, 2);
}

export function toCSV(ctx, results) {
  const q = s => `"${String(s ?? '').replace(/"/g, '""')}"`;
  const head = ['güven', 'platform', 'kullaniciAdi', 'isim', 'url', 'detay'];
  const lines = [head.join(',')];
  for (const a of flattenAccounts(results)) lines.push(head.map(h => q(a[h])).join(','));
  return lines.join('\n');
}

export function toMarkdown(ctx, results) {
  const p = unifiedProfile(ctx, results);
  const L = [`# OSINT Raporu — ${p.girdi}`, '', `**Tür:** ${p.tür}  ·  **Tarih:** ${new Date().toISOString().slice(0, 10)}`, ''];
  L.push('## Birleşik Profil', '');
  if (p.isimler.length) L.push(`- **İsim(ler):** ${p.isimler.join(' · ')}`);
  if (p.kullaniciAdlari.length) L.push(`- **Kullanıcı adları:** ${p.kullaniciAdlari.join(', ')}`);
  L.push(`- **Bulunan hesap:** ${p.hesapSayisi}  (${p.platformlar.join(', ')})`);
  if (p.sizinti) L.push(`- **Veri sızıntısı:** ${p.sizinti.adet} sızıntı, risk ${p.sizinti.risk} (${p.sizinti.skor})`);
  L.push('', '## Hesaplar', '', '| Güven | Platform | Kullanıcı adı | İsim | URL | Detay |', '|---|---|---|---|---|---|');
  const sıralı = [...p.hesaplar].sort((a, b) => (a.güven > b.güven ? 1 : -1)); // kesin olanlar üstte
  for (const a of sıralı) L.push(`| ${a.güven} | ${a.platform} | ${a.kullaniciAdi} | ${a.isim} | ${a.url} | ${a.detay} |`);
  return L.join('\n');
}

export function render(ctx, results, format) {
  if (format === 'csv') return toCSV(ctx, results);
  if (format === 'md') return toMarkdown(ctx, results);
  return toJSON(ctx, results);
}
