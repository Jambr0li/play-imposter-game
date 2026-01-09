import { test, expect } from '@playwright/test';

test.describe('Home Page Navigation', () => {

  test('Join Game button navigates to /join screen', async ({ page }) => {
    // Start at the home page
    await page.goto('/');

    // Verify we're on the home page
    await expect(page).toHaveURL('/');

    // Find and click the Join Game button
    const joinButton = page.getByRole('link', { name: 'Join Game' });
    await expect(joinButton).toBeVisible();
    await joinButton.click();

    // Verify navigation to /join
    await expect(page).toHaveURL('/join');
  });

  test('Host Game button navigates to /host screen', async ({ page }) => {
    // Start at the home page
    await page.goto('/');

    // Verify we're on the home page
    await expect(page).toHaveURL('/');

    // Find and click the Host Game button
    const hostButton = page.getByRole('link', { name: 'Host Game' });
    await expect(hostButton).toBeVisible();
    await hostButton.click();

    // Verify navigation to /host
    await expect(page).toHaveURL('/host');
  });

});
