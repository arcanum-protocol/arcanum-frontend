export default [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "InsufficientAmount", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "asset", "type": "address" }], "name": "InvalidAsset", "type": "error" }, { "inputs": [], "name": "IsPaused", "type": "error" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "previousAdmin", "type": "address" }, { "indexed": false, "internalType": "address", "name": "newAdmin", "type": "address" }], "name": "AdminChanged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "beacon", "type": "address" }], "name": "BeaconUpgraded", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "multipool", "type": "address" }, { "indexed": false, "internalType": "address[]", "name": "assets", "type": "address[]" }, { "indexed": false, "internalType": "uint256[]", "name": "values", "type": "uint256[]" }], "name": "CashbackPayed", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint8", "name": "version", "type": "uint8" }], "name": "Initialized", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "implementation", "type": "address" }], "name": "Upgraded", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "multipool", "type": "address" }], "name": "addBalance", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "distributorAddress", "type": "address" }], "name": "getDistrubutor", "outputs": [{ "components": [{ "internalType": "uint256", "name": "cashbackPerSec", "type": "uint256" }, { "internalType": "uint256", "name": "cashbackLimit", "type": "uint256" }, { "internalType": "uint256", "name": "cashbackBalance", "type": "uint256" }], "internalType": "struct CashbackDistributor", "name": "distributor", "type": "tuple" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "distributorAddress", "type": "address" }, { "internalType": "address", "name": "token", "type": "address" }], "name": "getLastUpdated", "outputs": [{ "internalType": "uint256", "name": "lastUpdatedTime", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "initialize", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "isPaused", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "multipool", "type": "address" }, { "internalType": "address[]", "name": "assets", "type": "address[]" }], "name": "payCashback", "outputs": [{ "internalType": "uint256[]", "name": "values", "type": "uint256[]" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "proxiableUUID", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "multipool", "type": "address" }, { "internalType": "uint256", "name": "newCashbackPerSec", "type": "uint256" }, { "internalType": "uint256", "name": "newCashbackLimit", "type": "uint256" }, { "internalType": "int256", "name": "cashbackBalanceChange", "type": "int256" }], "name": "updateDistributionParams", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newImplementation", "type": "address" }], "name": "upgradeTo", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newImplementation", "type": "address" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "upgradeToAndCall", "outputs": [], "stateMutability": "payable", "type": "function" }] as const;
