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

    dims: Dims;

    currency: string;
    price: string;

    paymentMethod: string;
    paymentTerm: string;
    bargaining: "possible" | "none";

    contactSecondary: string;
    extraPhoneAsMain: boolean;
    note: string;
};
