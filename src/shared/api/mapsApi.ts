import api from "@/shared/api/axios";
import type {MapsLocationSuggestion, MapsSearchLocationsParams} from "@/entities/maps/model/types.ts";


export const mapsApi = {
    async searchLocations(params: MapsSearchLocationsParams) {
        const { data } = await api.get<MapsLocationSuggestion[]>("/maps/geocode/search", {
            params,
        });

        return data;
    },
};