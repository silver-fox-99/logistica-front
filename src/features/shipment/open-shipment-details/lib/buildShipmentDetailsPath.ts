import type { ShipmentsKind } from "@/entities/shipment/model/type";

export function buildShipmentDetailsPath(kind: ShipmentsKind, id: string) {
    return `/search/${kind}/${id}`;
}