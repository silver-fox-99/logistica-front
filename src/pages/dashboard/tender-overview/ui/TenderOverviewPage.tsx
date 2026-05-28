import {Box, Chip, Grid, Paper, Stack, Typography} from "@mui/material";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";

import type { TenderWorkspaceContext } from "../../tender-workspace/model/types";
import type { Tender, TenderPoint } from "@/entities/tender/model/types";
import {useUserStore} from "@/entities/user/model/user.store.ts";
import {FiPhoneCall} from "react-icons/fi";
import {useInitStore} from "@/shared/store/initStore.ts";
import {formatPrice} from "@/shared/utils/formatPrice.ts";

function pointLabel(point: TenderPoint, empty: string) {
    return [point.city, point.region, point.country].filter(Boolean).join(", ") || point.display_name || empty;
}

function averageBid(tender: Tender) {
    const amounts = (tender.bids ?? [])
        .map((bid) => Number(bid.amount))
        .filter((amount) => Number.isFinite(amount));

    if (!amounts.length) return null;
    const sum = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    return formatPrice(sum)
}

export default function TenderOverviewPage() {
    const { t, i18n } = useTranslation();
    const { tender } = useOutletContext<TenderWorkspaceContext>();
    const empty = t("tenders.common.empty");

    const getLookup = useInitStore((s) => s.getLookup);

    const lookupLabel = (
        type: Parameters<typeof getLookup>[0],
        slug?: string | null,
    ) => {
        if (!slug) return null;

        const opt = getLookup(type, slug);

        if (!opt) return slug;

        if (i18n.language === "ru") return opt.label_ru || opt.label;
        if (i18n.language === "uz") return opt.label_uz || opt.label;

        return opt.label;
    };

    const fmtDate = (value?: string | null) =>
        value
            ? new Date(value).toLocaleString(i18n.language, {
                dateStyle: "medium",
                timeStyle: "short",
                hour12: false,
            })
            : empty;

    const user = useUserStore((s) => s.user);

    const canSeeTenderPhone =
        user?.id === tender.owner_id ||
        user?.id === tender.current_winner_id ||
        user?.id === tender.confirmed_winner_id;

    const pickups = tender.points?.filter((point) => point.type === "PICKUP") ?? [];
    const dropoffs = tender.points?.filter((point) => point.type === "DROPOFF") ?? [];
    const bids = tender.bids ?? [];
    const avg = averageBid(tender);
    const finalPrice = tender.final_price ? Number(tender.final_price) : null;
    const startPrice = Number(tender.start_price);
    const economy = finalPrice && Number.isFinite(startPrice) ? startPrice - finalPrice : null;

    const hasValue = (value: unknown) => {
        if (value === null || value === undefined) return false;
        if (typeof value === "string" && !value.trim()) return false;
        return true;
    };

    const fmtBool = (value?: boolean | null) =>
        value ? t("tenders.common.yes", "Yes") : t("tenders.common.no", "No");

    const fmtMoney = (value?: string | null) =>
        hasValue(value) ? `${value} ${tender.currency}` : empty;

    const terms = [
        {
            label: t("tenders.overview.cargo", "Cargo type"),
            value: lookupLabel("cargoTypes", tender.cargo_type),
        },
        {
            label: t("tenders.fields.cargoDescription", "Cargo description"),
            value: tender.cargo_description,
            size: { xs: 12 },
        },
        {
            label: t("tenders.fields.weightTons", "Weight"),
            value: hasValue(tender.weight_t) ? `${tender.weight_t} t` : null,
        },
        {
            label: t("tenders.fields.volumeM3", "Volume"),
            value: hasValue(tender.volume_m3) ? `${tender.volume_m3} m³` : null,
        },
        {
            label: t("tenders.fields.placesCount", "Places count"),
            value: tender.places_count,
        },
        {
            label: t("tenders.fields.temperatureMode", "Temperature mode"),
            value: tender.temperature_mode,
        },
        {
            label: t("tenders.fields.packagingType", "Packaging type"),
            value: tender.packaging_type,
        },
        {
            label: t("tenders.overview.transport", "Vehicle type"),
            value: lookupLabel("vehicleType", tender.vehicle_type),
        },
        {
            label: t("tenders.fields.vehicleBodyLengthM", "Body length"),
            value: hasValue(tender.vehicle_body_length_m)
                ? `${tender.vehicle_body_length_m} m`
                : null,
        },
        {
            label: t("tenders.overview.loadingType", "Loading type"),
            value: lookupLabel("loadType", tender.loading_type),
        },
        {
            label: t("tenders.create.adr", "ADR required"),
            value: fmtBool(tender.adr_required),
        },
        {
            label: t("tenders.create.hydraulicTailLiftRequired", "Hydraulic tail lift required"),
            value: fmtBool(tender.hydraulic_tail_lift_required),
        },
        {
            label: t("tenders.fields.pickupDate", "Pickup date"),
            value: tender.pickup_date,
        },
        {
            label: t("tenders.fields.pickupTime", "Pickup time"),
            value: tender.pickup_time,
        },
        {
            label: t("tenders.fields.dropoffDate", "Dropoff date"),
            value: tender.dropoff_date,
        },
        {
            label: t("tenders.fields.dropoffTime", "Dropoff time"),
            value: tender.dropoff_time,
        },
        {
            label: t("tenders.fields.startsAt", "Tender starts at"),
            value: fmtDate(tender.starts_at),
        },
        {
            label: t("tenders.fields.endsAt", "Tender ends at"),
            value: fmtDate(tender.ends_at),
        },
        {
            label: t("tenders.fields.auctionType", "Auction type"),
            value: tender.auction_type === "DECREASING"
                ? t("tenders.list.decreasing", "Decreasing")
                : t("tenders.list.increasing", "Increasing"),
        },
        {
            label: t("tenders.overview.startPrice", "Start price"),
            value: fmtMoney(formatPrice(tender.start_price)),
        },
        {
            label: t("tenders.overview.buyoutPrice", "Buyout price"),
            value: fmtMoney(formatPrice(tender.buyout_price)),
        },
        {
            label: t("tenders.fields.minBidStep", "Min bid step"),
            value: fmtMoney(formatPrice(tender.min_bid_step)),
        },
        {
            label: t("tenders.fields.paymentMethod", "Payment method"),
            value: lookupLabel("paymentMethods", tender.payment_method),
        },
        {
            label: t("tenders.fields.paymentTerm", "Payment term"),
            value: lookupLabel("paymentTerms", tender.payment_term),
        },
        {
            label: t("tenders.fields.paymentDefermentDays", "Payment deferment"),
            value: hasValue(tender.payment_deferment_days)
                ? `${tender.payment_deferment_days} ${t("tenders.common.days", "days")}`
                : null,
        },
        {
            label: t("tenders.fields.vatType", "VAT type"),
            value: tender.vat_type,
        },
        {
            label: t("tenders.fields.vehicleDataTransferMethod", "Vehicle data transfer method"),
            value: tender.vehicle_data_transfer_method,
            size: { xs: 12, md: 6 },
        },
        {
            label: t("tenders.fields.customsClearancePoint", "Customs clearance point"),
            value: tender.customs_clearance_point,
            size: { xs: 12, md: 6 },
        },
        {
            label: t("tenders.fields.customsDischargePoint", "Customs discharge point"),
            value: tender.customs_discharge_point,
            size: { xs: 12, md: 6 },
        },
        {
            label: t("tenders.fields.borderCrossingPoint", "Border crossing point"),
            value: tender.border_crossing_point,
            size: { xs: 12, md: 6 },
        },
        {
            label: t("tenders.fields.carrierDocuments", "Carrier documents"),
            value: tender.carrier_documents,
            size: { xs: 12 },
        },
    ].filter((item) => hasValue(item.value));

    return (
        <Stack spacing={2}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
                        <Typography variant="caption" color="text.secondary">{t("tenders.overview.participants")}</Typography>
                        <Typography variant="h5" fontWeight={800}>{bids.length}</Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
                        <Typography variant="caption" color="text.secondary">{t("tenders.overview.averageBid")}</Typography>
                        <Typography variant="h5" fontWeight={800}>
                            {avg == null ? empty : `${avg} ${tender.currency}`}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
                        <Typography variant="caption" color="text.secondary">{t("tenders.overview.economy")}</Typography>
                        <Typography variant="h5" fontWeight={800}>
                            {economy == null ? empty : `${formatPrice(economy)} ${tender.currency}`}
                        </Typography>

                    </Paper>
                </Grid>

                {canSeeTenderPhone && tender.phone && (
                    <Grid size={{ xs: 12 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                border: "1px solid",
                                borderColor: "success.light",
                                bgcolor: "rgba(46, 125, 50, 0.04)",
                            }}
                        >
                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                justifyContent="space-between"
                                alignItems={{ xs: "flex-start", sm: "center" }}
                                spacing={1.5}
                            >
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 1,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            bgcolor: "success.main",
                                            color: "common.white",
                                        }}
                                    >
                                        <FiPhoneCall size={20} />
                                    </Box>

                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            {t("tenders.overview.phone")}
                                        </Typography>
                                        <Typography variant="h6" fontWeight={800}>
                                            {tender.phone}
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Chip
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                    label={
                                        user?.id === tender.owner_id
                                            ? t("tenders.common.owner")
                                            : t("tenders.common.winner")
                                    }
                                />
                            </Stack>
                        </Paper>
                    </Grid>
                )}
            </Grid>

            <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
                <Stack spacing={2}>
                    <Typography variant="h6" fontWeight={800}>{t("tenders.overview.route")}</Typography>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Stack spacing={1}>
                                <Typography variant="subtitle2">{t("tenders.overview.pickup")}</Typography>
                                {pickups.map((point, index) => (
                                    <Chip key={point.id ?? index} label={pointLabel(point, empty)} sx={{ justifyContent: "flex-start" }} />
                                ))}
                            </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Stack spacing={1}>
                                <Typography variant="subtitle2">{t("tenders.overview.dropoff")}</Typography>
                                {dropoffs.map((point, index) => (
                                    <Chip key={point.id ?? index} label={pointLabel(point, empty)} sx={{ justifyContent: "flex-start" }} />
                                ))}
                            </Stack>
                        </Grid>
                    </Grid>
                </Stack>
            </Paper>

            <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
                <Stack spacing={2}>
                    <Box>
                        <Typography variant="h6" fontWeight={800}>
                            {t("tenders.overview.terms")}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            {t(
                                "tenders.overview.termsDescription",
                                "Main cargo, vehicle, payment and tender conditions",
                            )}
                        </Typography>
                    </Box>

                    <Grid container spacing={2}>
                        {terms.map((item) => (
                            <Grid key={item.label} size={item.size ?? { xs: 6, md: 3 }}>
                                <Typography variant="caption" color="text.secondary">
                                    {item.label}
                                </Typography>

                                <Typography fontWeight={600}>
                                    {item.value}
                                </Typography>
                            </Grid>
                        ))}
                    </Grid>
                </Stack>
            </Paper>
        </Stack>
    );
}
