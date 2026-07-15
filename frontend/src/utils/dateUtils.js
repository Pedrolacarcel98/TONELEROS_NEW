/**
 * Parses a date string in YYYY-MM-DD format (or ISO string)
 * into a Date object representing midnight in the local timezone.
 * This prevents timezone offsets from shifting the date by a day.
 */
export const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();
  
  // Extract only the date part YYYY-MM-DD
  const cleanStr = dateStr.split('T')[0];
  const parts = cleanStr.split('-');
  
  if (parts.length !== 3) {
    return new Date(dateStr); // Fallback to standard constructor
  }
  
  const [year, month, day] = parts.map(Number);
  
  // Months are 0-indexed in JS Date constructor
  return new Date(year, month - 1, day);
};
