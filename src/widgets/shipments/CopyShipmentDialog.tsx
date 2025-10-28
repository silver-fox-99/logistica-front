import { useEffect, useMemo, useState } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Stack, TextField, Button
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: (payload: { date_from: string; date_to: string }) => Promise<void> | void;
    initial?: { dateFrom?: string | null; dateTo?: string | null };
};

const toStr = (v?: string | null) => (v ?? "");

export default function CopyShipmentDialog({ open, onClose, onSubmit, initial }: Props) {
    const { t } = useTranslation();
    const [dateFrom, setDateFrom] = useState<string>("");
    const [dateTo, setDateTo] = useState<string>("");

    useEffect(() => {
        if (!open) return;
        setDateFrom(toStr(initial?.dateFrom));
        setDateTo(toStr(initial?.dateTo));
    }, [open, initial?.dateFrom, initial?.dateTo]);

    const errorMsg = useMemo(() => {
        if (!dateFrom || !dateTo) return t('shipments.copyDialog.errorBothDates');
        if (dateFrom > dateTo) return t('shipments.copyDialog.errorDateOrder');
        return "";
    }, [dateFrom, dateTo, t]);

    const handleSubmit = async () => {
        if (errorMsg) return;
        await onSubmit({ date_from: dateFrom, date_to: dateTo });
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{t('shipments.copyDialog.title')}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} mt={0.5}>
                    <Grid container spacing={1.5}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label={t('shipments.copyDialog.dateFrom')}
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label={t('shipments.copyDialog.dateTo')}
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                fullWidth
                            />
                        </Grid>
                    </Grid>

                    {!!errorMsg && (
                        <div style={{ color: "#d32f2f", fontSize: 12 }}>{errorMsg}</div>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="text">{t('shipments.copyDialog.cancel')}</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={!!errorMsg}>
                    {t('shipments.copyDialog.confirm')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
