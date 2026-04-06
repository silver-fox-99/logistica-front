import { useMemo, useState } from "react";
import {
    Box,
    Button,
    Divider,
    Drawer,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import type { ShipmentsKind } from "@/entities/shipment/model/type";

type BulkActionPayload =
    | { action: "raise" }
    | { action: "delete" }
    | {
    action: "update";
    payload: {
        date_from?: string;
        date_to?: string;
        price_amount?: number;
        price_currency?: string;
        bargain?: string | null;
        allow_partial_load?: boolean;
        note?: string | null;
    };
};

type Props = {
    open: boolean;
    kind: ShipmentsKind;
    selectedCount: number;
    onClose: () => void;
    onSubmit: (payload: BulkActionPayload) => Promise<void>;
};

type ActionType = "raise" | "delete" | "update";

export function MyShipmentsBulkActionsDrawer({
                                                 open,
                                                 kind,
                                                 selectedCount,
                                                 onClose,
                                                 onSubmit,
                                             }: Props) {
    const { t } = useTranslation();

    const [action, setAction] = useState<ActionType>("raise");
    const [submitting, setSubmitting] = useState(false);

    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [priceAmount, setPriceAmount] = useState("");
    const [priceCurrency, setPriceCurrency] = useState("USD");
    const [bargain, setBargain] = useState<string>("ALLOWED");
    const [allowPartialLoad, setAllowPartialLoad] = useState(false);
    const [note, setNote] = useState("");

    const title = useMemo(() => {
        return t("shipments.manage.bulkDrawerTitle", {
            count: selectedCount,
            defaultValue: "Bulk actions · {{count}} selected",
        });
    }, [selectedCount, t]);

    const handleSubmit = async () => {
        try {
            setSubmitting(true);

            if (action === "raise") {
                await onSubmit({ action: "raise" });
                toast.success(
                    t("shipments.manage.bulkRaiseSuccess", "Bulk raise completed")
                );
                return;
            }

            if (action === "delete") {
                await onSubmit({ action: "delete" });
                toast.success(
                    t("shipments.manage.bulkDeleteSuccess", "Bulk delete completed")
                );
                return;
            }

            const payload: Record<string, unknown> = {};

            if (dateFrom) payload.date_from = dateFrom;
            if (dateTo) payload.date_to = dateTo;
            if (priceAmount.trim()) payload.price_amount = Number(priceAmount);
            if (priceCurrency.trim()) payload.price_currency = priceCurrency;
            if (kind === "transport") payload.bargain = bargain;
            payload.allow_partial_load = allowPartialLoad;
            if (note.trim()) payload.note = note.trim();

            await onSubmit({
                action: "update",
                payload,
            });

            toast.success(
                t("shipments.manage.bulkUpdateSuccess", "Bulk update completed")
            );
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                t("shipments.manage.bulkActionError", "Bulk action failed")
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box
                sx={{
                    width: { xs: "100vw", sm: 420 },
                    maxWidth: "100%",
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    height: "100%",
                    boxSizing: "border-box",
                }}
            >
                <Box>
                    <Typography variant="h6" fontWeight={800}>
                        {title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                        {t(
                            "shipments.manage.bulkDrawerSubtitle",
                            "Choose an action for selected items. This panel is designed to be extended with new bulk operations."
                        )}
                    </Typography>
                </Box>

                <Divider />

                <FormControl fullWidth>
                    <InputLabel id="bulk-action-label">
                        {t("shipments.manage.actionType", "Action")}
                    </InputLabel>

                    <Select
                        labelId="bulk-action-label"
                        label={t("shipments.manage.actionType", "Action")}
                        value={action}
                        onChange={(event) => setAction(event.target.value as ActionType)}
                    >
                        <MenuItem value="raise">
                            {t("shipments.manage.actions.raise", "Raise selected")}
                        </MenuItem>
                        {/*<MenuItem value="update">*/}
                        {/*    {t("shipments.manage.actions.update", "Bulk update")}*/}
                        {/*</MenuItem>*/}
                        <MenuItem value="delete">
                            {t("shipments.manage.actions.delete", "Delete selected")}
                        </MenuItem>
                    </Select>
                </FormControl>

                {action === "raise" && (
                    <Typography variant="body2" color="text.secondary">
                        {t(
                            "shipments.manage.raiseDescription",
                            "All selected items will be raised."
                        )}
                    </Typography>
                )}

                {action === "delete" && (
                    <Typography variant="body2" color="error.main">
                        {t(
                            "shipments.manage.deleteDescription",
                            "Selected items will be deleted. This action cannot be undone."
                        )}
                    </Typography>
                )}

                {action === "update" && (
                    <Stack spacing={2}>
                        <TextField
                            label={t("shipments.editDialog.loadingDateFrom", "Loading date from")}
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={dateFrom}
                            onChange={(event) => setDateFrom(event.target.value)}
                            fullWidth
                        />

                        <TextField
                            label={t("shipments.editDialog.loadingDateTo", "Unloading date to")}
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={dateTo}
                            onChange={(event) => setDateTo(event.target.value)}
                            fullWidth
                        />

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                            <TextField
                                label={t("shipments.editDialog.priceAmount", "Price amount")}
                                value={priceAmount}
                                onChange={(event) => setPriceAmount(event.target.value)}
                                fullWidth
                            />

                            <TextField
                                label={t("shipments.editDialog.currency", "Currency")}
                                value={priceCurrency}
                                onChange={(event) => setPriceCurrency(event.target.value)}
                                fullWidth
                            />
                        </Stack>

                        {kind === "transport" && (
                            <FormControl fullWidth>
                                <InputLabel id="bulk-bargain-label">
                                    {t("shipments.editDialog.bargain", "Bargain")}
                                </InputLabel>

                                <Select
                                    labelId="bulk-bargain-label"
                                    label={t("shipments.editDialog.bargain", "Bargain")}
                                    value={bargain}
                                    onChange={(event) => setBargain(event.target.value)}
                                >
                                    <MenuItem value="ALLOWED">
                                        {t("shipments.editDialog.bargainAllowed")}
                                    </MenuItem>
                                    <MenuItem value="FORBIDDEN">
                                        {t("shipments.editDialog.bargainForbidden")}
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        )}

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={allowPartialLoad}
                                    onChange={(event) =>
                                        setAllowPartialLoad(event.target.checked)
                                    }
                                />
                            }
                            label={t(
                                "shipments.editDialog.allowPartialLoad",
                                "Allow partial load"
                            )}
                        />

                        <TextField
                            label={t("shipments.editDialog.note", "Note")}
                            value={note}
                            onChange={(event) => setNote(event.target.value)}
                            multiline
                            minRows={3}
                            fullWidth
                        />
                    </Stack>
                )}

                <Box sx={{ flex: 1 }} />

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={onClose}
                        disabled={submitting}
                        sx={{ textTransform: "none" }}
                    >
                        {t("common.close")}
                    </Button>

                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleSubmit}
                        disabled={submitting || selectedCount === 0}
                        sx={{ textTransform: "none" }}
                    >
                        {submitting
                            ? t("common.loading")
                            : t("shipments.confirmDialog.defaultConfirm")}
                    </Button>
                </Stack>
            </Box>
        </Drawer>
    );
}