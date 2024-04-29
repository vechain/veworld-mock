import { Page } from "@playwright/test";
import { VeWorldMockConfig, VeWorldMockOptions } from "@vechain/veworld-mock";


export type VeWorldMockClient = {
	getSignerAddress(page: Page): Promise<string>;
	getSenderTxId(page: Page): Promise<string>;
	setConfig(page: Page, config: VeWorldMockConfig): Promise<void>;
	setOptions(page: Page, options: VeWorldMockOptions): Promise<void>;
	installMock(page: Page): Promise<void>;
	uninstallMock(page: Page): Promise<void>;
	load(page: Page): Promise<void>;
};