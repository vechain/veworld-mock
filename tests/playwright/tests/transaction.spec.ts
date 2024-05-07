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
    await veWorldMockClient.setOptions(page, { realTx: true });
    await app.clickTestTxButton();
    await app.expectTxidToBeVisible();
    const txid = await veWorldMockClient.getSenderTxId(page);
    await app.expectTxIdToBe(txid);
  });

  test('Mock can return fake tx id', async ({ page }) => { 
    const app = new TestApp(page);
    await app.clickConnectWalletButton();
    await app.clickVeWorldButton();
    const address = await veWorldMockClient.getSignerAddress(page);
    await app.expectAddressToBeVisible(address);
    await app.expectValidCertificate();
    await veWorldMockClient.setOptions(page, { realTx: false, fakeTxId: '0x0' });
    await app.clickTestTxButton();
    await app.expectTxidToBeVisible();
    const txid = await veWorldMockClient.getSenderTxId(page);
    await app.expectTxIdToBe(txid);
  });

  test('Mock can make a transaction revert', async ({ page }) => { 
    const app = new TestApp(page);
    await app.clickConnectWalletButton();
    await app.clickVeWorldButton();
    const address = await veWorldMockClient.getSignerAddress(page);
    await app.expectAddressToBeVisible(address);
    await app.expectValidCertificate();
    await veWorldMockClient.setOptions(page, { realTx: true, revertTx: true});
    await app.clickTestTxButton();
    await app.expectTxidToBeVisible();
    const txid = await veWorldMockClient.getSenderTxId(page);
    await app.expectTxIdToBe(txid);
    await app.expectTxRevertedVisible();

  });


});
