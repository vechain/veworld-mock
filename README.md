
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

TODO

## Configuration

VeWorld mock has the following configuration:

- `accountIndex` : The account index derived from the mnemonic
- `chainTag` : The chain tag of the thor instance used
- `mnemonicWords` : The mnemonic used to derived the account index
- `thorUrl` : Url of thorest api

By default VeWorld mock is configured to use a local Solo, with its default mnemonic and its first account

## Options

VeWorld mock has the following options:

- `validCertificate` : If set to `false` then an invalid certificate will be returned
- `realTx` : If set to `true` the mock will send the tx to vechain thor
- `fakeTxId` :  The tx id for the mock to return if `realTx` is `false`
- `gasMultiplier` : When sending tx's to vechain thor, the gas % multiplier to use

## Outputs

VeWorld mock makes the following available:

- `address` : The address of the account index used
- `txId` : The last signed tx id

## Limitations

- Does not mock WalletConnect
- Does not mock Sync2
- Does not support sending real tx's that use dependant tx's or delegated gas fee

## Playwright

TODO

## Cypress

TODO






