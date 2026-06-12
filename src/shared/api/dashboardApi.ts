import api from "@/shared/api/axios";

export type CreationTrendPoint = {
    day: string;
    cargo_cnt: number;
    transport_cnt: number;
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
    updates?: number;
};

export type InfoViewer = {
    user_id: string | null;
    phone: string | null;
    email: string | null;
    first_name: string | null;
    last_name: string | null;
    cargo_views: number;
    transport_views: number;
    total_views: number;
    last_view_at: string;
};

export type DashboardResponse = {
    status: boolean;
    data: {
        kpi: {
            newUsers: number;
            newCargos: number;
            newTransports: number;
            activeUsers: number;
        };
        series: { creationTrend: CreationTrendPoint[] };
        top: {
            routes: { cargo: TopRoute[]; transport: TopRoute[] };
            countries: {
                cargo: { pickup: TopCountry[]; dropoff: TopCountry[] };
                transport: { departure: TopCountry[]; arrival: TopCountry[] };
            };
            powerUsers: PowerUser[];
            infoViewers: InfoViewer[];
        };
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
