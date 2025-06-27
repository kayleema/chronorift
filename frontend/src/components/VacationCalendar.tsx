import {getWeeksInYear} from '../utils/calendar';
import {dateToLocalString} from '../utils/vacation';
import type { VacationData } from '../services/api';

interface VacationCalendarProps {
    year: number;
    vacationDays: Set<string>;
    vacationDayStatuses: Map<string, VacationData>;
    onDayClick: (day: Date) => void;
}

export function VacationCalendar({year, vacationDays, vacationDayStatuses, onDayClick}: VacationCalendarProps) {
    const weeks = getWeeksInYear(year);
    const dayNames = ['月', '火', '水', '木', '金', '土', '日'];
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <div className="month-name-header"></div>
                {/* Empty div for alignment */}
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
                                const dayString = dateToLocalString(day);
                                const isVacation = vacationDays.has(dayString);
                                const isCurrentMonth = day.getMonth() === new Date().getMonth();
                                const dayStatus = vacationDayStatuses.get(dayString);
                                
                                // Determine classes based on status
                                const statusClass = dayStatus ? `status-${dayStatus.status.toLowerCase().replace('_', '-')}` : '';
                                const isBlocked = dayStatus && dayStatus.status !== 'PENDING';
                                const isPendingDeletion = dayStatus && dayStatus.status === 'PENDING_DELETION';
                                
                                const classNames = [
                                    'calendar-day',
                                    isVacation ? 'vacation' : '',
                                    isCurrentMonth ? 'current-month' : 'other-month',
                                    statusClass,
                                    isBlocked ? 'blocked' : '',
                                    isPendingDeletion ? 'pending-deletion' : ''
                                ].filter(Boolean).join(' ');

                                const title = isBlocked ? '承認済みの申請は変更できません' : '';

                                return (
                                    <div
                                        key={dayString}
                                        className={classNames}
                                        title={title}
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