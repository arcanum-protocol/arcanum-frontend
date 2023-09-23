import * as React from 'react';
import { FixedNumber } from "ethers";
import { useState, useEffect } from "react";
import { SendTransactionParams } from "./trade-pane";

import { useTradeContext } from '../contexts/TradeContext';

export function Tooltip({ children }) {
    return <div
        className="tooltip-main"
    >
        <div
            className="tooltip-hint"
        >
            {React.Children.toArray(children)[1]}
        </div>
        <div
            className="tooltip-content"
        >
            {React.Children.toArray(children)[0]}
        </div >
    </div>;
}
