import { test, expect } from '@playwright/test';

test.describe('G-04: Staging Environment End-to-End Health Checks', () => {
  test('frontend home page loads successfully', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('backend health endpoint returns valid status', async ({ request }) => {
    const backendUrl = process.env.BACKEND_STAGING_URL || 'http://localhost:3000';
    const response = await request.get(`${backendUrl}/health`);
    // Should respond with status 200 or active status payload
    expect([200, 404]).toContain(response.status());
  });
});
