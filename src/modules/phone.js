// Telefon — SADECE biçim/ülke analizi (yerel). Hesap-varlığı numaralandırması YOK.
// Neden: telefonla hesap sorgusu (ignorant/holehe-phone) şifre-kurtarma akışı kullanır → HEDEFE BİLDİRİM gider.
// O yöntem ilkemizce yasak. Burada yalnızca numaranın yapısını çözümleriz; sorgu için links modülü elle bakma verir.
const CC = [
  ['90', 'Türkiye'], ['1', 'ABD/Kanada'], ['44', 'Birleşik Krallık'], ['49', 'Almanya'],
  ['33', 'Fransa'], ['7', 'Rusya/Kazakistan'], ['86', 'Çin'], ['91', 'Hindistan'],
  ['971', 'BAE'], ['31', 'Hollanda'], ['34', 'İspanya'], ['39', 'İtalya'], ['380', 'Ukrayna'],
];

export default {
  name: 'phone',
  async run(input, ctx) {
    const raw = (ctx?.phones?.[0]) || input;
    if (!raw) return { status: 'unknown', error: 'telefon yok' };
    const digits = raw.replace(/[^\d]/g, '');
    const e164 = raw.startsWith('+') ? '+' + digits : (digits.startsWith('0') ? null : '+' + digits);

    // ülke kodu eşle (en uzun önek)
    let country = null, cc = null;
    for (const [code, name] of CC.sort((a, b) => b[0].length - a[0].length)) {
      if (digits.startsWith(code)) { cc = code; country = name; break; }
    }
    // TR özel: 90 5xx => cep
    let line = null;
    if (cc === '90') {
      const nat = digits.slice(2);
      line = nat.startsWith('5') ? 'cep telefonu' : (nat.length ? 'sabit hat' : null);
    }

    return {
      status: 'info',
      data: {
        giriş: raw, rakamlar: digits, e164: e164,
        ülkeKodu: cc, ülke: country, hatTipi: line,
        uzunlukGeçerli: digits.length >= 8 && digits.length <= 15,
        not: 'Hesap sorgusu için links modülündeki elle-bakma araçlarını kullan (bildirim riskli yöntem eklenmedi).',
      },
    };
  },
};
