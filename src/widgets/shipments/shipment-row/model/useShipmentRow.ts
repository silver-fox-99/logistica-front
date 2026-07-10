import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocalizedLookup } from "@/shared/utils/lookupUtils";
import { useInitStore } from "@/shared/store/initStore";
import type { ShipmentsKind } from "@/entities/shipment/model/type";

type Params = {
    data: any; // Raw CargoApiItem or TransportApiItem
    kind: ShipmentsKind;
};

export function useShipmentRow({ data, kind: _kind }: Params) {
    const { t, i18n } = useTranslation();
    const { findLocalizedLabel } = useLocalizedLookup();
    const { lookups, loadInit } = useInitStore();

    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        loadInit();
    }, [loadInit]);

    // Format individual route point with translations
    const formatRoutePoint = useCallback(
        (point?: any, withAddress = false) => {
            if (!point) return "";
            if (point.display_name && !withAddress) return point.display_name;

            const lang = i18n.resolvedLanguage || i18n.language || "uz";
            let country = "";
            let region = "";
            let city = "";

            if (lang === "ru") {
                country = point.country_ru || point.country || "";
                region = point.region_ru || point.region || "";
                city = point.city_ru || point.city || "";
            } else if (lang === "uz") {
                country = point.country_uz || point.country || "";
                region = point.region_uz || point.region || "";
                city = point.city_uz || point.city || "";
            } else {
                country = point.country || "";
                region = point.region || "";
                city = point.city || "";
            }

            const parts = [country, region, city].filter(Boolean);
            if (withAddress && point.address) {
                parts.push(point.address);
            }

            return parts.join(", ") || "—";
        },
        [i18n.resolvedLanguage, i18n.language],
    );

    // Points resolving and sorting
    const points = data.points || [];
    const sortedPoints = useMemo(() => [...points].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [points]);
    const loadPoints = useMemo(() => sortedPoints.filter(p => p.type === "PICKUP" || p.type === "DEPARTURE"), [sortedPoints]);
    const unloadPoints = useMemo(() => sortedPoints.filter(p => p.type === "DROPOFF" || p.type === "ARRIVAL"), [sortedPoints]);

    const primaryLoadPoint = loadPoints[0] ?? sortedPoints[0];
    const primaryUnloadPoint = unloadPoints[0] ?? sortedPoints[sortedPoints.length - 1];

    const routeFrom = useMemo(() => {
        if (primaryLoadPoint) return formatRoutePoint(primaryLoadPoint);
        return "—";
    }, [primaryLoadPoint, formatRoutePoint]);

    const routeTo = useMemo(() => {
        if (primaryUnloadPoint) return formatRoutePoint(primaryUnloadPoint);
        return "—";
    }, [primaryUnloadPoint, formatRoutePoint]);

    // Format dates (DD.MM.YY format)
    const formatDate = useCallback((dateStr?: string | string[]) => {
        if (!dateStr) return "";
        const rawDate = Array.isArray(dateStr) ? dateStr[0] : dateStr;
        if (!rawDate) return "";
        const date = new Date(rawDate);
        if (isNaN(date.getTime())) return rawDate;
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = String(date.getFullYear()).slice(-2);
        return `${day}.${month}.${year}`;
    }, []);

    const loadDateLabel = useMemo(() => {
        const loadFrom = data.date_from;
        const loadTo = data.date_to;
        if (!loadFrom) return t("shipments.shipmentCard.anyDate", "Любая дата");

        let datesStr = "";
        if (Array.isArray(loadFrom)) {
            const validDates = loadFrom.filter(Boolean);
            if (validDates.length >= 2) {
                datesStr = `${formatDate(validDates[0])} - ${formatDate(validDates[1])}`;
            } else if (validDates.length === 1) {
                datesStr = formatDate(validDates[0]);
            }
        } else {
            if (loadTo && typeof loadTo === "string" && loadTo !== loadFrom) {
                datesStr = `${formatDate(loadFrom)} - ${formatDate(loadTo)}`;
            } else {
                datesStr = formatDate(loadFrom);
            }
        }
        return datesStr || t("shipments.shipmentCard.anyDate", "Любая дата");
    }, [data.date_from, data.date_to, formatDate, t]);

    // Resolving specifications
    const vehicleTypeLabel = useMemo(
        () => findLocalizedLabel(lookups?.vehicleType ?? [], data.vehicle_type),
        [data.vehicle_type, lookups, findLocalizedLabel]
    );

    const cargoTypeLabel = useMemo(
        () => findLocalizedLabel(lookups?.cargoTypes ?? [], data.cargo_type),
        [data.cargo_type, lookups, findLocalizedLabel]
    );

    const loadTypeLabel = useMemo(() => {
        if (!data.load_type || (Array.isArray(data.load_type) && data.load_type.length === 0)) {
            return "";
        }
        const loadTypeArray = Array.isArray(data.load_type) ? data.load_type : [data.load_type];
        const loadTypeMap: Record<string, string> = {
            ANY: t("shipments.editDialog.loadTypeAny", "Any"),
            FULL: t("shipments.editDialog.loadTypeFull", "Full"),
            PARTIAL: t("shipments.editDialog.loadTypePartial", "Partial"),
            CONSOLIDATED: t("shipments.editDialog.loadTypeConsolidated", "Consolidated"),
        };
        return loadTypeArray
            .map((lt: string) => {
                const lookupLabel = findLocalizedLabel(lookups?.loadType ?? [], lt);
                return lookupLabel !== lt ? lookupLabel : (loadTypeMap[lt] || lt);
            })
            .join(", ");
    }, [data.load_type, lookups, findLocalizedLabel, t]);

    const paymentTermLabel = useMemo(
        () => findLocalizedLabel(lookups?.paymentTerms ?? [], data.payment_term),
        [data.payment_term, lookups, findLocalizedLabel]
    );

    const bargainLabel = useMemo(() => {
        if (!data.bargain) return "";
        return data.bargain === "ALLOWED"
            ? t("shipments.shipmentCard.bargainAllowed", "Возможен")
            : t("shipments.shipmentCard.bargainNotAllowed", "Невозможен");
    }, [data.bargain, t]);

    // Price and Payment Method resolving
    const formatPrice = useCallback((amount?: string | number, currency?: string) => {
        if (amount == null || amount === "" || Number(amount) === 0) return "";
        const num = Number(amount);
        if (!Number.isFinite(num)) return String(amount);
        const formatted = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(num);
        return currency ? `${formatted} ${currency}` : formatted;
    }, []);

    const priceLabel = useMemo(
        () => formatPrice(data.price_amount, data.price_currency),
        [data.price_amount, data.price_currency, formatPrice]
    );

    const paymentMethodLabel = useMemo(
        () => findLocalizedLabel(lookups?.paymentMethods ?? [], data.payment_method),
        [data.payment_method, lookups, findLocalizedLabel]
    );

    // Adapted data object to maintain compatibility with detail component expectations
    const adaptedData = useMemo(() => {
        const money = (cur: string, amt: string | number) => {
            const num = Number(amt);
            if (!cur || !Number.isFinite(num) || num === 0) return undefined;
            const formatted = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(num);
            return formatted ? `${formatted} ${cur}` : undefined;
        };

        const dimStr = (l?: any, w?: any, h?: any) => {
            if (l == null || w == null || h == null) return undefined;
            return `${Number(l)}m × ${Number(w)}m × ${Number(h)}m`;
        };

        const paymentMap: Record<string, "Cash" | "Bank" | "Card" | undefined> = {
            BANK_TRANSFER: "Bank",
            CASH: "Cash",
            CARD: "Card",
        };

        const name = [data.user?.first_name, data.user?.last_name].filter(Boolean).join(" ");
        const datesFrom = Array.isArray(data.date_from) ? data.date_from[0] : (data.date_from ?? "");

        return {
            id: data.id,
            routeFrom,
            routeTo,
            distanceKm: 0,
            typeTags: [],
            points: sortedPoints,
            dates: { from: datesFrom, to: data.date_to ?? "" },
            dims: data.has_dimensions ? dimStr(data.length_m, data.width_m, data.height_m) : undefined,
            paymentType: paymentMap[data.payment_method ?? ""],
            price: money(data.price_currency ?? "", data.price_amount ?? 0),
            contact: {
                userId: data.user?.id,
                name,
                company: data.user?.company,
                email: data.user?.email,
                phone1: data.user?.phone,
                phone2: data.contact_extra_phone ?? undefined,
            },
            vehicleType: data.vehicle_type,
            loadType: Array.isArray(data.load_type) ? data.load_type : (data.load_type ? [data.load_type] : undefined),
            cargoType: data.cargo_type,
            allowPartialLoad: data.allow_partial_load ?? undefined,
            carsCount: data.cars_count ?? undefined,
            palletsCount: data.pallets_count ?? undefined,
            weightT: data.weight_t != null ? Number(data.weight_t) : undefined,
            volumeM3: data.volume_m3 != null ? Number(data.volume_m3) : undefined,
            paymentTerm: data.payment_term,
            bargain: data.bargain,
            note: data.note ?? undefined,
            contactExtraPhone: data.contact_extra_phone ?? undefined,
            extraPhoneAsMain: data.extra_phone_as_main ?? false,
            display_type: data.display_type ?? null,
        };
    }, [data, routeFrom, routeTo, sortedPoints]);

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
        formatRoute: formatRoutePoint,
        loadPoints,
        unloadPoints,
        routeFrom,
        routeTo,
        vehicleTypeLabel,
        cargoTypeLabel,
        loadTypeLabel,
        loadDateLabel,
        paymentTermLabel,
        bargainLabel,
        priceLabel,
        paymentMethodLabel,
        adaptedData,
        openMore,
    };
}