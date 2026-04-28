export type MapsLocationSuggestion = {
    place_id: string;
    display_name: string;
    latitude: string | null;
    longitude: string | null;
    country: string | null;
    country_code: string | null;
    region: string | null;
    city: string | null;
    address: string | null;
    source: "locationiq";
};

export type MapsSearchLocationsParams = {
    q: string;
    countrycodes?: string;
    lang?: "en" | "ru" | "uz";
    limit?: number;
};