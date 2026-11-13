#!/usr/bin/env node
// Gerçek tarayıcıyla bir URL'ye git ve sonucu al.
// Kullanım:
//   node src/fetch-url.js <url>                 # metin + başlık (headless)
//   node src/fetch-url.js <url> --show          # görünür pencere
//   node src/fetch-url.js <url> --json          # tam JSON
//   node src/fetch-url.js <url> --wait=load     # bekleme stratejisi
//   node src/fetch-url.js <url> --fast          # resim/font engelle (hız)
import { browserFetch } from './browser/fetch.js';

const args = process.argv.slice(2);
const url = args.find(a => !a.startsWith('--'));
if (!url) { console.error('Kullanım: node src/fetch-url.js <url> [--show] [--json] [--wait=load] [--fast]'); process.exit(1); }

const opts = {
  headless: !args.includes('--show'),
  waitUntil: args.find(a => a.startsWith('--wait='))?.slice(7) || 'networkidle',
  blockAssets: args.includes('--fast'),
};

const r = await browserFetch(url.startsWith('http') ? url : 'https://' + url, opts);

if (args.includes('--json')) {
  console.log(JSON.stringify(r, null, 2));
} else {
  console.log(`\nURL:     ${r.url}`);
  console.log(`Son URL: ${r.finalUrl}`);
  console.log(`Durum:   ${r.status}   (${r.tookMs} ms)`);
  console.log(`Başlık:  ${r.title}`);
  if (r.error) console.log(`Hata:    ${r.error}`);
  console.log('\n--- Sayfa metni (ilk 2000 karakter) ---\n');
  console.log((r.text || '(boş)').slice(0, 2000));
  console.log();
}
