export function getBrandName(locale?: string): string {
  const lang = (locale || (typeof navigator !== 'undefined' ? navigator.language : 'tr') || 'tr').toLowerCase();
  const isTurkish = lang.startsWith('tr');
  return isTurkish ? 'AGROVİA' : 'AGROVIA';
}


