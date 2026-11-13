// Gerçek tarayıcı (Chromium) ile sayfa getirme — curl değil.
// JavaScript çalışır, gerçek User-Agent ve başlıklar gider, çerez/yönlendirme yönetilir.
// Kullanım:  const r = await browserFetch(url, { headless, waitUntil, timeoutMs, profileDir })
import { chromium } from 'playwright';

const REAL_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

export async function browserFetch(url, opts = {}) {
  const {
    headless = true,          // false = görünür pencere (insan gibi izlemek/giriş için)
    waitUntil = 'networkidle', // 'load' | 'domcontentloaded' | 'networkidle'
    timeoutMs = 30000,
    profileDir = null,        // verilirse kalıcı oturum profili (giriş gerektiren sayfalar için)
    blockAssets = false,      // true = resim/font/medya engelle (hız)
  } = opts;

  // Kalıcı profil (oturum) varsa launchPersistentContext, yoksa geçici bağlam.
  let context, browser;
  if (profileDir) {
    context = await chromium.launchPersistentContext(profileDir, {
      headless, viewport: { width: 1366, height: 768 }, userAgent: REAL_UA, locale: 'tr-TR',
    });
  } else {
    browser = await chromium.launch({ headless });
    context = await browser.newContext({
      viewport: { width: 1366, height: 768 }, userAgent: REAL_UA, locale: 'tr-TR',
    });
  }

  if (blockAssets) {
    await context.route('**/*', r =>
      ['image', 'media', 'font'].includes(r.request().resourceType()) ? r.abort() : r.continue());
  }

  const page = await context.newPage();
  const started = Date.now();
  let status = null, finalUrl = url, title = null, text = null, error = null;
  try {
    const resp = await page.goto(url, { waitUntil, timeout: timeoutMs });
    status = resp?.status() ?? null;
    finalUrl = page.url();
    title = await page.title();
    text = (await page.evaluate(() => document.body?.innerText ?? '')).replace(/\n{3,}/g, '\n\n').trim();
  } catch (e) {
    error = e.message;
    try { finalUrl = page.url(); title = await page.title(); } catch { /* yoksay */ }
  } finally {
    await context.close();
    if (browser) await browser.close();
  }

  return { url, finalUrl, status, title, text, error, tookMs: Date.now() - started };
}
