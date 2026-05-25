import type { TenderBlacklistPhone } from "@/entities/tender/model/types";

export type TenderEditValues = {
    title: string;
    cargoDescription: string;
    pickupDate: string;
    dropoffDate: string;
    pickupTime: string;
    dropoffTime: string;
    cargoType: string;
    vehicleType: string;
    loadingType: string;
    weightTons: string;
    volumeM3: string;
    placesCount: string;
    vehicleCapacityTons: string;
    vehicleBodyLengthM: string;
    startPrice: string;
    buyoutPrice: string;
    minBidStep: string;
    startsAt: string;
    endsAt: string;
    phone: string;
};

export type BlacklistItem = TenderBlacklistPhone;