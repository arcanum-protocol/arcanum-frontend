import { IndexAssetsBreakdown } from "./index-breakdown";
import * as React from 'react';
import { TVChartContainer } from "./tv-chart";

export function Arbi() {
    return (
        <div style={{ marginTop: "40px" }}>
            <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-around", gap: "5px" }}>
                <p>Something here</p>
                <TVChartContainer symbol={'ARBI'} />
            </div>
            <IndexAssetsBreakdown />
        </div>
    );
}
