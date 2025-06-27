import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminApprovals } from './AdminApprovals';
import type { VacationWithUserInfo } from '../services/api';

describe('AdminApprovals Component', () => {
  const mockOnApproveVacation = vi.fn();
  const mockOnRejectVacation = vi.fn();
  const mockOnApproveDeletion = vi.fn();
  const mockOnRejectDeletion = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows no pending message when list is empty', () => {
    render(
      <AdminApprovals
        pendingApprovals={[]}
        onApproveVacation={mockOnApproveVacation}
        onRejectVacation={mockOnRejectVacation}
        onApproveDeletion={mockOnApproveDeletion}
        onRejectDeletion={mockOnRejectDeletion}
      />
    );

    expect(screen.getByText('承認待ち一覧')).toBeInTheDocument();
    expect(screen.getByText('承認待ちの申請がありません。')).toBeInTheDocument();
  });

  it('displays pending vacation requests with approval buttons', () => {
    const mockPendingRequests: VacationWithUserInfo[] = [
      {
        id: 1,
        employeeId: 'test-employee',
        employeeName: 'Test Employee',
        startDate: '2024-07-01',
        endDate: '2024-07-05',
        status: 'PENDING',
        assignedTo: 'user1',
        assignedToName: 'User One'
      }
    ];

    render(
      <AdminApprovals
        pendingApprovals={mockPendingRequests}
        onApproveVacation={mockOnApproveVacation}
        onRejectVacation={mockOnRejectVacation}
        onApproveDeletion={mockOnApproveDeletion}
        onRejectDeletion={mockOnRejectDeletion}
      />
    );

    expect(screen.getByText('承認待ち一覧')).toBeInTheDocument();
    expect(screen.getByText('新規有給申請')).toBeInTheDocument();
    expect(screen.getByText('申請ID: 1')).toBeInTheDocument();
    expect(screen.getByText('申請者: Test Employee')).toBeInTheDocument();
    expect(screen.getByText('担当者: User One')).toBeInTheDocument();
    expect(screen.getByText('承認')).toBeInTheDocument();
    expect(screen.getByText('却下')).toBeInTheDocument();
  });

  it('displays pending deletion requests with deletion approval buttons', () => {
    const mockPendingRequests: VacationWithUserInfo[] = [
      {
        id: 2,
        employeeId: 'test-employee',
        employeeName: 'Test Employee',
        startDate: '2024-08-15',
        endDate: '2024-08-15',
        status: 'PENDING_DELETION',
        assignedTo: 'user2',
        assignedToName: 'User Two',
        deletionReason: '家族の緊急事態'
      }
    ];

    render(
      <AdminApprovals
        pendingApprovals={mockPendingRequests}
        onApproveVacation={mockOnApproveVacation}
        onRejectVacation={mockOnRejectVacation}
        onApproveDeletion={mockOnApproveDeletion}
        onRejectDeletion={mockOnRejectDeletion}
      />
    );

    expect(screen.getByText('承認待ち一覧')).toBeInTheDocument();
    expect(screen.getByText('削除申請')).toBeInTheDocument();
    expect(screen.getByText('申請ID: 2')).toBeInTheDocument();
    expect(screen.getByText('申請者: Test Employee')).toBeInTheDocument();
    expect(screen.getByText('削除理由: 家族の緊急事態')).toBeInTheDocument();
    expect(screen.getByText('削除承認')).toBeInTheDocument();
    expect(screen.getByText('削除却下')).toBeInTheDocument();
  });

  it('calls approve function when approve button is clicked', async () => {
    const mockPendingRequests: VacationWithUserInfo[] = [
      {
        id: 1,
        employeeId: 'test-employee',
        employeeName: 'Test Employee',
        startDate: '2024-07-01',
        endDate: '2024-07-01',
        status: 'PENDING',
        assignedTo: 'user1',
        assignedToName: 'User One'
      }
    ];

    mockOnApproveVacation.mockResolvedValue(undefined);

    render(
      <AdminApprovals
        pendingApprovals={mockPendingRequests}
        onApproveVacation={mockOnApproveVacation}
        onRejectVacation={mockOnRejectVacation}
        onApproveDeletion={mockOnApproveDeletion}
        onRejectDeletion={mockOnRejectDeletion}
      />
    );

    const user = userEvent.setup();
    const approveButton = screen.getByText('承認');
    
    await user.click(approveButton);

    expect(mockOnApproveVacation).toHaveBeenCalledWith(1);
  });

  it('calls reject function when reject button is clicked', async () => {
    const mockPendingRequests: VacationWithUserInfo[] = [
      {
        id: 1,
        employeeId: 'test-employee',
        employeeName: 'Test Employee',
        startDate: '2024-07-01',
        endDate: '2024-07-01',
        status: 'PENDING',
        assignedTo: 'user1',
        assignedToName: 'User One'
      }
    ];

    mockOnRejectVacation.mockResolvedValue(undefined);

    render(
      <AdminApprovals
        pendingApprovals={mockPendingRequests}
        onApproveVacation={mockOnApproveVacation}
        onRejectVacation={mockOnRejectVacation}
        onApproveDeletion={mockOnApproveDeletion}
        onRejectDeletion={mockOnRejectDeletion}
      />
    );

    const user = userEvent.setup();
    const rejectButton = screen.getByText('却下');
    
    await user.click(rejectButton);

    expect(mockOnRejectVacation).toHaveBeenCalledWith(1);
  });

  it('calls approve deletion function when deletion approve button is clicked', async () => {
    const mockPendingRequests: VacationWithUserInfo[] = [
      {
        id: 2,
        employeeId: 'test-employee',
        employeeName: 'Test Employee',
        startDate: '2024-08-15',
        endDate: '2024-08-15',
        status: 'PENDING_DELETION',
        assignedTo: 'user2',
        assignedToName: 'User Two',
        deletionReason: '家族の緊急事態'
      }
    ];

    mockOnApproveDeletion.mockResolvedValue(undefined);

    render(
      <AdminApprovals
        pendingApprovals={mockPendingRequests}
        onApproveVacation={mockOnApproveVacation}
        onRejectVacation={mockOnRejectVacation}
        onApproveDeletion={mockOnApproveDeletion}
        onRejectDeletion={mockOnRejectDeletion}
      />
    );

    const user = userEvent.setup();
    const approveDeletionButton = screen.getByText('削除承認');
    
    await user.click(approveDeletionButton);

    expect(mockOnApproveDeletion).toHaveBeenCalledWith(2);
  });

  it('calls reject deletion function when deletion reject button is clicked', async () => {
    const mockPendingRequests: VacationWithUserInfo[] = [
      {
        id: 2,
        employeeId: 'test-employee',
        employeeName: 'Test Employee',
        startDate: '2024-08-15',
        endDate: '2024-08-15',
        status: 'PENDING_DELETION',
        assignedTo: 'user2',
        assignedToName: 'User Two',
        deletionReason: '家族の緊急事態'
      }
    ];

    mockOnRejectDeletion.mockResolvedValue(undefined);

    render(
      <AdminApprovals
        pendingApprovals={mockPendingRequests}
        onApproveVacation={mockOnApproveVacation}
        onRejectVacation={mockOnRejectVacation}
        onApproveDeletion={mockOnApproveDeletion}
        onRejectDeletion={mockOnRejectDeletion}
      />
    );

    const user = userEvent.setup();
    const rejectDeletionButton = screen.getByText('削除却下');
    
    await user.click(rejectDeletionButton);

    expect(mockOnRejectDeletion).toHaveBeenCalledWith(2);
  });

  it('shows loading state during actions', async () => {
    const mockPendingRequests: VacationWithUserInfo[] = [
      {
        id: 1,
        employeeId: 'test-employee',
        employeeName: 'Test Employee',
        startDate: '2024-07-01',
        endDate: '2024-07-01',
        status: 'PENDING',
        assignedTo: 'user1',
        assignedToName: 'User One'
      }
    ];

    // Make the function take some time to resolve
    mockOnApproveVacation.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <AdminApprovals
        pendingApprovals={mockPendingRequests}
        onApproveVacation={mockOnApproveVacation}
        onRejectVacation={mockOnRejectVacation}
        onApproveDeletion={mockOnApproveDeletion}
        onRejectDeletion={mockOnRejectDeletion}
      />
    );

    const user = userEvent.setup();
    const approveButton = screen.getByText('承認');
    
    await user.click(approveButton);

    // Should show loading text
    expect(screen.getByText('承認中...')).toBeInTheDocument();
    
    // Wait for action to complete
    await waitFor(() => {
      expect(screen.getByText('承認')).toBeInTheDocument();
    });
  });

  it('displays date ranges correctly for multi-day requests', () => {
    const mockPendingRequests: VacationWithUserInfo[] = [
      {
        id: 1,
        employeeId: 'test-employee',
        employeeName: 'Test Employee',
        startDate: '2024-07-01',
        endDate: '2024-07-05',
        status: 'PENDING',
        assignedTo: 'user1',
        assignedToName: 'User One'
      }
    ];

    render(
      <AdminApprovals
        pendingApprovals={mockPendingRequests}
        onApproveVacation={mockOnApproveVacation}
        onRejectVacation={mockOnRejectVacation}
        onApproveDeletion={mockOnApproveDeletion}
        onRejectDeletion={mockOnRejectDeletion}
      />
    );

    // Check that the date range is displayed correctly (Japanese format)
    expect(screen.getByText(/2024\/7\/1.*2024\/7\/5/)).toBeInTheDocument();
  });
});