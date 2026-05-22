import { useState } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Paper, Stack, TextField, Typography } from "@mui/material";
import { useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import type { TenderWorkspaceContext } from "../../tender-workspace/model/types";
import { tendersApi } from "@/shared/api/tendersApi.ts";
import type { UpdateTenderPayload } from "@/entities/tender/model/types";

const toDateTimeInput = (value?: string | null) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
};

const toNullableNumberString = (value: string) => {
    const normalized = value.trim().replace(",", ".");
    if (!normalized) return null;
    const n = Number(normalized);
    return Number.isFinite(n) ? String(n) : null;
};

const toNullableInteger = (value: string) => {
    const normalized = value.trim();
    if (!normalized) return null;
    const n = Number(normalized);
    return Number.isFinite(n) ? Math.max(0, Math.round(n)) : null;
};

export default function TenderSettingsPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { tender, reload, isOwner, ownerCode } = useOutletContext<TenderWorkspaceContext>();
    const [cancelOpen, setCancelOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [blacklistPhone, setBlacklistPhone] = useState("");
    const [busy, setBusy] = useState(false);
    const [editValues, setEditValues] = useState({
        title: tender.title ?? "",
        cargoDescription: tender.cargo_description ?? "",
        pickupDate: tender.pickup_date ?? "",
        dropoffDate: tender.dropoff_date ?? "",
        pickupTime: tender.pickup_time ?? "",
        dropoffTime: tender.dropoff_time ?? "",
        cargoType: tender.cargo_type ?? "",
        vehicleType: tender.vehicle_type ?? "",
        loadingType: tender.loading_type ?? "",
        weightTons: tender.weight_t ?? "",
        volumeM3: tender.volume_m3 ?? "",
        placesCount: tender.places_count == null ? "" : String(tender.places_count),
        vehicleCapacityTons: tender.vehicle_capacity_t ?? "",
        vehicleBodyLengthM: tender.vehicle_body_length_m ?? "",
        startPrice: tender.start_price ?? "",
        buyoutPrice: tender.buyout_price ?? "",
        minBidStep: tender.min_bid_step ?? "",
        startsAt: toDateTimeInput(tender.starts_at),
        endsAt: toDateTimeInput(tender.ends_at),
        phone: tender.phone,
    });

    const canEdit = !tender.has_bids && !tender.bids?.length;

    if (!isOwner) {
        return (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
                {t("tenders.settings.participantReadOnly")}
            </Alert>
        );
    }

    const cancelTender = async () => {
        try {
            setBusy(true);
            await tendersApi.cancel(tender.id);
            toast.success(t("tenders.settings.toast.canceled"));
            navigate("/dashboard/tenders/my");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t("tenders.settings.toast.cancelError"));
        } finally {
            setBusy(false);
            setCancelOpen(false);
        }
    };

    const addBlacklistPhone = async () => {
        if (!blacklistPhone.trim()) {
            toast.warning(t("tenders.settings.validation.phone"));
            return;
        }

        try {
            setBusy(true);
            await tendersApi.addBlacklistPhone({ phone: blacklistPhone.trim(), reason: "Tender blacklist" });
            toast.success(t("tenders.settings.toast.phoneAdded"));
            setBlacklistPhone("");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t("tenders.settings.toast.phoneError"));
        } finally {
            setBusy(false);
        }
    };

    const setEditField = (name: keyof typeof editValues, value: string) => {
        setEditValues((current) => ({ ...current, [name]: value }));
    };

    const saveTender = async () => {
        if (!canEdit) return;

        if (!editValues.title.trim()) {
            toast.warning(t("tenders.settings.validation.title"));
            return;
        }

        if (!editValues.startPrice.trim()) {
            toast.warning(t("tenders.settings.validation.startPrice"));
            return;
        }

        if (!editValues.startsAt || !editValues.endsAt) {
            toast.warning(t("tenders.settings.validation.dates"));
            return;
        }

        if (editValues.endsAt <= editValues.startsAt) {
            toast.warning(t("tenders.settings.validation.dateOrder"));
            return;
        }

        const payload: UpdateTenderPayload = {
            title: editValues.title.trim(),
            cargo_description: editValues.cargoDescription.trim() || null,
            pickup_date: editValues.pickupDate || null,
            dropoff_date: editValues.dropoffDate || null,
            pickup_time: editValues.pickupTime || null,
            dropoff_time: editValues.dropoffTime || null,
            cargo_type: editValues.cargoType || "GENERAL",
            vehicle_type: editValues.vehicleType || "ANY",
            loading_type: editValues.loadingType || null,
            weight_t: toNullableNumberString(editValues.weightTons),
            volume_m3: toNullableNumberString(editValues.volumeM3),
            places_count: toNullableInteger(editValues.placesCount),
            vehicle_capacity_t: toNullableNumberString(editValues.vehicleCapacityTons),
            vehicle_body_length_m: toNullableNumberString(editValues.vehicleBodyLengthM),
            start_price: toNullableNumberString(editValues.startPrice) || "0",
            buyout_price: toNullableNumberString(editValues.buyoutPrice),
            min_bid_step: toNullableNumberString(editValues.minBidStep) || "0",
            starts_at: new Date(editValues.startsAt).toISOString(),
            ends_at: new Date(editValues.endsAt).toISOString(),
            phone: editValues.phone,
        };

        try {
            setBusy(true);
            await tendersApi.update(tender.id, payload);
            toast.success(t("tenders.settings.toast.updated"));
            setEditOpen(false);
            await reload();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t("tenders.settings.toast.updateError"));
        } finally {
            setBusy(false);
        }
    };

    return (
        <Stack spacing={2}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
                <Stack spacing={1}>
                    <Typography variant="h6" fontWeight={800}>{t("tenders.settings.title")}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t("tenders.common.status", { value: tender.status })}
                    </Typography>
                    {!canEdit && (
                        <Alert severity="warning" sx={{ borderRadius: 2 }}>
                            {t("tenders.settings.hasBidsWarning")}
                        </Alert>
                    )}
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                        <Button variant="outlined" disabled={!canEdit} onClick={() => setEditOpen(true)}>
                            {t("tenders.settings.editTerms")}
                        </Button>
                        <Button color="error" variant="outlined" onClick={() => setCancelOpen(true)}>
                            {t("tenders.settings.cancelTender")}
                        </Button>
                    </Stack>
                    {ownerCode && (
                        <Alert severity="success" sx={{ borderRadius: 2 }}>
                            <Typography fontWeight={800}>{t("tenders.bids.winnerCodeTitle")}: {ownerCode}</Typography>
                            <Typography variant="body2">{t("tenders.bids.winnerCodeDescription")}</Typography>
                        </Alert>
                    )}
                </Stack>
            </Paper>

            <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
                <Stack spacing={1.5}>
                    <Typography variant="h6" fontWeight={800}>{t("tenders.settings.blacklist")}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t("tenders.settings.blacklistDescription")}
                    </Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                        <TextField label={t("tenders.settings.phone")} placeholder="+998..." value={blacklistPhone} onChange={(event) => setBlacklistPhone(event.target.value)} fullWidth />
                        <Button variant="outlined" onClick={addBlacklistPhone} disabled={busy} sx={{ minWidth: 180 }}>
                            {t("tenders.common.add")}
                        </Button>
                    </Stack>
                </Stack>
            </Paper>

            <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)}>
                <DialogTitle>{t("tenders.settings.cancelDialogTitle")}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2">
                        {t("tenders.settings.cancelDialogText", { title: tender.title })}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCancelOpen(false)}>{t("tenders.common.back")}</Button>
                    <Button color="error" variant="contained" onClick={cancelTender} disabled={busy}>
                        {busy ? t("tenders.settings.cancelling") : t("tenders.settings.cancelTender")}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="md">
                <DialogTitle>{t("tenders.settings.editDialogTitle")}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                            {t("tenders.settings.editInfo")}
                        </Alert>

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12 }}>
                                <TextField label={t("tenders.fields.title")} value={editValues.title} onChange={(event) => setEditField("title", event.target.value)} fullWidth />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField label={t("tenders.fields.pickupDate")} type="date" InputLabelProps={{ shrink: true }} value={editValues.pickupDate} onChange={(event) => setEditField("pickupDate", event.target.value)} fullWidth />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField label={t("tenders.fields.dropoffDate")} type="date" InputLabelProps={{ shrink: true }} value={editValues.dropoffDate} onChange={(event) => setEditField("dropoffDate", event.target.value)} fullWidth />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField label={t("tenders.fields.pickupTime")} type="time" InputLabelProps={{ shrink: true }} value={editValues.pickupTime} onChange={(event) => setEditField("pickupTime", event.target.value)} fullWidth />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField label={t("tenders.fields.dropoffTime")} type="time" InputLabelProps={{ shrink: true }} value={editValues.dropoffTime} onChange={(event) => setEditField("dropoffTime", event.target.value)} fullWidth />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField label={t("tenders.fields.cargoType")} value={editValues.cargoType} onChange={(event) => setEditField("cargoType", event.target.value)} fullWidth />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField label={t("tenders.fields.vehicleType")} value={editValues.vehicleType} onChange={(event) => setEditField("vehicleType", event.target.value)} fullWidth />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField label={t("tenders.fields.loadingType")} value={editValues.loadingType} onChange={(event) => setEditField("loadingType", event.target.value)} fullWidth />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField label={t("tenders.fields.weightTons")} value={editValues.weightTons} onChange={(event) => setEditField("weightTons", event.target.value)} fullWidth />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField label={t("tenders.fields.volumeM3")} value={editValues.volumeM3} onChange={(event) => setEditField("volumeM3", event.target.value)} fullWidth />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField label={t("tenders.fields.placesCount")} value={editValues.placesCount} onChange={(event) => setEditField("placesCount", event.target.value)} fullWidth />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField label={t("tenders.fields.vehicleCapacityTons")} value={editValues.vehicleCapacityTons} onChange={(event) => setEditField("vehicleCapacityTons", event.target.value)} fullWidth />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField label={t("tenders.fields.vehicleBodyLengthM")} value={editValues.vehicleBodyLengthM} onChange={(event) => setEditField("vehicleBodyLengthM", event.target.value)} fullWidth />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField label={t("tenders.fields.startPrice")} value={editValues.startPrice} onChange={(event) => setEditField("startPrice", event.target.value)} fullWidth />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField label={t("tenders.fields.buyoutPrice")} value={editValues.buyoutPrice} onChange={(event) => setEditField("buyoutPrice", event.target.value)} fullWidth />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField label={t("tenders.fields.minBidStep")} value={editValues.minBidStep} onChange={(event) => setEditField("minBidStep", event.target.value)} fullWidth />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField label={t("forgotPassword.phoneLabel")} value={editValues.phone} onChange={(event) => setEditField("phone", event.target.value)} fullWidth />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField label={t("tenders.fields.startsAt")} type="datetime-local" InputLabelProps={{ shrink: true }} value={editValues.startsAt} onChange={(event) => setEditField("startsAt", event.target.value)} fullWidth />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField label={t("tenders.fields.endsAt")} type="datetime-local" InputLabelProps={{ shrink: true }} value={editValues.endsAt} onChange={(event) => setEditField("endsAt", event.target.value)} fullWidth />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField label={t("tenders.fields.cargoDescription")} value={editValues.cargoDescription} onChange={(event) => setEditField("cargoDescription", event.target.value)} fullWidth multiline minRows={3} />
                            </Grid>
                        </Grid>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)}>{t("tenders.common.cancel")}</Button>
                    <Button variant="contained" onClick={saveTender} disabled={busy || !canEdit}>
                        {busy ? t("tenders.common.saving") : t("tenders.common.save")}
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}
