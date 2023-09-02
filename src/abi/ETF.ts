export default [
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "mpName",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "mpSymbol",
                "type": "string"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address",
                "indexed": true
            },
            {
                "internalType": "address",
                "name": "spender",
                "type": "address",
                "indexed": true
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256",
                "indexed": false
            }
        ],
        "type": "event",
        "name": "Approval",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "asset",
                "type": "address",
                "indexed": true
            },
            {
                "internalType": "uint256",
                "name": "price",
                "type": "uint256",
                "indexed": false
            }
        ],
        "type": "event",
        "name": "AssetPriceChange",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "asset",
                "type": "address",
                "indexed": true
            },
            {
                "internalType": "uint256",
                "name": "quantity",
                "type": "uint256",
                "indexed": false
            }
        ],
        "type": "event",
        "name": "AssetQuantityChange",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "asset",
                "type": "address",
                "indexed": true
            },
            {
                "internalType": "uint256",
                "name": "share",
                "type": "uint256",
                "indexed": false
            }
        ],
        "type": "event",
        "name": "AssetTargetShareChange",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256",
                "indexed": false
            }
        ],
        "type": "event",
        "name": "BaseBurnFeeChange",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256",
                "indexed": false
            }
        ],
        "type": "event",
        "name": "BaseMintFeeChange",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256",
                "indexed": false
            }
        ],
        "type": "event",
        "name": "BaseTradeFeeChange",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256",
                "indexed": false
            }
        ],
        "type": "event",
        "name": "DepegBaseFeeChange",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256",
                "indexed": false
            }
        ],
        "type": "event",
        "name": "DeviationLimitChange",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256",
                "indexed": false
            }
        ],
        "type": "event",
        "name": "HalfDeviationFeeChange",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "previousOwner",
                "type": "address",
                "indexed": true
            },
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address",
                "indexed": true
            }
        ],
        "type": "event",
        "name": "OwnershipTransferred",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "authority",
                "type": "address",
                "indexed": false
            }
        ],
        "type": "event",
        "name": "PriceAuthorityChange",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "authority",
                "type": "address",
                "indexed": false
            }
        ],
        "type": "event",
        "name": "TargetShareAuthorityChange",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "from",
                "type": "address",
                "indexed": true
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address",
                "indexed": true
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256",
                "indexed": false
            }
        ],
        "type": "event",
        "name": "Transfer",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "authority",
                "type": "address",
                "indexed": false
            }
        ],
        "type": "event",
        "name": "WithdrawAuthorityChange",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "asset",
                "type": "address",
                "indexed": true
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256",
                "indexed": false
            }
        ],
        "type": "event",
        "name": "WithdrawFees",
        "anonymous": false
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "DENOMINATOR",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "name": "allowance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "approve",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "name": "assets",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "quantity",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "collectedFees",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "collectedCashbacks",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "share",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "baseBurnFee",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "baseMintFee",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "baseTradeFee",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "assetAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "share",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "burn",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amountOut",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "refund",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "decimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "subtractedValue",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "decreaseAllowance",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "depegBaseFee",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "deviationLimit",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "assetAddress",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "name": "getAssets",
        "outputs": [
            {
                "internalType": "struct MpAsset",
                "name": "asset",
                "type": "tuple",
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "quantity",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "price",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "collectedFees",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "collectedCashbacks",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "share",
                        "type": "uint256"
                    }
                ]
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "assetAddress",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "name": "getBurnData",
        "outputs": [
            {
                "internalType": "struct MpContext",
                "name": "context",
                "type": "tuple",
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "usdCap",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalTargetShares",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "halfDeviationFee",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "deviationLimit",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "operationBaseFee",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "userCashbackBalance",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "depegBaseFee",
                        "type": "uint256"
                    }
                ]
            },
            {
                "internalType": "struct MpAsset",
                "name": "asset",
                "type": "tuple",
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "quantity",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "price",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "collectedFees",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "collectedCashbacks",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "share",
                        "type": "uint256"
                    }
                ]
            },
            {
                "internalType": "uint256",
                "name": "ts",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "action",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "name": "getContext",
        "outputs": [
            {
                "internalType": "struct MpContext",
                "name": "context",
                "type": "tuple",
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "usdCap",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalTargetShares",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "halfDeviationFee",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "deviationLimit",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "operationBaseFee",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "userCashbackBalance",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "depegBaseFee",
                        "type": "uint256"
                    }
                ]
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "assetAddress",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "name": "getMintData",
        "outputs": [
            {
                "internalType": "struct MpContext",
                "name": "context",
                "type": "tuple",
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "usdCap",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalTargetShares",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "halfDeviationFee",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "deviationLimit",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "operationBaseFee",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "userCashbackBalance",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "depegBaseFee",
                        "type": "uint256"
                    }
                ]
            },
            {
                "internalType": "struct MpAsset",
                "name": "asset",
                "type": "tuple",
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "quantity",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "price",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "collectedFees",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "collectedCashbacks",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "share",
                        "type": "uint256"
                    }
                ]
            },
            {
                "internalType": "uint256",
                "name": "ts",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "assetInAddress",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "assetOutAddress",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "name": "getTradeData",
        "outputs": [
            {
                "internalType": "struct MpContext",
                "name": "context",
                "type": "tuple",
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "usdCap",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalTargetShares",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "halfDeviationFee",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "deviationLimit",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "operationBaseFee",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "userCashbackBalance",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "depegBaseFee",
                        "type": "uint256"
                    }
                ]
            },
            {
                "internalType": "struct MpAsset",
                "name": "assetIn",
                "type": "tuple",
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "quantity",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "price",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "collectedFees",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "collectedCashbacks",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "share",
                        "type": "uint256"
                    }
                ]
            },
            {
                "internalType": "struct MpAsset",
                "name": "assetOut",
                "type": "tuple",
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "quantity",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "price",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "collectedFees",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "collectedCashbacks",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "share",
                        "type": "uint256"
                    }
                ]
            },
            {
                "internalType": "uint256",
                "name": "ts",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "struct MpAsset",
                "name": "asset",
                "type": "tuple",
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "quantity",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "price",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "collectedFees",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "collectedCashbacks",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "share",
                        "type": "uint256"
                    }
                ]
            },
            {
                "internalType": "address",
                "name": "assetAddress",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "name": "getTransferredAmount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "halfDeviationFee",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "addedValue",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "increaseAllowance",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "assetAddress",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "increaseCashback",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "assetAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "share",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "mint",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amountIn",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "refund",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "priceAuthority",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "renounceOwnership"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "newBaseBurnFee",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "setBaseBurnFee"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "newBaseMintFee",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "setBaseMintFee"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "newBaseTradeFee",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "setBaseTradeFee"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "newDepegBaseFee",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "setDepegBaseFee"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "newDeviationLimit",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "setDeviationLimit"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "newHalfDeviationFee",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "setHalfDeviationFee"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newPriceAuthority",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "setPriceAuthority"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newTargetShareAuthority",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "setTargetShareAuthority"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newWithdrawAuthority",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "setWithdrawAuthority"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "share",
                "type": "uint256"
            },
            {
                "internalType": "struct MpContext",
                "name": "context",
                "type": "tuple",
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "usdCap",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalTargetShares",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "halfDeviationFee",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "deviationLimit",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "operationBaseFee",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "userCashbackBalance",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "depegBaseFee",
                        "type": "uint256"
                    }
                ]
            },
            {
                "internalType": "struct MpAsset",
                "name": "asset",
                "type": "tuple",
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "quantity",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "price",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "collectedFees",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "collectedCashbacks",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "share",
                        "type": "uint256"
                    }
                ]
            },
            {
                "internalType": "uint256",
                "name": "mpTotalSupply",
                "type": "uint256"
            }
        ],
        "stateMutability": "pure",
        "type": "function",
        "name": "shareToAmount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "assetInAddress",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "assetOutAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "share",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "swap",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amountIn",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountOut",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "refundIn",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "refundOut",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "symbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "targetShareAuthority",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "totalSupply",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "totalTargetShares",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "transfer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "transferFrom",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "transferOwnership"
    },
    {
        "inputs": [
            {
                "internalType": "address[]",
                "name": "assetAddresses",
                "type": "address[]"
            },
            {
                "internalType": "uint256[]",
                "name": "prices",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "updatePrices"
    },
    {
        "inputs": [
            {
                "internalType": "address[]",
                "name": "assetAddresses",
                "type": "address[]"
            },
            {
                "internalType": "uint256[]",
                "name": "shares",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "updateTargetShares"
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "usdCap",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "withdrawAuthority",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "assetAddress",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "withdrawFees",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "fees",
                "type": "uint256"
            }
        ]
    }
];
