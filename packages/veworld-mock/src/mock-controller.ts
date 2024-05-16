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
		fakeCertSignerAddress: '0x0',
		fakeTxId: '0x0',
		mockTransaction: 'real',
		mockCertificate: 'valid',
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
		return window['veworld-mock-output'].address;
	},

	getSenderTxId() {
		console.log('[VeWorld-Mock] Getting sender txId');
		return window['veworld-mock-output'].txId;
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
		const currentConfig = window['veworld-mock-config'];
		const mergedConfig = Object.assign(currentConfig, config)
		window['veworld-mock-config'] = mergedConfig;
	},

	setOptions(options: VeWorldMockOptions) {
		console.log('[VeWorld-Mock] Setting options');
		const currentOptions = window['veworld-mock-options'];
		const mergedOptions = Object.assign(currentOptions, options);
		window['veworld-mock-options'] = mergedOptions;
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