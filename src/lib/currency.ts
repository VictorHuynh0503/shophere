/**
 * Format price to Vietnamese Dong (VND) currency
 */
export function formatVND(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(price);
}

/**
 * Format price to compact VND display (e.g., "1.5M" for millions)
 */
export function formatVNDCompact(price: number): string {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}M ₫`;
  } else if (price >= 1000) {
    return `${(price / 1000).toFixed(0)}K ₫`;
  }
  return `${price.toLocaleString('vi-VN')} ₫`;
}
