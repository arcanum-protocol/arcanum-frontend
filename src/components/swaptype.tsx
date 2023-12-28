import { useStore } from "@/contexts/StoreContext";
import { ActionType } from "@/store/MultipoolStore";
import { observer } from "mobx-react-lite";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";


const types = ["arcanum", 'uniswap', 'bebop', 'unavailable'];

// return tabs for swap type
export const SwapType = observer(() => {
    const { swapType } = useStore();

    function imgToUse(type: ActionType) {
        switch (type) {
            case 'arcanum':
                return '/brands/arcanum.svg';
            case 'uniswap':
                return '/brands/uniswap.svg';
            case 'bebop':
                return '/brands/bebop.svg';
            case 'unavailable':
                return '/brands/unavailable.svg'; 
        }
    }

    function typeToUse(type: ActionType) {
        switch (type) {
            case 'arcanum':
                return 'This swap will be performed by Arcanum';
            case 'uniswap':
                return 'This swap will be performed by Uniswap';
            case 'bebop':
                return 'This swap will be performed by Bebop';
            case 'unavailable':
                return 'Currently this swap type is unavailable';
        }
    }

    return (
        <div className="flex justify-between w-full">
            {
                types.map((type, index) => {
                    return (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <div key={index} className={`flex grayscale items-center gap-10 justify-center w-16 h-16 rounded-md text-sm font-medium cursor-pointer transparent border ${swapType === type ? 'border-[#7c7c7c]' : 'border-[#2b2b2b]'}`}>
                                        {
                                            <img className="w-24 h-14" src={imgToUse(type as ActionType)}></img>
                                        }
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-black border text-gray-300 max-w-xs font-mono">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="text-sm font-medium">{typeToUse(type as ActionType)}</div>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )
                })
            }
        </div>)
});
