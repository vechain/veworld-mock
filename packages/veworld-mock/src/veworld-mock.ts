import { HDNode, TransactionHandler, blake2b256, certificate, secp256k1 } from '@vechain/sdk-core';
import { Clause, HttpClient, ThorClient } from '@vechain/sdk-network';
import { VeWorld, VeWorldMockConfig, VeWorldMockOptions } from './types';


// define the controller
export const mockController = {

	getSignerAddress() {
		return window['veworld-mock-output']['address'];
	},

	getSenderTxId() {
		return window['veworld-mock-output']['txId'];
	},

	installMock() {
		try {
			const install: VeWorld = {
				isVeWorld: true,
				newConnexSigner: () => mockNewConnexSigner,
			};
			window['vechain'] = install;
		} catch (e) {
			console.log(`Error installing veworld-mock: ${e}`)
			throw e;
		}
	},

	setConfig(config: VeWorldMockConfig) {
		if (config.accountIndex !== undefined) {
			window['veworld-mock-config'].accountIndex = config.accountIndex;
		}
		if (config.chainTag !== undefined) {
			window['veworld-mock-config'].chainTag = config.chainTag;
		}
		if (config.mnemonicWords !== undefined) {
			window['veworld-mock-config'].mnemonicWords = config.mnemonicWords;
		}
		if (config.thorUrl !== undefined) {
			window['veworld-mock-config'].thorUrl = config.thorUrl;
		}
	},

	setOptions(options: VeWorldMockOptions) {
		if (options.validCertificate !== undefined) {
			window['veworld-mock-options'].validCertificate = options.validCertificate;
		}
		if (options.realTx !== undefined) {
			window['veworld-mock-options'].realTx = options.realTx;
		}
		if (options.fakeTxId !== undefined) {
			window['veworld-mock-options'].fakeTxId = options.fakeTxId;
		}
		if (options.gasMultiplier !== undefined) {
			window['veworld-mock-options'].gasMultiplier = options.gasMultiplier;
		}
	},

	uninstallMock() {
		delete window['vechain'];
	},
};

// Signs and potentially sends a transaction
// txOptions currently not used so doesn't support dependant or delegated txs
const mockTxSender = async (txMessage: Clause[], txOptions: any) => {
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
	const gasMultiplier = window['veworld-mock-options'].gasMultiplier!;
	const gasResult = await thorClient.gas.estimateGas(clauses, senderAddress, { gasPadding: gasMultiplier });
	const txBody = {
		blockRef: latestBlock !== null ? latestBlock.id.slice(0, 18) : '0x0',
		chainTag: window['veworld-mock-config'].chainTag!,
		clauses: clauses,
		dependsOn: null,
		expiration: 18,
		gas: Math.ceil(gasResult.totalGas),
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
	console.log(`Signing certificate for ${msg.purpose}`);
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
			cert.signer = '0x0'
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
const mockNewConnexSigner = {
	
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

const setupDefaults = () => {
	// set the controller
	window['veworld-mock-controller'] = mockController;

	// setup default mock config for solo
	window['veworld-mock-config'] = {
		accountIndex: 0,
		chainTag: 0xf6,
		mnemonicWords: 'denial kitchen pet squirrel other broom bar gas better priority spoil cross'.split(' '),
		thorUrl: 'http://localhost:8669',
	}

	// setup the default mock options
	window['veworld-mock-options'] = {
		validCertificate: true,
		realTx: false,
		fakeTxId: '0x0',
		gasMultiplier: 0.2
	}

	// setup the default mock output
	window['veworld-mock-output'] = {
		address: null,
		txId: null,
	}

}
setupDefaults();
