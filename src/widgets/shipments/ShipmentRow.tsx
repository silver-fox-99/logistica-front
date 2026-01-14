import { useState, useEffect, useMemo, useCallback, forwardRef, type ReactElement, type Ref } from "react";
import {
    Box, Stack, Chip, Typography, IconButton, Button, Tooltip, Divider,
    Dialog, DialogTitle, DialogContent, DialogActions, Slide, CircularProgress
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
    FiClock, FiMapPin, FiPackage, FiTruck,
    FiRepeat, FiTrash2, FiEdit2, FiCopy, FiChevronDown, FiChevronUp, FiMail, FiUser, FiPhone, FiStar
} from "react-icons/fi";
import { useTranslation, type TFunction } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";

import type {ShipmentRowData, ShipmentsKind, GeoPoint} from "@/entities/shipment/model/type";
import { adaptCargo, adaptTransport } from "@/entities/shipment/lib/adapter";
import { useLocalizedLookup } from "@/shared/utils/lookupUtils";
import { useInitStore } from "@/shared/store/initStore";
import "./ShipmentRow.scss";
import {cargoApi} from "@/shared/api/cargoApi.ts";
import {transportApi} from "@/shared/api/transportApi.ts";
import { favoritesApi } from "@/shared/api/favoritesApi";
import { formatDate } from "@/shared/utils/formatDate";
import type { TransitionProps } from "@mui/material/transitions";

