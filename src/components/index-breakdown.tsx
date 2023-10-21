import { BigNumber } from "bignumber.js";
import type { MultipoolAsset } from '../types/multipoolAsset';
import { toHumanReadable } from "../lib/format-number";
import { Tooltip } from './tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

export function IndexAssetsBreakdown({ fetchedAssets }: { fetchedAssets: MultipoolAsset[] }) {
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
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="text-left">Asset</TableHead>
                    <TableHead className="text-center">Target</TableHead>
                    <TableHead className="text-center">Current</TableHead>
                    <TableHead className="text-center">Price</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-center">Market Cap</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    fetchedAssets.map((fetchedAsset) => 
                        <TableRow key={fetchedAsset.address}>
                            <TableCell className="text-left">{fetchedAsset.symbol}</TableCell>
                            <TableCell>{fetchedAsset.idealShare.toFixed(2)}%</TableCell>
                            <TableCell>{fetchedAsset.currentShare.toFixed(2)}%</TableCell>
                            <TableCell>{(fetchedAsset.price || 0).toFixed(2)}$</TableCell>
                            <TableCell>{tohumanReadableQuantity(fetchedAsset.quantity)}</TableCell>
                            <TableCell>{toHumanReadableMcap(fetchedAsset.mcap)}$</TableCell>
                        </TableRow>
                    )
                }
            </TableBody>
        </Table>
    );
}
