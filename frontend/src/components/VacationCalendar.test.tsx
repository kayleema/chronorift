import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VacationCalendar } from './VacationCalendar'

describe('VacationCalendar Component', () => {
  const mockOnDayClick = vi.fn()
  const currentYear = new Date().getFullYear()
  
  beforeEach(() => {
    mockOnDayClick.mockClear()
  })

  it('allows selecting multiple vacation days', async () => {
    const vacationDays = new Set<string>()
    render(<VacationCalendar year={currentYear} vacationDays={vacationDays} vacationDayStatuses={new Map()} onDayClick={mockOnDayClick} />)
    const user = userEvent.setup()
    
    // Find current month days to work with
    const currentMonthDays = document.querySelectorAll('.calendar-day.current-month')
    expect(currentMonthDays.length).toBeGreaterThan(2)
    
    const day1Container = currentMonthDays[0] as HTMLElement
    const day2Container = currentMonthDays[1] as HTMLElement
    const day3Container = currentMonthDays[2] as HTMLElement
    
    // Click multiple days
    await user.click(day1Container)
    await user.click(day2Container)
    await user.click(day3Container)
    
    // Should have called onDayClick for each day
    expect(mockOnDayClick).toHaveBeenCalledTimes(3)
  })

  it('displays vacation days with proper styling', () => {
    const vacationDays = new Set(['2025-06-15', '2025-06-16'])
    render(<VacationCalendar year={currentYear} vacationDays={vacationDays} vacationDayStatuses={new Map()} onDayClick={mockOnDayClick} />)
    
    // Find days with vacation class
    const vacationElements = document.querySelectorAll('.calendar-day.vacation')
    expect(vacationElements.length).toBeGreaterThan(0)
  })

  it('calls onDayClick with correct date when day is clicked', async () => {
    const vacationDays = new Set<string>()
    render(<VacationCalendar year={currentYear} vacationDays={vacationDays} vacationDayStatuses={new Map()} onDayClick={mockOnDayClick} />)
    const user = userEvent.setup()
    
    const currentMonthDays = document.querySelectorAll('.calendar-day.current-month')
    const dayContainer = currentMonthDays[0] as HTMLElement
    
    await user.click(dayContainer)
    
    expect(mockOnDayClick).toHaveBeenCalledTimes(1)
    expect(mockOnDayClick).toHaveBeenCalledWith(expect.any(Date))
  })

  it('renders day names in Japanese', () => {
    const vacationDays = new Set<string>()
    const { container } = render(<VacationCalendar year={currentYear} vacationDays={vacationDays} vacationDayStatuses={new Map()} onDayClick={mockOnDayClick} />)
    
    const dayNames = ['月', '火', '水', '木', '金', '土', '日']
    dayNames.forEach(name => {
      expect(container.textContent).toContain(name)
    })
  })

  it('does not call onDayClick for empty days', async () => {
    const vacationDays = new Set<string>()
    render(<VacationCalendar year={currentYear} vacationDays={vacationDays} vacationDayStatuses={new Map()} onDayClick={mockOnDayClick} />)
    const user = userEvent.setup()
    
    const emptyDays = document.querySelectorAll('.calendar-day.empty-day')
    
    if (emptyDays.length > 0) {
      await user.click(emptyDays[0])
      expect(mockOnDayClick).not.toHaveBeenCalled()
    }
  })
})