import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fetchVacationDays, createVacationRequest, AuthenticationError, redirectToLogin } from './api'

// Mock fetch globally
const mockFetch: any = vi.fn()
globalThis.fetch = mockFetch

// Mock window.location.href
Object.defineProperty(window, 'location', {
  value: {
    href: '',
  },
  writable: true,
})

describe('API Service', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    window.location.href = ''
  })

  describe('fetchVacationDays', () => {
    it('successfully fetches vacation data', async () => {
      const mockVacationData = [
        {
          id: 1,
          employeeId: 'test-employee',
          startDate: '2024-07-01',
          endDate: '2024-07-05',
          status: 'APPROVED'
        }
      ]

      // Mock auth status check (successful)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ authenticated: true, user: 'test-user' }),
      })

      // Mock vacation data fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockVacationData),
      })

      const result = await fetchVacationDays()

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/auth/status',
        {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          },
        }
      )
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/vacation',
        {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          },
        }
      )
      expect(result).toEqual(mockVacationData)
    })

    it('throws AuthenticationError for unauthenticated status', async () => {
      // Mock auth status check (unauthenticated)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ authenticated: false }),
      })

      await expect(fetchVacationDays()).rejects.toThrow(AuthenticationError)
    })

    it('handles auth status network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(fetchVacationDays()).rejects.toThrow('Network error: Network error')
    })

    it('returns empty array for non-array response', async () => {
      // Mock successful auth
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ authenticated: true, user: 'test-user' }),
      })

      // Mock non-array response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(null),
      })

      const result = await fetchVacationDays()
      expect(result).toEqual([])
    })
  })

  describe('createVacationRequest', () => {
    it('successfully creates vacation request', async () => {
      const mockCreatedVacation = {
        id: 2,
        employeeId: 'test-employee',
        startDate: '2024-08-01',
        endDate: '2024-08-05',
        status: 'PENDING'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockCreatedVacation),
      })

      const result = await createVacationRequest('2024-08-01', '2024-08-05')

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/vacation',
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            startDate: '2024-08-01',
            endDate: '2024-08-05',
          }),
        }
      )
      expect(result).toEqual(mockCreatedVacation)
    })

    it('throws AuthenticationError for 401 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      })

      await expect(createVacationRequest('2024-08-01', '2024-08-05')).rejects.toThrow(AuthenticationError)
    })
  })

  describe('redirectToLogin', () => {
    it('redirects to Google OAuth2 login', () => {
      redirectToLogin()
      expect(window.location.href).toBe('http://localhost:8080/oauth2/authorization/google')
    })
  })
})