import {Box, Chip, Grid, Paper, Stack, Typography} from "@mui/material";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";

import type { TenderWorkspaceContext } from "../../tender-workspace/model/types";
import type { Tender, TenderPoint } from "@/entities/tender/model/types";
import {useUserStore} from "@/entities/user/model/user.store.ts";
import {FiPhoneCall} from "react-icons/fi";

function pointLabel(point: TenderPoint, empty: string) {
    return [point.city, point.region, point.country].filter(Boolean).join(", ") || point.display_name || empty;
}

function averageBid(tender: Tender) {
    const amounts = (tender.bids ?? [])
        .map((bid) => Number(bid.amount))
        .filter((amount) => Number.isFinite(amount));

    if (!amounts.length) return null;
    return amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
}

export default function TenderOverviewPage() {
    const { t, i18n } = useTranslation();
    const { tender } = useOutletContext<TenderWorkspaceContext>();
    const empty = t("tenders.common.empty");
    const fmt = (value?: string | null) => value || empty;
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
                            {avg == null ? empty : `${avg.toFixed(2)} ${tender.currency}`}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
                        <Typography variant="caption" color="text.secondary">{t("tenders.overview.economy")}</Typography>
                        <Typography variant="h5" fontWeight={800}>
                            {economy == null ? empty : `${economy.toFixed(2)} ${tender.currency}`}
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
                    <Typography variant="h6" fontWeight={800}>{t("tenders.overview.terms")}</Typography>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <Typography variant="caption" color="text.secondary">{t("tenders.overview.cargo")}</Typography>
                            <Typography>{fmt(tender.cargo_type)}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <Typography variant="caption" color="text.secondary">{t("tenders.overview.weightVolume")}</Typography>
                            <Typography>{fmt(tender.weight_t)} t / {fmt(tender.volume_m3)} m3</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <Typography variant="caption" color="text.secondary">{t("tenders.overview.transport")}</Typography>
                            <Typography>{fmt(tender.vehicle_type)}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <Typography variant="caption" color="text.secondary">{t("tenders.overview.loadingType")}</Typography>
                            <Typography>{fmt(tender.loading_type)}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <Typography variant="caption" color="text.secondary">{t("tenders.overview.startsAt")}</Typography>
                            <Typography>{fmtDate(tender.starts_at)}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <Typography variant="caption" color="text.secondary">{t("tenders.overview.endsAt")}</Typography>
                            <Typography>{fmtDate(tender.ends_at)}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <Typography variant="caption" color="text.secondary">{t("tenders.overview.startPrice")}</Typography>
                            <Typography>{tender.start_price} {tender.currency}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <Typography variant="caption" color="text.secondary">{t("tenders.overview.buyoutPrice")}</Typography>
                            <Typography>{fmt(tender.buyout_price)} {tender.buyout_price ? tender.currency : ""}</Typography>
                        </Grid>
                    </Grid>

                    {tender.cargo_description && (
                        <Typography variant="body2" color="text.secondary">
                            {tender.cargo_description}
                        </Typography>
                    )}
                </Stack>
            </Paper>
        </Stack>
    );
}
