import api from "@/shared/api/axios";

export type PriceTrendPoint = {
    day: string;
    cargo_avg: number;
    cargo_median: number;
    transport_avg: number;
    transport_median: number;
};

export type TopRoute = {
    from_loc: string;
    to_loc: string;
    cnt: number;
    total_price: string | number;
};

export type TopCountry = { country: string; cnt: number };

export type PowerUser = {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    ads: number;
    updates: number;
};

export type ApiEndpointStat = {
    endpoint: string;
    method: string;
    hits: number;
    avg_ms: number;
    p95_ms: number;
    ok: number;
    errors: number;
};

export type DashboardResponse = {
    status: boolean;
    data: {
        kpi: {
            newUsers: number;
            newCargos: number;
            newTransports: number;
            avgPrice7d: { cargo: number; transport: number };
        };
        series: { priceTrend: PriceTrendPoint[] };
        top: {
            routes: { cargo: TopRoute[]; transport: TopRoute[] };
            countries: {
                cargo: { pickup: TopCountry[]; dropoff: TopCountry[] };
                transport: { departure: TopCountry[]; arrival: TopCountry[] };
            };
            powerUsers: PowerUser[];
        };
        api: { endpoints: ApiEndpointStat[] };
    };
};

export type Range = "7d" | "30d" | "90d";

export const dashboardApi = {
    getOverview: async (range: Range = "30d") => {
        const { data } = await api.get<DashboardResponse>("/admin-dashboard", {
            params: { range },
        });
        return data.data;
    },
};
