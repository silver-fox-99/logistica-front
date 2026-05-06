
export type PlaceLocation = {
    id: string;
    type: "COUNTRY" | "REGION" | "CITY";

    country: string;
    country_ru?: string | null;
    country_uz?: string | null;

    region?: string | null;
    region_ru?: string | null;
    region_uz?: string | null;

    city?: string | null;
    city_ru?: string | null;
    city_uz?: string | null;

    address?: string | null;
    display_name: string;

    latitude?: string | number | null;
    longitude?: string | number | null;

    source: "internal_geo";
};

export type Place = {
    location: PlaceLocation | null;
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