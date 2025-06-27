export interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * Converts a Date object to a date string in local timezone (YYYY-MM-DD format)
 * This avoids timezone issues when converting dates to strings
 */
export function dateToLocalString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converts a set of individual vacation day strings into continuous date ranges
 * Example: ['2024-07-01', '2024-07-02', '2024-07-03', '2024-07-05'] 
 * Returns: [{ startDate: '2024-07-01', endDate: '2024-07-03' }, { startDate: '2024-07-05', endDate: '2024-07-05' }]
 */
export function convertDaysToRanges(vacationDays: Set<string>): DateRange[] {
  if (vacationDays.size === 0) {
    return [];
  }

  // Convert to sorted array of Date objects
  const sortedDates = Array.from(vacationDays)
    .map(dateString => new Date(dateString))
    .sort((a, b) => a.getTime() - b.getTime());

  const ranges: DateRange[] = [];
  let rangeStart = sortedDates[0];
  let rangeEnd = sortedDates[0];

  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = sortedDates[i];
    const prevDate = sortedDates[i - 1];
    
    // Check if current date is consecutive to previous date
    const dayDifference = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (dayDifference === 1) {
      // Consecutive day - extend current range
      rangeEnd = currentDate;
    } else {
      // Gap found - save current range and start new one
      ranges.push({
        startDate: dateToLocalString(rangeStart),
        endDate: dateToLocalString(rangeEnd),
      });
      rangeStart = currentDate;
      rangeEnd = currentDate;
    }
  }

  // Add the final range
  ranges.push({
    startDate: dateToLocalString(rangeStart),
    endDate: dateToLocalString(rangeEnd),
  });

  return ranges;
}

/**
 * Converts vacation date ranges back to individual day strings
 * Used to display existing vacation data from backend
 */
export function convertRangesToDays(ranges: DateRange[]): Set<string> {
  const days = new Set<string>();
  
  ranges.forEach(range => {
    const startDate = new Date(range.startDate);
    const endDate = new Date(range.endDate);
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      days.add(dateToLocalString(date));
    }
  });
  
  return days;
}