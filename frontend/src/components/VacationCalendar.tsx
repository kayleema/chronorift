import React from 'react';
import { getWeeksInYear } from '../utils/calendar';

interface VacationCalendarProps {
  year: number;
  vacationDays: Set<string>;
  onDayClick: (day: Date) => void;
}

export function VacationCalendar({ year, vacationDays, onDayClick }: VacationCalendarProps) {
  const weeks = getWeeksInYear(year);
  const dayNames = ['月', '火', '水', '木', '金', '土', '日'];
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="month-name-header"></div> {/* Empty div for alignment */}
        <div className="day-names">
          {dayNames.map(name => (
            <div key={name} className="day-name">{name}</div>
          ))}
        </div>
      </div>
      {weeks.map((week, weekIndex) => {
        const currentYearDays = week.filter(day => day.getFullYear() === year);
        let showMonthName = false;
        let monthToShow = '';
        
        if (currentYearDays.length > 0) {
          if (weekIndex === 0) {
            // First week - show the month of the first day
            showMonthName = true;
            monthToShow = monthNames[currentYearDays[0].getMonth()];
          } else {
            // Check if this week contains the first day of a new month
            const hasFirstOfMonth = currentYearDays.some(day => day.getDate() === 1);
            if (hasFirstOfMonth) {
              const firstOfMonth = currentYearDays.find(day => day.getDate() === 1);
              showMonthName = true;
              monthToShow = monthNames[firstOfMonth!.getMonth()];
            }
          }
        }

        return (
          <div key={weekIndex} className="calendar-row">
            <div className="month-name-column">
              {showMonthName ? monthToShow : ''}
            </div>
            <div className="calendar-week">
              {week.map((day) => {
                const isCurrentYearDay = day.getFullYear() === year;
                if (!isCurrentYearDay) {
                  return <div key={day.toISOString()} className="calendar-day empty-day"></div>;
                }
                const dayString = day.toISOString().split('T')[0];
                const isVacation = vacationDays.has(dayString);
                const isCurrentMonth = day.getMonth() === new Date().getMonth();

                return (
                  <div
                    key={dayString}
                    className={`calendar-day ${isVacation ? 'vacation' : ''} ${isCurrentMonth ? 'current-month' : 'other-month'}`}
                    onClick={() => onDayClick(day)}
                  >
                    {day.getDate()}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}