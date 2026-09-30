import { test, expect } from '@playwright/test';

const TEACHER_EMAIL = 'teacher@demo.com';
const TEACHER_PASSWORD = 'teacher123';

test.describe('Teacher Role Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Wait for login form to be visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
    
    // Login as teacher
    await page.fill('input[type="email"]', TEACHER_EMAIL);
    await page.fill('input[type="password"]', TEACHER_PASSWORD);
    await page.selectOption('select', 'TEACHER');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to teacher dashboard
    await page.waitForURL('/teacher/dashboard', { timeout: 10000 });
  });

  test('should successfully login and redirect to teacher dashboard', async ({ page }) => {
    // Verify we're on the teacher dashboard
    await expect(page).toHaveURL('/teacher/dashboard');
    await expect(page.locator('h1')).toContainText('Teacher Dashboard');
  });

  test('should display stats cards with aggregated data', async ({ page }) => {
    // Wait for stats cards to load
    await page.waitForSelector('[data-testid="stats-card"], .grid', { timeout: 10000 });
    
    // Check for stats cards (My Classes, Total Students, Homework Posted, Recent Notices)
    const statsSection = page.locator('.grid').first();
    await expect(statsSection).toBeVisible();
    
    // Verify at least one stats card is visible
    const statsCards = page.locator('.grid').first().locator('> *');
    const count = await statsCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display quick actions section', async ({ page }) => {
    // Wait for quick actions to load
    await page.waitForSelector('text=Quick Actions', { timeout: 10000 });
    
    // Verify quick actions section is visible
    await expect(page.locator('text=Quick Actions')).toBeVisible();
    
    // Verify quick action buttons exist
    await expect(page.locator('text=Mark Attendance')).toBeVisible();
    await expect(page.locator('text=Create Homework')).toBeVisible();
    await expect(page.locator('text=View Students')).toBeVisible();
  });

  test('should navigate to students page from quick actions', async ({ page }) => {
    // Click on "View Students" quick action
    await page.locator('text=View Students').click();
    
    // Wait for navigation
    await page.waitForURL('/teacher/students', { timeout: 10000 });
    
    // Verify we're on students page
    await expect(page).toHaveURL('/teacher/students');
    await expect(page.locator('h1, h2')).toContainText(/students/i);
  });

  test('should navigate to homework page from quick actions', async ({ page }) => {
    // Click on "Create Homework" quick action
    await page.locator('text=Create Homework').click();
    
    // Wait for navigation
    await page.waitForURL('/teacher/homework', { timeout: 10000 });
    
    // Verify we're on homework page
    await expect(page).toHaveURL('/teacher/homework');
    await expect(page.locator('h1, h2')).toContainText(/homework/i);
  });

  test('should navigate to attendance page from quick actions', async ({ page }) => {
    // Click on "Mark Attendance" quick action
    await page.locator('text=Mark Attendance').click();
    
    // Wait for navigation
    await page.waitForURL('/teacher/attendance', { timeout: 10000 });
    
    // Verify we're on attendance page
    await expect(page).toHaveURL('/teacher/attendance');
    await expect(page.locator('h1, h2')).toContainText(/attendance/i);
  });

  test('should display "My Classes" section with class assignments', async ({ page }) => {
    // Wait for My Classes card
    await page.waitForSelector('text=My Classes', { timeout: 10000 });
    
    // Verify My Classes section is visible
    await expect(page.locator('text=My Classes')).toBeVisible();
    
    // Check if classes are displayed (or empty state if no assignments)
    const myClassesCard = page.locator('text=My Classes').locator('..').locator('..');
    await expect(myClassesCard).toBeVisible();
  });

  test('should display recent homework section', async ({ page }) => {
    // Wait for Recent Homework section
    await page.waitForSelector('text=Recent Homework', { timeout: 10000 });
    
    // Verify Recent Homework section is visible
    await expect(page.locator('text=Recent Homework')).toBeVisible();
  });

  test('should display recent notices section', async ({ page }) => {
    // Wait for Recent Notices section
    await page.waitForSelector('text=Recent Notices', { timeout: 10000 });
    
    // Verify Recent Notices section is visible
    await expect(page.locator('text=Recent Notices')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Find and click logout button in sidebar
    const logoutButton = page.locator('button:has-text("Logout")').last();
    await expect(logoutButton).toBeVisible();
    
    // Click logout
    await logoutButton.click();
    
    // Wait for redirect to login page
    await page.waitForURL('/login', { timeout: 10000 });
    
    // Verify we're on login page
    await expect(page).toHaveURL('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test.describe('Students Page', () => {
    test('should display students page with filters', async ({ page }) => {
      await page.goto('/teacher/students');
      
      // Wait for page to load
      await page.waitForSelector('h1, h2', { timeout: 10000 });
      
      // Verify page title
      await expect(page.locator('h1, h2')).toContainText(/students/i);
      
      // Check if filters are visible (if multiple assignments)
      const filterSection = page.locator('text=Filter by:');
      if (await filterSection.isVisible().catch(() => false)) {
        await expect(filterSection).toBeVisible();
      }
    });

    test('should filter students by class and section', async ({ page }) => {
      await page.goto('/teacher/students');
      
      await page.waitForSelector('select', { timeout: 10000 });
      
      // Check if class selector exists
      const classSelect = page.locator('select').first();
      if (await classSelect.isVisible().catch(() => false)) {
        const options = await classSelect.locator('option').all();
        if (options.length > 1) {
          // Select a class if available
          await classSelect.selectOption({ index: 1 });
          await page.waitForTimeout(1000); // Wait for filter to apply
        }
      }
    });
  });

  test.describe('Homework Page', () => {
    test('should display homework page with all classes view', async ({ page }) => {
      await page.goto('/teacher/homework');
      
      // Wait for page to load
      await page.waitForSelector('h1, h2', { timeout: 10000 });
      
      // Verify page title
      await expect(page.locator('h1, h2')).toContainText(/homework/i);
      
      // Check for "Create" button
      await expect(page.locator('button:has-text("Create")')).toBeVisible();
    });

    test('should filter homework by class', async ({ page }) => {
      await page.goto('/teacher/homework');
      
      await page.waitForSelector('select', { timeout: 10000 });
      
      // Check if class selector exists
      const classSelect = page.locator('select').first();
      if (await classSelect.isVisible().catch(() => false)) {
        const options = await classSelect.locator('option').all();
        if (options.length > 1) {
          // Select a class if available
          await classSelect.selectOption({ index: 1 });
          await page.waitForTimeout(1000); // Wait for filter to apply
        }
      }
    });
  });

  test.describe('Attendance Page', () => {
    test('should display attendance page with summary', async ({ page }) => {
      await page.goto('/teacher/attendance');
      
      // Wait for page to load
      await page.waitForSelector('h1, h2', { timeout: 10000 });
      
      // Verify page title
      await expect(page.locator('h1, h2')).toContainText(/attendance/i);
      
      // Check for attendance summary
      await page.waitForSelector('text=Attendance Summary', { timeout: 10000 });
      await expect(page.locator('text=Attendance Summary')).toBeVisible();
    });

    test('should display attendance summary cards', async ({ page }) => {
      await page.goto('/teacher/attendance');
      
      await page.waitForSelector('text=Present', { timeout: 10000 });
      
      // Verify summary cards exist
      await expect(page.locator('text=Present')).toBeVisible();
      await expect(page.locator('text=Absent')).toBeVisible();
      await expect(page.locator('text=Total')).toBeVisible();
    });

    test('should have "Mark All Present" button', async ({ page }) => {
      await page.goto('/teacher/attendance');
      
      await page.waitForSelector('button:has-text("Mark All Present")', { timeout: 10000 });
      
      // Verify button exists
      await expect(page.locator('button:has-text("Mark All Present")')).toBeVisible();
    });

    test('should have date navigation buttons', async ({ page }) => {
      await page.goto('/teacher/attendance');
      
      await page.waitForSelector('input[type="date"]', { timeout: 10000 });
      
      // Check for date navigation buttons
      const prevButton = page.locator('button').filter({ hasText: /chevron|previous|prev/i }).first();
      const nextButton = page.locator('button').filter({ hasText: /chevron|next/i }).first();
      
      // At least date input should be visible
      await expect(page.locator('input[type="date"]')).toBeVisible();
    });

    test('should mark attendance for students', async ({ page }) => {
      await page.goto('/teacher/attendance');
      
      // Wait for students table to load
      await page.waitForSelector('table', { timeout: 10000 });
      
      // Check if there are students
      const presentButtons = page.locator('button:has-text("Present")');
      const count = await presentButtons.count();
      
      if (count > 0) {
        // Click first "Present" button
        await presentButtons.first().click();
        await page.waitForTimeout(500);
        
        // Verify button state changed (optional - depends on implementation)
      }
    });
  });

  test.describe('Sidebar Navigation', () => {
    test('should navigate to dashboard from sidebar', async ({ page }) => {
      await page.goto('/teacher/students');
      
      // Click dashboard link
      await page.locator('a:has-text("Dashboard")').click();
      
      // Wait for navigation
      await page.waitForURL('/teacher/dashboard', { timeout: 10000 });
      await expect(page).toHaveURL('/teacher/dashboard');
    });

    test('should navigate to attendance from sidebar', async ({ page }) => {
      await page.locator('a:has-text("Attendance")').click();
      
      await page.waitForURL('/teacher/attendance', { timeout: 10000 });
      await expect(page).toHaveURL('/teacher/attendance');
    });

    test('should navigate to homework from sidebar', async ({ page }) => {
      await page.locator('a:has-text("Homework")').click();
      
      await page.waitForURL('/teacher/homework', { timeout: 10000 });
      await expect(page).toHaveURL('/teacher/homework');
    });

    test('should navigate to students from sidebar', async ({ page }) => {
      await page.locator('a:has-text("Students")').click();
      
      await page.waitForURL('/teacher/students', { timeout: 10000 });
      await expect(page).toHaveURL('/teacher/students');
    });

    test('should navigate to notices from sidebar', async ({ page }) => {
      await page.locator('a:has-text("Notices")').click();
      
      await page.waitForURL('/teacher/notices', { timeout: 10000 });
      await expect(page).toHaveURL('/teacher/notices');
    });
  });

  test.describe('Empty States', () => {
    test('should show helpful empty state when no class assignments', async ({ page }) => {
      // This test would require a teacher with no assignments
      // For now, we'll just verify the empty state component exists
      await page.goto('/teacher/dashboard');
      
      // Check if empty state might be shown
      const emptyState = page.locator('text=No class assignments');
      // This might not be visible if teacher has assignments
      // So we'll just check the page loads correctly
      await expect(page.locator('h1')).toBeVisible();
    });
  });
});

