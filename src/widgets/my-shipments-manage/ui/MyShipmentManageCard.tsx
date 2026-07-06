import { useCallback, useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import {
    Box,
    Button,
    Checkbox,
    Chip,
    Divider,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
    FiCalendar,
    FiChevronDown,
    FiChevronUp,
    FiClock,
    FiCopy,
    FiEdit2,
    FiEye,
    FiMapPin,
    FiPackage,
    FiRepeat,
    FiTrash2,
    FiTruck,
    FiMoreVertical,
    FiEyeOff,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";

import type { GeoPoint, ShipmentRowData, ShipmentsKind } from "@/entities/shipment/model/type";
import { useLocalizedLookup } from "@/shared/utils/lookupUtils";
import { useInitStore } from "@/shared/store/initStore";
import { formatDate } from "@/shared/utils/formatDate";
import {formatShipmentRoute} from "@/entities/shipment/lib/format-shipment-route.ts";

type Props = {
    data: ShipmentRowData;
    kind: ShipmentsKind;
    selected: boolean;
    onSelect: () => void;
    onUp: (id: string) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onCopy: (id: string) => void;
    onAutoBump: (id: string) => void;
    onDeactivate: (id: string) => void;
};

function getUpdatedValue(data: ShipmentRowData) {
    return (
        (data as any)?.sort_updated_at ??
        (data as any)?.updated_at ??
        (data as any)?.updatedAt ??
        (data as any)?.updated ??
        null
    );
}

function getViewsValue(data: ShipmentRowData) {
    const raw = (data as any)?.viewCount ?? (data as any)?.view_count ?? (data as any)?.viewsCount;
    return raw ? +raw : 0;
}

function getUpCountValue(data: ShipmentRowData) {
    const raw = (data as any)?.up_count ?? (data as any)?.upCount;
    return raw ? +raw : 0;
}

export function MyShipmentManageCard({
                                         data,
                                         kind,
                                         selected,
                                         onSelect,
                                         onUp,
                                         onEdit,
                                         onDelete,
                                         onCopy,
                                         onAutoBump,
                                         onDeactivate,
                                     }: Props) {
    const { t, i18n } = useTranslation();
    const { findLocalizedLabel } = useLocalizedLookup();
    const { lookups, loadInit } = useInitStore();

    const [expanded, setExpanded] = useState(false);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);
    const handleMenuOpen = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    useEffect(() => {
        loadInit();
    }, [loadInit]);

    const formatRoute = useCallback(
        (point?: GeoPoint, withAddress = false) =>
            formatShipmentRoute(
                point,
                i18n.resolvedLanguage || i18n.language || "uz",
                withAddress,
            ),
        [i18n.language, i18n.resolvedLanguage],
    );

    const sortedPoints = useMemo(
        () => [...(data.points ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        [data.points]
    );

    const loadPoints = useMemo(
        () => sortedPoints.filter((item) => item.type === "PICKUP" || item.type === "DEPARTURE"),
        [sortedPoints]
    );

    const unloadPoints = useMemo(
        () => sortedPoints.filter((item) => item.type === "DROPOFF" || item.type === "ARRIVAL"),
        [sortedPoints]
    );

    const primaryLoadPoint = loadPoints[0] ?? sortedPoints[0];
    const primaryUnloadPoint = unloadPoints[0] ?? sortedPoints[sortedPoints.length - 1];

    const routeFrom = useMemo(() => {
        if (primaryLoadPoint) return formatRoute(primaryLoadPoint);
        return "—";
    }, [formatRoute, primaryLoadPoint]);

    const routeTo = useMemo(() => {
        if (primaryUnloadPoint) return formatRoute(primaryUnloadPoint);
        return "—";
    }, [formatRoute, primaryUnloadPoint]);

    const updatedAt = getUpdatedValue(data);
    const views = getViewsValue(data);
    const upCount = getUpCountValue(data);

    const loadFrom = data.loadWindow?.from ?? data.dates.from;
    const loadTo = data.loadWindow?.to ?? data.loadWindow?.from ?? data.dates.from;
    const unloadDate = data.dates?.to ?? null;
    const canEdit = data.display_type !== 'inactive'

    const pointsBadgeSx = {
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
    };

    return (
        <Paper
            variant="outlined"
            sx={{
                p: 2,
                borderRadius: 1,
                borderColor: selected ? "primary.main" : "divider",
                boxShadow: selected ? "0 0 0 1px rgba(25,118,210,0.15)" : "none",
                opacity: !canEdit ? 0.5 : 1,
            }}
        >
            <Stack spacing={1.5}>
                <Grid container spacing={1.5} alignItems="flex-start">
                    <Grid size={{ xs: 12, md: 8.5 }}>
                        <Stack spacing={1.25}>
                            <Stack
                                direction="row"
                                spacing={1}
                                alignItems="flex-start"
                                sx={{ width: "100%" }}
                            >
                                <Checkbox
                                    checked={selected}
                                    onChange={onSelect}
                                    sx={{ mt: -0.5, ml: -0.5, flexShrink: 0 }}
                                />

                                <Stack spacing={1} sx={{ minWidth: 0, flex: 1 }}>
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                        flexWrap="wrap"
                                    >
                                        <Chip
                                            size="small"
                                            color={kind === "cargo" ? "info" : "success"}
                                            icon={kind === "cargo" ? <FiPackage /> : <FiTruck />}
                                            label={
                                                kind === "cargo"
                                                    ? t("shipments.shipmentCard.cargo")
                                                    : t("shipments.shipmentCard.transport")
                                            }
                                            sx={{ flexShrink: 0, borderRadius: 2 }}
                                        />
                                    </Stack>

                                    <Stack
                                        direction={{ xs: "column", sm: "row" }}
                                        spacing={{ xs: 0.5, sm: 1.25 }}
                                        alignItems={{ xs: "flex-start", sm: "center" }}
                                        flexWrap="wrap"
                                        sx={{ minWidth: 0 }}
                                    >
                                        <Stack
                                            direction="row"
                                            spacing={0.75}
                                            alignItems="center"
                                            sx={{
                                                minWidth: 0,
                                                maxWidth: { xs: "100%", md: 360, lg: 440 },
                                                flex: "1 1 auto",
                                            }}
                                        >
                                            <FiMapPin />

                                            <Tooltip title={routeFrom}>
                                                <Typography
                                                    fontWeight={700}
                                                    noWrap
                                                    sx={{
                                                        minWidth: 0,
                                                        maxWidth: "100%",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                        lineHeight: 1.25,
                                                        display: "block",
                                                    }}
                                                >
                                                    {routeFrom}
                                                </Typography>
                                            </Tooltip>

                                            {loadPoints.length > 1 && (
                                                <Tooltip
                                                    title={t("shipments.manage.pickupPointsCount", {
                                                        count: loadPoints.length,
                                                        defaultValue: "Pickup points: {{count}}",
                                                    })}
                                                >
                                                    <Box sx={pointsBadgeSx}>
                                                        {loadPoints.length > 99 ? "99+" : loadPoints.length}
                                                    </Box>
                                                </Tooltip>
                                            )}
                                        </Stack>

                                        <Typography
                                            color="text.secondary"
                                            sx={{ display: { xs: "none", sm: "block" } }}
                                        >
                                            →
                                        </Typography>

                                        <Stack
                                            direction="row"
                                            spacing={0.75}
                                            alignItems="center"
                                            sx={{
                                                minWidth: 0,
                                                maxWidth: { xs: "100%", md: 360, lg: 440 },
                                                flex: "1 1 auto",
                                            }}
                                        >
                                            <FiMapPin />

                                            <Tooltip title={routeTo}>
                                                <Typography
                                                    fontWeight={700}
                                                    noWrap
                                                    sx={{
                                                        minWidth: 0,
                                                        maxWidth: "100%",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                        lineHeight: 1.25,
                                                        display: "block",
                                                    }}
                                                >
                                                    {routeTo}
                                                </Typography>
                                            </Tooltip>

                                            {unloadPoints.length > 1 && (
                                                <Tooltip
                                                    title={t("shipments.manage.dropoffPointsCount", {
                                                        count: unloadPoints.length,
                                                        defaultValue: "Drop-off points: {{count}}",
                                                    })}
                                                >
                                                    <Box sx={pointsBadgeSx}>
                                                        {unloadPoints.length > 99 ? "99+" : unloadPoints.length}
                                                    </Box>
                                                </Tooltip>
                                            )}
                                        </Stack>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Grid>

                    <Grid size={{ xs: 12, md: 3.5 }}>
                        {canEdit && <Stack
                            direction="row"
                            spacing={0.5}
                            justifyContent={{ xs: "flex-start", md: "flex-end" }}
                            alignItems="center"
                        >
                            <IconButton onClick={handleMenuOpen}>
                                <FiMoreVertical />
                            </IconButton>

                             <Menu
                                anchorEl={anchorEl}
                                open={openMenu}
                                onClose={handleMenuClose}
                                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            >
                                <MenuItem onClick={() => { handleMenuClose(); onUp(data.id); }}>
                                    <ListItemIcon><FiRepeat size={16} /></ListItemIcon>
                                    <ListItemText>{t("shipments.shipmentCard.raiseUp")}</ListItemText>
                                </MenuItem>

                                <MenuItem onClick={() => { handleMenuClose(); onEdit(data.id); }}>
                                    <ListItemIcon><FiEdit2 size={16} /></ListItemIcon>
                                    <ListItemText>{t("shipments.shipmentCard.edit")}</ListItemText>
                                </MenuItem>

                                <MenuItem onClick={() => { handleMenuClose(); onCopy(data.id); }}>
                                    <ListItemIcon><FiCopy size={16} /></ListItemIcon>
                                    <ListItemText>{t("shipments.shipmentCard.copy")}</ListItemText>
                                </MenuItem>

                                <MenuItem onClick={() => { handleMenuClose(); onAutoBump(data.id); }}>
                                    <ListItemIcon><FiClock size={16} /></ListItemIcon>
                                    <ListItemText>{t("listingAutoBump.actions.open", { defaultValue: "Auto bump" })}</ListItemText>
                                </MenuItem>

                                <MenuItem onClick={() => { handleMenuClose(); onDeactivate(data.id); }}>
                                    <ListItemIcon><FiEyeOff size={16} /></ListItemIcon>
                                    <ListItemText>{t("shipments.shipmentCard.deactivate", { defaultValue: "Деактивировать" })}</ListItemText>
                                </MenuItem>

                                <Divider />

                                <MenuItem onClick={() => { handleMenuClose(); onDelete(data.id); }} sx={{ color: 'error.main' }}>
                                    <ListItemIcon sx={{ color: 'error.main' }}><FiTrash2 size={16} /></ListItemIcon>
                                    <ListItemText>{t("shipments.shipmentCard.delete")}</ListItemText>
                                </MenuItem>
                            </Menu>
                        </Stack>}
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Stack
                            direction={{ xs: "column", lg: "row" }}
                            spacing={1}
                            alignItems={{ xs: "stretch", lg: "center" }}
                            justifyContent="space-between"
                        >
                            <Stack direction="row" gap={1} flexWrap="wrap">
                                <Chip
                                    size="small"
                                    variant="outlined"
                                    icon={<FiCalendar />}
                                    sx={{
                                        borderRadius: 2
                                    }}
                                    label={`${t("shipments.shipmentCard.load")}: ${formatDate(loadFrom)}${
                                        loadFrom !== loadTo ? ` – ${formatDate(loadTo)}` : ""
                                    }`}
                                />

                                {unloadDate && (
                                    <Chip
                                        size="small"
                                        variant="outlined"
                                        icon={<FiClock />}
                                        sx={{
                                            borderRadius: 2
                                        }}
                                        label={`${t("shipments.shipmentCard.unload")}: ${formatDate(unloadDate)}`}
                                    />
                                )}

                                <Chip
                                    size="small"
                                    icon={<FiEye />}
                                    label={t("shipments.manage.viewsCount", {
                                        count: views,
                                        defaultValue: "Views: {{count}}",
                                    })}
                                    sx={{
                                        borderRadius: 2
                                    }}
                                />

                                <Chip
                                    size="small"
                                    icon={<FiRepeat />}
                                    label={t("shipments.manage.upCount", {
                                        count: upCount,
                                        defaultValue: "Raised: {{count}}",
                                    })}
                                    sx={{
                                        borderRadius: 2
                                    }}
                                />

                                <Chip
                                    size="small"
                                    icon={<FiClock />}
                                    label={t("shipments.manage.updatedAt", {
                                        value: updatedAt ? formatDate(updatedAt) : t("common.dash"),
                                        defaultValue: "Updated: {{value}}",
                                    })}
                                    sx={{
                                        borderRadius: 2
                                    }}
                                />

                                {data.paymentType && (
                                    <Chip
                                        size="small"
                                        color="success"
                                        label={data.paymentType}
                                    />
                                )}

                                {data.price && (
                                    <Chip
                                        size="small"
                                        color="success"
                                        variant="outlined"
                                        label={data.price}
                                    />
                                )}
                            </Stack>

                            <Box>
                                <Button
                                    variant="contained"
                                    size="small"
                                    endIcon={expanded ? <FiChevronUp /> : <FiChevronDown />}
                                    onClick={() => setExpanded((prev) => !prev)}
                                    sx={{
                                        textTransform: "none",
                                        minWidth: 140,
                                        alignSelf: { xs: "stretch", lg: "auto" },
                                    }}
                                >
                                    {expanded
                                        ? t("shipments.shipmentCard.collapse")
                                        : t("shipments.shipmentCard.more")}
                                </Button>
                            </Box>
                        </Stack>
                    </Grid>
                </Grid>

                {expanded && (
                    <>
                        <Divider />
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="subtitle2" fontWeight={700} mb={1}>
                                    {t("shipments.shipmentCard.orderDetails")}
                                </Typography>

                                <Stack spacing={0.75} color="text.secondary">
                                    {data.vehicleType && (
                                        <Typography variant="body2">
                                            <strong>{t("shipments.shipmentCard.vehicleType")}</strong>{" "}
                                            {findLocalizedLabel(lookups?.vehicleType ?? [], data.vehicleType) ||
                                                data.vehicleType}
                                        </Typography>
                                    )}

                                    {data.cargoType && (
                                        <Typography variant="body2">
                                            <strong>{t("shipments.shipmentCard.cargoType")}</strong>{" "}
                                            {findLocalizedLabel(lookups?.cargoTypes ?? [], data.cargoType) ||
                                                data.cargoType}
                                        </Typography>
                                    )}

                                    {data.loadType && data.loadType.length > 0 && (
                                        <Typography variant="body2">
                                            <strong>{t("shipments.shipmentCard.loadType")}</strong>{" "}
                                            {(Array.isArray(data.loadType) ? data.loadType : [data.loadType])
                                                .map((lt) => {
                                                    const lookupLabel = findLocalizedLabel(lookups?.loadType ?? [], lt);
                                                    const loadTypeMap: Record<string, string> = {
                                                        ANY: t("shipments.editDialog.loadTypeAny", "Any"),
                                                        FULL: t("shipments.editDialog.loadTypeFull", "Full"),
                                                        PARTIAL: t("shipments.editDialog.loadTypePartial", "Partial"),
                                                        CONSOLIDATED: t("shipments.editDialog.loadTypeConsolidated", "Consolidated"),
                                                    };
                                                    return lookupLabel !== lt ? lookupLabel : (loadTypeMap[lt] || lt);
                                                })
                                                .join(", ")}
                                        </Typography>
                                    )}

                                    {data.weightT != null && data.weightT > 0 && (
                                        <Typography variant="body2">
                                            <strong>{t("shipments.shipmentCard.weight")}</strong>{" "}
                                            {data.weightT} t
                                        </Typography>
                                    )}

                                    {data.volumeM3 != null && data.volumeM3 > 0 && (
                                        <Typography variant="body2">
                                            <strong>{t("shipments.shipmentCard.volume")}</strong>{" "}
                                            {data.volumeM3} m³
                                        </Typography>
                                    )}

                                    {data.allowPartialLoad != null && (
                                        <Typography variant="body2">
                                            <strong>{t("shipments.shipmentCard.partialLoad")}</strong>{" "}
                                            {data.allowPartialLoad
                                                ? t("shipments.shipmentCard.partialLoadYes")
                                                : t("shipments.shipmentCard.partialLoadNo")}
                                        </Typography>
                                    )}
                                </Stack>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="subtitle2" fontWeight={700} mb={1}>
                                    {t("userReviews.form.routeTitle")}
                                </Typography>

                                <Stack spacing={1.25}>
                                    <Box>
                                        <Typography variant="body2" fontWeight={700} mb={0.5}>
                                            {t("shipments.shipmentCard.load")}
                                        </Typography>

                                        <Stack spacing={0.5}>
                                            {loadPoints.length > 0 ? (
                                                loadPoints.map((point, index) => (
                                                    <Typography
                                                        key={`load-${point.id ?? index}`}
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        {index + 1}. {formatRoute(point, true)}
                                                    </Typography>
                                                ))
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    —
                                                </Typography>
                                            )}
                                        </Stack>
                                    </Box>

                                    <Box>
                                        <Typography variant="body2" fontWeight={700} mb={0.5}>
                                            {t("shipments.shipmentCard.unload")}
                                        </Typography>

                                        <Stack spacing={0.5}>
                                            {unloadPoints.length > 0 ? (
                                                unloadPoints.map((point, index) => (
                                                    <Typography
                                                        key={`unload-${point.id ?? index}`}
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        {index + 1}. {formatRoute(point, true)}
                                                    </Typography>
                                                ))
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    —
                                                </Typography>
                                            )}
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Grid>

                            {data.note && (
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
                                        {t("shipments.shipmentCard.additionalInfo")}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        {data.note}
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </>
                )}
            </Stack>
        </Paper>
    );
}