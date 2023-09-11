import { EstimatedValues } from "./estimatedValues"
import { SendTransactionParams } from "./sendTransactionParams"
import { EstimationTransactionBody } from "./estimationTransactionBody"

type TradeLogicAdapter = {
    genEstimationTxnBody: (
        params: SendTransactionParams,
    ) => EstimationTransactionBody | undefined,
    parseEstimationResult: (v: any, params: SendTransactionParams) => EstimatedValues | undefined,
}

export { TradeLogicAdapter }