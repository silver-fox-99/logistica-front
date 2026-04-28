import { cargoApi } from "./cargoApi";
import { transportApi, type TransportInitData } from "./transportApi";
import type {CargoInitData} from "@/entities/cargo/model/types.ts";

export type CommonInitData = {
    lookups: {
        vehicleType: CargoInitData["lookups"]["vehicleType"];
        paymentMethods: CargoInitData["lookups"]["paymentMethods"];
        paymentTerms: CargoInitData["lookups"]["paymentTerms"];
        bargainOptions: CargoInitData["lookups"]["bargainOptions"];
        currency: CargoInitData["lookups"]["currency"];
        cargoTypes?: CargoInitData["lookups"]["cargoTypes"];
        loadType?: CargoInitData["lookups"]["loadType"];
    };
    cargoPoints?: CargoInitData["cargoPoints"];
    transportPoints?: TransportInitData["transportPoints"];
};

export const commonInitApi = {
    async load(): Promise<CommonInitData> {
        const [cargo, transport] = await Promise.all([
            cargoApi.init(),
            transportApi.init()
        ]);

        return {
            lookups: {
                vehicleType: cargo.lookups.vehicleType,
                paymentMethods: cargo.lookups.paymentMethods,
                paymentTerms: cargo.lookups.paymentTerms,
                bargainOptions: cargo.lookups.bargainOptions,
                currency: cargo.lookups.currency,
                cargoTypes: cargo.lookups.cargoTypes,
                loadType: cargo.lookups.loadType,
            },
            cargoPoints: cargo.cargoPoints,
            transportPoints: transport.transportPoints,
        };
    }
};

