import BigNumber from "bignumber.js";
import { Address, decodeAbiParameters } from "viem";
import { getContract } from "viem";
import { publicClient } from "@/config";
import UniswapV3 from '../abi/UniswapV3';
import {
    Pool,
    Route,
    SwapOptions,
    SwapQuoter,
    SwapRouter,
    Trade
} from '@uniswap/v3-sdk';
import { CurrencyAmount, Percent, TradeType } from '@uniswap/sdk-core';
import { Token } from '@uniswap/sdk-core';
import ERC20 from "@/abi/ERC20";

const _publicClient = publicClient({ chainId: 42161 });

const poolsAddress = [
    "0x2f5e87c9312fa29aed5c179e456625d79015299c",
    "0xc6f780497a95e246eb9449f5e4770916dcd6396a",
    "0xa961f0473da4864c5ed28e00fcc53a3aab056c1b",
    "0xc31e54c7a869b9fcbecc14363cf510d1c41fa443",
    "0x641c00a822e8b671738d32a431a4fb6074e5c79d",
    "0xc6962004f452be9203591991d15f6b388e09e8d0",
    "0x59d72ddb29da32847a4665d08ffc8464a7185fae",
    "0x80a9ae39310abf666a87c743d6ebbd0e8c42158e",
    "0x446bf9748b4ea044dd759d9b9311c70491df8f29",
    "0xd3e11119d2680c963f1cdcffece0c4ade823fb58",
    "0x4d834a9b910e6392460ebcfb59f8eef27d5c19ff",
    "0xdbaeb7f0dfe3a0aafd798ccecb5b22e708f7852c"];

async function getAllPools() {
    const pools: Array<Pool> = [];

    for (const poolAddress of poolsAddress) {
        const poolContract = getContract({
            address: poolAddress as Address,
            abi: UniswapV3,
            publicClient: _publicClient
        });

        const [token0, token1, fee, liquidity, slot0] = await Promise.all([
            poolContract.read.token0(),
            poolContract.read.token1(),
            poolContract.read.fee(),
            poolContract.read.liquidity(),
            poolContract.read.slot0(),
        ]);

        const token0Contract = getContract({
            address: token0 as Address,
            abi: ERC20,
            publicClient: _publicClient
        });

        const token1Contract = getContract({
            address: token1 as Address,
            abi: ERC20,
            publicClient: _publicClient
        });

        const token0Asset: Token = new Token(42161, token0, await token0Contract.read.decimals());
        const token1Asset: Token = new Token(42161, token1, await token1Contract.read.decimals());

        const _pool = {
            token0: token0Asset,
            token1: token1Asset,
            fee: fee,
            liquidity: liquidity.toString(),
            sqrtPriceX96: slot0[0].toString(),
            tick: slot0[1],
        };

        const pool = new Pool(
            _pool.token0,
            _pool.token1,
            _pool.fee,
            _pool.sqrtPriceX96,
            _pool.liquidity,
            _pool.tick
        );

        pools.push(pool);
    }

    return pools;
}

function createRoute(pools: Array<Pool>, inputToken: Token, outputToken: Token) {
    // pools contains all the pools also those that are not used in the route
    // so we need to filter them
    const poolsUsed = pools.filter(pool => {
        return (
            pool.token0.equals(inputToken) ||
            pool.token1.equals(inputToken) ||
            pool.token0.equals(outputToken) ||
            pool.token1.equals(outputToken)
        );
    });
    const route = new Route(poolsUsed, inputToken, outputToken);

    return route;
}

async function getAmountOut(route: Route<Token, Token>, amountIn: BigNumber) {
    const { calldata } = SwapQuoter.quoteCallParameters(
        route,
        CurrencyAmount.fromRawAmount(
            route.input,
            amountIn.toFixed(0)
        ),
        TradeType.EXACT_INPUT
    );

    const { data } = await _publicClient.call({
        to: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
        data: calldata as Address,
    })

    const [outValue] = decodeAbiParameters([{ name: 'amountOut', type: 'uint256' }], data!);

    return new BigNumber(outValue.toString());
}

function createTrade(route: Route<Token, Token>, amountIn: BigNumber, amountOut: BigNumber) {
    const uncheckedTrade = Trade.createUncheckedTrade({
        route: route,
        inputAmount: CurrencyAmount.fromRawAmount(
            route.input,
            amountIn.toFixed(0)
        ),
        outputAmount: CurrencyAmount.fromRawAmount(
            route.output,
            amountOut.toFixed(0)
        ),
        tradeType: TradeType.EXACT_OUTPUT,
    })

    return uncheckedTrade
}

async function Create(shares: Map<Address, BigNumber>, inputAsset: Address, amountIn: BigNumber, multipoolAddress: Address) {
    if (amountIn == undefined) {
        throw new Error("AmountIn is undefined");
    }
    const pools = await getAllPools();

    const addresses = Array.from([...shares.keys(), inputAsset]);

    const _decimals = await _publicClient.multicall({
        contracts: addresses.map((address) => {
            return {
                address: address as Address,
                abi: ERC20,
                functionName: "decimals",
            }
        })
    });

    if (_decimals.length !== addresses.length) {
        throw new Error("Decimals length not equal addresses length");
    }

    const decimals: Map<Address, number> = new Map();
    for (const [index, address] of addresses.entries()) {
        const decimal = _decimals[index].result;
        if (decimal == undefined) {
            throw new Error("Decimals is not a number");
        }
        decimals.set(address, decimal);
    }

    const inputDecimals = decimals.get(inputAsset);
    if (!inputDecimals) {
        throw new Error("Decimals not found");
    }
    const inputToken = new Token(42161, inputAsset, inputDecimals);

    const callDatas: Array<{
        data: string;
        to: string;
        value: string;
        asset: Address;
        amountOut: BigNumber;
    }> = [];
    const outs: Map<Address, BigNumber> = new Map();

    for (const [address, amount] of shares.entries()) {
        const outDecimal = decimals.get(address);
        if (!outDecimal) {
            throw new Error("Decimals not found");
        }
        const outputToken = new Token(42161, address as Address, outDecimal);

        const swapRoute = createRoute(pools, inputToken, outputToken);

        const amountInShare = amountIn.multipliedBy(amount).dividedBy(100);
        const amountOut = await getAmountOut(swapRoute, amountInShare.multipliedBy(0.995));
        const trade = createTrade(swapRoute, amountInShare, amountOut);

        outs.set(address, amountOut);

        const options: SwapOptions = {
            slippageTolerance: new Percent(50, 10_000), // 50 bips, or 0.50%
            deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
            recipient: multipoolAddress,
        }

        const methodParameters = SwapRouter.swapCallParameters([trade], options);
        
        const tx = {
            data: methodParameters.calldata,
            to: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
            value: methodParameters.value,
            asset: address,
            amountOut: amountOut,
        };

        callDatas.push(tx);
    }

    return {
        calldata: callDatas,
        selectedAssets: outs,
    }
}

export { Create }
