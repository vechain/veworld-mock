import {Page} from 'playwright';
import {Locator, expect} from '@playwright/test';


/**
 * Test App model
 */
export class TestApp {
    private page: Page
    readonly connectWalletButton: Locator
    readonly veWorldButton: Locator
    readonly walletAddress: Locator
    readonly validCertificate: Locator
    readonly testTxButton: Locator
    readonly txIdAlert: Locator
    readonly revertedAlert: Locator
    readonly signDataInput: Locator
    readonly testSignDataButton: Locator
    readonly signDataAlert: Locator

    constructor(page: Page) {
        this.page = page
        this.connectWalletButton = page.getByText('Connect Wallet', {exact: true}).first()
        this.veWorldButton = page.locator('div.modal-body button.card.LIGHT').first()
        this.walletAddress = page.locator('css=span.wallet-address').first()
        this.validCertificate = page.locator('css=div#cert-alert').first()
        this.testTxButton = page.locator('css=button#test-tx').first()
        this.txIdAlert = page.locator('css=div#txid-alert').first()
        this.revertedAlert = page.locator('css=div#reverted-alert').first()
        this.signDataInput = page.locator('#sign-data-input')
        this.testSignDataButton = page.locator('#sign-data-button')
        this.signDataAlert = page.locator('#sign-data-alert')
    }

    async clickConnectWalletButton() {
        await this.connectWalletButton.click()
    }

    async clickVeWorldButton() {
        await this.veWorldButton.click()
    }

    async expectAddressToBeVisible(address: string) {
        const trimmedAddress = address.slice(-4)
        await expect(this.walletAddress).toBeVisible()
        await expect(this.walletAddress).toContainText(trimmedAddress)
    }

    async expectValidCertificate() {
        await expect(this.validCertificate).toContainText('Valid Certificate')
    }

    async expectInvalidCertificate() {
        await expect(this.validCertificate).toContainText('Invalid Certificate')
    }

    async clickTestTxButton() {
        await this.testTxButton.click()
    }

    async expectTxidToBeVisible() {
        await expect(this.txIdAlert).toBeVisible()
    }

    async expectTxIdToBe(txid: string) {
        await expect(this.txIdAlert).toContainText(txid)
    }

    async expectTxRevertedVisible() {
        await expect(this.revertedAlert).toBeVisible()
        await expect(this.revertedAlert).toContainText('Transaction was reverted')
    }

    async expectTxRejectedToBeVisible() {
        await expect(this.txIdAlert).toBeVisible()
        await expect(this.txIdAlert).toContainText('User cancelled request')
    }

    async submitDataToSign() {
        await this.signDataInput.fill('foobar')
        await this.testSignDataButton.click()
    }

    async expectSignedDataToBeVisible() {
        await expect(this.signDataAlert).toBeVisible()
        await expect(this.signDataAlert).not.toBeEmpty()
    }
}