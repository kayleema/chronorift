import React, { useState, useEffect } from 'react';
import './App.css';
import { VacationCalendar } from './components/VacationCalendar';
import { MyRequests } from './components/MyRequests';
import { AdminApprovals } from './components/AdminApprovals';
import { fetchVacationDays, redirectToLogin, AuthenticationError, createVacationRequest, fetchUsers, requestVacationDeletion, fetchPendingApprovals, approveVacation, rejectVacation, approveDeletion, rejectDeletion } from './services/api';
import type { VacationData, VacationWithUserInfo, User } from './services/api';
import { convertDaysToRanges, dateToLocalString } from './utils/vacation';

interface AppState {
  vacationDays: Set<string>;
  originalVacationDays: Set<string>; // Track original state to detect changes
  vacationDayStatuses: Map<string, VacationData>; // Track status for each day
  loading: boolean;
  saving: boolean;
  error: string | null;
  saveMessage: string | null;
  users: User[];
  selectedUserId: string;
  usersLoading: boolean;
  pendingApprovals: VacationWithUserInfo[];
  approvalsLoading: boolean;
}

function App() {
  const [state, setState] = useState<AppState>({
    vacationDays: new Set(),
    originalVacationDays: new Set(),
    vacationDayStatuses: new Map(),
    loading: true,
    saving: false,
    error: null,
    saveMessage: null,
    users: [],
    selectedUserId: '',
    usersLoading: true,
    pendingApprovals: [],
    approvalsLoading: true,
  });
  
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const loadData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, usersLoading: true, approvalsLoading: true, error: null }));
        
        // Load vacation data, users, and pending approvals in parallel
        const [vacationData, users, pendingApprovals] = await Promise.all([
          fetchVacationDays(),
          fetchUsers(),
          fetchPendingApprovals()
        ]);
        
        // Convert vacation ranges to individual days and track statuses
        const vacationDaySet = new Set<string>();
        const statusMap = new Map<string, VacationData>();
        vacationData.forEach((vacation: VacationData) => {
          const startDate = new Date(vacation.startDate);
          const endDate = new Date(vacation.endDate);
          
          for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            const dayString = dateToLocalString(date);
            vacationDaySet.add(dayString);
            statusMap.set(dayString, vacation);
          }
        });
        
        setState(prev => ({
          ...prev,
          vacationDays: vacationDaySet,
          originalVacationDays: new Set(vacationDaySet), // Store original state
          vacationDayStatuses: statusMap,
          loading: false,
          users,
          selectedUserId: users.length > 0 ? users[0].id : '',
          usersLoading: false,
          pendingApprovals,
          approvalsLoading: false,
        }));
        
      } catch (error) {
        if (error instanceof AuthenticationError) {
          redirectToLogin();
          return;
        }
        
        setState(prev => ({
          ...prev,
          loading: false,
          usersLoading: false,
          approvalsLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        }));
      }
    };

    loadData();
  }, []);

  const handleDayClick = (day: Date) => {
    const dayString = dateToLocalString(day);
    const dayStatus = state.vacationDayStatuses.get(dayString);
    
    // Check if day is modifiable (only PENDING vacations can be toggled)
    if (dayStatus && dayStatus.status !== 'PENDING') {
      // Day is blocked - do nothing
      return;
    }
    
    setState(prev => ({
      ...prev,
      vacationDays: new Set(
        prev.vacationDays.has(dayString)
          ? [...prev.vacationDays].filter(d => d !== dayString)
          : [...prev.vacationDays, dayString]
      ),
      saveMessage: null, // Clear save message when making changes
    }));
  };

  const handleSave = async () => {
    setState(prev => ({ ...prev, saving: true, error: null, saveMessage: null }));

    try {
      // Get only the newly added days (not in original set)
      const newDays = new Set([...state.vacationDays].filter(day => !state.originalVacationDays.has(day)));
      
      if (newDays.size === 0) {
        setState(prev => ({ 
          ...prev, 
          saving: false, 
          saveMessage: '保存する新しい有給申請がありません' 
        }));
        return;
      }

      // Convert new days to date ranges
      const dateRanges = convertDaysToRanges(newDays);
      
      // Create vacation requests for each range
      const savePromises = dateRanges.map(range => 
        createVacationRequest(range.startDate, range.endDate, state.selectedUserId)
      );

      await Promise.all(savePromises);

      // Update original state to reflect saved changes
      setState(prev => ({
        ...prev,
        originalVacationDays: new Set(prev.vacationDays),
        saving: false,
        saveMessage: `${dateRanges.length}件の有給申請を保存しました`,
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        saving: false,
        error: error instanceof Error ? error.message : '有給申請の保存に失敗しました',
      }));
    }
  };

  const hasUnsavedChanges = () => {
    return state.vacationDays.size !== state.originalVacationDays.size ||
           [...state.vacationDays].some(day => !state.originalVacationDays.has(day));
  };

  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setState(prev => ({
      ...prev,
      selectedUserId: event.target.value,
    }));
  };

  const handleRequestDeletion = async (id: number, reason: string) => {
    try {
      await requestVacationDeletion(id, reason);
      
      // Refresh vacation data to get updated status
      const vacationData = await fetchVacationDays();
      
      // Update state with new data
      const vacationDaySet = new Set<string>();
      const statusMap = new Map<string, VacationData>();
      vacationData.forEach((vacation: VacationData) => {
        const startDate = new Date(vacation.startDate);
        const endDate = new Date(vacation.endDate);
        
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
          const dayString = dateToLocalString(date);
          vacationDaySet.add(dayString);
          statusMap.set(dayString, vacation);
        }
      });
      
      setState(prev => ({
        ...prev,
        vacationDays: vacationDaySet,
        originalVacationDays: new Set(vacationDaySet),
        vacationDayStatuses: statusMap,
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '削除申請に失敗しました',
      }));
    }
  };

  const refreshData = async () => {
    try {
      // Refresh both vacation data and pending approvals
      const [vacationData, pendingApprovals] = await Promise.all([
        fetchVacationDays(),
        fetchPendingApprovals()
      ]);
      
      // Update vacation data
      const vacationDaySet = new Set<string>();
      const statusMap = new Map<string, VacationData>();
      vacationData.forEach((vacation: VacationData) => {
        const startDate = new Date(vacation.startDate);
        const endDate = new Date(vacation.endDate);
        
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
          const dayString = dateToLocalString(date);
          vacationDaySet.add(dayString);
          statusMap.set(dayString, vacation);
        }
      });
      
      setState(prev => ({
        ...prev,
        vacationDays: vacationDaySet,
        originalVacationDays: new Set(vacationDaySet),
        vacationDayStatuses: statusMap,
        pendingApprovals,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'データの更新に失敗しました',
      }));
    }
  };

  const handleApproveVacation = async (id: number) => {
    try {
      await approveVacation(id);
      await refreshData();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '承認に失敗しました');
    }
  };

  const handleRejectVacation = async (id: number) => {
    try {
      await rejectVacation(id);
      await refreshData();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '却下に失敗しました');
    }
  };

  const handleApproveDeletion = async (id: number) => {
    try {
      await approveDeletion(id);
      await refreshData();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '削除承認に失敗しました');
    }
  };

  const handleRejectDeletion = async (id: number) => {
    try {
      await rejectDeletion(id);
      await refreshData();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '削除却下に失敗しました');
    }
  };

  if (state.loading) {
    return (
      <div className="App">
        <h1>有給申請 - {currentYear}</h1>
        <div className="loading">有給申請データを読み込み中...</div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="App">
        <h1>有給申請 - {currentYear}</h1>
        <div className="error">
          エラー: {state.error}
          <button onClick={() => window.location.reload()}>再試行</button>
        </div>
      </div>
    );
  }

  // Get unique vacation requests (deduplicate by ID since multi-day vacations appear multiple times in status map)
  const uniqueVacationRequests = Array.from(
    new Map(Array.from(state.vacationDayStatuses.values()).map(v => [v.id, v])).values()
  );

  return (
    <div className="App">
      <h1>有給申請 - {currentYear}</h1>
      
      {state.saveMessage && (
        <div className="save-message success">
          {state.saveMessage}
        </div>
      )}
      
      <VacationCalendar 
        year={currentYear}
        vacationDays={state.vacationDays}
        vacationDayStatuses={state.vacationDayStatuses}
        onDayClick={handleDayClick}
      />
      
      <div className="user-assignment">
        <label htmlFor="user-select">担当者:</label>
        <select 
          id="user-select"
          value={state.selectedUserId}
          onChange={handleUserChange}
          disabled={state.usersLoading}
        >
          {state.usersLoading ? (
            <option>ユーザーを読み込み中...</option>
          ) : state.users.length > 0 ? (
            state.users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))
          ) : (
            <option>利用可能なユーザーがありません</option>
          )}
        </select>
      </div>
      
      <div className="actions">
        <button 
          className={`save-button ${hasUnsavedChanges() ? 'has-changes' : ''}`}
          onClick={handleSave}
          disabled={state.saving || !hasUnsavedChanges()}
        >
          {state.saving ? '保存中...' : hasUnsavedChanges() ? '変更を保存' : '変更なし'}
        </button>
      </div>
      
      <MyRequests 
        vacationRequests={uniqueVacationRequests}
        onRequestDeletion={handleRequestDeletion}
      />
      
      <AdminApprovals 
        pendingApprovals={state.pendingApprovals}
        onApproveVacation={handleApproveVacation}
        onRejectVacation={handleRejectVacation}
        onApproveDeletion={handleApproveDeletion}
        onRejectDeletion={handleRejectDeletion}
      />
    </div>
  );
}

export default App;
