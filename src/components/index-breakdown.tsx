import { useState, useEffect } from "react";
import { fetchIndex, type Index } from "../lib/indexes";
import * as React from 'react';

export function IndexAssetsBreakdown() {
    const [fetchedAssets, setFetchedAssets] = useState<Index>();

    useEffect(() => {
        async function inner() {
            const result = await fetchIndex(1);
            setFetchedAssets(result);
        }
        inner();
    }, []);

    const assets = fetchedAssets?.assets.map(asset => <li>{asset.name}</li>);

    return (
        <ul>
            {assets}
        </ul>
    );
}
