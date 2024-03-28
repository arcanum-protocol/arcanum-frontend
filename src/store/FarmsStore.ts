import FARM from "@/abi/FARM";
import { getETFsPrice } from "@/api/arcanum";
import { arbitrumPublicClient } from "@/config";
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
        client: arbitrumPublicClient
    });

    addressToIds = new Map<Address, string>([
        ["0x4810e5a7741ea5fdbb658eda632ddfac3b19e3c6", "arbi"],
        ["0xbb5b3d9f6b57077b4545ea9879ee7fd0bdb08db0", "spi"],
        ["0xc13a9dfea919248974113c901badc87e15e3f2b4", "arbi"],
        ["0xc3222af6b11ffb337abf8d8b0f2755409d734157", "spi"],
    ]);

    mpIdToPrice: Map<Address, number> = new Map();
    farms: Farm[] = [];

    constructor(farmAddress: Address) {
        this.FarmsConatractInstance = getContract({
            address: farmAddress,
            abi: FARM,
            client: arbitrumPublicClient
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
