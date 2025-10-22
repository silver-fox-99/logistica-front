import api from "@/shared/api/axios.ts";

export type ListResponse<T> = {
    status: boolean;
    data: T[];
    total: number;
    page: number;
    pages: number;
    limit: number;
    message: string;
};

export type ListParams = {
    page?: number;
    limit?: number;
    [k: string]: any;
};

function compactParams(params?: Record<string, any>) {
    const out: Record<string, any> = {};
    Object.entries(params ?? {}).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") return;
        out[k] = v;
    });
    return out;
}


function normalize(a?: number | ListParams, b?: number, c?: Record<string, any>): ListParams {
    if (typeof a === "object" && a !== null) {
        return compactParams(a);
    }
    return compactParams({ page: a, limit: b, ...(c || {}) });
}


async function getList<T>(url: string, params?: Record<string, any>) {
    try {
        const resp = await api.get<ListResponse<T>>(url, { params });
        return resp.data;
    } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || "Request failed";
        throw new Error(msg);
    }
}

export const publicShipmentsApi = {
    // Public cargo
    async listCargo<T = any>(
        a?: number | ListParams,
        b?: number,
        c?: Record<string, any>
    ) {
        const params = normalize(a, b, c);
        return getList<T>("/cargo/public/list", params);
    },

    // Public transport
    async listTransport<T = any>(
        a?: number | ListParams,
        b?: number,
        c?: Record<string, any>
    ) {
        const params = normalize(a, b, c);
        return getList<T>("/transport/public/list", params);
    },

    async getFilters() {
       const response = await api.get("/common/filters")
        return response.data
    }
};
