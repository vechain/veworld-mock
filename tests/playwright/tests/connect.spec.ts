import { test, expect } from '@playwright/test';
import { veWorldMockClient } from '@vechain/veworld-mock-playwright'
import { TestApp } from '../model/testApp';


test.describe('Wallet Connect', () => {

  test.beforeEach(async ({ page }) => {
    await veWorldMockClient.load(page);
    await page.goto('http://localhost:5003');
    await veWorldMockClient.installMock(page);
  });

  test('Mock can sign valid certificate VeWorld', async ({ page }) => { 
    const app = new TestApp(page);
    await app.clickConnectWalletButton();
    await app.clickVeWorldButton();
    const address = await veWorldMockClient.getSignerAddress(page);
    await app.expectAddressToBeVisible(address);
    await app.expectValidCertificate();
  });

  test('Mock can sign invalid certificate Veworld', async ({ page }) => { 
    veWorldMockClient.setOptions(page, {validCertificate: false});
    const app = new TestApp(page);
    await app.clickConnectWalletButton();
    await app.clickVeWorldButton();
    const address = await veWorldMockClient.getSignerAddress(page);
    await app.expectInvalidCertificate();
  });


});
