import { TestApp } from "../model/testApp";
import { mockController } from "@vechain/veworld-mock/dist/veworld-mock";

describe('Wallet Connect', () => {

    beforeEach(() => {
        cy.visit('http://localhost:5003');
    });

    it('Mock can sign valid certificate', async () => {
        const app = new TestApp();
        app.clickConnectWalletButton();
        app.clickVeWorldButton();
        const address = mockController.getSignerAddress();
        app.expectAddressToBeVisible(address);
        app.expectValidCertificate();

    } )


    it('Mock can sign invalid certificate', () => {

    } )

})

