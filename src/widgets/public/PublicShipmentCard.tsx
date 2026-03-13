import { memo, useMemo, useCallback, useEffect } from "react";
import {
    Box,
    Stack,
    Typography,
    Chip,
    Button,
    Paper,
    Tooltip as MuiTooltip,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { FiCalendar, FiMapPin, FiTag } from "react-icons/fi";
import type { PublicShipmentBase, PublicPoint } from "@/entities/public-shipment/model/types";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/shared/utils/formatDate";
import { useLocalizedLookup } from "@/shared/utils/lookupUtils";
import { useInitStore } from "@/shared/store/initStore";

type Props = {
    data: PublicShipmentBase;
    kind: "cargo" | "transport";
    cta: { label: string; href: string; icon?: React.ReactNode };
    mobileLayout?: "column" | "row";
};

export const PublicShipmentCard = memo(function PublicShipmentCard({
                                                                       data,
                                                                       cta,
                                                                       kind,
                                                                       mobileLayout = "column",
                                                                   }: Props) {
    const { t, i18n } = useTranslation();
    const { lookups, loadInit } = useInitStore();
    const { findLocalizedLabel } = useLocalizedLookup();

    useEffect(() => {
        loadInit();
    }, [loadInit]);

    const fmtPoint = useCallback(
        (p?: PublicPoint) => {
            if (!p) return "—";

            const parts: string[] = [];
            const lang = i18n.resolvedLanguage || i18n.language || "uz";

            const getLocalized = (
                base?: string | null,
                ru?: string | null,
                uz?: string | null
            ) => {
                if (!base) return null;
                if (lang === "ru" && ru) return ru;
                if (lang === "uz" && uz) return uz;
                return base;
            };

            const country = getLocalized(p.country, p.country_ru, p.country_uz);
            const region = getLocalized(p.region, p.region_ru, p.region_uz);
            const city = getLocalized(p.city, p.city_ru, p.city_uz);

            if (country) parts.push(country);
            if (region) parts.push(region);
            if (city) parts.push(city);

            return parts.length ? parts.join(", ") : "—";
        },
        [i18n.resolvedLanguage, i18n.language]
    );

    const sortedPoints = useMemo(
        () => [...(data.points ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        [data.points]
    );

    const loadPoints = useMemo(
        () =>
            sortedPoints.filter(
                (point) => point.type === "PICKUP" || point.type === "DEPARTURE"
            ),
        [sortedPoints]
    );

    const unloadPoints = useMemo(
        () =>
            sortedPoints.filter(
                (point) => point.type === "DROPOFF" || point.type === "ARRIVAL"
            ),
        [sortedPoints]
    );

    const primaryLoadPoint = loadPoints[0] ?? sortedPoints[0];
    const primaryUnloadPoint =
        unloadPoints[0] ?? sortedPoints[sortedPoints.length - 1];

    const routeFrom = useMemo(
        () => fmtPoint(primaryLoadPoint),
        [fmtPoint, primaryLoadPoint]
    );

    const routeTo = useMemo(
        () => fmtPoint(primaryUnloadPoint),
        [fmtPoint, primaryUnloadPoint]
    );

    const localizedTags = useMemo(() => {
        if (!data.tags) return [];

        const vt = lookups?.vehicleType ?? [];
        const lt = lookups?.loadType ?? [];
        const ct = lookups?.cargoTypes ?? [];

        const loadTypeMap: Record<string, string> = {
            ANY: t("shipments.editDialog.loadTypeAny"),
            FULL: t("shipments.editDialog.loadTypeFull"),
            PARTIAL: t("shipments.editDialog.loadTypePartial"),
            CONSOLIDATED: t("shipments.editDialog.loadTypeConsolidated"),
        };

        return data.tags.map((tag) => {
            const vtLabel = findLocalizedLabel(vt, tag);
            if (vtLabel && vtLabel !== tag) return vtLabel;

            const ltLabel = findLocalizedLabel(lt, tag);
            if (ltLabel && ltLabel !== tag) return ltLabel;

            const ctLabel = findLocalizedLabel(ct, tag);
            if (ctLabel && ctLabel !== tag) return ctLabel;

            if (loadTypeMap[tag]) return loadTypeMap[tag];
            return tag;
        });
    }, [
        data.tags,
        lookups?.vehicleType,
        lookups?.loadType,
        lookups?.cargoTypes,
        findLocalizedLabel,
        t,
    ]);

    const localizedMetrics = useMemo(() => {
        if (!data.metrics) return [];

        const list: string[] = [];

        data.metrics.forEach((m) => {
            const carsMatch = m.match(/^(\d+)\s*cars?$/i);
            if (carsMatch) {
                return;
            }

            const weightMatch = m.match(/^([\d.,]+)\s*t$/i);
            if (weightMatch) {
                list.push(
                    `${weightMatch[1]} ${t("shipments.shipmentCard.weightUnitShort", "т")}`
                );
                return;
            }

            const volumeMatch = m.match(/^([\d.,]+)\s*m3$/i);
            if (volumeMatch) {
                list.push(
                    `${volumeMatch[1]} ${t("shipments.shipmentCard.volumeUnitShort", "м³")}`
                );
                return;
            }

            const volumeSupMatch = m.match(/^([\d.,]+)\s*m³$/i);
            if (volumeSupMatch) {
                list.push(
                    `${volumeSupMatch[1]} ${t("shipments.shipmentCard.volumeUnitShort", "м³")}`
                );
                return;
            }

            list.push(m);
        });

        return list;
    }, [data.metrics, t]);

    return (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Grid container spacing={1.5} alignItems="center">
                <Grid size={{ xs: 12, md: 8 }}>
                    <Stack spacing={1}>
                        <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                            sx={{
                                flexWrap: { xs: "wrap", md: "nowrap" },
                            }}
                        >
                            <Box
                                display="inline-flex"
                                alignItems="center"
                                gap={0.75}
                                sx={{ minWidth: 0, flexShrink: 0 }}
                            >
                                <FiMapPin />
                                <MuiTooltip title={routeFrom}>
                                    <Typography
                                        fontWeight={700}
                                        noWrap
                                        sx={{ maxWidth: { xs: 180, md: 300 } }}
                                    >
                                        {routeFrom}
                                    </Typography>
                                </MuiTooltip>

                                {loadPoints.length > 1 && (
                                    <MuiTooltip
                                        title={`${t("shipments.shipmentCard.load")}: ${loadPoints.length}`}
                                    >
                                        <Box
                                            sx={{
                                                minWidth: 20,
                                                height: 20,
                                                px: 0.5,
                                                borderRadius: "999px",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                bgcolor: "primary.main",
                                                color: "primary.contrastText",
                                                fontSize: 11,
                                                fontWeight: 700,
                                                lineHeight: 1,
                                                flexShrink: 0,
                                            }}
                                        >
                                            {loadPoints.length > 99 ? "99+" : loadPoints.length}
                                        </Box>
                                    </MuiTooltip>
                                )}
                            </Box>

                            <Typography color="text.secondary" sx={{ flexShrink: 0 }}>
                                →
                            </Typography>

                            <Box
                                display="inline-flex"
                                alignItems="center"
                                gap={0.75}
                                sx={{ minWidth: 0, flexShrink: 0 }}
                            >
                                <FiMapPin />
                                <MuiTooltip title={routeTo}>
                                    <Typography
                                        fontWeight={700}
                                        noWrap
                                        sx={{ maxWidth: { xs: 180, md: 300 } }}
                                    >
                                        {routeTo}
                                    </Typography>
                                </MuiTooltip>

                                {unloadPoints.length > 1 && (
                                    <MuiTooltip
                                        title={`${t("shipments.shipmentCard.unload")}: ${unloadPoints.length}`}
                                    >
                                        <Box
                                            sx={{
                                                minWidth: 20,
                                                height: 20,
                                                px: 0.5,
                                                borderRadius: "999px",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                bgcolor: "primary.main",
                                                color: "primary.contrastText",
                                                fontSize: 11,
                                                fontWeight: 700,
                                                lineHeight: 1,
                                                flexShrink: 0,
                                            }}
                                        >
                                            {unloadPoints.length > 99 ? "99+" : unloadPoints.length}
                                        </Box>
                                    </MuiTooltip>
                                )}
                            </Box>

                            <Chip
                                size="small"
                                icon={<FiCalendar />}
                                variant="outlined"
                                label={(() => {
                                    const loadFrom = data.loadWindow?.from ?? data.dates?.from;
                                    const loadTo =
                                        data.loadWindow?.to ??
                                        data.loadWindow?.from ??
                                        data.dates?.from;
                                    const unload = data.dates?.to;

                                    const loadPart = data.loadWindow
                                        ? `${t("shipments.shipmentCard.load")}: ${formatDate(loadFrom)} – ${formatDate(loadTo)}`
                                        : `${t("shipments.shipmentCard.load")}: ${formatDate(loadFrom)}`;

                                    const unloadPart = unload
                                        ? `${t("shipments.shipmentCard.unload")}: ${formatDate(unload)}`
                                        : "";

                                    return unloadPart ? `${loadPart} / ${unloadPart}` : loadPart;
                                })()}
                                sx={{ ml: 0.5 }}
                            />

                            <Chip
                                size="small"
                                color="primary"
                                variant="filled"
                                label={
                                    kind === "cargo"
                                        ? t("shipments.shipmentCard.cargo")
                                        : t("shipments.shipmentCard.transport")
                                }
                            />
                        </Stack>

                        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                            {localizedMetrics.map((m) => (
                                <Chip key={m} size="small" variant="outlined" label={m} />
                            ))}
                            {data.price && (
                                <Chip size="small" color="success" variant="outlined" label={data.price} />
                            )}
                        </Stack>

                        {!!localizedTags.length && (
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                {localizedTags.map((tag, idx) => (
                                    <Chip
                                        key={`${tag}-${idx}`}
                                        size="small"
                                        icon={<FiTag />}
                                        variant="outlined"
                                        label={tag}
                                    />
                                ))}
                            </Stack>
                        )}

                        {data.note && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {data.note}
                            </Typography>
                        )}
                    </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Stack
                        direction={{ xs: mobileLayout === "column" ? "column" : "row", md: "row" }}
                        spacing={1}
                        alignItems={{
                            xs: mobileLayout === "column" ? "flex-start" : "flex-start",
                            md: "flex-end",
                        }}
                        justifyContent="space-between"
                        sx={{
                            "@media (min-width: 900px)": {
                                alignItems: "flex-end",
                                flexDirection: "column",
                                gap: "12px",
                            },
                        }}
                    >
                        {/*<Typography variant="caption" color="text.secondary">*/}
                        {/*    {t("shipments.shipmentCard.updated")} {formatDate(data.createdAt) ?? ""}*/}
                        {/*</Typography>*/}

                        <Button
                            component={RouterLink}
                            to={cta.href}
                            variant="contained"
                            size="small"
                            sx={{ textTransform: "none" }}
                            endIcon={cta.icon}
                        >
                            {cta.label}
                        </Button>

                        <Typography variant="caption" color="text.secondary" textAlign={{ md: "right" }}>
                            {t("shipments.shipmentCard.signInToView")}
                        </Typography>
                    </Stack>
                </Grid>
            </Grid>
        </Paper>
    );
});