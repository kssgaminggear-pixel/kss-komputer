/** "2 terjual" -> 2, "40+ terjual" -> 40, "1,5rb+ terjual" -> 1500. */
export function parseSold(label) {
  const match = String(label).toLowerCase().match(/([\d.,]+)\s*(rb|jt)?/);
  if (!match) return { sold: 0, soldLabel: '' };
  const unit = match[2] === 'rb' ? 1000 : match[2] === 'jt' ? 1_000_000 : 1;
  const number = unit === 1 ? Number(match[1].replace(/\D/g, '')) : Number(match[1].replace(',', '.'));
  return {
    sold: Math.round(number * unit),
    soldLabel: String(label).replace(/\s*terjual\s*/i, '').trim(),
  };
}
