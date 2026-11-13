// #5 Proton Mail — Proton'un herkese açık PGP anahtar sunucusu (HKP/pks).
// Her Proton hesabının bir açık anahtarı vardır; anahtarın oluşturulma zamanı ≈ hesabın açılış tarihi.
// Yanıt: "info:1:0" = yok, "info:1:N" + "pub:<fingerprint>:<algo>:<bits>:<unix-zaman>::" = var
export default {
  name: 'proton',
  async run(email) {
    const res = await fetch(`https://api.protonmail.ch/pks/lookup?op=index&search=${encodeURIComponent(email)}`);
    if (!res.ok) return { status: 'unknown', error: `HTTP ${res.status}` };
    const text = await res.text();
    const keys = text.split('\n').filter(l => l.startsWith('pub:')).map(l => {
      const [, fingerprint, algo, , created] = l.split(':');
      return {
        fingerprint,
        algorithm: { '1': 'RSA', '22': 'Ed25519/ECC' }[algo] ?? algo,
        created: created ? new Date(+created * 1000).toISOString().slice(0, 10) : null,
      };
    });
    if (!keys.length) return { status: 'not_found' };
    return {
      status: 'found',
      data: { keys: keys.length, accountCreatedApprox: keys.map(k => k.created).sort()[0], keyList: keys },
    };
  },
};
