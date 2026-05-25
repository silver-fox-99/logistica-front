import { Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

type Props = {
    code: string;
    busy: boolean;
    onCodeChange: (value: string) => void;
    onConfirm: () => void;
};

export function ConfirmCodeCard({
                                    code,
                                    busy,
                                    onCodeChange,
                                    onConfirm,
                                }: Props) {
    const { t } = useTranslation();

    return (
        <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
            <Stack spacing={2}>
                <Box>
                    <Typography variant="h6" fontWeight={800}>
                        {t("tenders.bids.codePanelTitle")}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        {t("tenders.bids.codePanelDescription")}
                    </Typography>
                </Box>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <TextField
                        label={t("tenders.bids.code")}
                        value={code}
                        onChange={(event) => onCodeChange(event.target.value)}
                        fullWidth
                    />

                    <Button
                        variant="contained"
                        onClick={onConfirm}
                        disabled={busy}
                        sx={{ minWidth: 180 }}
                    >
                        {busy ? t("tenders.common.saving") : t("tenders.bids.confirmCode")}
                    </Button>
                </Stack>
            </Stack>
        </Paper>
    );
}