import { IndexAssetsBreakdown } from "./index-breakdown";
import * as React from 'react';
import { TVChartContainer } from "./tv-chart";

export function Arbi() {
    return (
        <>
            <TVChartContainer symbol={'ARBI'} />
            <IndexAssetsBreakdown />
        </>
    );
}
