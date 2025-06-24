import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App Component', () => {
  beforeEach(() => {
    render(<App />)
  })

  it('renders the main title', () => {
    const currentYear = new Date().getFullYear()
    expect(screen.getByText(`Time Off Request - ${currentYear}`)).toBeInTheDocument()
  })

  it('renders day names in Japanese', () => {
    const dayNames = ['月', '火', '水', '木', '金', '土', '日']
    dayNames.forEach(day => {
      expect(screen.getByText(day)).toBeInTheDocument()
    })
  })

  it('renders month names in Japanese', () => {
    // At least January should be visible
    expect(screen.getByText('1月')).toBeInTheDocument()
  })

  it('renders calendar days', () => {
    // Should have multiple instances of day 1 (from different months)
    expect(screen.getAllByText('1')).toHaveLength(12) // Appears in each month
    expect(screen.getAllByText('15').length).toBeGreaterThan(0)
    expect(screen.getAllByText('31').length).toBeGreaterThan(0)
  })

  it('toggles vacation day when clicking on a day', async () => {
    const user = userEvent.setup()
    
    // Find a current month day (look for one with current-month class)
    const currentMonthDays = document.querySelectorAll('.calendar-day.current-month')
    expect(currentMonthDays.length).toBeGreaterThan(0)
    
    const dayContainer = currentMonthDays[10] as HTMLElement // Use 11th current month day
    
    // Initially should not have vacation class
    expect(dayContainer).not.toHaveClass('vacation')
    
    // Click to select as vacation day
    await user.click(dayContainer)
    
    // Should now have vacation class
    expect(dayContainer).toHaveClass('vacation')
    
    // Click again to deselect
    await user.click(dayContainer)
    
    // Should no longer have vacation class
    expect(dayContainer).not.toHaveClass('vacation')
  })

  it('applies correct CSS classes to current month vs other month days', () => {
    // Check that we have both current month and other month days
    const currentMonthDays = document.querySelectorAll('.calendar-day.current-month')
    const otherMonthDays = document.querySelectorAll('.calendar-day.other-month')
    
    expect(currentMonthDays.length).toBeGreaterThan(0)
    expect(otherMonthDays.length).toBeGreaterThan(0)
  })
})