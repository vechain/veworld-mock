
```
 __   __ __      __       _    _ 
 \ \ / /_\ \    / /__ _ _| |__| |
  \ V / -_) \/\/ / _ \ '_| / _` |
  _\_/\___|\_/\_/\___/_| |_\__,_|
 |  \/  |___  __| |__            
 | |\/| / _ \/ _| / /            
 |_|  |_\___/\__|_\_\            
 ```                            

# VeWorld Mock for E2E Testing

VeWorld mock allows to develop playwright & Cypress tests for dApps that interact with VeWorld browser wallet.  

## Implementation

dApp's and VeWorld browser wallet communicate through the `window` object to each other. Specifically
VeWorld makes functions available on the `window` object that a dApp can call. These functions
are for certificate signing and transaction signing and sending to vechain thor.

VeWorld Mock replaces those functions with its own implementation, meaning that VeWorld browser wallet
is not needed to be installed when running playwright tests, and the mock implementations of these
functions can be configured to suit the test scenario, through a mock client.

## Installation



## Configuration


## Feature Options


## Limitations

- Does not mock WalletConnect
- Does not mock Sync2





