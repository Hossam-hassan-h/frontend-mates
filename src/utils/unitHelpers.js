export const isWeightUnit = (unit) => {
  if (!unit) return true; // Default to weight-based (kg)
  const u = unit.trim().toLowerCase();
  return u === 'kg' || u === 'كغ' || u === 'كيلو' || u === 'kilogram';
};

export const getEnglishUnit = (unit) => {
  if (!unit) return 'kg';
  const u = unit.trim().toLowerCase();
  if (u === 'كيلو' || u === 'كغ' || u === 'kg' || u === 'kilogram') return 'kg';
  if (u === 'حبة' || u === 'piece' || u === 'pieces') return 'piece';
  if (u === 'علبة' || u === 'box' || u === 'boxes') return 'box';
  if (u === 'صندوق' || u === 'crate' || u === 'crates') return 'box';
  if (u === 'ربطة' || u === 'bundle' || u === 'bundles') return 'bundle';
  if (u === 'كيس' || u === 'bag' || u === 'bags') return 'bag';
  if (u === 'شوال' || u === 'خيشة' || u === 'sack' || u === 'sacks') return 'sack';
  if (u === 'عبوة' || u === 'pack' || u === 'packs' || u === 'package') return 'pack';
  if (u === 'زجاجة' || u === 'bottle' || u === 'bottles') return 'bottle';
  if (u === 'كرتونة' || u === 'carton' || u === 'cartons') return 'carton';
  return u;
};
