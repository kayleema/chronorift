import { useState } from 'react';
import type { VacationData } from '../services/api';

interface MyRequestsProps {
  vacationRequests: VacationData[];
  onRequestDeletion: (id: number, reason: string) => Promise<void>;
}

export function MyRequests({ vacationRequests, onRequestDeletion }: MyRequestsProps) {
  const [deletionReasons, setDeletionReasons] = useState<Record<number, string>>({});
  const [loadingDeletions, setLoadingDeletions] = useState<Set<number>>(new Set());

  const handleDeletionRequest = async (id: number) => {
    const reason = deletionReasons[id] || '';
    if (!reason.trim()) {
      alert('削除理由を入力してください');
      return;
    }

    setLoadingDeletions(prev => new Set(prev).add(id));
  try {
      await onRequestDeletion(id, reason);
      setDeletionReasons(prev => ({ ...prev, [id]: '' }));
    } catch (error) {
      console.error('Failed to request deletion:', error);
      alert('削除申請に失敗しました。もう一度お試しください。');
    } finally {
      setLoadingDeletions(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleReasonChange = (id: number, reason: string) => {
    setDeletionReasons(prev => ({ ...prev, [id]: reason }));
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'PENDING': return '承認待ち';
      case 'APPROVED': return '承認済み';
      case 'REJECTED': return '却下';
      case 'PENDING_DELETION': return '削除申請中';  
      case 'DELETION_REJECTED': return '削除却下';
      case 'DELETED': return '削除済み';
      default: return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'APPROVED': return 'status-approved';
      case 'REJECTED': return 'status-rejected';
      case 'PENDING_DELETION': return 'status-pending-deletion';
      case 'DELETION_REJECTED': return 'status-deletion-rejected';
      case 'DELETED': return 'status-deleted';
      default: return '';
    }
  };

  const canRequestDeletion = (status: string) => {
    return status === 'APPROVED';
  };

  if (vacationRequests.length === 0) {
    return (
      <div className="my-requests">
        <h2>有給申請一覧</h2>
        <div className="no-requests">有給申請がありません。</div>
      </div>
    );
  }

  return (
    <div className="my-requests">
      <h2>有給申請一覧</h2>
      <div className="requests-list">
        {vacationRequests.map((request) => (
          <div key={request.id} className={`request-item ${getStatusClass(request.status)}`}>
            <div className="request-dates">
              <strong>
                {request.startDate === request.endDate 
                  ? new Date(request.startDate).toLocaleDateString()
                  : `${new Date(request.startDate).toLocaleDateString()} - ${new Date(request.endDate).toLocaleDateString()}`
                }
              </strong>
            </div>
            <div className="request-status">
              ステータス: <span className={`status-badge ${getStatusClass(request.status)}`}>
                {getStatusDisplay(request.status)}
              </span>
            </div>
            {request.assignedTo && (
              <div className="request-assigned">
                担当者: {request.assignedTo}
              </div>
            )}
            {request.deletionReason && (
              <div className="deletion-reason">
                削除理由: {request.deletionReason}
              </div>
            )}
            {canRequestDeletion(request.status) && (
              <div className="deletion-request">
                <textarea
                  value={deletionReasons[request.id] || ''}
                  onChange={(e) => handleReasonChange(request.id, e.target.value)}
                  placeholder="削除申請の理由を入力してください..."
                  className="deletion-reason-input"
                  disabled={loadingDeletions.has(request.id)}
                />
                <button
                  onClick={() => handleDeletionRequest(request.id)}
                  disabled={loadingDeletions.has(request.id) || !deletionReasons[request.id]?.trim()}
                  className="request-deletion-btn"
                >
                  {loadingDeletions.has(request.id) ? '申請中...' : '削除申請'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}