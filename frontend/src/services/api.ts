export interface VacationData {
  id: number;
  employeeId: string;
  startDate: string;
  endDate: string;
  status: string;
  assignedTo?: string;
  deletionReason?: string;
}

export interface VacationWithUserInfo {
  id: number;
  employeeId: string;
  employeeName?: string;
  startDate: string;
  endDate: string;
  status: string;
  assignedTo?: string;
  assignedToName?: string;
  deletionReason?: string;
}

export interface User {
  id: string;
  name: string;
}

export interface ApiError {
  message: string;
  status: number;
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export async function checkAuthStatus(): Promise<{ authenticated: boolean; user?: string }> {
  try {
    const response = await fetch('/api/auth/status', {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json();
    
    if (response.status === 401) {
      return { authenticated: false };
    }

    if (!response.ok) {
      throw new Error(`Failed to check auth status: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function fetchVacationDays(): Promise<VacationData[]> {
  try {
    // First check if user is authenticated
    const authStatus = await checkAuthStatus();
    if (!authStatus.authenticated) {
      throw new AuthenticationError('User not authenticated');
    }

    const response = await fetch('/api/vacation', {
      credentials: 'include', // Include cookies for session
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.status === 401 || response.status === 403) {
      throw new AuthenticationError('User not authenticated');
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch vacation days: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function fetchUsers(): Promise<User[]> {
  try {
    const response = await fetch('/api/users', {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.status === 401 || response.status === 403) {
      throw new AuthenticationError('User not authenticated');
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function createVacationRequest(startDate: string, endDate: string, assignedTo?: string): Promise<VacationData> {
  try {
    const response = await fetch('/api/vacation', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        assignedTo,
      }),
    });

    if (response.status === 401 || response.status === 403) {
      throw new AuthenticationError('User not authenticated');
    }

    if (!response.ok) {
      throw new Error(`Failed to create vacation request: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function requestVacationDeletion(id: number, reason: string): Promise<VacationData> {
  try {
    const response = await fetch(`/api/vacation/${id}/request-deletion`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        reason,
      }),
    });

    if (response.status === 401 || response.status === 403) {
      throw new AuthenticationError('User not authenticated');
    }

    if (!response.ok) {
      throw new Error(`Failed to request vacation deletion: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function approveVacation(id: number): Promise<VacationData> {
  try {
    const response = await fetch(`/api/vacation/${id}/approve`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.status === 401 || response.status === 403) {
      throw new AuthenticationError('User not authenticated');
    }

    if (!response.ok) {
      throw new Error(`Failed to approve vacation: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function rejectVacation(id: number): Promise<VacationData> {
  try {
    const response = await fetch(`/api/vacation/${id}/reject`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.status === 401 || response.status === 403) {
      throw new AuthenticationError('User not authenticated');
    }

    if (!response.ok) {
      throw new Error(`Failed to reject vacation: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function approveDeletion(id: number): Promise<VacationData> {
  try {
    const response = await fetch(`/api/vacation/${id}/approve-deletion`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.status === 401 || response.status === 403) {
      throw new AuthenticationError('User not authenticated');
    }

    if (!response.ok) {
      throw new Error(`Failed to approve deletion: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function rejectDeletion(id: number): Promise<VacationData> {
  try {
    const response = await fetch(`/api/vacation/${id}/reject-deletion`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.status === 401 || response.status === 403) {
      throw new AuthenticationError('User not authenticated');
    }

    if (!response.ok) {
      throw new Error(`Failed to reject deletion: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function fetchPendingApprovals(): Promise<VacationWithUserInfo[]> {
  try {
    const response = await fetch('/api/vacation/pending-approvals', {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.status === 401 || response.status === 403) {
      throw new AuthenticationError('User not authenticated');
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch pending approvals: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function redirectToLogin(): void {
  // Use absolute URL for OAuth2 redirect since it needs to work properly
  window.location.href = 'http://localhost:8080/oauth2/authorization/google';
}