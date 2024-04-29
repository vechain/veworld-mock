/**
 * Test App model
 */
export class TestApp {

    constructor() { }

    clickConnectWalletButton() {
        cy.get('vdk-connect-button button').click()
    }

    clickVeWorldButton() {
        cy.get('vdk-source-card button').first().click()
    }

    expectAddressToBeVisible(address: string) {
        const trimmedAddress = address.slice(-4)
        cy.get('span#wallet-address').first().should('be.visible').and('contain.text', trimmedAddress)
    }

    expectValidCertificate() {
        cy.get('div#cert-alert').first().should('be.visible').and('contain.text', 'Valid Certificate')
    }

    expectInvalidCertificate() {
        cy.get('div#cert-alert').first().should('be.visible').and('contain.text', 'Invalid Certificate')
    }

    clickTestTxButton() {
        cy.get('button#test-tx').click()
    }

    expectTxidToBeVisible(txid: string) {
        cy.get('div#txid-alert').first().should('be.visible').and('contain.text', txid)
    }

}