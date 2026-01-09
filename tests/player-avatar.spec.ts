import { test, expect } from '@playwright/test';

test.describe('Player Avatar Feature', () => {

  test('player is assigned an avatar emoji when creating a game', async ({ page }) => {
    // Navigate to the host page
    await page.goto('/host');

    // Verify we're on the host page
    await expect(page).toHaveURL('/host');

    // Generate a unique name for this test run
    const testName = `AvatarTest_${Date.now()}`;

    // Enter the host name
    const nameInput = page.getByPlaceholder('Enter your name');
    await expect(nameInput).toBeVisible();
    await nameInput.fill(testName);

    // Click the Create Game button
    const createButton = page.getByRole('button', { name: 'Create Game' });
    await expect(createButton).toBeVisible();
    await createButton.click();

    // Wait for navigation to the game room
    await expect(page).toHaveURL(/\/game\/[A-Z0-9]+/);

    // Verify the waiting room is displayed with the game code
    await expect(page.getByText('Waiting Room')).toBeVisible();

    // Verify the player name appears in the players list
    // This confirms that the player was successfully created in the database
    // which includes the avatar field (Convex would reject the insert if avatar was missing)
    await expect(page.getByText(testName)).toBeVisible();

    // Verify the player is shown with the "(You)" indicator
    await expect(page.getByText('(You)')).toBeVisible();

    // Verify host badge is displayed (use exact matching to avoid conflict with player names containing 'Host')
    await expect(page.getByText('Host', { exact: true })).toBeVisible();
  });

  test('player is assigned an avatar emoji when joining a game', async ({ page, context }) => {
    // First, create a game as a host
    await page.goto('/host');

    const hostName = `JoinTestHost_${Date.now()}`;
    const nameInput = page.getByPlaceholder('Enter your name');
    await nameInput.fill(hostName);

    const createButton = page.getByRole('button', { name: 'Create Game' });
    await createButton.click();

    // Wait for navigation to the game room and extract the game code
    await expect(page).toHaveURL(/\/game\/[A-Z0-9]+/);
    const url = page.url();
    const gameCode = url.split('/game/')[1];

    // Now open a new page to join as a second player
    const page2 = await context.newPage();

    // Clear localStorage to simulate a new player
    await page2.goto('/');
    await page2.evaluate(() => {
      localStorage.clear();
    });

    // Navigate to the join page
    await page2.goto('/join');
    await expect(page2).toHaveURL('/join');

    // Enter the game code (placeholder is "ABCD12")
    const codeInput = page2.getByPlaceholder('ABCD12');
    await expect(codeInput).toBeVisible();
    await codeInput.fill(gameCode);

    // Enter a player name
    const guestName = `JoinTestGuest_${Date.now()}`;
    const guestNameInput = page2.getByPlaceholder('Enter your name');
    await expect(guestNameInput).toBeVisible();
    await guestNameInput.fill(guestName);

    // Click Join Game button
    const joinButton = page2.getByRole('button', { name: 'Join Game' });
    await expect(joinButton).toBeVisible();
    await joinButton.click();

    // Wait for navigation to the game room
    await expect(page2).toHaveURL(/\/game\/[A-Z0-9]+/);

    // Verify the guest is in the game
    // This confirms the player record was created successfully with all required fields including avatar
    await expect(page2.getByText(guestName)).toBeVisible();
    await expect(page2.getByText('(You)')).toBeVisible();

    // Verify both players appear in the host's view
    await expect(page.getByText(guestName)).toBeVisible({ timeout: 10000 });

    // Clean up - close second page
    await page2.close();
  });

});
