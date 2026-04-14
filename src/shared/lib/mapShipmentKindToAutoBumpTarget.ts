import type { ShipmentsKind } from "@/entities/shipment/model/type";
import type { AutoBumpTargetType } from "@/entities/listing-auto-bump/model/types";

export function mapShipmentKindToAutoBumpTarget(
    kind: ShipmentsKind
): AutoBumpTargetType {
    return kind === "cargo" ? "cargo" : "transport";
}