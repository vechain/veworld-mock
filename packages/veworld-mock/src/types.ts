export interface VeWorldMockConfig {
	accountIndex?: number;
	chainTag?: number;
	mnemonicWords?: string[];
	thorUrl?: string;
};

export interface VeWorldMockOutput {
	address: string;
	txId: string;
};

export type VeWorldMockController = {
	getSignerAddress(): string;
	getSenderTxId(): string;
	setConfig(config: VeWorldMockConfig): void;
    setOptions(options: VeWorldMockOptions): void;
    installMock(): void;
    uninstallMock(): void;
};

export type VeWorldMockOptions = {
    validCertificate?: boolean;
    realTx?: boolean;
    fakeTxId?: string;
    gasMultiplier?: number;
};

export type VeWorld = {
    isVeWorld: boolean;
    newConnexSigner(): any;
};

declare global {
	interface Window {
		'veworld-mock-config': VeWorldMockConfig ;
		'veworld-mock-controller': VeWorldMockController;
		'veworld-mock-output': VeWorldMockOutput;
        'veworld-mock-options': VeWorldMockOptions;
        'veworld': VeWorld;
	}
};