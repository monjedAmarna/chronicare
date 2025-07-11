import { test, expect } from '@playwright/test';

test.describe('Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test.describe('Patient Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      // Login as patient
      await page.goto('/signin');
      await page.fill('[data-testid="email-input"]', 'patient@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="signin-button"]');
      await expect(page).toHaveURL(/\/patient\/dashboard/);
    });

    test('should display patient dashboard with health metrics', async ({ page }) => {
      await expect(page.locator('text=Patient Dashboard')).toBeVisible();
      await expect(page.locator('text=Health Metrics')).toBeVisible();
      await expect(page.locator('text=Recent Medications')).toBeVisible();
      await expect(page.locator('text=Upcoming Appointments')).toBeVisible();
    });

    test('should add new health metric', async ({ page }) => {
      await page.click('[data-testid="add-metric-button"]');

      // Fill metric form
      await page.selectOption('[data-testid="metric-type-select"]', 'blood_pressure');
      await page.fill('[data-testid="metric-value-input"]', '120/80');
      await page.fill('[data-testid="metric-unit-input"]', 'mmHg');
      await page.fill('[data-testid="metric-date-input"]', '2024-01-15');

      await page.click('[data-testid="save-metric-button"]');

      // Should show success message
      await expect(page.locator('text=Metric added successfully')).toBeVisible();
      
      // Should appear in metrics list
      await expect(page.locator('text=120/80 mmHg')).toBeVisible();
    });

    test('should add new medication', async ({ page }) => {
      await page.click('[data-testid="add-medication-button"]');

      // Fill medication form
      await page.fill('[data-testid="medication-name-input"]', 'Aspirin');
      await page.fill('[data-testid="medication-dosage-input"]', '100mg');
      await page.selectOption('[data-testid="medication-frequency-select"]', 'daily');
      await page.fill('[data-testid="medication-instructions-input"]', 'Take with food');
      await page.check('[data-testid="medication-active-checkbox"]');

      await page.click('[data-testid="save-medication-button"]');

      // Should show success message
      await expect(page.locator('text=Medication added successfully')).toBeVisible();
      
      // Should appear in medications list
      await expect(page.locator('text=Aspirin')).toBeVisible();
    });

    test('should view health metrics chart', async ({ page }) => {
      await page.click('[data-testid="view-metrics-chart"]');

      // Should show chart
      await expect(page.locator('[data-testid="metrics-chart"]')).toBeVisible();
      await expect(page.locator('text=Health Metrics Over Time')).toBeVisible();
    });

    test('should export health report', async ({ page }) => {
      await page.click('[data-testid="export-report-button"]');

      // Should show export options
      await expect(page.locator('text=Export Report')).toBeVisible();
      await expect(page.locator('[data-testid="export-pdf-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="export-csv-button"]')).toBeVisible();

      // Click PDF export
      await page.click('[data-testid="export-pdf-button"]');

      // Should trigger download (or show success message)
      await expect(page.locator('text=Report exported successfully')).toBeVisible();
    });
  });

  test.describe('Doctor Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      // Login as doctor
      await page.goto('/signin');
      await page.fill('[data-testid="email-input"]', 'doctor@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="signin-button"]');
      await expect(page).toHaveURL(/\/doctor\/dashboard/);
    });

    test('should display doctor dashboard with patient list', async ({ page }) => {
      await expect(page.locator('text=Doctor Dashboard')).toBeVisible();
      await expect(page.locator('text=My Patients')).toBeVisible();
      await expect(page.locator('text=Recent Appointments')).toBeVisible();
      await expect(page.locator('text=Alerts')).toBeVisible();
    });

    test('should view patient details', async ({ page }) => {
      await page.click('[data-testid="patient-row-1"]');

      // Should show patient details
      await expect(page.locator('text=Patient Details')).toBeVisible();
      await expect(page.locator('text=Health Metrics')).toBeVisible();
      await expect(page.locator('text=Medications')).toBeVisible();
      await expect(page.locator('text=Appointments')).toBeVisible();
    });

    test('should create care plan for patient', async ({ page }) => {
      await page.click('[data-testid="patient-row-1"]');
      await page.click('[data-testid="create-care-plan-button"]');

      // Fill care plan form
      await page.fill('[data-testid="care-plan-title-input"]', 'Diabetes Management');
      await page.fill('[data-testid="care-plan-description-input"]', 'Comprehensive diabetes care plan');
      await page.selectOption('[data-testid="care-plan-priority-select"]', 'high');
      await page.fill('[data-testid="care-plan-goals-input"]', 'Maintain blood sugar levels');

      await page.click('[data-testid="save-care-plan-button"]');

      // Should show success message
      await expect(page.locator('text=Care plan created successfully')).toBeVisible();
    });

    test('should manage patient medications', async ({ page }) => {
      await page.click('[data-testid="patient-row-1"]');
      await page.click('[data-testid="manage-medications-button"]');

      // Should show patient medications
      await expect(page.locator('text=Patient Medications')).toBeVisible();

      // Add new medication
      await page.click('[data-testid="add-medication-button"]');
      await page.fill('[data-testid="medication-name-input"]', 'Metformin');
      await page.fill('[data-testid="medication-dosage-input"]', '500mg');
      await page.selectOption('[data-testid="medication-frequency-select"]', 'twice_daily');
      await page.click('[data-testid="save-medication-button"]');

      await expect(page.locator('text=Medication added successfully')).toBeVisible();
    });

    test('should view patient analytics', async ({ page }) => {
      await page.click('[data-testid="patient-row-1"]');
      await page.click('[data-testid="view-analytics-button"]');

      // Should show analytics
      await expect(page.locator('text=Patient Analytics')).toBeVisible();
      await expect(page.locator('[data-testid="analytics-chart"]')).toBeVisible();
    });
  });

  test.describe('Admin Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      // Login as admin
      await page.goto('/signin');
      await page.fill('[data-testid="email-input"]', 'admin@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="signin-button"]');
      await expect(page).toHaveURL(/\/admin\/dashboard/);
    });

    test('should display admin dashboard with system stats', async ({ page }) => {
      await expect(page.locator('text=Admin Dashboard')).toBeVisible();
      await expect(page.locator('text=System Overview')).toBeVisible();
      await expect(page.locator('text=Total Users')).toBeVisible();
      await expect(page.locator('text=Total Appointments')).toBeVisible();
      await expect(page.locator('text=Recent Activities')).toBeVisible();
    });

    test('should manage users', async ({ page }) => {
      await page.click('[data-testid="manage-users-button"]');

      // Should show users list
      await expect(page.locator('text=User Management')).toBeVisible();
      await expect(page.locator('[data-testid="users-table"]')).toBeVisible();

      // View user details
      await page.click('[data-testid="user-row-1"]');
      await expect(page.locator('text=User Details')).toBeVisible();

      // Edit user role
      await page.click('[data-testid="edit-user-button"]');
      await page.selectOption('[data-testid="user-role-select"]', 'doctor');
      await page.click('[data-testid="save-user-button"]');

      await expect(page.locator('text=User updated successfully')).toBeVisible();
    });

    test('should view system reports', async ({ page }) => {
      await page.click('[data-testid="view-reports-button"]');

      // Should show reports
      await expect(page.locator('text=System Reports')).toBeVisible();
      await expect(page.locator('text=User Statistics')).toBeVisible();
      await expect(page.locator('text=Health Data Summary')).toBeVisible();

      // Generate report
      await page.click('[data-testid="generate-report-button"]');
      await expect(page.locator('text=Report generated successfully')).toBeVisible();
    });

    test('should view recent activities', async ({ page }) => {
      await page.click('[data-testid="view-activities-button"]');

      // Should show activities
      await expect(page.locator('text=Recent Activities')).toBeVisible();
      await expect(page.locator('[data-testid="activities-list"]')).toBeVisible();
    });
  });

  test.describe('Cross-role Navigation', () => {
    test('should show appropriate navigation for each role', async ({ page }) => {
      // Test patient navigation
      await page.goto('/signin');
      await page.fill('[data-testid="email-input"]', 'patient@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="signin-button"]');

      await expect(page.locator('[data-testid="nav-health-metrics"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-medications"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-appointments"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-care-plans"]')).toBeVisible();

      // Test doctor navigation
      await page.goto('/signin');
      await page.fill('[data-testid="email-input"]', 'doctor@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="signin-button"]');

      await expect(page.locator('[data-testid="nav-patients"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-appointments"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-care-plans"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-alerts"]')).toBeVisible();

      // Test admin navigation
      await page.goto('/signin');
      await page.fill('[data-testid="email-input"]', 'admin@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="signin-button"]');

      await expect(page.locator('[data-testid="nav-dashboard"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-users"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-reports"]')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      // Login as patient
      await page.goto('/signin');
      await page.fill('[data-testid="email-input"]', 'patient@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="signin-button"]');

      // Try to add metric with invalid data
      await page.click('[data-testid="add-metric-button"]');
      await page.click('[data-testid="save-metric-button"]');

      // Should show validation errors
      await expect(page.locator('text=Please fill in all required fields')).toBeVisible();
    });

    test('should show loading states', async ({ page }) => {
      // Login as patient
      await page.goto('/signin');
      await page.fill('[data-testid="email-input"]', 'patient@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="signin-button"]');

      // Click refresh data
      await page.click('[data-testid="refresh-data-button"]');

      // Should show loading indicator
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    });
  });
}); 