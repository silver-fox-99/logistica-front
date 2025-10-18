import api from "@/shared/api/axios.ts";
import type {CargoApiItem, ListResponse, ShipmentsKind, TransportApiItem} from "@/entities/shipment/model/type.ts";


type Scope = "public" | "my";

export type ListParams = {
    page?: number;
    limit?: number;

};

const listUrl = (kind: ShipmentsKind, scope: Scope) =>
    scope === "my" ? `/${kind}/my/list` : `/${kind}/list`;

export async function getShipments(kind: "cargo", scope: Scope, params: ListParams) {
    const { data } = await api.get<ListResponse<CargoApiItem>>(listUrl(kind, scope), { params });
    return data;
}

export async function getShipmentsTransport(kind: "transport", scope: Scope, params: ListParams) {
    const { data } = await api.get<ListResponse<TransportApiItem>>(listUrl(kind, scope), { params });
    return data;
}

export const shipmentsApi = {
    list: (kind: ShipmentsKind, scope: Scope, params: ListParams) =>
        kind === "cargo" ? getShipments("cargo", scope, params) : getShipmentsTransport("transport", scope, params),
};
