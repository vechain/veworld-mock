import { DAppKitUI } from '@vechain/dapp-kit-ui';
import { Certificate } from 'thor-devkit';
import { Connex } from '@vechain/connex'

const soloGenesis = {
    "number": 0,
    "id": "0x00000000c05a20fbca2bf6ae3affba6af4a74b800b585bf7a4988aba7aea69f6",
    "size": 170,
    "parentID": "0xffffffff53616c757465202620526573706563742c20457468657265756d2100",
    "timestamp": 1530316800,
    "gasLimit": 10000000,
    "beneficiary": "0x0000000000000000000000000000000000000000",
    "gasUsed": 0,
    "totalScore": 0,
    "txsRoot": "0x45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0",
    "txsFeatures": 0,
    "stateRoot": "0x93de0ffb1f33bc0af053abc2a87c4af44594f5dcb1cb879dd823686a15d68550",
    "receiptsRoot": "0x45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0",
    "signer": "0x0000000000000000000000000000000000000000",
    "isTrunk": true,
    "transactions": []
};

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <div class="container">
        <h2>VeWorld Mock</h2>
        <div class="label">Connect:</div>
        <div id="cert-alert" class="alert alert-primary" role="alert" hidden></div>
        <vdk-button></vdk-button>
        <div class="label">Send test tx:</div>
        <div id="txid-alert" class="alert alert-primary" role="alert" hidden></div>
        <div id="reverted-alert" class="alert alert-primary" role="alert" hidden></div>
        <div id="typed-data-signature" class="alert alert-primary" role="alert" hidden></div>
        <button type="button" class="btn btn-light" id="test-tx" disabled>Test Transaction</button>
        <button
            type="button"
            class="btn btn-light"
            id="test-sign-typed-data"
            disabled
        >
            Test Signed Typed Data
        </button>
    </div>
`;

const vechainDAppKitOptions = {
    nodeUrl: 'http://localhost:8669',
    genesis: soloGenesis,
    usePersistence: true,
};

const connexInstance = new Connex({ node: 'http://localhost:8669', network: soloGenesis})

const validCert = (cert: Certificate): boolean => {
    let isValid: boolean;
    try {
        Certificate.verify(cert);
        isValid = true;
    } catch (error) {
        isValid = false;
    }
    return isValid;
}

DAppKitUI.configure(vechainDAppKitOptions);
const testTxButton = document.getElementById('test-tx');
const certAlert = document.getElementById('cert-alert');
const txIdAlert = document.getElementById('txid-alert');
const revertedAlert = document.getElementById('reverted-alert');

if (testTxButton && certAlert) {

    testTxButton.addEventListener('click', async () => {
        const testTx = [{
            to: '0x435933c8064b4Ae76bE665428e0307eF2cCFBD68',
            value: '0x1',
            data: '0x',
        }];

        try {
            let txResponse: Connex.Vendor.TxResponse;
            try {
                // request to sign tx
                txResponse = await DAppKitUI.vendor.sign('tx', testTx).request();
            } catch (error) {
                // display error
                let message = 'Unknown error';
                if (error instanceof Error) message = error.message;
                txIdAlert!.removeAttribute('hidden');
                txIdAlert!.innerText = `Transaction Error: ${message}`;
                return;
            }
            // get tx id
            const txid = txResponse.txid;
            // display tx id
            txIdAlert!.removeAttribute('hidden');
            txIdAlert!.innerText = `Transaction ID: ${txid}`;
            // display if reverted
            const ticker = connexInstance.thor.ticker();
            await ticker.next();
            const tx = connexInstance.thor.transaction(txid);
            const txDetail = await tx.get();
            const receipt = await tx.getReceipt();
            console.log(JSON.stringify(txDetail));
            console.log(JSON.stringify(receipt));
            if (receipt && receipt.reverted) {
                console.log('Transaction was reverted');
                revertedAlert!.removeAttribute('hidden');
                revertedAlert!.innerText = 'Transaction was reverted';
            } 
            console.log('txResponse', txResponse);
        } catch (error) {
            console.error('error', error);
        }
    });

    const handleConnected = (address: string | null) => {
        if (address) {
            const cert = DAppKitUI.wallet.state.connectionCertificate!
            const valid = validCert(cert);
            certAlert!.removeAttribute('hidden');
            certAlert!.innerText = valid ? 'Valid Certificate' : 'Invalid Certificate';
            testTxButton!.removeAttribute('disabled');
        } else {
            testTxButton!.setAttribute('disabled', 'true');
            certAlert!.setAttribute('hidden', 'true');
            txIdAlert!.setAttribute('hidden', 'true');
            revertedAlert!.setAttribute('hidden', 'true');
        }
    };

    handleConnected(DAppKitUI.wallet.state.address);

    DAppKitUI.modal.onConnectionStatusChange(handleConnected);
}
