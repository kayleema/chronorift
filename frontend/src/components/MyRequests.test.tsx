import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MyRequests } from './MyRequests'
import * as api from '../services/api'

// Mock the API module
vi.mock('../services/api', () => ({
  fetchVacationDays: vi.fn(),
  requestVacationDeletion: vi.fn(),
  AuthenticationError: class AuthenticationError extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'AuthenticationError'
    }
  },
}))

const mockFetchVacationDays = vi.mocked(api.fetchVacationDays)

describe('MyRequests Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays list of vacation requests', async () => {
    const mockVacationData = [
      {
        id: 1,
        employeeId: 'test-employee',
        startDate: '2024-07-01',
        endDate: '2024-07-05',
        status: 'PENDING',
        assignedTo: 'user1'
      },
      {
        id: 2,
        employeeId: 'test-employee',
        startDate: '2024-08-15',
        endDate: '2024-08-15',
        status: 'APPROVED',
        assignedTo: 'user2'
      }
    ]
    mockFetchVacationDays.mockResolvedValue(mockVacationData)

    render(<MyRequests vacationRequests={mockVacationData} onRequestDeletion={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByText('有給申請一覧')).toBeInTheDocument()
    })

    expect(screen.getByText('7/1/2024 - 7/5/2024')).toBeInTheDocument()
    expect(screen.getByText('8/15/2024')).toBeInTheDocument()
    expect(screen.getByText('承認待ち')).toBeInTheDocument()
    expect(screen.getByText('承認済み')).toBeInTheDocument()
    expect(screen.getByText('担当者: user1')).toBeInTheDocument()
    expect(screen.getByText('担当者: user2')).toBeInTheDocument()
  })

  it('shows delete button only for approved requests', async () => {
    const mockVacationData = [
      {
        id: 1,
        employeeId: 'test-employee',
        startDate: '2024-07-01',
        endDate: '2024-07-05',
        status: 'PENDING',
        assignedTo: 'user1'
      },
      {
        id: 2,
        employeeId: 'test-employee',
        startDate: '2024-08-15',
        endDate: '2024-08-15',
        status: 'APPROVED',
        assignedTo: 'user2'
      }
    ]
    mockFetchVacationDays.mockResolvedValue(mockVacationData)

    render(<MyRequests vacationRequests={mockVacationData} onRequestDeletion={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByText('有給申請一覧')).toBeInTheDocument()
    })

    // Should not show delete button for pending request
    const pendingRequest = screen.getByText('承認待ち').closest('.request-item')
    expect(pendingRequest?.querySelector('.request-deletion-btn')).not.toBeInTheDocument()

    // Should show delete button for approved request
    const approvedRequest = screen.getByText('承認済み').closest('.request-item')
    expect(approvedRequest?.querySelector('.request-deletion-btn')).toBeInTheDocument()
  })

  it('shows deletion form for approved requests', async () => {
    const mockVacationData = [
      {
        id: 2,
        employeeId: 'test-employee',
        startDate: '2024-08-15',
        endDate: '2024-08-15',
        status: 'APPROVED',
        assignedTo: 'user2'
      }
    ]

    render(<MyRequests vacationRequests={mockVacationData} onRequestDeletion={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByText('有給申請一覧')).toBeInTheDocument()
    })

    // Check that deletion form is shown for approved requests
    expect(screen.getByPlaceholderText('削除申請の理由を入力してください...')).toBeInTheDocument()
    expect(screen.getByText('削除申請')).toBeInTheDocument()
  })

  it('submits deletion request with reason', async () => {
    const mockVacationData = [
      {
        id: 2,
        employeeId: 'test-employee',
        startDate: '2024-08-15',
        endDate: '2024-08-15',
        status: 'APPROVED',
        assignedTo: 'user2'
      }
    ]
    const mockOnRequestDeletion = vi.fn().mockResolvedValue(undefined)

    render(<MyRequests vacationRequests={mockVacationData} onRequestDeletion={mockOnRequestDeletion} />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('有給申請一覧')).toBeInTheDocument()
    })

    // Fill in reason
    const reasonInput = screen.getByPlaceholderText('削除申請の理由を入力してください...')
    await user.type(reasonInput, '家族の緊急事態')

    // Submit request
    const submitButton = screen.getByText('削除申請')
    await user.click(submitButton)

    expect(mockOnRequestDeletion).toHaveBeenCalledWith(2, '家族の緊急事態')
  })

  it('shows no delete button for pending deletion requests', async () => {
    const mockVacationData = [
      {
        id: 3,
        employeeId: 'test-employee',
        startDate: '2024-09-01',
        endDate: '2024-09-01',
        status: 'PENDING_DELETION',
        assignedTo: 'user1'
      }
    ]
    mockFetchVacationDays.mockResolvedValue(mockVacationData)

    render(<MyRequests vacationRequests={mockVacationData} onRequestDeletion={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByText('有給申請一覧')).toBeInTheDocument()
    })

    expect(screen.getByText('削除申請中')).toBeInTheDocument()
    
    // Should not show delete button for pending deletion request
    const requestItem = screen.getByText('削除申請中').closest('.request-item')
    expect(requestItem?.querySelector('.request-deletion-btn')).not.toBeInTheDocument()
  })

  it('shows no requests message when empty', () => {
    render(<MyRequests vacationRequests={[]} onRequestDeletion={vi.fn()} />)

    expect(screen.getByText('有給申請がありません。')).toBeInTheDocument()
  })

  it('validates deletion reason is required', async () => {
    const mockVacationData = [
      {
        id: 2,
        employeeId: 'test-employee',
        startDate: '2024-08-15',
        endDate: '2024-08-15',
        status: 'APPROVED',
        assignedTo: 'user2'
      }
    ]
    const mockOnRequestDeletion = vi.fn()

    render(<MyRequests vacationRequests={mockVacationData} onRequestDeletion={mockOnRequestDeletion} />)

    await waitFor(() => {
      expect(screen.getByText('有給申請一覧')).toBeInTheDocument()
    })

    // Button should be disabled without reason
    const submitButton = screen.getByText('削除申請')
    expect(submitButton).toBeDisabled()
    
    // Try to click disabled button - it shouldn't call the function
    await userEvent.click(submitButton)
    expect(mockOnRequestDeletion).not.toHaveBeenCalled()
  })
})