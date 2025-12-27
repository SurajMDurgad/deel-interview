/**
 * Date formatting utilities for the Payslips app
 */

/**
 * Format an ISO date string to a human-readable format
 * @param isoDate - ISO date string (e.g., '2024-01-15')
 * @returns Formatted date string (e.g., 'Jan 15, 2024')
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  
  // Check for invalid date
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format a date range for display
 * @param fromDate - Start date in ISO format
 * @param toDate - End date in ISO format
 * @returns Formatted period string (e.g., 'Jan 1 – Jan 31, 2024')
 */
export function formatPeriod(fromDate: string, toDate: string): string {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  
  // Check for invalid dates
  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    return 'Invalid Period';
  }
  
  const sameYear = from.getFullYear() === to.getFullYear();
  const sameMonth = sameYear && from.getMonth() === to.getMonth();
  
  if (sameMonth) {
    // Same month and year: "Jan 1 – 31, 2024"
    const monthYear = to.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    return `${monthYear.split(' ')[0]} ${from.getDate()} – ${to.getDate()}, ${to.getFullYear()}`;
  } else if (sameYear) {
    // Same year: "Jan 1 – Feb 15, 2024"
    const fromFormatted = from.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const toFormatted = to.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${fromFormatted} – ${toFormatted}`;
  } else {
    // Different years: "Dec 15, 2023 – Jan 15, 2024"
    return `${formatDate(fromDate)} – ${formatDate(toDate)}`;
  }
}

/**
 * Compare two ISO date strings for sorting
 * @param dateA - First date
 * @param dateB - Second date
 * @param ascending - Sort order (true for oldest first, false for newest first)
 * @returns Comparison result for Array.sort()
 */
export function compareDates(dateA: string, dateB: string, ascending: boolean = true): number {
  const a = new Date(dateA).getTime();
  const b = new Date(dateB).getTime();
  
  return ascending ? a - b : b - a;
}

