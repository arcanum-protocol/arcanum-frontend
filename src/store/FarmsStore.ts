import FARM from "@/abi/FARM";
import { getETFsPrice } from "@/api/arcanum";
import { customTestnetPublicClient } from "@/config";
import { makeAutoObservable, runInAction } from "mobx";
import { Address, getContract } from "viem";


interface Farm {
    id: number;
    lockAsset: Address;
    lockAssetTotalNumber: bigint;
    rewardAsset: Address;
    rpb: bigint;
    arps: bigint;
    availableRewards: bigint;
    lastUpdateBlock: bigint;
}

class FarmsStore {
    FarmsConatractInstance = getContract({
        address: undefined as any,
        abi: FARM,
        client: customTestnetPublicClient
    });

    addressToIds = new Map<Address, string>([
        ["0x4810e5a7741ea5fdbb658eda632ddfac3b19e3c6", "arbi"],
        ["0xbb5b3d9f6b57077b4545ea9879ee7fd0bdb08db0", "spi"],
        ["0x961fad7932e95018bac25ee3c7459c7002480671", "arbi"],
        ["0xa67554edfa8be9bf28d2086bdc1eaf5ac27bd008", "spi"],
    ]);

    mpIdToPrice: Map<Address, number> = new Map();
    farms: Farm[] = [];

    constructor(farmAddress: Address) {
        this.FarmsConatractInstance = getContract({
            address: farmAddress,
            abi: FARM,
            client: customTestnetPublicClient
        });

        this.getFarmsPrice();

        makeAutoObservable(this);
    }

    setFarms(farms: Farm[]) {
        this.farms = farms;
    }

    getFarmsPrice() {
        const asArray = Array.from(this.addressToIds.values());

        getETFsPrice(asArray).then((responce) => {
            runInAction(() => {
                this.mpIdToPrice = responce;
            });
        });
    }
}

export { FarmsStore };
export type { Farm };
