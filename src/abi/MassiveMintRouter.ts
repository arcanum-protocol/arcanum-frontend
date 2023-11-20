export default [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "OwnableInvalidOwner", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "OwnableUnauthorizedAccount", "type": "error" }, { "inputs": [], "name": "ReentrancyGuardReentrantCall", "type": "error" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }], "name": "approveToken", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "poolAddress", "type": "address" }, { "internalType": "address", "name": "tokenFrom", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "minShareOut", "type": "uint256" }, { "components": [{ "internalType": "bytes", "name": "targetData", "type": "bytes" }, { "internalType": "address", "name": "target", "type": "address" }, { "internalType": "uint256", "name": "ethValue", "type": "uint256" }], "internalType": "struct MultipoolMassiveMintRouter.CallParams[]", "name": "params", "type": "tuple[]" }, { "internalType": "address[]", "name": "multipoolAddresses", "type": "address[]" }, { "internalType": "address", "name": "to", "type": "address" }], "name": "massiveMint", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "addr", "type": "address" }], "name": "toggleContract", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]