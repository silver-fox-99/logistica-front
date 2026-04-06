import api from "@/shared/api/axios";
import type { ShipmentsKind } from "@/entities/shipment/model/type.ts";

/** ------ Common bulk types ------ */
export type ShipmentBulkAction = "up" | "delete";

export type ShipmentBulkActionDto = {
    action: ShipmentBulkAction;
    ids: string[];
};

/** ------ Cargo ------ */
export async function cargoUp(id: string) {
    const { data } = await api.patch(`/cargo/${id}/up`);
    return data;
}

export type CargoPatchDto = Partial<{
    date_from: string | null;
    date_to: string | null;
    price_amount: number;
    contact_extra_phone: string | null;
    note: string | null;
}>;

export async function cargoPatch(id: string, dto: CargoPatchDto) {
    const { data } = await api.patch(`/cargo/${id}`, dto);
    return data;
}

export async function cargoDelete(id: string) {
    const { data } = await api.delete(`/cargo/${id}`);
    return data;
}

export async function cargoBulkAction(dto: ShipmentBulkActionDto) {
    const { data } = await api.post(`/cargo/bulk-action`, dto);
    return data;
}

/** ------ Transport ------ */
export async function transportUp(id: string) {
    const { data } = await api.patch(`/transport/${id}/up`);
    return data;
}

export type TransportPatchDto = Partial<{
    date_from: string | null;
    date_to: string | null;
    price_amount: number;
    contact_extra_phone: string | null;
    note: string | null;
}>;

export async function transportPatch(id: string, dto: TransportPatchDto) {
    const { data } = await api.patch(`/transport/${id}`, dto);
    return data;
}

export async function transportDelete(id: string) {
    const { data } = await api.delete(`/transport/${id}`);
    return data;
}

export async function transportBulkAction(dto: ShipmentBulkActionDto) {
    const { data } = await api.post(`/transport/bulk-action`, dto);
    return data;
}

/** ------ Copy ------ */
export async function shipmentCopy(
    kind: ShipmentsKind,
    sourceId: string,
    payload: { date_from: string; date_to: string }
) {
    return api.post(`/${kind}/copy`, {
        source_id: sourceId,
        ...payload,
    });
}