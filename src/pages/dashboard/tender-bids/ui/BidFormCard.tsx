import { Box, Button, Grid, InputAdornment, Paper, Stack, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

type Props = {
    currency: string;
    amount: string;
    busy: boolean;
    minBidStep?: string | number | null;
    startPrice?: string | number | null;
    leaderAmount?: string | number | null;
    onAmountChange: (value: string) => void;
    onSubmit: () => void;
    formatPrice: (value: number | string | null | undefined) => string | undefined;
};

export function BidFormCard({
    currency,
    amount,
    busy,
    minBidStep,
    startPrice,
    leaderAmount,
    onAmountChange,
    onSubmit,
    formatPrice,
}: Props) {
    const { t } = useTranslation();

    // Compute suggested minimum bid: leader - step, or start_price if no bids
    const computeMinBid = (): string => {
        const step = minBidStep ? Number(minBidStep) : 0;
        if (leaderAmount != null) {
            const min = Number(leaderAmount) - step;
            return min > 0 ? String(min) : String(leaderAmount);
        }
        if (startPrice != null) {
            return String(startPrice);
        }
        return "";
    };

    const minBid = computeMinBid();
    const minBidFormatted = minBid ? formatPrice(minBid) : null;

    const handleFillMin = () => {
        if (minBid) onAmountChange(minBid);
    };

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

                {minBidFormatted && (
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                            {t("tenders.bids.suggestedBid")}:
                        </Typography>
                        <Typography
                            variant="body2"
                            fontWeight={700}
                            color="primary.main"
                            sx={{ cursor: "pointer", textDecoration: "underline dotted" }}
                            onClick={handleFillMin}
                        >
                            {minBidFormatted} {currency}
                        </Typography>
                    </Stack>
                )}

                <Grid container spacing={1.5} alignItems="flex-end">
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            label={t("tenders.bids.amount", { currency })}
                            value={amount}
                            onChange={(event) => onAmountChange(event.target.value)}
                            fullWidth
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">{currency}</InputAdornment>
                                    ),
                                },
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Stack direction="row" justifyContent={{ xs: "flex-start", md: "flex-end" }}>
                            <Button variant="contained" onClick={onSubmit} disabled={busy}>
                                {busy ? t("tenders.common.saving") : t("tenders.bids.submit")}
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
            </Stack>
        </Paper>
    );
}
