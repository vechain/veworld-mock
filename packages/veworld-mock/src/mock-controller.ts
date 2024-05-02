import { VeWorld, VeWorldMockConfig, VeWorldMockController, VeWorldMockOptions } from "./types";
import { mockConnexSigner } from "./mock-connex-signer";


// set default values
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

// define the controller
export const mockController: VeWorldMockController = {

	getSignerAddress() {
		console.log('[VeWorld-Mock] Getting signer address');
		return window['veworld-mock-output']['address'];
	},

	getSenderTxId() {
		console.log('[VeWorld-Mock] Getting sender txId');
		return window['veworld-mock-output']['txId'];
	},

	installMock() {
		console.log('[VeWorld-Mock] Installing mock');
		try {
			const install: VeWorld = {
				isVeWorld: true,
				newConnexSigner: () => mockConnexSigner,
			};
			window['vechain'] = install;
		} catch (e) {
			console.log(`[VeWorld-Mock] Error installing veworld-mock: ${e}`)
			throw e;
		}
	},

	setConfig(config: VeWorldMockConfig) {
		console.log('[VeWorld-Mock] Setting config');
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
		console.log('[VeWorld-Mock] Setting options');
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
		if (options.fakeCertSignerAddress !== undefined) {
			window['veworld-mock-options'].fakeCertSignerAddress = options.fakeCertSignerAddress;
		}
	},

	uninstallMock() {
		console.log('[VeWorld-Mock] Uninstalling mock');
		delete window['vechain'];
	},

	resetToDefault() {
		console.log('[VeWorld-Mock] Resetting to default');
		setupDefaults();
	}
};

setupDefaults();