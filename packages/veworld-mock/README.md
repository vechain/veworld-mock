
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

VeWorld mock allows to develop e2e tests for dApps that interact with VeWorld browser wallet.  

## Implementation

dApp's and VeWorld browser wallet communicate through the `window` object to each other. Specifically
VeWorld makes functions available on the `window` object that a dApp can call. These functions
are for certificate signing and transaction signing and sending to vechain thor.

VeWorld Mock replaces those functions with its own implementation, meaning that VeWorld browser wallet
is not needed to be installed when running playwright tests, and the mock implementations of these
functions can be configured to suit the test scenario.

## Installation

Add the dependencies to your project

`yarn add --dev @vechain/veworld-mock`  
`yarn add --dev @vechain/veworld-mock-playwright`

## Configuration

VeWorld mock has the following configuration:

- `accountIndex` : The account index derived from the mnemonic
- `chainTag` : The chain tag of the thor instance used
- `mnemonicWords` : The mnemonic used to derived the account index
- `thorUrl` : Url of thorest api

By default VeWorld mock is configured to use a local Solo, with its default mnemonic and its first account

## Options

VeWorld mock has the following options:

### Transactions

* `mockTransaction`: specifies the type of transaction to create, values are {real, fake, reject}
  * `real` --> The mock will create a real transaction
  * `fake` --> The mock will return the configured fake transaction id
  * `reject` --> The mock will return an error similar to when the user clicks on Reject in VeWorld 
* `fakeTxId` --> The transaction id to use when using `fake`
* `gasMultiplier` : When using `real` or `fake` the gas % multiplier to use when estimating the transaction gas

The default values are: 

```
fakeCertSignerAddress: '0x0',
fakeTxId: '0x0',
mockTransaction: 'real',
mockCertificate: 'valid',
gasMultiplier: 0.2
```

(Note: To generate a reverted tx, a vet transfer clause of 10billion is added to the tx)

### Certificates

* `mockCertificate` : Specified how to mock the certificate signing, values are {valid, invalid}
  * `valid` --> Certificate will be signed correctly
  * `invalid` --> The certificate is signed correctly, but the `signer` is set to the fake address
* `fakeCertSignerAddress` --> When using `invalid` the fake signer address



## Outputs

VeWorld mock makes the following available:

- `address` : The address of the account index used
- `txId` : The last signed tx id

## Limitations

- Does not mock WalletConnect
- Does not mock Sync2
- Does not support sending real tx's that use dependant tx's or delegated gas fee

