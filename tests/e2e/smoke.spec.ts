import { test, expect } from '@playwright/test';

test('has title and renders public portfolio', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Antonio Riyanto/);
  // Ensure we render the header or hero
  await expect(page.locator('text=Antonio Riyanto')).toBeVisible();
});

test('admin login page loads directly', async ({ page }) => {
  await page.goto('/admin/login');
  await expect(page.locator('text=Login')).toBeVisible();
});
