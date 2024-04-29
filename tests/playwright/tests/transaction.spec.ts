import { test, expect } from '@playwright/test';
import { veWorldMockClient } from '@vechain/veworld-mock-playwright';
import { TestApp } from '../model/testApp';


test.describe('Transactions', () => {

  test.beforeEach(async ({ page }) => {
    await veWorldMockClient.load(page);
    await page.goto('http://localhost:5003');
    await veWorldMockClient.installMock(page);
  });

  test('Mock can create real transaction', async ({ page }) => { 
    const app = new TestApp(page);
    await app.clickConnectWalletButton();
    await app.clickVeWorldButton();
    const address = await veWorldMockClient.getSignerAddress(page);
    await app.expectAddressToBeVisible(address);
    await app.expectValidCertificate();
    await app.clickTestTxButton();
    const txid = await veWorldMockClient.getSenderTxId(page);
    await app.expectTxidToBeVisible(txid);
  });

  test('Mock can return fake tx id', async ({ page }) => { 
    const app = new TestApp(page);
    await app.clickConnectWalletButton();
    await app.clickVeWorldButton();
    const address = await veWorldMockClient.getSignerAddress(page);
    await app.expectAddressToBeVisible(address);
    await app.expectValidCertificate();
    await veWorldMockClient.setOptions(page, { fakeTxId: '0x0' });
    await app.clickTestTxButton();
    const txid = await veWorldMockClient.getSenderTxId(page);
    await app.expectTxidToBeVisible(txid);
  });


});