const DetailsTransition = forwardRef(function DetailsTransition(
    props: TransitionProps & { children: ReactElement },
    ref: Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

type ShipmentDetailsContentProps = {
    data: ShipmentRowData;
    scope: "public" | "my";
    lookups: ReturnType<typeof useInitStore>["lookups"];
    findLocalizedLabel: ReturnType<typeof useLocalizedLookup>["findLocalizedLabel"];
    t: TFunction;
    showActions?: boolean;
    onUp?: (id: string) => void;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    onCopy?: (id: string) => void;
};

function ShipmentDetailsContent({
                                    data,
                                    scope,
                                    lookups,
                                    findLocalizedLabel,
                                    t,
                                    showActions = true,
                                    onUp,
                                    onEdit,
                                    onDelete,
                                    onCopy,
                                }: ShipmentDetailsContentProps) {
    return (
        <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" fontWeight={600} mb={1}>
                    {t('shipments.shipmentCard.contactInfo')}
                </Typography>
                <Stack spacing={1} color="text.secondary">
                    {data.contact?.name && (
                        <Stack direction="row" spacing={1} alignItems="center">
                            <FiUser />
                            {data.contact.userId ? (
                                <Typography
                                    component={RouterLink}
                                    to={`/dashboard/user-reviews?search=${data.contact.userId}`}
                                    sx={{ textDecoration: "none", color: "inherit" }}
                                >
                                    {data.contact.name}
                                </Typography>
                            ) : (
                                <Typography>{data.contact.name}</Typography>
                            )}
                        </Stack>
                    )}
                    {data.contact?.email && (
                        <Stack direction="row" spacing={1} alignItems="center">
                            <FiMail />
                            <Typography>{data.contact.email}</Typography>
                        </Stack>
                    )}
                    {!data?.extraPhoneAsMain && data.contact?.phone1 && (
                        <Stack direction="row" spacing={1} alignItems="center">
                            <FiPhone />
                            <Typography>{data.contact.phone1}</Typography>
                        </Stack>
                    )}
                    {!data?.extraPhoneAsMain && data.contact?.phone2 && (
                        <Stack direction="row" spacing={1} alignItems="center">
                            <FiPhone />
                            <Typography>{data.contact.phone2}</Typography>
                        </Stack>
                    )}
                    {data.contactExtraPhone && (
                        <Stack direction="row" spacing={1} alignItems="center">
                            <FiPhone />
                            <Typography>{!data?.extraPhoneAsMain ? t('shipments.shipmentCard.additionalPhone') : null} {data.contactExtraPhone}</Typography>
                        </Stack>
                    )}
                    {data.contact?.telegram && <Typography>{data.contact.telegram}</Typography>}
                </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" fontWeight={600} mb={1}>
                    {t('shipments.shipmentCard.orderDetails')}
                </Typography>
                <Stack spacing={0.75} color="text.secondary">
                    {data.vehicleType && (
                        <Typography variant="body2">
                            <strong>{t('shipments.shipmentCard.vehicleType')}</strong> {findLocalizedLabel(lookups?.vehicleType ?? [], data.vehicleType) || data.vehicleType}
                        </Typography>
                    )}
                    {data.cargoType && (
                        <Typography variant="body2">
                            <strong>{t('shipments.shipmentCard.cargoType')}</strong> {findLocalizedLabel(lookups?.cargoTypes ?? [], data.cargoType) || data.cargoType}
                        </Typography>
                    )}
                    {data.loadType && data.loadType.length > 0 && (
                        <Typography variant="body2">
                            <strong>{t('shipments.shipmentCard.loadType')}</strong> {
                                (() => {
                                    const loadTypeArray = Array.isArray(data.loadType) ? data.loadType : [data.loadType];
                                    const loadTypeMap: Record<string, string> = {
                                        "ANY": t('shipments.editDialog.loadTypeAny'),
                                        "FULL": t('shipments.editDialog.loadTypeFull'),
                                        "PARTIAL": t('shipments.editDialog.loadTypePartial'),
                                        "CONSOLIDATED": t('shipments.editDialog.loadTypeConsolidated')
                                    };
                                    return loadTypeArray.map(lt => {
                                        const lookupLabel = findLocalizedLabel(lookups?.loadType ?? [], lt);
                                        return lookupLabel !== lt ? lookupLabel : (loadTypeMap[lt] || lt);
                                    }).join(', ');
                                })()
                            }
                        </Typography>
                    )}
                    {data.carsCount != null && data.carsCount > 0 && (
                        <Typography variant="body2">
                            <strong>{t('shipments.shipmentCard.carsCount')}</strong> {data.carsCount}
                        </Typography>
                    )}
                    {data.palletsCount != null && data.palletsCount > 0 && (
                        <Typography variant="body2">
                            <strong>{t('shipments.shipmentCard.palletsCount')}</strong> {data.palletsCount}
                        </Typography>
                    )}
                    {data.weightT != null && data.weightT > 0 && (
                        <Typography variant="body2">
                            <strong>{t('shipments.shipmentCard.weight')}</strong> {data.weightT} т
                        </Typography>
                    )}
                    {data.volumeM3 != null && data.volumeM3 > 0 && (
                        <Typography variant="body2">
                            <strong>{t('shipments.shipmentCard.volume')}</strong> {data.volumeM3} м³
                        </Typography>
                    )}
                    {data.allowPartialLoad != null && (
                        <Typography variant="body2">
                            <strong>{t('shipments.shipmentCard.partialLoad')}</strong> {data.allowPartialLoad ? t('shipments.shipmentCard.partialLoadYes') : t('shipments.shipmentCard.partialLoadNo')}
                        </Typography>
                    )}
                    {data.paymentTerm && (
                        <Typography variant="body2">
                            <strong>{t('shipments.shipmentCard.paymentTerm')}</strong> {findLocalizedLabel(lookups?.paymentTerms ?? [], data.paymentTerm) || data.paymentTerm}
                        </Typography>
                    )}
                    {data.bargain && (
                        <Typography variant="body2">
                            <strong>{t('shipments.shipmentCard.bargain')}</strong> {data.bargain === "ALLOWED" ? t('shipments.shipmentCard.bargainAllowed') : t('shipments.shipmentCard.bargainNotAllowed')}
                        </Typography>
                    )}
                </Stack>
            </Grid>

            {data.note && (
                <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
                        {t('shipments.shipmentCard.additionalInfo')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {data.note}
                    </Typography>
                </Grid>
            )}

            {showActions && scope === "my" && (
                <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 1 }} />
                    <Stack
                        direction="row"
                        spacing={1}
                        justifyContent={{ xs: "flex-start", md: "flex-end" }}
                    >
                        <Tooltip title={t('shipments.shipmentCard.raiseUp')}>
                            <IconButton onClick={() => onUp?.(data.id)}>
                                <FiRepeat />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('shipments.shipmentCard.edit')}>
                            <IconButton onClick={() => onEdit?.(data.id)}>
                                <FiEdit2 />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('shipments.shipmentCard.copy')}>
                            <IconButton onClick={() => onCopy?.(data.id)}>
                                <FiCopy />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('shipments.shipmentCard.delete')}>
                            <IconButton color="error" onClick={() => onDelete?.(data.id)}>
                                <FiTrash2 />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Grid>
            )}
        </Grid>
    );
}

