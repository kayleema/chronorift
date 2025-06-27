import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import * as api from './services/api'

// Mock the API module
vi.mock('./services/api', () => ({
  fetchVacationDays: vi.fn(),
  redirectToLogin: vi.fn(),
  fetchUsers: vi.fn(),
  createVacationRequest: vi.fn(),
  requestVacationDeletion: vi.fn(),
  fetchPendingApprovals: vi.fn(),
  approveVacation: vi.fn(),
  rejectVacation: vi.fn(),
  approveDeletion: vi.fn(),
  rejectDeletion: vi.fn(),
  AuthenticationError: class AuthenticationError extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'AuthenticationError'
    }
  },
}))

const mockFetchVacationDays = vi.mocked(api.fetchVacationDays)
const mockFetchUsers = vi.mocked(api.fetchUsers)
const mockCreateVacationRequest = vi.mocked(api.createVacationRequest)
const mockFetchPendingApprovals = vi.mocked(api.fetchPendingApprovals)

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock successful API calls by default
    mockFetchVacationDays.mockResolvedValue([])
    mockFetchUsers.mockResolvedValue([
      { id: 'user1', name: 'John Doe' },
      { id: 'user2', name: 'Jane Smith' },
      { id: 'user3', name: 'Bob Johnson' }
    ])
    mockCreateVacationRequest.mockResolvedValue({
      id: 1,
      employeeId: 'current-user',
      startDate: '2024-01-01',
      endDate: '2024-01-01',
      status: 'PENDING',
      assignedTo: 'user1'
    })
    mockFetchPendingApprovals.mockResolvedValue([])
  })

  it('renders the main title', async () => {
    render(<App />)
    const currentYear = new Date().getFullYear()
    expect(screen.getByText(`有給申請 - ${currentYear}`)).toBeInTheDocument()
  })

  it('renders day names in Japanese after loading', async () => {
    render(<App />)
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('有給申請データを読み込み中...')).not.toBeInTheDocument()
    })

    const dayNames = ['月', '火', '水', '木', '金', '土', '日']
    dayNames.forEach(day => {
      expect(screen.getByText(day)).toBeInTheDocument()
    })
  })

  it('renders month names in Japanese after loading', async () => {
    render(<App />)
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('有給申請データを読み込み中...')).not.toBeInTheDocument()
    })

    // At least January should be visible
    expect(screen.getByText('1月')).toBeInTheDocument()
  })

  it('renders calendar days after loading', async () => {
    render(<App />)
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('有給申請データを読み込み中...')).not.toBeInTheDocument()
    })

    // Should have multiple instances of day 1 (from different months)
    expect(screen.getAllByText('1')).toHaveLength(12) // Appears in each month
    expect(screen.getAllByText('15').length).toBeGreaterThan(0)
    expect(screen.getAllByText('31').length).toBeGreaterThan(0)
  })

  it('toggles vacation day when clicking on a day', async () => {
    render(<App />)
    const user = userEvent.setup()
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('有給申請データを読み込み中...')).not.toBeInTheDocument()
    })
    
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

  it('applies correct CSS classes to current month vs other month days', async () => {
    render(<App />)
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('有給申請データを読み込み中...')).not.toBeInTheDocument()
    })
    
    // Check that we have both current month and other month days
    const currentMonthDays = document.querySelectorAll('.calendar-day.current-month')
    const otherMonthDays = document.querySelectorAll('.calendar-day.other-month')
    
    expect(currentMonthDays.length).toBeGreaterThan(0)
    expect(otherMonthDays.length).toBeGreaterThan(0)
  })

  describe('User Assignment Dropdown', () => {
    it('renders the assign to dropdown', async () => {
      render(<App />)
      
      await waitFor(() => {
        expect(screen.queryByText('有給申請データを読み込み中...')).not.toBeInTheDocument()
      })

      expect(screen.getByLabelText('担当者:')).toBeInTheDocument()
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument() // First user should be selected by default
    })

    it('loads and displays user options in dropdown', async () => {
      render(<App />)
      const user = userEvent.setup()
      
      await waitFor(() => {
        expect(screen.queryByText('有給申請データを読み込み中...')).not.toBeInTheDocument()
      })

      const dropdown = screen.getByLabelText('担当者:')
      await user.click(dropdown)

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
    })

    it('changes selected user when dropdown option is selected', async () => {
      render(<App />)
      const user = userEvent.setup()
      
      await waitFor(() => {
        expect(screen.queryByText('有給申請データを読み込み中...')).not.toBeInTheDocument()
      })

      const dropdown = screen.getByLabelText('担当者:')
      await user.selectOptions(dropdown, 'user2')

      expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument()
    })

    it('includes selected user in save request', async () => {
      render(<App />)
      const user = userEvent.setup()
      
      await waitFor(() => {
        expect(screen.queryByText('有給申請データを読み込み中...')).not.toBeInTheDocument()
      })

      // Select a different user
      const dropdown = screen.getByLabelText('担当者:')
      await user.selectOptions(dropdown, 'user2')

      // Select a vacation day
      const currentMonthDays = document.querySelectorAll('.calendar-day.current-month')
      await user.click(currentMonthDays[5] as HTMLElement)

      // Click save
      const saveButton = screen.getByText('変更を保存')
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockCreateVacationRequest).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String),
          'user2'
        )
      })
    })

    it('shows error when users fail to load', async () => {
      mockFetchUsers.mockRejectedValue(new Error('Failed to load users'))
      
      render(<App />)
      
      await waitFor(() => {
        expect(screen.getByText(/Failed to load users/)).toBeInTheDocument()
      })
    })
  })

  describe('Calendar Status Handling', () => {
    it('allows clicking on PENDING vacation days to toggle them', async () => {
      const mockVacationData = [
        {
          id: 1,
          employeeId: 'test-employee',
          startDate: '2025-01-15',
          endDate: '2025-01-15',
          status: 'PENDING',
          assignedTo: 'user1'
        }
      ]
      mockFetchVacationDays.mockResolvedValue(mockVacationData)

      render(<App />)
      const user = userEvent.setup()
      
      await waitFor(() => {
        expect(screen.queryByText('有給申請データを読み込み中...')).not.toBeInTheDocument()
      })

      // Find the pending vacation day
      const pendingDay = document.querySelector('.calendar-day.vacation.status-pending')
      expect(pendingDay).toBeInTheDocument()
      expect(pendingDay).not.toHaveClass('blocked')

      // Should be able to click it
      await user.click(pendingDay as HTMLElement)
      
      // Should toggle off (remove vacation class)
      expect(pendingDay).not.toHaveClass('vacation')
    })

    it('blocks clicking on APPROVED vacation days', async () => {
      const mockVacationData = [
        {
          id: 2,
          employeeId: 'test-employee', 
          startDate: '2025-01-20',
          endDate: '2025-01-20',
          status: 'APPROVED',
          assignedTo: 'user1'
        }
      ]
      mockFetchVacationDays.mockResolvedValue(mockVacationData)

      render(<App />)
      const user = userEvent.setup()
      
      await waitFor(() => {
        expect(screen.queryByText('有給申請データを読み込み中...')).not.toBeInTheDocument()
      })

      // Find the approved vacation day
      const approvedDay = document.querySelector('.calendar-day.vacation.status-approved')
      expect(approvedDay).toBeInTheDocument()
      expect(approvedDay).toHaveClass('blocked')

      // Click should be blocked/have no effect
      await user.click(approvedDay as HTMLElement)
      
      // Should still have vacation class (wasn't toggled)
      expect(approvedDay).toHaveClass('vacation')
    })

    it('shows PENDING_DELETION vacation days with special styling', async () => {
      const mockVacationData = [
        {
          id: 3,
          employeeId: 'test-employee',
          startDate: '2025-01-25',
          endDate: '2025-01-25', 
          status: 'PENDING_DELETION',
          assignedTo: 'user1'
        }
      ]
      mockFetchVacationDays.mockResolvedValue(mockVacationData)

      render(<App />)
      
      await waitFor(() => {
        expect(screen.queryByText('有給申請データを読み込み中...')).not.toBeInTheDocument()
      })

      // Find the pending deletion vacation day
      const pendingDeletionDay = document.querySelector('.calendar-day.vacation.status-pending-deletion')
      expect(pendingDeletionDay).toBeInTheDocument()
      expect(pendingDeletionDay).toHaveClass('blocked')
      expect(pendingDeletionDay).toHaveClass('pending-deletion')
    })

    it('shows tooltip for blocked vacation days', async () => {
      const mockVacationData = [
        {
          id: 4,
          employeeId: 'test-employee',
          startDate: '2025-01-30',
          endDate: '2025-01-30',
          status: 'APPROVED',
          assignedTo: 'user1'
        }
      ]
      mockFetchVacationDays.mockResolvedValue(mockVacationData)

      render(<App />)
      
      await waitFor(() => {
        expect(screen.queryByText('有給申請データを読み込み中...')).not.toBeInTheDocument()
      })

      // Find the approved vacation day
      const approvedDay = document.querySelector('.calendar-day.vacation.status-approved')
      expect(approvedDay).toBeInTheDocument()

      // Check tooltip via title attribute
      expect(approvedDay).toHaveAttribute('title', '承認済みの申請は変更できません')
    })
  })
})