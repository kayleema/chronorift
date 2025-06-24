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
- **API Communication**: Currently disabled - operates in client-only mode
- **State Management**: Local React state with hooks
- **Utils**: Calendar logic extracted to `src/utils/calendar.ts`

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

- The frontend hardcodes `employeeId = "employee123"` for demonstration
- Backend defaults to `"test-employee"` when authentication is null
- Calendar shows vacation days with visual indicators
- API mismatch: Frontend calls `/toggle` endpoint but backend only has CRUD operations
- Backend uses Spring Security but has fallback authentication for testing
- Both applications expect to run on different ports (frontend dev server + backend :8080)

## Testing

- Backend: JUnit 5 + Mockito for unit tests
- Frontend: Vitest + React Testing Library + Jest DOM
- Run backend tests with `./gradlew test` from backend directory
- Run frontend tests with `npm test` from frontend directory

### Frontend Test Structure
- `src/App.test.tsx`: Main component integration tests
- `src/utils/calendar.test.ts`: Calendar logic unit tests  
- `src/components/VacationCalendar.test.tsx`: Vacation selection interaction tests