type ShipmentDetailsModalProps = {
    open: boolean;
    onClose: () => void;
    data: ShipmentRowData | null;
    kind: ShipmentsKind;
    lookups: ReturnType<typeof useInitStore>["lookups"];
    findLocalizedLabel: ReturnType<typeof useLocalizedLookup>["findLocalizedLabel"];
    t: TFunction;
    loading: boolean;
};

function ShipmentDetailsModal({
                                   open,
                                   onClose,
                                   data,
                                   kind,
                                   lookups,
                                   findLocalizedLabel,
                                   t,
                                   loading,
                               }: ShipmentDetailsModalProps) {
    const title = `${t('shipments.shipmentCard.orderDetailsTitle', 'Детали заявки')} · ${kind === "cargo" ? t('shipments.shipmentCard.cargo') : t('shipments.shipmentCard.transport')}`;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            TransitionComponent={DetailsTransition}
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent dividers>
                {loading ? (
                    <Stack alignItems="center" justifyContent="center" sx={{ py: 4 }}>
                        <CircularProgress />
                    </Stack>
                ) : data ? (
                    <ShipmentDetailsContent
                        data={data}
                        scope="public"
                        lookups={lookups}
                        findLocalizedLabel={findLocalizedLabel}
                        t={t}
                        showActions={false}
                    />
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        {t('shipments.messages.orderDetailsEmpty', 'Нет данных для отображения')}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('common.close', 'Закрыть')}</Button>
            </DialogActions>
        </Dialog>
    );
}

type Props = {
    data: ShipmentRowData;
    scope: "public" | "my";
    onMoreOpen?: (id: string) => void;
    kind: ShipmentsKind;
    favoriteIds?: Set<string>;
    onFavoriteChange?: (id: string, isFavorite: boolean) => void;
    /** Экшены для scope="my" */
    onUp?: (id: string) => void;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    onCopy?: (id: string) => void;
    mobileLayout?: "column" | "row";
};

