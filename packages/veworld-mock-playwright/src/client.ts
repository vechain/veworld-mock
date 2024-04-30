import { Page } from '@playwright/test';
import { readFileSync } from 'fs';
import { VeWorldMockConfig, VeWorldMockOptions } from '@vechain/veworld-mock';
import { VeWorldMockClient } from './types';

export const veWorldMockClient: VeWorldMockClient = {
	getSignerAddress: async (page: Page) => {
		return await page.evaluate(() => {
			return window['veworld-mock-controller'].getSignerAddress();
		});
	},
	getSenderTxId: async (page: Page) => {
		return await page.evaluate(() => {
			return window['veworld-mock-controller'].getSenderTxId();
		});
	},
	setConfig: async (page: Page, config: VeWorldMockConfig) => {
		await page.evaluate((config) => {
			window['veworld-mock-controller'].setConfig(config);
		}, config);
	},
	setOptions: async (page: Page, options: VeWorldMockOptions) => {
		await page.evaluate((options) => {
			window['veworld-mock-controller'].setOptions(options);
		}, options);
	},
	installMock: async (page: Page) => {
		await page.evaluate(() => {
			window['veworld-mock-controller'].installMock();
		});
	},
	uninstallMock: async (page: Page) => {
		await page.evaluate(() => {
			window['veworld-mock-controller'].uninstallMock();
		});
	},
	load: async (page: Page) => {
		await page.addInitScript({
			content: readFileSync(require.resolve('@vechain/veworld-mock/dist/veworld-mock.js'), 'utf-8')
		});
	},
	resetToDefault: async (page: Page) => {
		await page.evaluate(() => {
			window['veworld-mock-controller'].resetToDefault();
		});
	}
};

