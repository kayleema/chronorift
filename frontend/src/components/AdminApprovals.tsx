import { useState } from 'react';
import type { VacationWithUserInfo } from '../services/api';

interface AdminApprovalsProps {
  pendingApprovals: VacationWithUserInfo[];
  onApproveVacation: (id: number) => Promise<void>;
  onRejectVacation: (id: number) => Promise<void>;
  onApproveDeletion: (id: number) => Promise<void>;
  onRejectDeletion: (id: number) => Promise<void>;
}

export function AdminApprovals({ 
  pendingApprovals, 
  onApproveVacation, 
  onRejectVacation, 
  onApproveDeletion, 
  onRejectDeletion 
}: AdminApprovalsProps) {
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set());

  const handleAction = async (action: () => Promise<void>, actionKey: string) => {
    setLoadingActions(prev => new Set(prev).add(actionKey));
    try {
      await action();
    } catch (error) {
      console.error('Action failed:', error);
      alert('操作に失敗しました。もう一度お試しください。');
    } finally {
      setLoadingActions(prev => {
        const next = new Set(prev);
        next.delete(actionKey);
        return next;
      });
    }
  };

  const getRequestTypeDisplay = (status: string) => {
    switch (status) {
      case 'PENDING': return '新規有給申請';
      case 'PENDING_DELETION': return '削除申請';
      default: return status;
    }
  };

  const getActionButtons = (request: VacationWithUserInfo) => {
    const isLoading = (action: string) => loadingActions.has(`${request.id}-${action}`);
    
    if (request.status === 'PENDING') {
      return (
        <div className="approval-actions">
          <button
            onClick={() => handleAction(
              () => onApproveVacation(request.id),
              `${request.id}-approve`
            )}
            disabled={isLoading('approve') || isLoading('reject')}
            className="approve-btn"
          >
            {isLoading('approve') ? '承認中...' : '承認'}
          </button>
          <button
            onClick={() => handleAction(
              () => onRejectVacation(request.id),
              `${request.id}-reject`
            )}
            disabled={isLoading('approve') || isLoading('reject')}
            className="reject-btn"
          >
            {isLoading('reject') ? '却下中...' : '却下'}
          </button>
        </div>
      );
    } else if (request.status === 'PENDING_DELETION') {
      return (
        <div className="approval-actions">
          <button
            onClick={() => handleAction(
              () => onApproveDeletion(request.id),
              `${request.id}-approve-deletion`
            )}
            disabled={isLoading('approve-deletion') || isLoading('reject-deletion')}
            className="approve-deletion-btn"
          >
            {isLoading('approve-deletion') ? '削除承認中...' : '削除承認'}
          </button>
          <button
            onClick={() => handleAction(
              () => onRejectDeletion(request.id),
              `${request.id}-reject-deletion`
            )}
            disabled={isLoading('approve-deletion') || isLoading('reject-deletion')}
            className="reject-deletion-btn"
          >
            {isLoading('reject-deletion') ? '削除却下中...' : '削除却下'}
          </button>
        </div>
      );
    }
    return null;
  };

  if (pendingApprovals.length === 0) {
    return (
      <div className="admin-approvals">
        <h2>承認待ち一覧</h2>
        <div className="no-pending">承認待ちの申請がありません。</div>
      </div>
    );
  }

  return (
    <div className="admin-approvals">
      <h2>承認待ち一覧</h2>
      <div className="pending-list">
        {pendingApprovals.map((request) => (
          <div key={request.id} className={`pending-item ${request.status.toLowerCase().replace('_', '-')}`}>
            <div className="request-header">
              <div className="request-type">
                <span className="type-badge">{getRequestTypeDisplay(request.status)}</span>
              </div>
              <div className="request-id">申請ID: {request.id}</div>
            </div>
            
            <div className="request-details">
              <div className="request-dates">
                <strong>
                  {request.startDate === request.endDate 
                    ? new Date(request.startDate).toLocaleDateString('ja-JP')
                    : `${new Date(request.startDate).toLocaleDateString('ja-JP')} - ${new Date(request.endDate).toLocaleDateString('ja-JP')}`
                  }
                </strong>
              </div>
              
              <div className="request-employee">
                申請者: {request.employeeName || request.employeeId}
              </div>
              
              {request.assignedTo && (
                <div className="request-assigned">
                  担当者: {request.assignedToName || request.assignedTo}
                </div>
              )}
              
              {request.deletionReason && (
                <div className="deletion-reason">
                  削除理由: {request.deletionReason}
                </div>
              )}
            </div>
            
            {getActionButtons(request)}
          </div>
        ))}
      </div>
    </div>
  );
}