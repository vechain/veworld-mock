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

const mockTypedDataSigner = () => {
    const EIP712_CONTRACT = '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC';
    const EIP712_FROM = '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826';
    const EIP712_TO = '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB';
    const EIP712_PRIVATE_KEY = '0xc85ef7d79691fe79573b1a7064c19c1a9819ebdbd1faaab1a8ec92344438aaf4';
    const fixture = {
        name: 'EIP712 example',
        domain: {
            name: 'Ether Mail',
                version: '1',
                chainId: 1,
                verifyingContract: EIP712_CONTRACT
        },
        primaryType: 'Mail',
        types: {
        Person: [
            {
                name: 'name',
                type: 'string'
            },
            {
                name: 'wallet',
                type: 'address'
            }
        ],
        Mail: [
        {
            name: 'from',
            type: 'Person'
        },
        {
            name: 'to',
            type: 'Person'
        },
        {
            name: 'contents',
            type: 'string'
        }
    ]
        },
        data: {
            from: {
                name: 'Cow',
                    wallet: EIP712_FROM
            },
            to: {
                name: 'Bob',
                    wallet: EIP712_TO
            },
            contents: 'Hello, Bob!'
        },
        encoded:
            '0xa0cedeb2dc280ba39b857546d74f5549c3a1d7bdc2dd96bf881f76108e23dac2fc71e5fa27ff56c350aa531bc129ebdf613b772b6604664f5d8dbe21b85eb0c8cd54f074a4af31b4411ff6a60c9719dbd559c221c8ac3492d9d872b041d703d1b5aadf3154a261abdd9086fc627b61efca26ae5702701d05cd2305f7c52a2fc8',
                digest: '0xbe609aee343fb3c4b28e1df9e632fca64fcfaede20f02e86244efddf30957bd2',
            privateKey: EIP712_PRIVATE_KEY,
            signature:
        '0x4355c47d63924e8a72e509b65029052eb6c299d53a04e167c5775fd466751c9d07299936d304c153f6443dfa05f40ff007d72911b6f72307f996231605b915621c'
    }

    const provider = new VeChainProvider(ThorClient.at(window['veworld-mock-config'].thorUrl!))
    const signer = new VeChainPrivateKeySigner(
        Hex.of(EIP712_PRIVATE_KEY).bytes,
        provider
    )
    return signer.signTypedData(
        fixture.domain as TypedDataDomain,
        fixture.types,
        fixture.data,
        fixture.primaryType,
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

    async signTypedData() {
        return Promise.resolve(mockTypedDataSigner());
    },
};