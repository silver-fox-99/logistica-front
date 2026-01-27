export type TransportPlace = {
    countryId: string | null;
    regionId: string | null;
    cityId: string | null;
    address: string;
};

export type AddTransportFormValues = {
    dateFrom: string;
    dateTo: string;

    loadPlaces: TransportPlace[];
    unloadPlaces: TransportPlace[];

    vehicleType: string;
    vehiclesCount: string;

    capacityTons: string;
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
    email: string;
    note: string;
    extraPhoneAsMain: boolean;
};