export default function ShipmentRow({
                                        data, kind, onMoreOpen, scope, favoriteIds, onFavoriteChange, onUp, onEdit, onDelete, onCopy, mobileLayout = "column"
                                    }: Props) {
    const { t, i18n } = useTranslation();
    const { findLocalizedLabel } = useLocalizedLookup();
    const { lookups, loadInit } = useInitStore();
    const [expanded, setExpanded] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [detailsData, setDetailsData] = useState<ShipmentRowData | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const formatRoute = useCallback((point?: GeoPoint) => {
        if (!point) return "—";
        const parts: string[] = [];
        
        const lang = i18n.resolvedLanguage || i18n.language || "uz";
        
        const getLocalized = (base?: string | null, ru?: string | null, uz?: string | null) => {
            if (!base) return null;
            if (lang === "ru" && ru) return ru;
            if (lang === "uz" && uz) return uz;
            return base;
        };
        
        const country = getLocalized(point.country, point.country_ru, point.country_uz);
        if (country) parts.push(country);
        
        const region = getLocalized(point.region, point.region_ru, point.region_uz);
        if (region) parts.push(region);
        
        const city = getLocalized(point.city, point.city_ru, point.city_uz);
        if (city) parts.push(city);
        
        return parts.length > 0 ? parts.join(", ") : "—";
    }, [i18n.resolvedLanguage, i18n.language]);
    
    const routeFrom = useMemo(() => {
        const pickup = data.points?.find(item => item.type === "PICKUP") ?? data.points?.[0];
        if (pickup) return formatRoute(pickup);
        return data.routeFrom || "—";
    }, [data.points, data.routeFrom, formatRoute]);
    
    const routeTo = useMemo(() => {
        const drop = data.points?.find(item => item.type === "DROPOFF") ?? data.points?.[data.points.length - 1];
        if (drop) return formatRoute(drop);
        return data.routeTo || "—";
    }, [data.points, data.routeTo, formatRoute]);

    useEffect(() => {
        loadInit();
    }, [loadInit]);

    useEffect(() => {
        if (scope === "public") {
            if (favoriteIds) {
                setIsFavorite(favoriteIds.has(data.id));
            } else {
                setIsFavorite(!!data.isFavorite);
            }
        } else {
            setIsFavorite(false);
        }
    }, [scope, data.id, favoriteIds, data.isFavorite, kind]);

    const handleToggleFavorite = async () => {
        if (scope !== "public") return;
        setFavoriteLoading(true);
        try {
            if (isFavorite) {
                const confirmed = window.confirm(t("shipments.favorites.confirmRemove", "Удалить из избранного?"));
                if (!confirmed) {
                    setFavoriteLoading(false);
                    return;
                }
                await favoritesApi.remove(kind, data.id);
                setIsFavorite(false);
                onFavoriteChange?.(data.id, false);
                toast.success(t("shipments.favorites.removed"));
            } else {
                await favoritesApi.add(kind, data.id);
                setIsFavorite(true);
                onFavoriteChange?.(data.id, true);
                toast.success(t("shipments.favorites.added"));
            }
        } catch (error: any) {
            const message = error?.response?.data?.message;
            const status = error?.response?.status;
            // если сервер не вернул ошибку, не тревожим юзера
            if (message || (status && status >= 400)) {
                toast.error(message || t('shipments.favorites.error'));
            }
        } finally {
            setFavoriteLoading(false);
        }
    };

    const openDetailsModal = async () => {
        if (detailsLoading) return;
        setDetailsLoading(true);
        try {
            const resp = kind === "cargo" ? await cargoApi.info(data.id) : await transportApi.info(data.id);
            const payload = (resp as any)?.data ?? resp;
            if (!payload) {
                throw new Error(t('shipments.messages.orderDetailsError', 'Не удалось открыть детали'));
            }
            const adapted = kind === "cargo" ? adaptCargo(payload as any) : adaptTransport(payload as any);
            setDetailsData(adapted);
            setDetailsOpen(true);
            onMoreOpen?.(data.id);
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || t('shipments.messages.orderDetailsError', 'Лимит просмотра деталей исчерпан');
            toast.error(message);
        } finally {
            setDetailsLoading(false);
        }
    };

    const openMore = () => {
        if (scope === "public") {
            void openDetailsModal();
            return;
        }
        if (!expanded) {
            onMoreOpen?.(data.id);
        }
        setExpanded((s) => !s);
    };

    return (
        <>
            <Box
                sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider", bgcolor: "background.paper", width: "100%", maxWidth: "100%", overflow: "hidden", boxSizing: "border-box" }}
                className="shipment-row"
            >
            <Grid container spacing={0} alignItems="center" sx={{ width: "100%", margin: 0 }}>
                {/* ЛЕВАЯ КОЛОНКА */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Stack spacing={1}>
                        <Stack 
                            direction="row" 
                            spacing={1.5} 
                            alignItems="center"
                            sx={{ 
                                flexWrap: { xs: "wrap", md: "nowrap" }
                            }}
                        >
                            <Box display="inline-flex" alignItems="center" gap={0.75} sx={{ minWidth: 0, flexShrink: 0 }}>
                                <FiMapPin />
                                <Tooltip title={routeFrom}>
                                    <Typography fontWeight={700} noWrap sx={{ maxWidth: { xs: 180, md: 300 } }}>
                                        {routeFrom}
                                    </Typography>
                                </Tooltip>
                            </Box>
                            <Typography color="text.secondary" sx={{ flexShrink: 0 }}>→</Typography>
                            <Box display="inline-flex" alignItems="center" gap={0.75} sx={{ minWidth: 0, flexShrink: 0 }}>
                                <FiMapPin />
                                <Tooltip title={routeTo}>
                                    <Typography fontWeight={700} noWrap sx={{ maxWidth: { xs: 180, md: 300 } }}>
                                        {routeTo}
                                    </Typography>
                                </Tooltip>
                            </Box>

                        </Stack>

                        {/* Тип карточки и даты */}
                        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                            <Chip
                                size="small"
                                icon={kind === "cargo" ? <FiPackage /> : <FiTruck />}
                                label={
                                    kind === "cargo"
                                        ? t('shipments.shipmentCard.cargo')
                                        : `${t('shipments.shipmentCard.transport')}${
                                            data.vehicleType
                                                ? `: ${findLocalizedLabel(lookups?.vehicleType ?? [], data.vehicleType) || data.vehicleType}`
                                                : ""
                                        }`
                                }
                                className={`shipment-row__chip ${kind === "cargo" ? "shipment-row__chip--cargo" : "shipment-row__chip--transport"}`}
                            />
                            <Chip
                                size="small"
                                icon={<FiClock />}
                                variant="outlined"
                                label={
                                    data.dates.to
                                        ? `${formatDate(data.dates.from)} – ${formatDate(data.dates.to)}`
                                        : formatDate(data.dates.from)
                                }
                                className="shipment-row__chip shipment-row__chip--dates"
                            />

                        </Stack>

                        <Stack spacing={1}>
                            <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                                {data.distanceKm > 0 && (
                                    <Chip
                                        size="small"
                                        color="primary"
                                        label={`${data.distanceKm} km`}
                                        className="shipment-row__chip shipment-row__chip--distance"
                                    />
                                )}
                                {data.dims && (
                                    <Chip
                                        size="small"
                                        variant="outlined"
                                        icon={<FiPackage />}
                                        label={data.dims}
                                        className="shipment-row__chip shipment-row__chip--dimensions"
                                    />
                                )}
                            </Stack>

                            <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                                {data.typeTags.map((t) => (
                                    <Chip
                                        key={t}
                                        size="small"
                                        variant="outlined"
                                        label={t}
                                        className="shipment-row__chip shipment-row__chip--type"
                                    />
                                ))}
                            </Stack>
                        </Stack>

                        {!!data.badges?.length && (
                            <Stack direction="row" spacing={1} flexWrap="wrap" className="shipment-row__badges">
                                {data.badges.map((b) => (
                                    <Chip
                                        key={b}
                                        size="small"
                                        label={b}
                                        className="shipment-row__chip shipment-row__chip--badge"
                                    />
                                ))}
                            </Stack>
                        )}
                    </Stack>
                </Grid>

                {/* ПРАВАЯ КОЛОНКА */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Stack
                        direction={{ xs: mobileLayout, md: "column" }}
                        spacing={1}
                        alignItems={{ xs: mobileLayout === "column" ? "flex-start" : "flex-start", md: "flex-end" }}
                        justifyContent={{ xs: mobileLayout === "column" ? "flex-start" : "space-between", md: "flex-start" }}
                    >
                        <Stack 
                            direction={{ xs: mobileLayout === "column" ? "column" : "row", md: "row" }} 
                            spacing={1} 
                            alignItems={{ xs: mobileLayout === "column" ? "flex-start" : "center", md: "center" }} 
                            flexWrap="wrap" 
                            justifyContent={{ xs: mobileLayout === "column" ? "flex-start" : "flex-end", md: "flex-end" }}
                            sx={{ width: { xs: mobileLayout === "column" ? "100%" : "auto", md: "auto" } }}
                        >
                            {typeof data.repeats === "number" && data.repeats > 0 && (
                                <Chip
                                    size="small"
                                    label={`${t('shipments.shipmentCard.repeats')} ${data.repeats}`}
                                    className="shipment-row__chip shipment-row__chip--repeats"
                                />
                            )}
                            {typeof data.views === "number" && data.views > 0 && (
                                <Chip
                                    size="small"
                                    label={`${t('shipments.shipmentCard.views')} ${data.views}`}
                                    className="shipment-row__chip shipment-row__chip--views"
                                />
                            )}
                        </Stack>

                        <Stack 
                            direction={{ xs: mobileLayout === "column" ? "column" : "row", md: "row" }} 
                            spacing={1} 
                            alignItems={{ xs: mobileLayout === "column" ? "flex-start" : "center", md: "center" }} 
                            flexWrap="wrap"
                            sx={{ width: { xs: mobileLayout === "column" ? "100%" : "auto", md: "auto" } }}
                        >
                            {data.paymentType && (
                                <Chip
                                    size="small"
                                    color="success"
                                    label={data.paymentType}
                                    className="shipment-row__chip shipment-row__chip--payment"
                                />
                            )}
                            {data.price && (
                                <Chip
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                    label={data.price}
                                    className="shipment-row__chip shipment-row__chip--price"
                                />
                            )}
                            {data.pricePerKm && (
                                <Typography variant="caption" color="text.secondary" className="shipment-row__price-per-km">
                                    {data.pricePerKm}
                                </Typography>
                            )}
                        </Stack>

                        <Stack 
                            direction={{ xs: mobileLayout === "column" ? "column" : "row", md: "row" }} 
                            spacing={1} 
                            alignItems={{ xs: mobileLayout === "column" ? "flex-start" : "center", md: "center" }}
                            sx={{ width: { xs: mobileLayout === "column" ? "100%" : "auto", md: "auto" } }}
                        >
                            {scope === "public" && (
                                <Tooltip title={isFavorite ? t('shipments.favorites.remove') : t('shipments.favorites.add')}>
                                    <IconButton
                                        onClick={handleToggleFavorite}
                                        disabled={favoriteLoading}
                                        sx={{
                                            color: isFavorite ? "#ff9800" : "inherit",
                                            "&:hover": { color: "#ff9800" }
                                        }}
                                    >
                                        <FiStar fill={isFavorite ? "#ff9800" : "none"} />
                                    </IconButton>
                                </Tooltip>
                            )}
                            <Button
                                size="small"
                                variant="contained"
                                onClick={openMore}
                                disabled={scope === "public" && detailsLoading}
                                endIcon={
                                    scope === "public"
                                        ? (detailsLoading ? <CircularProgress size={16} color="inherit" /> : <FiChevronDown />)
                                        : (expanded ? <FiChevronUp /> : <FiChevronDown />)
                                }
                                sx={{ textTransform: "none", width: { xs: mobileLayout === "column" ? "100%" : "auto", md: "auto" } }}
                            >
                                {scope === "public"
                                    ? t('shipments.shipmentCard.more')
                                    : (expanded ? t('shipments.shipmentCard.collapse') : t('shipments.shipmentCard.more'))}
                            </Button>
                        </Stack>

                        {data.timeAgo && (
                            <Typography variant="caption" color="text.secondary">
                                {data.timeAgo}
                            </Typography>
                        )}
                    </Stack>
                </Grid>
            </Grid>

            {expanded && (
                <>
                    <Divider sx={{ my: 1.5 }} />
                    <ShipmentDetailsContent
                        data={data}
                        scope={scope}
                        lookups={lookups}
                        findLocalizedLabel={findLocalizedLabel}
                        t={t}
                        onUp={onUp}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onCopy={onCopy}
                    />
                </>
            )}
            </Box>

            <ShipmentDetailsModal
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                data={detailsData}
                kind={kind}
                lookups={lookups}
                findLocalizedLabel={findLocalizedLabel}
                t={t}
                loading={detailsLoading}
            />
        </>
    );
}
