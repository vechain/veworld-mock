import {test} from '@playwright/test';
import {veWorldMockClient} from '@vechain/veworld-mock-playwright';
import {TestApp} from '../model/testApp';

test.describe('Typed data', () => {

    test.beforeEach(async ({page}) => {
        await veWorldMockClient.load(page);
        await page.goto('http://localhost:5003');
        await veWorldMockClient.installMock(page);
    });

    test('Mock can sign typed data', async ({page}) => {
        const app = new TestApp(page);
        await app.clickConnectWalletButton();
        await app.clickVeWorldButton();
        const address = await veWorldMockClient.getSignerAddress(page);
        await app.expectAddressToBeVisible(address);

        await app.submitDataToSign();
        await app.expectSignedDataToBeVisible()
        await page.waitForTimeout(1000)
    });
});
