import {test} from '@playwright/test';
import {veWorldMockClient} from '@vechain/veworld-mock-playwright'
import {TestApp} from '../model/testApp';

test.describe('Wallet Connect', () => {

    test.beforeEach(async ({page}) => {
        await veWorldMockClient.load(page);
        await page.goto('http://localhost:5003');
        await veWorldMockClient.installMock(page);
    });

    test('Mock can sign valid certificate', async ({page}) => {
        const app = new TestApp(page);
        await app.clickConnectWalletButton();
        await app.clickVeWorldButton();
        const address = await veWorldMockClient.getSignerAddress(page);
        await app.expectAddressToBeVisible(address);
        await app.expectValidCertificate();
    });

    test('Mock can sign valid certificate with non default account', async ({page}) => {
        await veWorldMockClient.setConfig(page, {accountIndex: 2});
        const app = new TestApp(page);
        await app.clickConnectWalletButton();
        await app.clickVeWorldButton();
        const address = await veWorldMockClient.getSignerAddress(page);
        await app.expectAddressToBeVisible(address);
        await app.expectValidCertificate();
    });

    test('Mock can sign invalid certificate', async ({page}) => {
        await veWorldMockClient.setOptions(page, {
            mockCertificate: 'invalid',
            fakeCertSignerAddress: "0x865306084235Bf804c8Bba8a8d56890940ca8F0b"
        });
        const app = new TestApp(page);
        await app.clickConnectWalletButton();
        await app.clickVeWorldButton();
        await app.expectInvalidCertificate();
    });
});
