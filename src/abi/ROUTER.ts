export default [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "x",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "y",
                "type": "uint256"
            }
        ],
        "name": "PRBMath_MulDiv18_Overflow",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "x",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "y",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "denominator",
                "type": "uint256"
            }
        ],
        "name": "PRBMath_MulDiv_Overflow",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "PRBMath_SD59x18_Abs_MinSD59x18",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "PRBMath_SD59x18_Div_InputTooSmall",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "SD59x18",
                "name": "x",
                "type": "int256"
            },
            {
                "internalType": "SD59x18",
                "name": "y",
                "type": "int256"
            }
        ],
        "name": "PRBMath_SD59x18_Div_Overflow",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "PRBMath_SD59x18_Mul_InputTooSmall",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "SD59x18",
                "name": "x",
                "type": "int256"
            },
            {
                "internalType": "SD59x18",
                "name": "y",
                "type": "int256"
            }
        ],
        "name": "PRBMath_SD59x18_Mul_Overflow",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "SD59x18",
                "name": "x",
                "type": "int256"
            },
            {
                "internalType": "uint256",
                "name": "y",
                "type": "uint256"
            }
        ],
        "name": "PRBMath_SD59x18_Powu_Overflow",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "SD59x18",
                "name": "x",
                "type": "int256"
            }
        ],
        "name": "PRBMath_SD59x18_Sqrt_NegativeInput",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "SD59x18",
                "name": "x",
                "type": "int256"
            }
        ],
        "name": "PRBMath_SD59x18_Sqrt_Overflow",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "poolAddress",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "assetAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amountOut",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "sharesInMax",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            }
        ],
        "name": "burnWithAmountOut",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "shares",
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
        "inputs": [
            {
                "internalType": "address",
                "name": "poolAddress",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "assetAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "sharesIn",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountOutMin",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            }
        ],
        "name": "burnWithSharesIn",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amount",
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
        "inputs": [
            {
                "internalType": "address",
                "name": "poolAddress",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "assetAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "sharesIn",
                "type": "uint256"
            }
        ],
        "name": "estimateBurnAmountOut",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amountOut",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "assetPrice",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "sharePrice",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "cashbackOut",
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
                "name": "poolAddress",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "assetAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amountOut",
                "type": "uint256"
            }
        ],
        "name": "estimateBurnSharesIn",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "sharesIn",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "assetPrice",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "sharePrice",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "cashbackOut",
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
                "name": "poolAddress",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "assetAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "sharesOut",
                "type": "uint256"
            }
        ],
        "name": "estimateMintAmountIn",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amountIn",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "assetPrice",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "sharePrice",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "cashbackIn",
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
                "name": "poolAddress",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "assetAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amountIn",
                "type": "uint256"
            }
        ],
        "name": "estimateMintSharesOut",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "sharesOut",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "assetPrice",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "sharePrice",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "cashbackIn",
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
                "name": "poolAddress",
                "type": "address"
            },
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
                "name": "amountOut",
                "type": "uint256"
            }
        ],
        "name": "estimateSwapAmountIn",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "shares",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountIn",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "assetInPrice",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "assetOutPrice",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "cashbackIn",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "cashbackOut",
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
                "name": "poolAddress",
                "type": "address"
            },
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
                "name": "amountIn",
                "type": "uint256"
            }
        ],
        "name": "estimateSwapAmountOut",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "shares",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountOut",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "assetInPrice",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "assetOutPrice",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "cashbackIn",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "cashbackOut",
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
                "name": "poolAddress",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "assetAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amountIn",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "sharesOutMin",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            }
        ],
        "name": "mintWithAmountIn",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "shares",
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
        "inputs": [
            {
                "internalType": "address",
                "name": "poolAddress",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "assetAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "sharesOut",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountInMax",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            }
        ],
        "name": "mintWithSharesOut",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amount",
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
        "inputs": [
            {
                "internalType": "address",
                "name": "poolAddress",
                "type": "address"
            },
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
                "name": "amountIn",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountOutMin",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            }
        ],
        "name": "swapWithAmountIn",
        "outputs": [
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
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "poolAddress",
                "type": "address"
            },
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
                "name": "amountOut",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountInMax",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            }
        ],
        "name": "swapWithAmountOut",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amountIn",
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
    }
];
