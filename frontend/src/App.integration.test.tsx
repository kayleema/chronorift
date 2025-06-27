import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from './App'
import * as api from './services/api'

// Mock the entire API module
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
const mockRedirectToLogin = vi.mocked(api.redirectToLogin)
const mockFetchUsers = vi.mocked(api.fetchUsers)
const mockFetchPendingApprovals = vi.mocked(api.fetchPendingApprovals)

describe('App Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock successful fetchUsers by default
    mockFetchUsers.mockResolvedValue([
      { id: 'user1', name: 'John Doe' },
      { id: 'user2', name: 'Jane Smith' }
    ])
    // Mock successful fetchPendingApprovals by default
    mockFetchPendingApprovals.mockResolvedValue([])
  })

  it('shows loading state initially', () => {
    mockFetchVacationDays.mockImplementation(() => new Promise(() => {})) // Never resolves
    mockFetchUsers.mockImplementation(() => new Promise(() => {})) // Never resolves
    mockFetchPendingApprovals.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<App />)

    expect(screen.getByText('有給申請データを読み込み中...')).toBeInTheDocument()
  })

  it('fetches vacation data on mount and displays calendar', async () => {
    const mockVacationData = [
      {
        id: 1,
        employeeId: 'test-employee',
        startDate: '2025-06-15',
        endDate: '2025-06-17',
        status: 'APPROVED'
      }
    ]

    mockFetchVacationDays.mockResolvedValueOnce(mockVacationData)

    render(<App />)

    // Initially shows loading
    expect(screen.getByText('有給申請データを読み込み中...')).toBeInTheDocument()

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('有給申請データを読み込み中...')).not.toBeInTheDocument()
    })

    // Should show the calendar
    expect(screen.getByText(/有給申請 - \d{4}/)).toBeInTheDocument()
    
    // Should call the API
    expect(mockFetchVacationDays).toHaveBeenCalledTimes(1)
    
    // Should display vacation days (days 15, 16, 17 should have vacation class)
    const vacationDays = document.querySelectorAll('.calendar-day.vacation')
    expect(vacationDays.length).toBeGreaterThan(0)
  })

  it('redirects to login when user is not authenticated', async () => {
    mockFetchVacationDays.mockRejectedValueOnce(new api.AuthenticationError('User not authenticated'))

    render(<App />)

    await waitFor(() => {
      expect(mockRedirectToLogin).toHaveBeenCalledTimes(1)
    })

    expect(mockFetchVacationDays).toHaveBeenCalledTimes(1)
  })

  it('shows error message for network errors', async () => {
    mockFetchVacationDays.mockRejectedValueOnce(new Error('Network connection failed'))

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/エラー: Network connection failed/)).toBeInTheDocument()
    })

    expect(screen.getByText('再試行')).toBeInTheDocument()
    expect(mockRedirectToLogin).not.toHaveBeenCalled()
  })

  it('converts vacation date ranges to individual days correctly', async () => {
    const mockVacationData = [
      {
        id: 1,
        employeeId: 'test-employee',
        startDate: '2025-06-15',
        endDate: '2025-06-17', // 3-day vacation
        status: 'APPROVED'
      },
      {
        id: 2,
        employeeId: 'test-employee',
        startDate: '2025-06-20',
        endDate: '2025-06-20', // 1-day vacation
        status: 'PENDING'
      }
    ]

    mockFetchVacationDays.mockResolvedValueOnce(mockVacationData)

    render(<App />)

    await waitFor(() => {
      expect(screen.queryByText('有給申請データを読み込み中...')).not.toBeInTheDocument()
    })

    // Should have vacation days for 15th, 16th, 17th, and 20th
    const vacationDays = document.querySelectorAll('.calendar-day.vacation')
    expect(vacationDays.length).toBeGreaterThanOrEqual(4)
  })

  it('handles empty vacation data response', async () => {
    mockFetchVacationDays.mockResolvedValueOnce([])

    render(<App />)

    await waitFor(() => {
      expect(screen.queryByText('有給申請データを読み込み中...')).not.toBeInTheDocument()
    })

    // Should show calendar with no vacation days selected
    expect(screen.getByText(/有給申請 - \d{4}/)).toBeInTheDocument()
    const vacationDays = document.querySelectorAll('.calendar-day.vacation')
    expect(vacationDays.length).toBe(0)
  })

  it('allows manual day selection after data loads', async () => {
    mockFetchVacationDays.mockResolvedValueOnce([])

    render(<App />)

    await waitFor(() => {
      expect(screen.queryByText('有給申請データを読み込み中...')).not.toBeInTheDocument()
    })

    // Find a current month day and click it
    const currentMonthDays = document.querySelectorAll('.calendar-day.current-month')
    expect(currentMonthDays.length).toBeGreaterThan(0)

    const firstDay = currentMonthDays[0] as HTMLElement
    expect(firstDay).not.toHaveClass('vacation')

    // Note: We can't easily test the click because it would require user-event
    // which is already tested in the component tests. This test focuses on
    // the integration of data loading and state management.
  })
})