/**
 * Parses a date string in YYYY-MM-DD format (or ISO string or SQL datetime with space)
 * into a Date object representing midnight in the local timezone.
 * This prevents timezone offsets from shifting the date by a day.
 */
export const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();
  
  if (dateStr instanceof Date) {
    return new Date(dateStr.getFullYear(), dateStr.getMonth(), dateStr.getDate());
  }

  // Extract only the date part YYYY-MM-DD (handles both 'T' and space separators)
  const cleanStr = String(dateStr).trim().split(/[T\s]/)[0];
  const parts = cleanStr.split('-');
  
  if (parts.length === 3) {
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      // Months are 0-indexed in JS Date constructor
      return new Date(year, month - 1, day);
    }
  }
  
  // Fallback to standard constructor
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date() : d;
};
