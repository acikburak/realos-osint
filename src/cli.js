#!/usr/bin/env node
// Çoklu-giriş OSINT CLI. Girdi: e-posta | kullanıcı adı | telefon | "ad soyad".
// Kullanım:
//   node src/cli.js <girdi> [--only=modul1,modul2] [--json]
//   node src/cli.js acikburak321@gmail.com
//   node src/cli.js acikburak                 # kullanıcı adı
//   node src/cli.js "Burak Açık"              # isim -> kullanıcı adı adayları
//   node src/cli.js +905551112233             # telefon (biçim analizi)
import { writeFileSync } from 'node:fs';
import { modules, USERNAME_MODULES, PHONE_MODULES, LINK_MODULES } from './modules/index.js';
import { buildContext } from './identify.js';
import { render } from './report.js';

const args = process.argv.slice(2);
const input = args.find(a => !a.startsWith('--'));
const only = args.find(a => a.startsWith('--only='))?.slice(7).split(',');
const asJson = args.includes('--json');
const out = args.find(a => a.startsWith('--out='))?.slice(6); // dosya yolu; uzantıdan format

if (!input) {
  console.error('Kullanım: node src/cli.js <e-posta|kullanıcıadı|telefon|"ad soyad"> [--only=...] [--json]');
  process.exit(1);
}

const ctx = buildContext(input);

// Bir modül bu bağlamda çalışabilir mi?
function accepts(m) {
  if (PHONE_MODULES.has(m.name)) return ctx.phones.length > 0;
  if (USERNAME_MODULES.has(m.name)) return ctx.usernames.length > 0;
  if (LINK_MODULES.has(m.name)) return true;
  return !!ctx.email; // e-posta modülü
}
// Modüle verilecek birincil argüman
function primary(m) {
  if (PHONE_MODULES.has(m.name)) return ctx.phones[0];
  if (USERNAME_MODULES.has(m.name)) return ctx.usernames[0];
  return ctx.email;
}

let pool = modules.filter(accepts);
if (only) pool = pool.filter(m => only.includes(m.name));

const started = Date.now();
const run = async m => {
  const t = Date.now();
  try { return { module: m.name, ms: Date.now() - t, ...(await m.run(primary(m), ctx)) }; }
  catch (e) { return { module: m.name, ms: Date.now() - t, status: 'error', error: e.message }; }
};

// Faz 1: kullanıcı-adı modülleri DIŞINDAKİLER (e-posta, sızıntı, telefon, links)
const phase1mods = pool.filter(m => !USERNAME_MODULES.has(m.name));
const phase1 = await Promise.all(phase1mods.map(run));

// PİVOT: faz 1'de bulunan kullanıcı adlarını bağlama ekle (ör. e-postadan GitHub kullanıcı adı)
const discovered = new Set(ctx.usernames);
for (const r of phase1) {
  const un = r.data?.username;
  if (un && typeof un === 'string' && /^[a-z0-9._-]{2,30}$/i.test(un) && !un.includes('gizli')) discovered.add(un);
}
ctx.usernames = [...discovered];

// Faz 2: kullanıcı-adı modülleri (zenginleştirilmiş adaylarla)
const phase2mods = pool.filter(m => USERNAME_MODULES.has(m.name));
const phase2 = await Promise.all(phase2mods.map(run));

const results = [...phase1, ...phase2];

if (out) {
  const fmt = out.endsWith('.csv') ? 'csv' : out.endsWith('.md') ? 'md' : 'json';
  writeFileSync(out, render(ctx, results, fmt));
  console.log(`Rapor yazıldı: ${out}  (format: ${fmt})`);
} else if (asJson) {
  console.log(render(ctx, results, 'json'));
} else {
  const icon = { found: '✔', not_found: '✘', info: 'ℹ', error: '!', unknown: '?' };
  console.log(`\n${ctx.input}  [tür: ${ctx.type}]  (${Date.now() - started} ms)`);
  if (ctx.usernames.length) console.log(`kullanıcı adı adayları: ${ctx.usernames.join(', ')}\n`);
  for (const r of results) {
    console.log(`${icon[r.status] ?? '?'} ${r.module.padEnd(11)} ${r.status}${r.error ? ' — ' + r.error : ''}`);
    for (const [k, v] of Object.entries(r.data ?? {})) console.log(`    ${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`);
  }
  console.log();
}
