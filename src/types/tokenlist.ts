export interface Token {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
    logoURI?: string;
}

export interface BebopToken {
    name: string
    ticker: string
    availability: Availability
    priceUsd: number
    cid: string
    displayDecimals: number
    colour: string
    permitDomain: number
    industry: string
    tokenType: string
    iconUrl: string
    minOrderSize: number
    chainInfo: ChainInfo[]
  }
  
  export interface Availability {
    isAvailable: boolean
    canBuy: boolean
    canSell: boolean
  }
  
  export interface ChainInfo {
    chainId: number
    contractAddress: string
    decimals: number
  }
  