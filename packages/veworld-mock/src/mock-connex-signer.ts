import { HDNode, TransactionHandler, blake2b256, certificate, secp256k1 } from '@vechain/sdk-core';
import { Clause, HttpClient, ThorClient } from '@vechain/sdk-network';

class Rejected extends Error {
	constructor(message: string) {
		super(message);
	}
}

// Signs and potentially sends a transaction
// txOptions currently not used so doesn't support dependant or delegated txs
const mockTxSender = async (txMessage: Clause[], txOptions: any) => {
	const txType = window['veworld-mock-options'].mockTransaction;
	console.log(`[VeWorld-Mock] Signing/Sending transaction of type ${txType}`);
	window['veworld-mock-output'].txId = null;
	// return fake tx
	if (txType === 'fake') {
		const fakeTxId = window['veworld-mock-options'].fakeTxId;
		console.log(`[VeWorld-Mock] returning fake txId: ${fakeTxId}`);
		window['veworld-mock-output'].txId = fakeTxId;
		return fakeTxId;
	}
	// reject tx
	if (txType === 'reject') {
		console.log(`[VeWorld-Mock] rejecting transaction`);
		throw new Rejected('User cancelled request');
	}
	// real tx
	if (txType === 'revert' || txType === 'real') {
		console.log(`[VeWorld-Mock] creating real transaction`);
		// build tx object - ignore tx options for now
		const httpClient = new HttpClient(window['veworld-mock-config'].thorUrl!);
		const thorClient = new ThorClient(httpClient);
		const clauses = txMessage.map((clause) => ({
			data: clause.data || '0x',
			to: clause.to,
			value: clause.value,
		}));
		const hdNode = HDNode.fromMnemonic(window['veworld-mock-config'].mnemonicWords!);
		const childNode = hdNode.derive(window['veworld-mock-config'].accountIndex!);
		const privateKey = childNode.privateKey;
		if (privateKey === null) {
			console.log('Error: Private key is null');
			throw new Error('Private key is null');
		}
		const senderAddress = childNode.address;
		const latestBlock = await thorClient.blocks.getBestBlockCompressed();
		//check if to make revert
		if (txType === 'revert') {
			console.log('[VeWorld-Mock] making reverting transaction');
			// add large vet trasfer clause
			clauses.push({
				data: '0x',
				to: '0xC9360019f6aF825fd935f384712a98F0dE54a7B9',
				value: '0x204FCE5E3E25026110000000',
			});
		}
		// get tx gas
		const gasMultiplier = window['veworld-mock-options'].gasMultiplier!;
		const gasResult = await thorClient.gas.estimateGas(clauses, senderAddress, { gasPadding: gasMultiplier });
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
		const rawNormalSigned = TransactionHandler.sign(txBody, privateKey).encoded;
		const send = await thorClient.transactions.sendRawTransaction(`0x${rawNormalSigned.toString('hex')}`);
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
	// sign valid or invalid cert
	if (certType === 'valid' || certType === 'invalid') {
		try {
			const hdNode = HDNode.fromMnemonic(window['veworld-mock-config'].mnemonicWords!);
			const childNode = hdNode.derive(window['veworld-mock-config'].accountIndex!);
			const privateKey = childNode.privateKey;
			if (privateKey === null) {
				console.log('[VeWorld-Mock] Error: Private key is null');
				throw new Error('Private key is null');
			}
			const address = childNode.address;
			window['veworld-mock-output'].address = address.toLocaleLowerCase();
			const cert = {
				domain: window.location.hostname,
				payload: msg.payload,
				purpose: msg.purpose,
				signer: address.toLowerCase(), 		//https://github.com/vechain/vechain-sdk-js/issues/809
				timestamp: Math.floor(Date.now() / 1000),
			};
			const signature = secp256k1.sign(blake2b256(certificate.encode(cert)), privateKey);
			if (certType === 'invalid') {
				console.log('VeWorld-Mock] Returning invalid certificate');
				cert.signer = window['veworld-mock-options'].fakeCertSignerAddress!;
			}
			const response = {
				annex: {
					domain: cert.domain,
					signer: cert.signer,
					timestamp: cert.timestamp,
				},
				signature: `0x${signature.toString('hex')}`,
			};
			return response;
		} catch (e) {
			console.log(`Error signing certificate: ${e}`);
			throw e;
		}
	}
	throw new Error('[VeWorld-Mock] Invalid cert type');
}

// Mocks the newConnexSigner object
export const mockConnexSigner = {
	
	async signCert(msg: { payload: { type: string; content: string }; purpose: string }) {
		return mockCertificateSigner(msg);
	},

	async signTx(txMessage: Clause[], txOptions: any) {
		const txId = await mockTxSender(txMessage, txOptions);
		return Promise.resolve({
			signer: window['veworld-mock-output'].address!,
			txid: txId,
		});
	}
};