export default [
	{
	  inputs: [],
	  stateMutability: "nonpayable",
	  type: "constructor",
	},
	{
	  inputs: [
		{
		  internalType: "uint256",
		  name: "x",
		  type: "uint256",
		},
		{
		  internalType: "uint256",
		  name: "y",
		  type: "uint256",
		},
	  ],
	  name: "PRBMath_MulDiv18_Overflow",
	  type: "error",
	},
	{
	  inputs: [
		{
		  internalType: "uint256",
		  name: "x",
		  type: "uint256",
		},
		{
		  internalType: "uint256",
		  name: "y",
		  type: "uint256",
		},
		{
		  internalType: "uint256",
		  name: "denominator",
		  type: "uint256",
		},
	  ],
	  name: "PRBMath_MulDiv_Overflow",
	  type: "error",
	},
	{
	  inputs: [],
	  name: "PRBMath_SD59x18_Abs_MinSD59x18",
	  type: "error",
	},
	{
	  inputs: [],
	  name: "PRBMath_SD59x18_Div_InputTooSmall",
	  type: "error",
	},
	{
	  inputs: [
		{
		  internalType: "SD59x18",
		  name: "x",
		  type: "int256",
		},
		{
		  internalType: "SD59x18",
		  name: "y",
		  type: "int256",
		},
	  ],
	  name: "PRBMath_SD59x18_Div_Overflow",
	  type: "error",
	},
	{
	  inputs: [],
	  name: "PRBMath_SD59x18_Mul_InputTooSmall",
	  type: "error",
	},
	{
	  inputs: [
		{
		  internalType: "SD59x18",
		  name: "x",
		  type: "int256",
		},
		{
		  internalType: "SD59x18",
		  name: "y",
		  type: "int256",
		},
	  ],
	  name: "PRBMath_SD59x18_Mul_Overflow",
	  type: "error",
	},
	{
	  inputs: [
		{
		  internalType: "SD59x18",
		  name: "x",
		  type: "int256",
		},
		{
		  internalType: "uint256",
		  name: "y",
		  type: "uint256",
		},
	  ],
	  name: "PRBMath_SD59x18_Powu_Overflow",
	  type: "error",
	},
	{
	  inputs: [
		{
		  internalType: "SD59x18",
		  name: "x",
		  type: "int256",
		},
	  ],
	  name: "PRBMath_SD59x18_Sqrt_NegativeInput",
	  type: "error",
	},
	{
	  inputs: [
		{
		  internalType: "SD59x18",
		  name: "x",
		  type: "int256",
		},
	  ],
	  name: "PRBMath_SD59x18_Sqrt_Overflow",
	  type: "error",
	},
	{
	  inputs: [
		{
		  internalType: "address",
		  name: "_pool",
		  type: "address",
		},
		{
		  internalType: "address",
		  name: "_asset",
		  type: "address",
		},
		{
		  internalType: "UD60x18",
		  name: "_amountOut",
		  type: "uint256",
		},
		{
		  internalType: "UD60x18",
		  name: "_sharesInMax",
		  type: "uint256",
		},
		{
		  internalType: "address",
		  name: "_to",
		  type: "address",
		},
		{
		  internalType: "uint256",
		  name: "deadline",
		  type: "uint256",
		},
	  ],
	  name: "burnWithAmountOut",
	  outputs: [],
	  stateMutability: "nonpayable",
	  type: "function",
	},
	{
	  inputs: [
		{
		  internalType: "address",
		  name: "_pool",
		  type: "address",
		},
		{
		  internalType: "address",
		  name: "_asset",
		  type: "address",
		},
		{
		  internalType: "UD60x18",
		  name: "_sharesIn",
		  type: "uint256",
		},
		{
		  internalType: "UD60x18",
		  name: "_amountOutMin",
		  type: "uint256",
		},
		{
		  internalType: "address",
		  name: "_to",
		  type: "address",
		},
		{
		  internalType: "uint256",
		  name: "deadline",
		  type: "uint256",
		},
	  ],
	  name: "burnWithSharesIn",
	  outputs: [],
	  stateMutability: "nonpayable",
	  type: "function",
	},
	{
	  inputs: [
		{
		  internalType: "address",
		  name: "_pool",
		  type: "address",
		},
		{
		  internalType: "address",
		  name: "_asset",
		  type: "address",
		},
		{
		  internalType: "UD60x18",
		  name: "_sharesIn",
		  type: "uint256",
		},
	  ],
	  name: "estimateBurnAmountOut",
	  outputs: [
		{
		  internalType: "UD60x18",
		  name: "_amountOut",
		  type: "uint256",
		},
	  ],
	  stateMutability: "view",
	  type: "function",
	},
	{
	  inputs: [
		{
		  internalType: "address",
		  name: "_pool",
		  type: "address",
		},
		{
		  internalType: "address",
		  name: "_asset",
		  type: "address",
		},
		{
		  internalType: "UD60x18",
		  name: "_amountOut",
		  type: "uint256",
		},
	  ],
	  name: "estimateBurnSharesIn",
	  outputs: [
		{
		  internalType: "UD60x18",
		  name: "_sharesIn",
		  type: "uint256",
		},
	  ],
	  stateMutability: "view",
	  type: "function",
	},
	{
	  inputs: [
		{
		  internalType: "address",
		  name: "_pool",
		  type: "address",
		},
		{
		  internalType: "address",
		  name: "_asset",
		  type: "address",
		},
		{
		  internalType: "UD60x18",
		  name: "_sharesOut",
		  type: "uint256",
		},
	  ],
	  name: "estimateMintAmountIn",
	  outputs: [
		{
		  internalType: "UD60x18",
		  name: "_amountIn",
		  type: "uint256",
		},
	  ],
	  stateMutability: "view",
	  type: "function",
	},
	{
	  inputs: [
		{
		  internalType: "address",
		  name: "_pool",
		  type: "address",
		},
		{
		  internalType: "address",
		  name: "_asset",
		  type: "address",
		},
		{
		  internalType: "UD60x18",
		  name: "_amountIn",
		  type: "uint256",
		},
	  ],
	  name: "estimateMintSharesOut",
	  outputs: [
		{
		  internalType: "UD60x18",
		  name: "sharesOut",
		  type: "uint256",
		},
	  ],
	  stateMutability: "view",
	  type: "function",
	},
	{
	  inputs: [
		{
		  internalType: "address",
		  name: "_pool",
		  type: "address",
		},
		{
		  internalType: "address",
		  name: "_assetIn",
		  type: "address",
		},
		{
		  internalType: "address",
		  name: "_assetOut",
		  type: "address",
		},
		{
		  internalType: "UD60x18",
		  name: "_amountIn",
		  type: "uint256",
		},
	  ],
	  name: "estimateSwapSharesByAmountIn",
	  outputs: [
		{
		  internalType: "UD60x18",
		  name: "shares",
		  type: "uint256",
		},
		{
		  internalType: "UD60x18",
		  name: "amountOut",
		  type: "uint256",
		},
	  ],
	  stateMutability: "view",
	  type: "function",
	},
	{
	  inputs: [
		{
		  internalType: "address",
		  name: "_pool",
		  type: "address",
		},
		{
		  internalType: "address",
		  name: "_assetOut",
		  type: "address",
		},
		{
		  internalType: "UD60x18",
		  name: "_amountOut",
		  type: "uint256",
		},
	  ],
	  name: "estimateSwapSharesByAmountOut",
	  outputs: [
		{
		  internalType: "UD60x18",
		  name: "shares",
		  type: "uint256",
		},
		{
		  internalType: "UD60x18",
		  name: "amountIn",
		  type: "uint256",
		},
	  ],
	  stateMutability: "view",
	  type: "function",
	},
	{
	  inputs: [
		{
		  internalType: "address",
		  name: "_pool",
		  type: "address",
		},
		{
		  internalType: "address",
		  name: "_asset",
		  type: "address",
		},
		{
		  internalType: "UD60x18",
		  name: "_amountIn",
		  type: "uint256",
		},
		{
		  internalType: "UD60x18",
		  name: "_sharesOutMin",
		  type: "uint256",
		},
		{
		  internalType: "address",
		  name: "_to",
		  type: "address",
		},
		{
		  internalType: "uint256",
		  name: "deadline",
		  type: "uint256",
		},
	  ],
	  name: "mintWithAmountIn",
	  outputs: [],
	  stateMutability: "nonpayable",
	  type: "function",
	},
	{
	  inputs: [
		{
		  internalType: "address",
		  name: "_pool",
		  type: "address",
		},
		{
		  internalType: "address",
		  name: "_asset",
		  type: "address",
		},
		{
		  internalType: "UD60x18",
		  name: "_sharesOut",
		  type: "uint256",
		},
		{
		  internalType: "uint256",
		  name: "_amountInMax",
		  type: "uint256",
		},
		{
		  internalType: "address",
		  name: "_to",
		  type: "address",
		},
		{
		  internalType: "uint256",
		  name: "deadline",
		  type: "uint256",
		},
	  ],
	  name: "mintWithSharesOut",
	  outputs: [],
	  stateMutability: "nonpayable",
	  type: "function",
	},
	{
	  inputs: [
		{
		  internalType: "address",
		  name: "_pool",
		  type: "address",
		},
		{
		  internalType: "address",
		  name: "_assetIn",
		  type: "address",
		},
		{
		  internalType: "address",
		  name: "_assetOut",
		  type: "address",
		},
		{
		  internalType: "UD60x18",
		  name: "_amountInMax",
		  type: "uint256",
		},
		{
		  internalType: "UD60x18",
		  name: "_amountOutMin",
		  type: "uint256",
		},
		{
		  internalType: "UD60x18",
		  name: "_shares",
		  type: "uint256",
		},
		{
		  internalType: "address",
		  name: "_to",
		  type: "address",
		},
		{
		  internalType: "uint256",
		  name: "deadline",
		  type: "uint256",
		},
	  ],
	  name: "swap",
	  outputs: [],
	  stateMutability: "nonpayable",
	  type: "function",
	},
	{
	  inputs: [
		{
		  internalType: "address",
		  name: "_pool",
		  type: "address",
		},
		{
		  internalType: "address",
		  name: "_assetIn",
		  type: "address",
		},
		{
		  internalType: "address",
		  name: "_assetOut",
		  type: "address",
		},
		{
		  internalType: "UD60x18",
		  name: "_amountIn",
		  type: "uint256",
		},
		{
		  internalType: "UD60x18",
		  name: "_amountOutMin",
		  type: "uint256",
		},
		{
		  internalType: "address",
		  name: "_to",
		  type: "address",
		},
		{
		  internalType: "uint256",
		  name: "deadline",
		  type: "uint256",
		},
	  ],
	  name: "swapWithAmountIn",
	  outputs: [],
	  stateMutability: "nonpayable",
	  type: "function",
	},
	{
	  inputs: [
		{
		  internalType: "address",
		  name: "_pool",
		  type: "address",
		},
		{
		  internalType: "address",
		  name: "_assetIn",
		  type: "address",
		},
		{
		  internalType: "address",
		  name: "_assetOut",
		  type: "address",
		},
		{
		  internalType: "UD60x18",
		  name: "_amountOut",
		  type: "uint256",
		},
		{
		  internalType: "UD60x18",
		  name: "_amountInMax",
		  type: "uint256",
		},
		{
		  internalType: "address",
		  name: "_to",
		  type: "address",
		},
		{
		  internalType: "uint256",
		  name: "deadline",
		  type: "uint256",
		},
	  ],
	  name: "swapWithAmountOut",
	  outputs: [],
	  stateMutability: "nonpayable",
	  type: "function",
	},
  ];