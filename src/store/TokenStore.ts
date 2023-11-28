// import { ExternalAsset, MultipoolAsset } from "@/types/multipoolAsset";
// import { runInAction, makeAutoObservable } from "mobx";
// import { publicClient } from "@/config";
// import multipoolABI from "../abi/ETF";
// import SCHEME from "../scheme.yaml";

// class TokenStore {
//     externalTokens: ExternalAsset[] = [];
//     multipoolTokens: MultipoolAsset[] = [];

//     private publicClient = publicClient({ chainId: 31337 });

//     constructor() {
//         makeAutoObservable(this);
//         this.fetchExternalTokens();
//         this.fetchMultipoolTokens();
//     }

//     async fetchExternalTokens() {
//         const res = await fetch("https://tokens.1inch.io/v1.2/31337");
//         const json = await res.json();

//         const tokens: ExternalAsset[] = [];
//         let i = 0;

//         for (const token of Object.keys(json)) {
//             tokens.push({
//                 name: json[token].name,
//                 symbol: json[token].symbol,
//                 decimals: json[token].decimals,
//                 logo: json[token].logoURI,
//                 address: token,
//                 type: "external"
//             });
//             i++;
//         }

//         runInAction(() => {
//             this.externalTokens = tokens;
//         });
//     }

//     async fetchMultipoolTokens() {
//         const multipool = SCHEME["arbi"];
//         const assets = multipool.assets;

//         // get all multipool assets from contract
//         console.log("fetching multipool assets", assets);

//         const tokens: MultipoolAsset[] = [];

//         const onchainResults = await this.publicClient.multicall({
//             contracts: assets.map((asset: any) => {
//                 return {
//                     address: multipool.address,
//                     abi: multipoolABI,
//                     functionName: "getAsset",
//                     args: [asset.address],
//                     chainId: multipool.chain_id,
//                     enabled: true
//                 };
//             }),
//         });

//         console.log("token", onchainResults);

//         tokens.push({
//             name: token.name,
//             symbol: token.symbol,
//             decimals: token.decimals,
//             logo: token.logo,
//             address: token.address,
//             type: "multipool",
//             multipoolAddress: multipool.address,
//             assetId: asset.id,
//             idealShare: asset.idealShare,
//             currentShare: asset.currentShare,
//             quantity: asset.quantity,
//             chainPrice: asset.chainPrice,
//             id: asset.id,
//             ticker: asset.ticker,
//             coingeckoId: asset.coingeckoId,
//             defilamaId: asset.defilamaId,
//             revenue: asset.revenue,
//             mcap: asset.mcap,
//             volume24h: asset.volume24h,
//             priceChange24h: asset.priceChange24h,
//             deviationPercent: asset.deviationPercent
//         });
//     }

//     addToken(token: ExternalAsset) {
//         this.externalTokens = [...this.externalTokens, token];
//     }
// }

// export const tokenStore = new TokenStore();
