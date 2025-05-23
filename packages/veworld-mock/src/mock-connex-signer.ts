import {
    Address,
    Certificate,
    HDKey,
    Hex,
    HexUInt,
    Transaction,
    TransactionClause,
} from '@vechain/sdk-core';
import {
    ThorClient,
    TypedDataDomain,
    TypedDataParameter,
    VeChainPrivateKeySigner,
    VeChainProvider
} from '@vechain/sdk-network';

class Rejected extends Error {
    constructor(message: string) {
        super(message);
    }
}

// Signs and potentially sends a transaction
// txOptions currently not used so doesn't support dependant or delegated txs
const mockTxSender = async (txMessage: TransactionClause[], txOptions: any) => {
    const txType = window['veworld-mock-options'].mockTransaction;
    console.log(`[VeWorld-Mock] Signing/Sending transaction of type ${txType}`);
    window['veworld-mock-output'].txId = null;

    // switch tx based on txType
    if (txType === 'fake') {
        const fakeTxId = window['veworld-mock-options'].fakeTxId;
        console.log(`[VeWorld-Mock] returning fake txId: ${fakeTxId}`);
        window['veworld-mock-output'].txId = fakeTxId;
        return fakeTxId;
    }

    if (txType === 'reject') {
        console.log(`[VeWorld-Mock] rejecting transaction`);
        throw new Rejected('User cancelled request');
    }

    if (txType === 'revert' || txType === 'real') {
        console.log(`[VeWorld-Mock] creating real transaction`);
        // build tx object - ignore tx options for now
        const thorClient = ThorClient.at(window['veworld-mock-config'].thorUrl!);
        const clauses = txMessage.map((clause) => ({
            data: clause.data || '0x',
            to: clause.to,
            value: clause.value,
        }));

        // TODO: make method from it
        // derive key and address
        const childNode = HDKey.fromMnemonic(
            window['veworld-mock-config'].mnemonicWords!,
            HDKey.VET_DERIVATION_PATH
        ).deriveChild(window['veworld-mock-config'].accountIndex!)
        const privateKey = childNode.privateKey;
        if (privateKey === null) {
            console.log('Error: Private key is null');
            throw new Error('Private key is null');
        }
        const senderAddress = Address.ofPrivateKey(privateKey).toString();

        const latestBlock = await thorClient.blocks.getBestBlockCompressed();
        // check if to make revert
        if (txType === 'revert') {
            console.log('[VeWorld-Mock] making reverting transaction');
            // add large vet transfer clause
            clauses.push({
                data: '0x',
                to: '0xC9360019f6aF825fd935f384712a98F0dE54a7B9',
                value: '0x204FCE5E3E25026110000000',
            });
        }
        // get tx gas
        const gasMultiplier = window['veworld-mock-options'].gasMultiplier!;
        const gasResult = await thorClient.gas.estimateGas(clauses, senderAddress, {gasPadding: gasMultiplier});
        const totalGas = Math.ceil(gasResult.totalGas);
        // create tx body
        const txBody = {
            blockRef: latestBlock !== null ? latestBlock.id.slice(0, 18) : '0x0',
            chainTag: window['veworld-mock-config'].chainTag!,
            clauses: clauses,
            dependsOn: null,
            expiration: 18,
            gas: totalGas,
            gasPriceCoef: 0,
            nonce: 0,
        };
        // sign and send tx
        const raw = Transaction.of(txBody).sign(privateKey).encoded;
        const send = await thorClient.transactions
            .sendRawTransaction(HexUInt.of(raw).toString());
        const txId = send.id;
        // record txId
        window['veworld-mock-output'].txId = txId;
        console.log(`[VeWorld-Mock] Real tx id ${txId}`);
        // return txId
        return txId;
    }
    throw new Error('[VeWorld-Mock] Invalid mock txType');
};

// signs certificate
const mockCertificateSigner = (msg: { payload: { type: string; content: string }; purpose: string }) => {
    const certType = window['veworld-mock-options'].mockCertificate;
    console.log(`[VeWorld-Mock] Signing certificate of type ${certType} for ${msg.purpose}`);
    window['veworld-mock-output'].address = null;

    if (certType === 'valid' || certType === 'invalid') {
        try {
            const childNode = HDKey.fromMnemonic(
                window['veworld-mock-config'].mnemonicWords!,
                HDKey.VET_DERIVATION_PATH
            ).deriveChild(window['veworld-mock-config'].accountIndex!)
            const privateKey = childNode.privateKey;
            if (privateKey === null) {
                console.log('[VeWorld-Mock] Error: Private key is null');
                throw new Error('Private key is null');
            }

            const address = Address.ofPrivateKey(privateKey).toString();
            window['veworld-mock-output'].address = address
            const certData = {
                domain: window.location.hostname,
                payload: msg.payload,
                purpose: msg.purpose,
                signer: address,
                timestamp: Math.floor(Date.now() / 1000),
            };
            const certificate = Certificate.of(certData)
            certificate.sign(privateKey)

            if (certType === 'invalid') {
                console.log('[VeWorld-Mock] Returning invalid certificate');
                certData.signer = window['veworld-mock-options'].fakeCertSignerAddress!;
            }
            return {
                annex: {
                    domain: certData.domain,
                    signer: certData.signer,
                    timestamp: certData.timestamp,
                },
                signature: certificate.signature,
            };
        } catch (e) {
            console.log(`Error signing certificate: ${e}`);
            throw e;
        }
    }
    throw new Error('[VeWorld-Mock] Invalid cert type');
}

const mockTypedDataSigner = (
    domain: TypedDataDomain,
    types: Record<string, TypedDataParameter[]>,
    message: Record<string, unknown>,
    primaryType?: any
) => {
    const wallet = HDKey.fromMnemonic(
        window['veworld-mock-config'].mnemonicWords!,
        HDKey.VET_DERIVATION_PATH
    ).deriveChild(window['veworld-mock-config'].accountIndex!)
    const provider = new VeChainProvider(ThorClient.at(window['veworld-mock-config'].thorUrl!))

    const signer = new VeChainPrivateKeySigner(
        Hex.of(wallet.privateKey).bytes,
        provider
    )

    return signer.signTypedData(
        domain,
        types,
        message,
        typeof primaryType === 'string' ? primaryType : undefined
    )
}

// Mocks the newConnexSigner object
export const mockConnexSigner = {
    async signCert(msg: { payload: { type: string; content: string }; purpose: string }) {
        return mockCertificateSigner(msg);
    },

    async signTx(txMessage: TransactionClause[], txOptions: any) {
        const txId = await mockTxSender(txMessage, txOptions);
        return Promise.resolve({
            signer: window['veworld-mock-output'].address!,
            txid: txId,
        });
    },

    async signTypedData(
        domain: TypedDataDomain,
        types: Record<string, TypedDataParameter[]>,
        message: Record<string, unknown>,
        primaryType?: string
    ) {
        return Promise.resolve(mockTypedDataSigner(domain, types, message, primaryType));
    },
};