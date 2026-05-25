import { Alert, Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import type { TenderBid } from "@/entities/tender/model/types";
import { BidCard } from "./BidCard";

type Props = {
    bids: TenderBid[];
    leader?: TenderBid;
    currency: string;
    isOwner: boolean;
    selectingId: string;
    formatTime: (value?: string | null) => string;
    onSelectWinner: (bidId: string) => void;
};

export function BidsListCard({
                                 bids,
                                 leader,
                                 currency,
                                 isOwner,
                                 selectingId,
                                 formatTime,
                                 onSelectWinner,
                             }: Props) {
    const { t } = useTranslation();

    return (
        <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
            <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                    <Box>
                        <Typography variant="h6" fontWeight={800}>
                            {t("tenders.bids.currentOffers")}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            {t("tenders.bids.rule")}
                        </Typography>
                    </Box>

                    {leader && (
                        <Chip
                            color="success"
                            label={t("tenders.bids.leader", {
                                amount: leader.amount,
                                currency,
                            })}
                        />
                    )}
                </Stack>

                {!bids.length && (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                        {t("tenders.bids.empty")}
                    </Alert>
                )}

                {bids.map((bid, index) => (
                    <BidCard
                        key={bid.id}
                        bid={bid}
                        index={index}
                        currency={currency}
                        isLeader={bid.id === leader?.id}
                        isOwner={isOwner}
                        selectingId={selectingId}
                        formatTime={formatTime}
                        onSelectWinner={onSelectWinner}
                    />
                ))}
            </Stack>
        </Paper>
    );
}