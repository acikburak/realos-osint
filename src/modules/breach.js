// Veri Sızıntısı — XposedOrNot açık API (anahtarsız, ücretsiz). HIBP'nin bedava muadili.
// Doğrulandı 2026-11-13: sızıntı varsa {"breaches":[[...]]}, yoksa {"Error":"Not found"}.
// Yöntem: düz GET, bildirim yok, koruma atlatma yok. Girdi: e-posta.
const API = 'https://api.xposedornot.com/v1';

export default {
  name: 'breach',
  async run(email) {
    const r = await fetch(`${API}/check-email/${encodeURIComponent(email)}`, { signal: AbortSignal.timeout(15000) });
    if (!r.ok) return { status: 'unknown', error: `HTTP ${r.status}` };
    const d = await r.json();
    const breaches = d.breaches?.[0] ?? [];
    if (!breaches.length) return { status: 'not_found', data: { note: 'bilinen sızıntı yok' } };

    // Detay (risk skoru) — başarısız olursa sızıntı listesini yine döndür.
    let risk = null, riskScore = null;
    try {
      const a = await fetch(`${API}/breach-analytics?email=${encodeURIComponent(email)}`, { signal: AbortSignal.timeout(20000) });
      if (a.ok) {
        const j = await a.json();
        risk = j.BreachMetrics?.risk?.[0]?.risk_label ?? null;
        riskScore = j.BreachMetrics?.risk?.[0]?.risk_score ?? null;
      }
    } catch { /* detay yoksay */ }

    return {
      status: 'found',
      data: {
        breachCount: breaches.length,
        riskLabel: risk,
        riskScore,
        breaches: breaches.slice(0, 25),
        more: breaches.length > 25 ? breaches.length - 25 : 0,
      },
    };
  },
};
