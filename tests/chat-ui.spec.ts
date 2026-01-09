import { test, expect } from '@playwright/test';

test.describe('Chat UI Component', () => {

  test('chat section is visible in the waiting room', async ({ page }) => {
    // Navigate to the host page and create a game
    await page.goto('/host');

    const testName = `ChatTest_${Date.now()}`;
    const nameInput = page.getByPlaceholder('Enter your name');
    await nameInput.fill(testName);

    const createButton = page.getByRole('button', { name: 'Create Game' });
    await createButton.click();

    // Wait for navigation to the game room
    await expect(page).toHaveURL(/\/game\/[A-Z0-9]+/);

    // Verify we're in the waiting room
    await expect(page.getByText('Waiting Room')).toBeVisible();

    // Verify the chat section is visible (use exact match to avoid matching player names containing "Chat")
    await expect(page.getByText('Chat', { exact: true })).toBeVisible();

    // Verify the chat messages container exists
    const chatMessages = page.getByTestId('chat-messages');
    await expect(chatMessages).toBeVisible();

    // Verify either the empty state or loading state is shown
    // (depends on whether Convex backend has the chat functions deployed)
    const loadingOrEmpty = page.locator('text="Loading messages..."').or(
      page.locator('text="No messages yet. Say hello!"')
    ).or(page.locator('text="Chat is loading..."'));
    await expect(loadingOrEmpty).toBeVisible();
  });

  test('chat messages area has scrollable container', async ({ page }) => {
    // Navigate to the host page and create a game
    await page.goto('/host');

    const testName = `ChatDisplayTest_${Date.now()}`;
    const nameInput = page.getByPlaceholder('Enter your name');
    await nameInput.fill(testName);

    const createButton = page.getByRole('button', { name: 'Create Game' });
    await createButton.click();

    // Wait for navigation to the game room
    await expect(page).toHaveURL(/\/game\/[A-Z0-9]+/);

    // Verify the chat section exists (use exact match)
    await expect(page.getByText('Chat', { exact: true })).toBeVisible();

    // Verify the chat messages container has the scrollable area
    const chatMessages = page.getByTestId('chat-messages');
    await expect(chatMessages).toBeVisible();

    // The chat area should be scrollable (has a fixed height class h-48)
    await expect(chatMessages).toHaveClass(/h-48/);
    await expect(chatMessages).toHaveClass(/overflow-y-auto/);
  });

});
