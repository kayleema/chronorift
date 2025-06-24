export function getWeeksInYear(year: number): Date[][] {
  const weeks = [];
  let currentDay = new Date(year, 0, 1); // Start from January 1st

  // Adjust to the first Monday of the year or the first day if it's Monday
  // getDay() returns 0 for Sunday, 1 for Monday, ..., 6 for Saturday
  // We want to adjust to Monday (1). If it's Sunday (0), set to previous Monday (6 days back).
  const dayOfWeek = currentDay.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Calculate days to subtract to get to Monday
  currentDay.setDate(currentDay.getDate() - diff);

  while (currentDay.getFullYear() < year + 2) { // Iterate a bit into the next year to catch the last week
    const week = [];
    for (let i = 0; i < 7; i++) {
      const dayToAdd = new Date(currentDay);
      week.push(dayToAdd);
      currentDay.setDate(currentDay.getDate() + 1);
    }
    weeks.push(week);
    if (currentDay.getFullYear() > year && currentDay.getMonth() === 0 && currentDay.getDate() === 1) {
      // Stop if we've just started the next year
      break;
    }
  }
  // Filter out weeks that are entirely outside the current year, or trim partial weeks at the end
  return weeks.filter(week => week.some(day => day.getFullYear() === year));
}