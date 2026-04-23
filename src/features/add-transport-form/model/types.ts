export type Place = {
    countryId: string | null;
    regionId: string | null;
    cityId: string | null;
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