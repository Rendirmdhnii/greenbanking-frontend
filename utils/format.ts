/**
 * Global Currency & Formatting Utilities — GreenBanking Nusantara
 * Digunakan di seluruh komponen untuk konsistensi format Rupiah.
 */

/**
 * Format angka ke format Rupiah Indonesia.
 * @example formatIDR(2500000) → "Rp 2.500.000"
 */
export function formatIDR(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Rp 0';
  return 'Rp ' + num.toLocaleString('id-ID');
}

/**
 * Format angka saja tanpa prefix Rp.
 * @example formatNumber(2500000) → "2.500.000"
 */
export function formatNumber(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0';
  return num.toLocaleString('id-ID');
}

/**
 * Parse string Rupiah kembali ke angka mentah.
 * @example parseIDR("2.500.000") → 2500000
 */
export function parseIDR(formatted: string): number {
  return parseInt(formatted.replace(/[^0-9]/g, ''), 10) || 0;
}

/**
 * Copy text ke clipboard dengan fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback untuk browser lama
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
}

/**
 * SweetAlert2 preset warna GreenBanking Nusantara.
 */
export const SwalGreenBanking = {
  success: {
    confirmButtonColor: '#059669',
    iconColor: '#059669',
  },
  error: {
    confirmButtonColor: '#dc2626',
    iconColor: '#dc2626',
  },
  warning: {
    confirmButtonColor: '#d97706',
    iconColor: '#d97706',
  },
  info: {
    confirmButtonColor: '#064e3b',
    iconColor: '#064e3b',
  },
};
