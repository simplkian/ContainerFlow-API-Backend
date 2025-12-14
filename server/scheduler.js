/**
 * Get day of week (1=Monday, 7=Sunday) in specified timezone
 * @param {Date} date
 * @param {string} timezone
 * @returns {number}
 */
export function getDayOfWeekInTimezone(date, timezone) {
  const dateStr = date.toLocaleString('en-US', { timeZone: timezone });
  const localDate = new Date(dateStr);
  const day = localDate.getDay();
  return day === 0 ? 7 : day;
}

/**
 * Calculate days between two dates (ignoring time)
 * @param {Date} date1
 * @param {Date} date2
 * @returns {number}
 */
export function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if a task should be generated for a specific date based on schedule rule
 * @param {{ ruleType: 'DAILY' | 'WEEKLY' | 'INTERVAL', weekdays?: number[] | null, everyNDays?: number | null, startDate?: Date | null }} schedule
 * @param {Date} targetDate
 * @param {string} timezone
 * @returns {boolean}
 */
export function shouldGenerateForDate(schedule, targetDate, timezone) {
  const { ruleType, weekdays, everyNDays, startDate } = schedule;

  switch (ruleType) {
    case 'DAILY':
      return true;

    case 'WEEKLY':
      if (!weekdays || !Array.isArray(weekdays) || weekdays.length === 0) {
        return false;
      }
      const dayOfWeek = getDayOfWeekInTimezone(targetDate, timezone);
      return weekdays.includes(dayOfWeek);

    case 'INTERVAL':
      if (!everyNDays || everyNDays < 1 || !startDate) {
        return false;
      }
      const days = daysBetween(startDate, targetDate);
      return days >= 0 && days % everyNDays === 0;

    default:
      return false;
  }
}
