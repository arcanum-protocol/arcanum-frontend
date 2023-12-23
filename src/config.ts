import { createConfig } from "wagmi";
import { getDefaultConfig } from "connectkit";
import { arbitrum } from 'wagmi/chains';
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import {
    createClient,
    http,
    formatTransactionRequest,
    type CallParameters
} from 'viem'


export const publicClient = createClient({
    chain: arbitrum,
    transport: http(),
}).extend(client => ({
    async traceCall(args: CallParameters) {
        return client.request({
            method: 'debug_traceCall',
            params: [formatTransactionRequest(args), 'latest', {}]
        })
    },
}))


export const config = createConfig(
    getDefaultConfig({
        publicClient,
        alchemyId: "MERXmvJOqhiBs4LYV_rOFMueneDC3Sq_",
        walletConnectProjectId: "1d63d7e43fd1d5ea177bdb4a8939ade4",

        chains: [arbitrum],

        // Required
        appName: "ARCANUM",

        // Optional
        appDescription:
            "Decentralized asset management protocol that allows to create complicated asset management portfolio and manage them in a DeFi manner.",
        appUrl: "https://arcanum.to",
        appIcon: "https://arcanum.to/logo.png",
    }),
);

export const alchemyClient = createAlchemyWeb3("https://arb-mainnet.g.alchemy.com/v2/MERXmvJOqhiBs4LYV_rOFMueneDC3Sq_").alchemy;
