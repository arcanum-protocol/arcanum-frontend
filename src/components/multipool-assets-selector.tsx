import { useState, useEffect } from "react";
import { fetchAssets, type MultipoolAsset } from "../lib/multipool";
import * as React from 'react';

export function MultipoolAssetSelector() {
    const [fetchedAssets, setFetchedAssets] = useState<MultipoolAsset[]>();

    useEffect(() => {
        async function inner() {
            const result = await fetchAssets();
            setFetchedAssets(result);
        }
        inner();
    }, []);

    const assets = fetchedAssets?.map(asset => <li>{asset.deviationPercent.toString()}</li>);

    return (
        <ul>
            {assets}
        </ul>
    );
}
