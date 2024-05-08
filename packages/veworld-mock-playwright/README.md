
```
██╗   ██╗███████╗██╗    ██╗ ██████╗ ██████╗ ██╗     ██████╗ 
██║   ██║██╔════╝██║    ██║██╔═══██╗██╔══██╗██║     ██╔══██╗
██║   ██║█████╗  ██║ █╗ ██║██║   ██║██████╔╝██║     ██║  ██║
╚██╗ ██╔╝██╔══╝  ██║███╗██║██║   ██║██╔══██╗██║     ██║  ██║
 ╚████╔╝ ███████╗╚███╔███╔╝╚██████╔╝██║  ██║███████╗██████╔╝
  ╚═══╝  ╚══════╝ ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═════╝ 
███╗   ███╗ ██████╗  ██████╗██╗  ██╗                        
████╗ ████║██╔═══██╗██╔════╝██║ ██╔╝                        
██╔████╔██║██║   ██║██║     █████╔╝                         
██║╚██╔╝██║██║   ██║██║     ██╔═██╗                         
██║ ╚═╝ ██║╚██████╔╝╚██████╗██║  ██╗                        
╚═╝     ╚═╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝                                                                                        
 ```                            

## Playwright E2E

Playwright runs as a node process, whereas the VeWorld mock run inside the browser 
Two operations are needed: `load`, which loads the VeWorld mock js file into the browser, and `installMock` which sets up the mock functions on the window object. 

This will need to be done before each test with a beforeEach block:

```
  test.beforeEach(async ({ page }) => {
    await veWorldMockClient.load(page);
    await page.goto('http://localhost:5003');
    await veWorldMockClient.installMock(page);
  });
```

To configure the mock within a test:

```
import { veWorldMockClient } from '@vechain/veworld-mock-playwright'

test('Configure mock', async ({ page }) => { 
  veWorldMockClient.setOptions(page, {validCertificate: false, fakeCertSignerAddress: "0x865306084235Bf804c8Bba8a8d56890940ca8F0b"});
})
```

To read outputs of the mock:

```
import { veWorldMockClient } from '@vechain/veworld-mock-playwright'

test('get outputs of mock', async ({ page }) => { 
  // do  steps for cert signing...
  const address = await veWorldMockClient.getSignerAddress(page);
  // do steps for a tx ...
  const txId = await veWorldMockClient.getSenderTxId(page)
})
```

## Sample App and Tests

To build the test app, veworld mock and vework mock client:

`yarn install`  
`yarn build`

The sample app uses Solo, to launch solo:

`make solo-up`

To launch the sample app (seperte terminal):

`yarn dev`

the test app is available at: http://localhost:5003/

To run the playwright tests:

`yarn install-browsers`  
`yarn test`












