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
	resetToDefault(): void;
};

export type MockTransactionType = 'real' | 'fake' | 'revert' | 'reject';
export type MockCertificateType = 'valid' | 'invalid';

export type VeWorldMockOptions = {
	mockTransaction?: MockTransactionType;
	mockCertificate?: MockCertificateType;
	fakeTxId?: string;
	fakeCertSignerAddress?: string;
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