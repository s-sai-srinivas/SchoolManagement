# Playwright E2E Tests

This directory contains end-to-end tests for the School Management System using Playwright.

## Prerequisites

1. Backend server must be running on port 3001
2. Frontend dev server will be started automatically by Playwright (or ensure it's running on port 3000)
3. Test data must be seeded in the database (run backend seed script)

## Test Credentials

- **Teacher**: `teacher@demo.com` / `teacher123`
- **Admin**: `admin@demo.com` / `admin123`
- **Parent**: `parent@demo.com` / `parent123`

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests in UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Run tests in debug mode
```bash
npm run test:e2e:debug
```

### Run specific test file
```bash
npx playwright test teacher-role.spec.ts
```

## Test Structure

- `teacher-role.spec.ts` - Comprehensive tests for teacher role functionality including:
  - Login and authentication
  - Dashboard stats and quick actions
  - Navigation between pages
  - Students page filtering
  - Homework page functionality
  - Attendance marking workflow
  - Logout functionality

## Configuration

Tests are configured in `playwright.config.ts`:
- Base URL: `http://localhost:3000`
- Browser: Chromium (Desktop Chrome)
- Auto-starts dev server before tests
- Screenshots on failure
- HTML reporter enabled

## Notes

- Tests assume test data exists in the database
- Some tests may need adjustment based on actual data
- Tests use timeouts to handle async operations
- Make sure backend API is accessible from frontend

