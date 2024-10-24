# TACT Compilation Report
Contract: NftShop
BOC Size: 2451 bytes

# Types
Total Types: 17

## StateInit
TLB: `_ code:^cell data:^cell = StateInit`
Signature: `StateInit{code:^cell,data:^cell}`

## Context
TLB: `_ bounced:bool sender:address value:int257 raw:^slice = Context`
Signature: `Context{bounced:bool,sender:address,value:int257,raw:^slice}`

## SendParameters
TLB: `_ bounce:bool to:address value:int257 mode:int257 body:Maybe ^cell code:Maybe ^cell data:Maybe ^cell = SendParameters`
Signature: `SendParameters{bounce:bool,to:address,value:int257,mode:int257,body:Maybe ^cell,code:Maybe ^cell,data:Maybe ^cell}`

## Deploy
TLB: `deploy#946a98b6 queryId:uint64 = Deploy`
Signature: `Deploy{queryId:uint64}`

## DeployOk
TLB: `deploy_ok#aff90f57 queryId:uint64 = DeployOk`
Signature: `DeployOk{queryId:uint64}`

## FactoryDeploy
TLB: `factory_deploy#6d0ff13b queryId:uint64 cashback:address = FactoryDeploy`
Signature: `FactoryDeploy{queryId:uint64,cashback:address}`

## ChangeOwner
TLB: `change_owner#819dbe99 queryId:uint64 newOwner:address = ChangeOwner`
Signature: `ChangeOwner{queryId:uint64,newOwner:address}`

## ChangeOwnerOk
TLB: `change_owner_ok#327b2b4a queryId:uint64 newOwner:address = ChangeOwnerOk`
Signature: `ChangeOwnerOk{queryId:uint64,newOwner:address}`

## MintFromAllowedToMint
TLB: `mint_from_allowed_to_mint#05b907d9 to:address nftType:int257 nftItem:int257 = MintFromAllowedToMint`
Signature: `MintFromAllowedToMint{to:address,nftType:int257,nftItem:int257}`

## NftType
TLB: `_ data:^string prices:dict<int, int> = NftType`
Signature: `NftType{data:^string,prices:dict<int, int>}`

## SetNftAddress
TLB: `set_nft_address#fc74fb48 address:address = SetNftAddress`
Signature: `SetNftAddress{address:address}`

## SetPrices
TLB: `set_prices#7cfe3c8e prices:dict<int, ^NftType{data:^string,prices:dict<int, int>}> = SetPrices`
Signature: `SetPrices{prices:dict<int, ^NftType{data:^string,prices:dict<int, int>}>}`

## SetWorkStatus
TLB: `set_work_status#a4766332 status:bool = SetWorkStatus`
Signature: `SetWorkStatus{status:bool}`

## SetFeeCollector
TLB: `set_fee_collector#975d1d58 feeCollector:address = SetFeeCollector`
Signature: `SetFeeCollector{feeCollector:address}`

## Buy
TLB: `buy#d0170c90 nftType:int257 nftItem:int257 = Buy`
Signature: `Buy{nftType:int257,nftItem:int257}`

## ChangeNftCollectionOwner
TLB: `change_nft_collection_owner#1cea826e new_owner:address = ChangeNftCollectionOwner`
Signature: `ChangeNftCollectionOwner{new_owner:address}`

## SetAllowedMint
TLB: `set_allowed_mint#d0a2daa4 minter:address allowed:bool = SetAllowedMint`
Signature: `SetAllowedMint{minter:address,allowed:bool}`

# Get Methods
Total Get Methods: 2

## prices

## owner

# Error Codes
2: Stack underflow
3: Stack overflow
4: Integer overflow
5: Integer out of expected range
6: Invalid opcode
7: Type check error
8: Cell overflow
9: Cell underflow
10: Dictionary error
13: Out of gas error
32: Method ID not found
34: Action is invalid or not supported
37: Not enough TON
38: Not enough extra-currencies
128: Null reference exception
129: Invalid serialization prefix
130: Invalid incoming message
131: Constraints error
132: Access denied
133: Contract stopped
134: Invalid argument
135: Code of a contract was not found
136: Invalid address
137: Masterchain support is not enabled for this contract
4181: not working
22049: not allowed to mint
46093: value does not equal price to pay
49280: not owner

# Trait Inheritance Diagram

```mermaid
graph TD
NftShop
NftShop --> BaseTrait
NftShop --> Deployable
Deployable --> BaseTrait
NftShop --> OwnableTransferable
OwnableTransferable --> BaseTrait
OwnableTransferable --> Ownable
Ownable --> BaseTrait
NftShop --> Ownable
```

# Contract Dependency Diagram

```mermaid
graph TD
NftShop
```