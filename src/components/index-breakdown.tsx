import { BigNumber } from "bignumber.js";
import type { MultipoolAsset } from '../types/multipoolAsset';
import { toHumanReadable } from "../lib/format-number";
import { Tooltip } from './tooltip';

export function IndexAssetsBreakdown({ fetchedAssets }) {
    let randomindexes: number[] = [];

    for (let i = 0; i < fetchedAssets?.length * 6; i++) {
        randomindexes.push(Number((Math.random() * 10000).toFixed(0)));
    }

    function toHumanReadableMcap(number: BigNumber) {
        // const decimals = new BigNumber(10).pow(18);

        // const value = number.div(decimals);
        return toHumanReadable(number, 2);
    }

    function tohumanReadableQuantity(number: BigNumber) {
        const decimals = new BigNumber(10).pow(18);

        const value = number.div(decimals);
        return toHumanReadable(value, 2);
    }

    const assets = fetchedAssets?.map((asset: MultipoolAsset, index: number) =>
        <>
            <div key={randomindexes[0 + index]} style={{ backgroundColor: "var(--bc)", padding: "5px", gridRow: index + 2, gridColumn: "1", display: "flex", justifyContent: "flex-start" }}>
                <div style={{
                    borderRadius: "50%", width: "25px", height: "25px", overflow: "clip", marginRight: "10px",
                }}>
                    <img style={{ width: "25px", height: "25px" }} src={asset.logo || "https://arcanum.to/logo.png"} />
                </div>
                {<>{asset.name} ({asset.symbol})</>}
            </div>
            <div key={randomindexes[1 + index]} style={{ backgroundColor: "var(--bc)", padding: "5px", gridRow: index + 2, gridColumn: "2", display: "flex", justifyContent: "flex-end" }}>
                {Number(asset.idealShare.toString()).toFixed(2)}%
            </div>
            <div key={randomindexes[2 + index]} style={{ backgroundColor: "var(--bc)", padding: "5px", gridRow: index + 2, gridColumn: "3", display: "flex", justifyContent: "flex-end" }}>
                {Number(asset.currentShare.toString()).toFixed(2)}%
            </div>
            <div key={randomindexes[3 + index]} style={{ backgroundColor: "var(--bc)", padding: "5px", gridRow: index + 2, gridColumn: "4", display: "flex", justifyContent: "flex-end" }}>
                {asset.price?.toFixed(2).toString()}$
            </div>
            <div key={randomindexes[4 + index]} style={{ backgroundColor: "var(--bc)", padding: "5px", gridRow: index + 2, gridColumn: "5", display: "flex", justifyContent: "flex-end" }}>
                {tohumanReadableQuantity(asset.quantity)}
            </div>
            <div key={randomindexes[5 + index]} style={{ backgroundColor: "var(--bc)", padding: "5px", gridRow: index + 2, gridColumn: "6", display: "flex", justifyContent: "flex-end" }}>
                {toHumanReadableMcap(asset.mcap)}$
            </div>
        </>
    );

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "var(--bc)",
            justifyContent: "center",
            borderRadius: "10px",
            width: "100%",
        }}>
            <h1 style={{ display: "flex", marginTop: "15px", alignSelf: "center", fontSize: "20px", marginLeft: "15px" }}>Asset breakdown</h1>
            <div style={{
                margin: "5px 10px",
                display: "grid",
                overflowX: "auto",
                minWidth: "250px",
                borderRadius: "20px",
                border: "1px solid #393939",
                gap: "1px",
                gridGap: "1px",
                marginBottom: "20px",
                gridTemplateRows: "1fr",
                backgroundColor: "#393939"
            }}>
                <div style={{ backgroundColor: "var(--bc)", padding: "5px", paddingLeft: "10px", gridRow: "1", gridColumn: "1", display: "flex", justifyContent: "flex-start" }}>
                    Name
                </div>
                <div style={{ backgroundColor: "var(--bc)", padding: "5px", gridRow: "1", gridColumn: "2", display: "flex", justifyContent: "flex-end" }}>
                    <Tooltip>
                        <p style={{ margin: "0", textDecoration: "underline" }}>
                            Target share
                        </p>
                        <p style={{ margin: "5px" }}>
                            The share of the corresponding asset in the pool in its equilibrium state.
                        </p>
                    </Tooltip>
                </div>
                <div style={{ backgroundColor: "var(--bc)", padding: "5px", gridRow: "1", gridColumn: "3", display: "flex", justifyContent: "flex-end" }}>
                    <Tooltip>
                        <p style={{ margin: "0", textDecoration: "underline" }}>
                            Current share
                        </p>
                        <p style={{ margin: "5px" }}>
                            The share of the corresponding asset in the pool in its current state.
                        </p>
                    </Tooltip>
                </div>
                <div style={{ backgroundColor: "var(--bc)", padding: "5px", gridRow: "1", gridColumn: "4", display: "flex", justifyContent: "flex-end" }}>
                    <Tooltip>
                        <p style={{ margin: "0", textDecoration: "underline" }}>
                            Price
                        </p>
                        <p style={{ margin: "5px" }}>
                            Current price of the asset.
                        </p>
                    </Tooltip>
                </div>
                <div style={{ backgroundColor: "var(--bc)", padding: "5px", gridRow: "1", gridColumn: "5", display: "flex", justifyContent: "flex-end" }}>
                    <Tooltip>
                        <p style={{ margin: "0", textDecoration: "underline" }}>
                            Quantity
                        </p>
                        <p style={{ margin: "5px" }}>
                            Current amount of assets in the pool (at the current share).
                        </p>
                    </Tooltip>
                </div>
                <div style={{ backgroundColor: "var(--bc)", padding: "5px", gridRow: "1", gridColumn: "6", display: "flex", justifyContent: "flex-end" }}>
                    <Tooltip>
                        <p style={{ margin: "0", textDecoration: "underline" }}>
                            Market cap
                        </p>
                        <p style={{ margin: "5px" }}>
                            Current market cap of the token.
                        </p>
                    </Tooltip>
                </div>
                {assets}
            </div>
        </div >
    );
}
