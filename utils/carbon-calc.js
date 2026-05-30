/**
 * UTILITY KODE KALKULATOR KARBON & ECO-POINTS (TERISOLASI)
 * file: carbon-calc.js
 * ====================================================================
 */

/**
 * Menghitung nilai pengurangan emisi karbon (kg CO2e) dan jumlah Eco-Points
 * yang diperoleh nasabah dari aktivitas perbankan ramah lingkungan.
 *
 * @param {string} transactionType - Jenis transaksi ('paperless_billing', 'digital_payment', 'green_investment')
 * @param {number} quantityOrAmount - Jumlah transaksi (quantity) atau nominal uang (amount)
 * @returns {Object} Objek berisi { carbonSaved: number, ecoPointsEarned: number }
 */
export function calculateCarbonOffset(transactionType, quantityOrAmount) {
  // Validasi input dasar
  if (!transactionType || typeof quantityOrAmount !== 'number' || quantityOrAmount <= 0) {
    return { carbonSaved: 0, ecoPointsEarned: 0 };
  }

  let carbonSaved = 0;

  switch (transactionType) {
    case 'paperless_billing':
      // Mengurangi penggunaan kertas (cetak struk/koran transaksi).
      // Est. Penghematan: 0.2 kg CO2e per lembar tagihan digital.
      carbonSaved = Number((0.2 * quantityOrAmount).toFixed(3));
      break;

    case 'digital_payment':
      // Mengurangi mobilitas fisik nasabah ke cabang bank atau ATM (perjalanan).
      // Est. Penghematan: 0.6 kg CO2e per transaksi digital.
      carbonSaved = Number((0.6 * quantityOrAmount).toFixed(3));
      break;

    case 'green_investment':
      // Investasi pendanaan proyek hijau (panel surya, mikrohidro, dll).
      // Est. Penghematan: 2.5 kg CO2e per Rp 100.000 dana yang diinvestasikan.
      carbonSaved = Number(((quantityOrAmount / 100000) * 2.5).toFixed(3));
      break;

    default:
      carbonSaved = 0;
      break;
  }

  // Aturan Sistem Poin: 1 kg CO2e setara dengan 10 Eco-Points
  const ecoPointsEarned = Math.round(carbonSaved * 10);

  return {
    carbonSaved,      // Pengurangan Karbon (kg CO2e)
    ecoPointsEarned   // Eco-Points yang Didapatkan
  };
}
