# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a full-stack time-off management application with separate frontend and backend:

### Backend (Spring Boot + Kotlin)
- **Location**: `backend/` directory
- **Framework**: Spring Boot 3.3.1 with Kotlin 1.9.24
- **Database**: H2 in-memory database with JPA/Hibernate
- **Security**: Spring Security with OAuth2 client support
- **API**: REST API at `/api/vacation` endpoints
- **Core Entity**: `Vacation` entity with employeeId, startDate, endDate, status fields
- **Repository**: JpaRepository pattern for data access
- **Java Version**: 21

### Frontend (React + TypeScript + Vite)
- **Location**: `frontend/` directory  
- **Framework**: React 19.1.0 with TypeScript and Vite
- **Calendar UI**: Custom calendar component showing yearly view with Japanese day/month names
- **API Communication**: Integrated with backend REST API
- **Authentication**: Automatic redirect to OAuth2 login when unauthenticated
- **State Management**: Local React state with async data loading
- **Utils**: Calendar logic extracted to `src/utils/calendar.ts`
- **Services**: API service layer with error handling and authentication checks

## Development Commands

### Backend (run from `backend/` directory)
```bash
./gradlew bootRun          # Start the Spring Boot server
./gradlew test             # Run all tests
./gradlew build            # Build the application
```

### Frontend (run from `frontend/` directory)
```bash
npm run dev                # Start development server
npm run build              # Build for production (runs tsc + vite build)
npm run lint               # Run ESLint
npm run preview            # Preview production build
```

## Key Implementation Details

- **Frontend-Backend Integration**: App fetches vacation data on load and redirects to login if unauthenticated
- **Authentication Flow**: OAuth2 with Google, automatic redirect for unauthenticated users
- **Error Handling**: Comprehensive error states with retry functionality
- **Data Conversion**: Backend vacation ranges converted to individual calendar days
- **Loading States**: User-friendly loading and error messages
- **Session Management**: Cookies used for session persistence
- **Fallback Authentication**: Backend defaults to `"test-employee"` when authentication is null for testing

## Testing

- Backend: JUnit 5 + Mockito for unit tests
- Frontend: Vitest + React Testing Library + Jest DOM
- Run backend tests with `./gradlew test` from backend directory
- Run frontend tests with `npm test` from frontend directory

### Frontend Test Structure
- `src/App.test.tsx`: Main component tests with mocked API calls
- `src/App.integration.test.tsx`: Full integration tests for auth flow and data fetching
- `src/services/api.test.ts`: API service unit tests with authentication scenarios
- `src/utils/calendar.test.ts`: Calendar logic unit tests  
- `src/components/VacationCalendar.test.tsx`: Vacation calendar component tests