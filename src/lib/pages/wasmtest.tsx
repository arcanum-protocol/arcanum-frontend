import { useState, useEffect } from "react";
import init, { ChainData } from "examples-wasm";
import examplesWASMUrl from "examples-wasm/examples_wasm_bg.wasm?url";
import { useQuery } from "@tanstack/react-query";

function WASMTest() {
    const [result, setResult] = useState<string>("0");

    // useQuery({
    //     queryKey: ["wasm"],
    //     queryFn: async () => {
    //         const res = await init(examplesWASMUrl);

    //         var a = await ChainData.new();
    //         console.log(await a.add_address("0xD730eeCe7177E970Be2AabA268aE0817C7d05E5E"));
    //         console.log(await a.get_balance("0xD730eeCe7177E970Be2AabA268aE0817C7d05E5E"));

    //         setTimeout(async () => {
    //             console.log("Freeing memory");
    //             res.free();
    //         }, 10000);
    //     }
    // });

    return <div>{result}</div>;
}

export { WASMTest }
