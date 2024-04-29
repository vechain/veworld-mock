import { test, expect } from '@playwright/test';


test.describe('Transactions', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5003');
  });

  test('Mock can create real transaction', async ({ page }) => { });

  test('Mock can return fake tx id', async ({ page }) => { });


});
