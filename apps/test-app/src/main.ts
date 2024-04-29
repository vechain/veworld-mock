import { DAppKitUI } from '@vechain/dapp-kit-ui';
import { Certificate } from 'thor-devkit';

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
        <button type="button" class="btn btn-light" id="test-tx" disabled>Test Transaction</button>
    </div>
`;

const vechainDAppKitOptions = {
    nodeUrl: 'http://localhost:8669',
    genesis: soloGenesis,
    usePersistence: true,
};

const validCert = (cert: Certificate): boolean => {
    let isValid = false;
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

if (testTxButton && certAlert) {

    testTxButton.addEventListener('click', async () => {
        const tx = [{
            to: '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed',
            value: '0x0',
            data: '0x',
        }];

        try {
            const txResponse = await DAppKitUI.vendor.sign('tx', tx).request();
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
        }
    };

    handleConnected(DAppKitUI.wallet.state.address);

    DAppKitUI.modal.onConnectionStatusChange(handleConnected);
}
