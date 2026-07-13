
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Stack,
    TextField,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { TenderEditValues } from "../model/types";

type FieldConfig = {
    name: keyof TenderEditValues;
    label: string;
    size?: { xs: number; md?: number };
    type?: string;
    multiline?: boolean;
    minRows?: number;
};

type Props = {
    open: boolean;
    values: TenderEditValues;
    busy: boolean;
    canEdit: boolean;
    onClose: () => void;
    onSave: () => void;
    onChange: (name: keyof TenderEditValues, value: string) => void;
};

export function TenderEditDialog({
                                     open,
                                     values,
                                     busy,
                                     canEdit,
                                     onClose,
                                     onSave,
                                     onChange,
                                 }: Props) {
    const { t } = useTranslation();

    const fields: FieldConfig[] = [
        { name: "title", label: t("tenders.fields.title"), size: { xs: 12 } },

        { name: "pickupDate", label: t("tenders.fields.pickupDate"), type: "date", size: { xs: 12, md: 6 } },
        { name: "dropoffDate", label: t("tenders.fields.dropoffDate"), type: "date", size: { xs: 12, md: 6 } },

        { name: "pickupTime", label: t("tenders.fields.pickupTime"), type: "time", size: { xs: 12, md: 6 } },
        { name: "dropoffTime", label: t("tenders.fields.dropoffTime"), type: "time", size: { xs: 12, md: 6 } },

        { name: "cargoType", label: t("tenders.fields.cargoType"), size: { xs: 12, md: 4 } },
        { name: "vehicleType", label: t("tenders.fields.vehicleType"), size: { xs: 12, md: 4 } },
        { name: "loadingType", label: t("tenders.fields.loadingType"), size: { xs: 12, md: 4 } },

        { name: "weightTons", label: t("tenders.fields.weightTons"), size: { xs: 12, md: 4 } },
        { name: "volumeM3", label: t("tenders.fields.volumeM3"), size: { xs: 12, md: 4 } },
        { name: "placesCount", label: t("tenders.fields.placesCount"), size: { xs: 12, md: 4 } },

       // { name: "vehicleCapacityTons", label: t("tenders.fields.vehicleCapacityTons"), size: { xs: 12, md: 6 } },
        { name: "vehicleBodyLengthM", label: t("tenders.fields.vehicleBodyLengthM"), size: { xs: 12, md: 6 } },

        { name: "startPrice", label: t("tenders.fields.startPrice"), size: { xs: 12, md: 4 } },
        { name: "buyoutPrice", label: t("tenders.fields.buyoutPrice"), size: { xs: 12, md: 4 } },
        { name: "minBidStep", label: t("tenders.fields.minBidStep"), size: { xs: 12, md: 4 } },
        { name: "payment_deferment_days", label: t("tenders.fields.paymentDefermentDays"), size: { xs: 12, md: 6 } },

        { name: "phone", label: t("forgotPassword.phoneLabel"), size: { xs: 12, md: 6 } },
        { name: "startsAt", label: t("tenders.fields.startsAt"), type: "datetime-local", size: { xs: 12, md: 6 } },
        { name: "endsAt", label: t("tenders.fields.endsAt"), type: "datetime-local", size: { xs: 12, md: 6 } },

        {
            name: "cargoDescription",
            label: t("tenders.fields.cargoDescription"),
            size: { xs: 12 },
            multiline: true,
            minRows: 3,
        },
    ];

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{t("tenders.settings.editDialogTitle")}</DialogTitle>

            <DialogContent>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    <Alert severity="info" sx={{ borderRadius: "8px" }}>
                        {t("tenders.settings.editInfo")}
                    </Alert>

                    <Grid container spacing={2}>
                        {fields.map((field) => (
                            <Grid key={field.name} size={field.size ?? { xs: 12 }}>
                                <TextField
                                    label={field.label}
                                    type={field.type}
                                    value={values[field.name]}
                                    onChange={(event) => onChange(field.name, event.target.value)}
                                    fullWidth
                                    multiline={field.multiline}
                                    minRows={field.minRows}
                                    InputLabelProps={
                                        field.type === "date" || field.type === "time" || field.type === "datetime-local"
                                            ? { shrink: true }
                                            : undefined
                                    }
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>{t("tenders.common.cancel")}</Button>

                <Button variant="contained" onClick={onSave} disabled={busy || !canEdit}>
                    {busy ? t("tenders.common.saving") : t("tenders.common.save")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}