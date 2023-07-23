export default [
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_name",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_symbol",
                "type": "string"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "asset",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "percent",
                "type": "uint256"
            }
        ],
        "name": "AssetPercentsChange",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "asset",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
            }
        ],
        "name": "AssetPriceChange",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "asset",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "quantity",
                "type": "uint256"
            }
        ],
        "name": "AssetQuantityChange",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "BaseBurnFeeChange",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "BaseMintFeeChange",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "BaseTradeFeeChange",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "DeviationPercentLimitChange",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "HalfDeviationFeeRatioChange",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "percentsSource",
                "type": "address"
            }
        ],
        "name": "PercentsSourceChange",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "priceSource",
                "type": "address"
            }
        ],
        "name": "PriceSourceChange",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "asset",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "WithdrawCollectedFees",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "DENOMINATOR",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
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
        "name": "allowance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
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
        "name": "approve",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
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
                "name": "percent",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "baseBurnFee",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "baseMintFee",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "baseTradeFee",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_asset",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_share",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "_to",
                "type": "address"
            }
        ],
        "name": "burn",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "_amountOut",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "refund",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
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
        "name": "decreaseAllowance",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "deviationPercentLimit",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "feeReceiver",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_asset",
                "type": "address"
            }
        ],
        "name": "getAssets",
        "outputs": [
            {
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
                        "name": "percent",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct MpAsset",
                "name": "asset",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getBurnContext",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "totalCurrentUsdAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalAssetPercents",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "halfDeviationFeeRatio",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "deviationPercentLimit",
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
                    }
                ],
                "internalType": "struct MpContext",
                "name": "context",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "baseFee",
                "type": "uint256"
            }
        ],
        "name": "getContext",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "totalCurrentUsdAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalAssetPercents",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "halfDeviationFeeRatio",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "deviationPercentLimit",
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
                    }
                ],
                "internalType": "struct MpContext",
                "name": "context",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getMintContext",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "totalCurrentUsdAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalAssetPercents",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "halfDeviationFeeRatio",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "deviationPercentLimit",
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
                    }
                ],
                "internalType": "struct MpContext",
                "name": "context",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getTradeContext",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "totalCurrentUsdAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalAssetPercents",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "halfDeviationFeeRatio",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "deviationPercentLimit",
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
                    }
                ],
                "internalType": "struct MpContext",
                "name": "context",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
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
                        "name": "percent",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct MpAsset",
                "name": "assetIn",
                "type": "tuple"
            },
            {
                "internalType": "address",
                "name": "_assetIn",
                "type": "address"
            }
        ],
        "name": "getTransferredAmount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "halfDeviationFeeRatio",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
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
        "name": "increaseAllowance",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_asset",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_share",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "_to",
                "type": "address"
            }
        ],
        "name": "mint",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "_amountIn",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "refund",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "percentsSource",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "priceSource",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_baseBurnFee",
                "type": "uint256"
            }
        ],
        "name": "setBaseBurnFee",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_baseMintFee",
                "type": "uint256"
            }
        ],
        "name": "setBaseMintFee",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_baseTradeFee",
                "type": "uint256"
            }
        ],
        "name": "setBaseTradeFee",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_deviationPercentLimit",
                "type": "uint256"
            }
        ],
        "name": "setDeviationPercentLimit",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_halfDeviationFeeRatio",
                "type": "uint256"
            }
        ],
        "name": "setHalfDeviationFeeRatio",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_percentsSource",
                "type": "address"
            }
        ],
        "name": "setPercentsSource",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_priceSource",
                "type": "address"
            }
        ],
        "name": "setPriceSource",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_share",
                "type": "uint256"
            },
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "totalCurrentUsdAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalAssetPercents",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "halfDeviationFeeRatio",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "deviationPercentLimit",
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
                    }
                ],
                "internalType": "struct MpContext",
                "name": "context",
                "type": "tuple"
            },
            {
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
                        "name": "percent",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct MpAsset",
                "name": "asset",
                "type": "tuple"
            },
            {
                "internalType": "uint256",
                "name": "virtualShare",
                "type": "uint256"
            }
        ],
        "name": "shareToAmount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_assetIn",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_assetOut",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_share",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "_to",
                "type": "address"
            }
        ],
        "name": "swap",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "_amountIn",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_amountOut",
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
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalAssetPercents",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalCurrentUsdAmount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
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
        "name": "transfer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
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
        "name": "transferFrom",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_asset",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_percent",
                "type": "uint256"
            }
        ],
        "name": "updateAssetPercents",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_asset",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_price",
                "type": "uint256"
            }
        ],
        "name": "updatePrice",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_assetAddress",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_to",
                "type": "address"
            }
        ],
        "name": "withdrawCollectedFees",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]
