import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocalizedLookup } from "@/shared/utils/lookupUtils";
import { useInitStore } from "@/shared/store/initStore";
import { formatShipmentRoute } from "@/entities/shipment/lib/format-shipment-route";
import {
    getLoadDateLabel,
    getLoadPoints,
    getLoadTypeLabel,
    getShipmentTypeLabel,
    getSortedPoints,
    getSummaryItems,
    getUnloadDateLabel,
    getUnloadPoints,
    getVehicleTypeLabel,
} from "@/entities/shipment/model/shipment-row.selectors";
import type { ShipmentRowData, ShipmentsKind } from "@/entities/shipment/model/type";

type Params = {
    data: ShipmentRowData;
    kind: ShipmentsKind;
};

export function useShipmentRow({ data, kind }: Params) {
    const { t, i18n } = useTranslation();
    const { findLocalizedLabel } = useLocalizedLookup();
    const { lookups, loadInit } = useInitStore();

    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        loadInit();
    }, [loadInit]);

    const formatRoute = useCallback(
        (point?: any, withAddress = false) =>
            formatShipmentRoute(
                point,
                i18n.resolvedLanguage || i18n.language || "uz",
                withAddress,
            ),
        [i18n.resolvedLanguage, i18n.language],
    );

    const sortedPoints = useMemo(() => getSortedPoints(data), [data]);
    const loadPoints = useMemo(() => getLoadPoints(data), [data]);
    const unloadPoints = useMemo(() => getUnloadPoints(data), [data]);

    const primaryLoadPoint = loadPoints[0] ?? sortedPoints[0];
    const primaryUnloadPoint = unloadPoints[0] ?? sortedPoints[sortedPoints.length - 1];

    const routeFrom = useMemo(() => {
        if (primaryLoadPoint) return formatRoute(primaryLoadPoint);
        return "—";
    }, [primaryLoadPoint, formatRoute]);

    const routeTo = useMemo(() => {
        if (primaryUnloadPoint) return formatRoute(primaryUnloadPoint);
        return "—";
    }, [primaryUnloadPoint, formatRoute]);

    const shipmentTypeLabel = useMemo(() => getShipmentTypeLabel(kind, t), [kind, t]);

    const vehicleTypeLabel = useMemo(
        () => getVehicleTypeLabel(data, lookups, findLocalizedLabel),
        [data, lookups, findLocalizedLabel],
    );

    const loadTypeLabel = useMemo(
        () => getLoadTypeLabel(data, lookups, findLocalizedLabel, t),
        [data, lookups, findLocalizedLabel, t],
    );

    const loadDateLabel = useMemo(() => getLoadDateLabel(data, t), [data, t]);
    const unloadDateLabel = useMemo(() => getUnloadDateLabel(data, t), [data, t]);

    const summaryItems = useMemo(
        () => getSummaryItems(data, vehicleTypeLabel, loadTypeLabel, t),
        [data, vehicleTypeLabel, loadTypeLabel, t],
    );

    const openMore = (scope: "public" | "my", onMoreOpen?: (id: string) => void) => {
        if (scope === "my" && !expanded) {
            onMoreOpen?.(data.id);
        }

        if (scope === "my") {
            setExpanded((prev) => !prev);
        }
    };

    return {
        t,
        lookups,
        findLocalizedLabel,
        expanded,
        setExpanded,
        formatRoute,
        loadPoints,
        unloadPoints,
        routeFrom,
        routeTo,
        shipmentTypeLabel,
        vehicleTypeLabel,
        loadTypeLabel,
        loadDateLabel,
        unloadDateLabel,
        summaryItems,
        openMore,
    };
}