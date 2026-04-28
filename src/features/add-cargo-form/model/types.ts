import type {MapsLocationSuggestion} from "@/entities/maps/model/types.ts";

export type Place = {
    location: MapsLocationSuggestion | null;
    address: string;
};

export type AddCargoFormValues = {
    dateFrom: string;
    dateFromEnd: string;
    dateTo: string;

    pickups: Place[];
    dropoffs: Place[];

    cargoType: string;
    vehicleType: string;
    loadType: string[];
    allowPartial: boolean;

    vehiclesCount: string;
    palletsCount: string;
    weightTons: string;
    volumeM3: string;

    dims: {
        length: string;
        width: string;
        height: string;
    };

    currency: string;
    price: string;

    paymentMethod: string;
    paymentTerm: string;
    bargaining: "possible" | "none";

    contactSecondary: string;
    note: string;
    extraPhoneAsMain: boolean;

    images: File[];
    imageUrls: string[];
};