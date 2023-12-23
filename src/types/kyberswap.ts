export interface KyberswapResponce {
    code: number
    message: string
    data: Data
    requestId: string
}

export interface Data {
    routeSummary: RouteSummary
    routerAddress: string
}

export interface RouteSummary {
    tokenIn: string
    amountIn: string
    amountInUsd: string
    tokenInMarketPriceAvailable: boolean
    tokenOut: string
    amountOut: string
    amountOutUsd: string
    tokenOutMarketPriceAvailable: boolean
    gas: string
    gasPrice: string
    gasUsd: string
    extraFee: ExtraFee
    route: Route[][]
    extra: Extra2
}

export interface ExtraFee {
    feeAmount: string
    chargeFeeBy: string
    isInBps: boolean
    feeReceiver: string
}

export interface Route {
    pool: string
    tokenIn: string
    tokenOut: string
    limitReturnAmount: string
    swapAmount: string
    amountOut: string
    exchange: string
    poolLength: number
    poolType: string
    poolExtra?: PoolExtra
    extra: Extra
}

export interface PoolExtra {
    limitPoint: number
}

export interface Extra { }

export interface Extra2 {
    chunksInfo: any[]
}

export interface BuildResponce {
    code: number
    message: string
    data: Data
    requestId: string
  }
  
  export interface Data {
    amountIn: string
    amountInUsd: string
    amountOut: string
    amountOutUsd: string
    gas: string
    gasUsd: string
    outputChange: OutputChange
    data: string
    routerAddress: string
  }
  
  export interface OutputChange {
    amount: string
    percent: number
    level: number
  }
