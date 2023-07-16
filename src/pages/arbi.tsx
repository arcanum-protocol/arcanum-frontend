import { IndexAssetsBreakdown } from "../components/index-breakdown";
import * as React from 'react';
import { TVChartContainer } from "../components/tv-chart";

export function Arbi() {
    return (
        <div style={{ marginTop: "40px" }}>
            <div style={{
                marginTop: "40px",
                margin: "0px auto",
                width: "100%",
                display: "flex",
                justifyContent: "space-around",
                gap: "5px",
            }}>
                <div style={{ display: "flex" }}>
                    <p>How do we calculate the index</p>
                </div>
                <div style={{ display: "flex", justifySelf: "flex-end" }}>
                    <TVChartContainer symbol={'ARBI'} />
                </div>
            </div>
            <IndexAssetsBreakdown />
        </div>
    );
}
