import { describe, it, expect } from 'vitest'
import { getWeeksInYear } from './calendar'

describe('Calendar Logic', () => {
  it('generates correct number of weeks for a year', () => {
    const weeks2024 = getWeeksInYear(2024)
    const weeks2025 = getWeeksInYear(2025)
    
    // Should have 52 or 53 weeks depending on the year
    expect(weeks2024.length).toBeGreaterThanOrEqual(52)
    expect(weeks2024.length).toBeLessThanOrEqual(53)
    expect(weeks2025.length).toBeGreaterThanOrEqual(52)
    expect(weeks2025.length).toBeLessThanOrEqual(53)
  })

  it('each week has exactly 7 days', () => {
    const weeks = getWeeksInYear(2024)
    
    weeks.forEach(week => {
      expect(week).toHaveLength(7)
    })
  })

  it('weeks start on Monday', () => {
    const weeks = getWeeksInYear(2024)
    
    weeks.forEach(week => {
      // Monday is day 1 in JavaScript Date.getDay()
      expect(week[0].getDay()).toBe(1)
    })
  })

  it('contains all days of the year', () => {
    const weeks = getWeeksInYear(2024)
    const allDays = weeks.flat()
    const daysInYear = allDays.filter(day => day.getFullYear() === 2024)
    
    // 2024 is a leap year, so should have 366 days
    expect(daysInYear).toHaveLength(366)
  })

  it('January 1st is included in the calendar', () => {
    const weeks = getWeeksInYear(2024)
    const allDays = weeks.flat()
    const jan1 = allDays.find(day => 
      day.getFullYear() === 2024 && 
      day.getMonth() === 0 && 
      day.getDate() === 1
    )
    
    expect(jan1).toBeDefined()
  })

  it('December 31st is included in the calendar', () => {
    const weeks = getWeeksInYear(2024)
    const allDays = weeks.flat()
    const dec31 = allDays.find(day => 
      day.getFullYear() === 2024 && 
      day.getMonth() === 11 && 
      day.getDate() === 31
    )
    
    expect(dec31).toBeDefined()
  })

  it('handles leap years correctly', () => {
    const weeks2024 = getWeeksInYear(2024) // Leap year
    const weeks2023 = getWeeksInYear(2023) // Not leap year
    
    const days2024 = weeks2024.flat().filter(day => day.getFullYear() === 2024)
    const days2023 = weeks2023.flat().filter(day => day.getFullYear() === 2023)
    
    expect(days2024).toHaveLength(366) // Leap year
    expect(days2023).toHaveLength(365) // Regular year
  })

  it('February 29th exists in leap years only', () => {
    const weeks2024 = getWeeksInYear(2024) // Leap year
    const weeks2023 = getWeeksInYear(2023) // Not leap year
    
    const allDays2024 = weeks2024.flat()
    const allDays2023 = weeks2023.flat()
    
    const feb29_2024 = allDays2024.find(day => 
      day.getFullYear() === 2024 && 
      day.getMonth() === 1 && 
      day.getDate() === 29
    )
    
    const feb29_2023 = allDays2023.find(day => 
      day.getFullYear() === 2023 && 
      day.getMonth() === 1 && 
      day.getDate() === 29
    )
    
    expect(feb29_2024).toBeDefined()
    expect(feb29_2023).toBeUndefined()
  })
})