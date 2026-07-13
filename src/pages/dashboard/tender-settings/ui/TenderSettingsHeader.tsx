import { Alert, Button, Paper, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

type Props = {
    tender: any;
    canEdit: boolean;
    ownerCode?: string | null;
    onEdit: () => void;
    onCancel: () => void;
};

export function TenderSettingsHeader({
                                         tender,
                                         canEdit,
                                         ownerCode,
                                         onEdit,
                                         onCancel,
                                     }: Props) {
    const { t } = useTranslation();

    return (
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: "16px", borderColor: "divider" }}>
            <Stack spacing={1}>
                <Typography variant="h6" fontWeight={800}>
                    {t("tenders.settings.title")}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                    {t("tenders.common.status", { value: tender.status })}
                </Typography>

                {!canEdit && (
                    <Alert severity="warning" sx={{ borderRadius: "8px" }}>
                        {t("tenders.settings.hasBidsWarning")}
                    </Alert>
                )}

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <Button variant="outlined" disabled={!canEdit} onClick={onEdit}>
                        {t("tenders.settings.editTerms")}
                    </Button>

                    <Button color="error" variant="outlined" onClick={onCancel}>
                        {t("tenders.settings.cancelTender")}
                    </Button>
                </Stack>

                {ownerCode && (
                    <Alert severity="success" sx={{ borderRadius: "8px" }}>
                        <Typography fontWeight={800}>
                            {t("tenders.bids.winnerCodeTitle")}: {ownerCode}
                        </Typography>
                        <Typography variant="body2">
                            {t("tenders.bids.winnerCodeDescription")}
                        </Typography>
                    </Alert>
                )}
            </Stack>
        </Paper>
    );
}