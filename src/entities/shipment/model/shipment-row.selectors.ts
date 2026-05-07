import type { TFunction } from "i18next";
import type { ShipmentRowData } from "./type";
import type { FindLocalizedLabel } from "./shipment-row.types";
import { formatDate } from "@/shared/utils/formatDate";
import type { CommonInitData } from "@/shared/api/commonInitApi";

type Lookups = CommonInitData["lookups"] | null;

export const getLoadPoints = (data: ShipmentRowData) => {
    return (data.points ?? [])
        .filter((point) => point.type === "PICKUP" || point.type === "DEPARTURE")
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
};

export const getUnloadPoints = (data: ShipmentRowData) => {
    return (data.points ?? [])
        .filter((point) => point.type === "DROPOFF" || point.type === "ARRIVAL")
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
};

export const getSortedPoints = (data: ShipmentRowData) => {
    return [...(data.points ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
};

export function getShipmentTypeLabel(kind: "cargo" | "transport", t: TFunction) {
    return kind === "cargo"
        ? t("shipments.shipmentCard.cargo", "Cargo")
        : t("shipments.shipmentCard.transport", "Transport");
}

export function getVehicleTypeLabel(
    data: ShipmentRowData,
    lookups: Lookups,
    findLocalizedLabel: FindLocalizedLabel,
) {
    if (!data.vehicleType) return "";
    return findLocalizedLabel(lookups?.vehicleType ?? [], data.vehicleType) || data.vehicleType;
}

export function getLoadTypeLabel(
    data: ShipmentRowData,
    lookups: Lookups,
    findLocalizedLabel: FindLocalizedLabel,
    t: TFunction,
) {
    if (!data.loadType || (Array.isArray(data.loadType) && data.loadType.length === 0)) {
        return "";
    }

    const loadTypeArray = Array.isArray(data.loadType) ? data.loadType : [data.loadType];

    const loadTypeMap: Record<string, string> = {
        ANY: t("shipments.editDialog.loadTypeAny", "Any"),
        FULL: t("shipments.editDialog.loadTypeFull", "Full"),
        PARTIAL: t("shipments.editDialog.loadTypePartial", "Partial"),
        CONSOLIDATED: t("shipments.editDialog.loadTypeConsolidated", "Consolidated"),
    };

    return loadTypeArray
        .map((lt) => {
            const lookupLabel = findLocalizedLabel(lookups?.loadType ?? [], lt);
            return lookupLabel !== lt ? lookupLabel : (loadTypeMap[lt] || lt);
        })
        .join(", ");
}

export function getLoadDateLabel(data: ShipmentRowData, t: TFunction) {
    const loadFrom = data.loadWindow?.from ?? data.dates.from;
    const loadTo = data.loadWindow?.to ?? data.loadWindow?.from ?? data.dates.from;

    if (!loadFrom) return "";

    if (data.loadWindow?.from || data.loadWindow?.to) {
        return `${t("shipments.shipmentCard.load", "Pickup")}: ${formatDate(loadFrom)} – ${formatDate(loadTo)}`;
    }

    return `${t("shipments.shipmentCard.load", "Pickup")}: ${formatDate(loadFrom)}`;
}

export function getUnloadDateLabel(data: ShipmentRowData, t: TFunction) {
    if (!data.dates.to) return "";
    return `${t("shipments.shipmentCard.unload", "Delivery")}: ${formatDate(data.dates.to)}`;
}

export function getSummaryItems(
    data: ShipmentRowData,
    vehicleTypeLabel: string,
    loadTypeLabel: string,
    t: TFunction,
) {
    const items: Array<{ key: string; icon: "weight" | "volume" | "vehicle" | "loadType"; label: string }> = [];

    if (data.weightT != null && data.weightT > 0) {
        items.push({
            key: "weight",
            icon: "weight",
            label: `${data.weightT} ${t("shipments.shipmentCard.weightUnitShort", "t")}`,
        });
    }

    if (data.volumeM3 != null && data.volumeM3 > 0) {
        items.push({
            key: "volume",
            icon: "volume",
            label: `${data.volumeM3} ${t("shipments.shipmentCard.volumeUnitShort", "m³")}`,
        });
    }

    if (vehicleTypeLabel) {
        items.push({
            key: "vehicle",
            icon: "vehicle",
            label: vehicleTypeLabel,
        });
    }

    if (loadTypeLabel) {
        items.push({
            key: "loadType",
            icon: "loadType",
            label: loadTypeLabel,
        });
    }

    return items.slice(0, 4);
}