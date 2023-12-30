export default [
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "renounceOwnership",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "swap",
    "inputs": [
      {
        "name": "poolAddress",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "swapArgs",
        "type": "tuple",
        "internalType": "struct MultipoolRouter.SwapArgs",
        "components": [
          {
            "name": "forcePushArgs",
            "type": "tuple",
            "internalType": "struct ForcePushArgs",
            "components": [
              {
                "name": "contractAddress",
                "type": "address",
                "internalType": "address"
              },
              {
                "name": "timestamp",
                "type": "uint128",
                "internalType": "uint128"
              },
              {
                "name": "sharePrice",
                "type": "uint128",
                "internalType": "uint128"
              },
              {
                "name": "signatures",
                "type": "bytes[]",
                "internalType": "bytes[]"
              }
            ]
          },
          {
            "name": "assetsToSwap",
            "type": "tuple[]",
            "internalType": "struct AssetArgs[]",
            "components": [
              {
                "name": "assetAddress",
                "type": "address",
                "internalType": "address"
              },
              {
                "name": "amount",
                "type": "int256",
                "internalType": "int256"
              }
            ]
          },
          {
            "name": "isExactInput",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "receiverAddress",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "refundEthToReceiver",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "refundAddress",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "ethValue",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      },
      {
        "name": "paramsBefore",
        "type": "tuple[]",
        "internalType": "struct MultipoolRouter.Call[]",
        "components": [
          {
            "name": "callType",
            "type": "uint8",
            "internalType": "enum MultipoolRouter.CallType"
          },
          {
            "name": "data",
            "type": "bytes",
            "internalType": "bytes"
          }
        ]
      },
      {
        "name": "paramsAfter",
        "type": "tuple[]",
        "internalType": "struct MultipoolRouter.Call[]",
        "components": [
          {
            "name": "callType",
            "type": "uint8",
            "internalType": "enum MultipoolRouter.CallType"
          },
          {
            "name": "data",
            "type": "bytes",
            "internalType": "bytes"
          }
        ]
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "toggleContract",
    "inputs": [
      {
        "name": "contractAddress",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transferOwnership",
    "inputs": [
      {
        "name": "newOwner",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "OwnershipTransferred",
    "inputs": [
      {
        "name": "previousOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "newOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "CallFailed",
    "inputs": [
      {
        "name": "callNumber",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "isPredecessing",
        "type": "bool",
        "internalType": "bool"
      }
    ]
  },
  {
    "type": "error",
    "name": "ContractCallNotAllowed",
    "inputs": [
      {
        "name": "target",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "InsufficientEthBalance",
    "inputs": [
      {
        "name": "callNumber",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "isPredecessing",
        "type": "bool",
        "internalType": "bool"
      }
    ]
  },
  {
    "type": "error",
    "name": "InsufficientEthBalanceCallingSwap",
    "inputs": []
  }
] as const;
