export type TransportPlaceLocation = {
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
    location: TransportPlaceLocation | null;
    address: string;
};

export type Dims = {
    length: string;
    width: string;
    height: string;
};

export type AddTransportFormValues = {
    dateFrom: string;
    dateFromEnd: string;
    dateTo: string;

    loadPlaces: Place[];
    unloadPlaces: Place[];

    vehicleType: string;
    loadType: string[];
    vehiclesCount: string;

    capacityTons: string;
    volumeM3: string;

    dims: Dims;

    currency: string;
    price: string;

    paymentMethod: string;
    paymentTerm: string;
    bargaining: "possible" | "none";

    contactSecondary: string;
    email: string;
    extraPhoneAsMain: boolean;
    note: string;

    images: File[];
    imageUrls: string[];
};