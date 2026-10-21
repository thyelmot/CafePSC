export const DEFAULT_SIZES = [
  { value: 'M', label: 'Tiêu chuẩn (M)', priceAdd: 0 },
];

/**
 * Normalize sizes from database (handles JSONB, string, array, or object)
 * Returns array of { value: string, label: string, priceAdd: number }
 */
export const normalizeSizes = (sizes) => {
  if (!sizes) return DEFAULT_SIZES;
  let list = sizes;
  if (typeof sizes === 'string') {
    try {
      list = JSON.parse(sizes);
    } catch {
      list = sizes.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  if (!Array.isArray(list)) return DEFAULT_SIZES;
  if (list.length === 0) return DEFAULT_SIZES;

  return list.map(item => {
    if (typeof item === 'string') {
      const val = item.toUpperCase();
      return {
        value: val,
        label: val === 'L' ? 'Lớn (L)' : val === 'M' ? 'Vừa (M)' : val === 'S' ? 'Nhỏ (S)' : val,
        priceAdd: val === 'L' ? 5000 : 0
      };
    }
    const val = (item.value || item.name || item.size || 'M').toUpperCase();
    const label = item.label || (val === 'L' ? 'Lớn (L)' : val === 'M' ? 'Vừa (M)' : val === 'S' ? 'Nhỏ (S)' : val);
    const priceAdd = Number(item.priceAdd ?? item.price_add ?? item.price ?? (val === 'L' ? 5000 : 0));
    return { value: val, label, priceAdd };
  });
};

/**
 * Calculate unit price based on product base price and selected options
 * Supports dynamic sizes from database with safe fallback for legacy orders
 */
export const calculateUnitPrice = (product, options) => {
  const basePrice = Number(product?.price) || 0;
  const sizeVal = options?.size;
  if (!sizeVal) return basePrice;

  if (product?.sizes) {
    const sizes = normalizeSizes(product.sizes);
    const matched = sizes.find(s => s.value === sizeVal);
    if (matched) return basePrice + matched.priceAdd;
  }

  // Fallback for legacy orders / default sizing
  if (sizeVal === 'L') return basePrice + 5000;
  return basePrice;
};
