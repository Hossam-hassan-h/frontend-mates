/**
 * Formats a price stored as an integer in piastres into standard EGP currency display.
 * 1 EGP = 100 piastres.
 *
 * Example:
 *   formatEGP(135000) -> "1,350.00 EGP"
 *   formatEGP(270000) -> "2,700.00 EGP"
 *   formatEGP(13500)  -> "135.00 EGP"
 *
 * @param {number|string} piastres - Integer value in piastres
 * @returns {string} Formatted price string with 2 decimal places and thousands separator
 */
export function formatEGP(piastres) {
  const numeric = Number(piastres) || 0;
  const egp = numeric / 100;
  return `${egp.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} EGP`;
}

export default formatEGP;
