import { Box, Button, Grid, Paper, Stack, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

type Props = {
    currency: string;
    amount: string;
    transportDetails: string;
    busy: boolean;
    onAmountChange: (value: string) => void;
    onTransportDetailsChange: (value: string) => void;
    onSubmit: () => void;
};

export function BidFormCard({
                                currency,
                                amount,
                                transportDetails,
                                busy,
                                onAmountChange,
                                onTransportDetailsChange,
                                onSubmit,
                            }: Props) {
    const { t } = useTranslation();

    return (
        <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
            <Stack spacing={2}>
                <Box>
                    <Typography variant="h6" fontWeight={800}>
                        {t("tenders.bids.yourBid")}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        {t("tenders.bids.description")}
                    </Typography>
                </Box>

                <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                            label={t("tenders.bids.amount", { currency })}
                            value={amount}
                            onChange={(event) => onAmountChange(event.target.value)}
                            fullWidth
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 8 }}>
                        <TextField
                            label={t("tenders.bids.transportDetails")}
                            value={transportDetails}
                            onChange={(event) => onTransportDetailsChange(event.target.value)}
                            fullWidth
                        />
                    </Grid>
                </Grid>

                <Stack direction="row" justifyContent="flex-end">
                    <Button variant="contained" onClick={onSubmit} disabled={busy}>
                        {busy ? t("tenders.common.saving") : t("tenders.bids.submit")}
                    </Button>
                </Stack>
            </Stack>
        </Paper>
    );
}