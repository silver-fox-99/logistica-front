export type Place = {
    countryId?: string | null;
    regionId?: string | null;
    cityId?: string | null;
};

export type ReviewGeoLoadingState = {
    countries?: boolean;
    regionsFor?: string | null;
    citiesFor?: string | null;
};