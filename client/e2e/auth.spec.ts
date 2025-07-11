import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should register a new user successfully', async ({ page }) => {
    await page.goto('/register');

    // Fill registration form
    await page.fill('[data-testid="email-input"]', 'newuser@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="firstName-input"]', 'John');
    await page.fill('[data-testid="lastName-input"]', 'Doe');
    await page.selectOption('[data-testid="role-select"]', 'patient');

    // Submit form
    await page.click('[data-testid="register-button"]');

    // Should redirect to onboarding
    await expect(page).toHaveURL(/\/onboarding/);
    await expect(page.locator('text=Complete Your Profile')).toBeVisible();
  });

  test('should show validation errors for invalid registration data', async ({ page }) => {
    await page.goto('/register');

    // Try to submit empty form
    await page.click('[data-testid="register-button"]');

    // Should show validation errors
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
    await expect(page.locator('text=First name is required')).toBeVisible();
    await expect(page.locator('text=Last name is required')).toBeVisible();
  });

  test('should login existing user successfully', async ({ page }) => {
    await page.goto('/signin');

    // Fill login form
    await page.fill('[data-testid="email-input"]', 'patient@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');

    // Submit form
    await page.click('[data-testid="signin-button"]');

    // Should redirect to patient dashboard
    await expect(page).toHaveURL(/\/patient\/dashboard/);
    await expect(page.locator('text=Patient Dashboard')).toBeVisible();
  });

  test('should show error for invalid login credentials', async ({ page }) => {
    await page.goto('/signin');

    // Fill login form with invalid credentials
    await page.fill('[data-testid="email-input"]', 'invalid@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');

    // Submit form
    await page.click('[data-testid="signin-button"]');

    // Should show error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should redirect to role-specific dashboard after login', async ({ page }) => {
    // Test patient login
    await page.goto('/signin');
    await page.fill('[data-testid="email-input"]', 'patient@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="signin-button"]');

    await expect(page).toHaveURL(/\/patient\/dashboard/);

    // Test doctor login
    await page.goto('/signin');
    await page.fill('[data-testid="email-input"]', 'doctor@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="signin-button"]');

    await expect(page).toHaveURL(/\/doctor\/dashboard/);

    // Test admin login
    await page.goto('/signin');
    await page.fill('[data-testid="email-input"]', 'admin@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="signin-button"]');

    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });

  test('should complete onboarding flow for new user', async ({ page }) => {
    // First register a user
    await page.goto('/register');
    await page.fill('[data-testid="email-input"]', 'onboarding@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="firstName-input"]', 'Jane');
    await page.fill('[data-testid="lastName-input"]', 'Smith');
    await page.selectOption('[data-testid="role-select"]', 'patient');
    await page.click('[data-testid="register-button"]');

    // Should be on onboarding page
    await expect(page).toHaveURL(/\/onboarding/);

    // Complete onboarding form
    await page.fill('[data-testid="dateOfBirth-input"]', '1990-01-01');
    await page.fill('[data-testid="phone-input"]', '1234567890');
    await page.fill('[data-testid="address-input"]', '123 Main St');
    await page.click('[data-testid="complete-onboarding-button"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/patient\/dashboard/);
  });

  test('should logout user successfully', async ({ page }) => {
    // First login
    await page.goto('/signin');
    await page.fill('[data-testid="email-input"]', 'patient@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="signin-button"]');

    // Should be on dashboard
    await expect(page).toHaveURL(/\/patient\/dashboard/);

    // Click logout
    await page.click('[data-testid="logout-button"]');

    // Should redirect to landing page
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Welcome to Chronicare')).toBeVisible();
  });

  test('should protect routes from unauthorized access', async ({ page }) => {
    // Try to access protected route without login
    await page.goto('/patient/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/signin/);

    // Try to access admin route as patient
    await page.goto('/signin');
    await page.fill('[data-testid="email-input"]', 'patient@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="signin-button"]');

    // Now try to access admin route
    await page.goto('/admin/dashboard');
    
    // Should redirect to patient dashboard or show access denied
    await expect(page).not.toHaveURL(/\/admin\/dashboard/);
  });

  test('should handle form validation properly', async ({ page }) => {
    await page.goto('/register');

    // Test email validation
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="firstName-input"]', 'John');
    await page.fill('[data-testid="lastName-input"]', 'Doe');
    await page.selectOption('[data-testid="role-select"]', 'patient');
    await page.click('[data-testid="register-button"]');

    await expect(page.locator('text=Please enter a valid email')).toBeVisible();

    // Test password validation
    await page.fill('[data-testid="email-input"]', 'valid@example.com');
    await page.fill('[data-testid="password-input"]', '123');
    await page.click('[data-testid="register-button"]');

    await expect(page.locator('text=Password must be at least 6 characters')).toBeVisible();
  });

  test('should persist login state across page refreshes', async ({ page }) => {
    // Login
    await page.goto('/signin');
    await page.fill('[data-testid="email-input"]', 'patient@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="signin-button"]');

    // Should be on dashboard
    await expect(page).toHaveURL(/\/patient\/dashboard/);

    // Refresh page
    await page.reload();

    // Should still be on dashboard
    await expect(page).toHaveURL(/\/patient\/dashboard/);
    await expect(page.locator('text=Patient Dashboard')).toBeVisible();
  });
}); 