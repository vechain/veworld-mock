import { HDNode, TransactionHandler, blake2b256, certificate, secp256k1 } from '@vechain/sdk-core';
import { Clause, HttpClient, ThorClient } from '@vechain/sdk-network';

// Signs and potentially sends a transaction
// txOptions currently not used so doesn't support dependant or delegated txs
const mockTxSender = async (txMessage: Clause[], txOptions: any) => {
	console.log('[VeWorld-Mock] Signing/Sending transaction');
	if (!window['veworld-mock-options'].realTx) {
		// fake tx
		window['veworld-mock-output'].txId = window['veworld-mock-options'].fakeTxId!;
		return window['veworld-mock-options'].fakeTxId!;
	}
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
	if (window['veworld-mock-options'].revertTx) {
		console.log('[VeWorld-Mock] making reverting transaction');
		// add an invalid clause
		clauses.push({
			data: '0x',
			to: '0xC9360019f6aF825fd935f384712a98F0dE54a7B9',
			value: '0x204FCE5E3E25026110000000',
		});
	}
	//get tx gas
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
	const rawNormalSigned = TransactionHandler.sign(txBody, privateKey).encoded;
	const send = await thorClient.transactions.sendRawTransaction(`0x${rawNormalSigned.toString('hex')}`);
	const txId = send.id;
	// setup output
	window['veworld-mock-output'].txId = txId;
	// return txId
	return txId;
};

// signs certificate
const mockCertificateSigner = (msg: { payload: { type: string; content: string }; purpose: string }) => {
	console.log(`[VeWorld-Mock] Signing certificate for ${msg.purpose}`);
	try {
		const hdNode = HDNode.fromMnemonic(window['veworld-mock-config'].mnemonicWords!);
		const childNode = hdNode.derive(window['veworld-mock-config'].accountIndex!);
		const privateKey = childNode.privateKey;
		if (privateKey === null) {
			console.log('Error: Private key is null');
			throw new Error('Private key is null');
		}
		const address = childNode.address;
		window['veworld-mock-output'].address = address;
		const cert = {
			domain: window.location.hostname,
			payload: msg.payload,
			purpose: msg.purpose,
			signer: address.toLowerCase(), 		//https://github.com/vechain/vechain-sdk-js/issues/809
			timestamp: Math.floor(Date.now() / 1000),
		};
		const signature = secp256k1.sign(blake2b256(certificate.encode(cert)), privateKey);
		if (!window['veworld-mock-options'].validCertificate) {
			console.log('Returning invalid certificate');
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