import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import type { Tender } from "@/entities/tender/model/types";
import { getTenderStatusMeta } from "@/entities/tender/lib/getTenderStatusMeta";
import { getTenderAuctionTypeLabel } from "@/entities/tender/lib/getTenderAuctionTypeMeta";

type Props = {
    tender: Tender;
    isOwner?: boolean;
    isCurrentWinner?: boolean;
    ownerCode?: string;
};

export function TenderWorkspaceHeader({
                                          tender,
                                          isOwner = false,
                                          isCurrentWinner = false,
                                          ownerCode = "",
                                      }: Props) {
    const { t, i18n } = useTranslation();

    const statusMeta = getTenderStatusMeta(tender.status, t);
    const auctionTypeLabel = getTenderAuctionTypeLabel(tender.auction_type, t);

    const endLabel = tender.ends_at
        ? new Date(tender.ends_at).toLocaleString(i18n.language, {
            dateStyle: "short",
            timeStyle: "short",
            hour12: false,
        })
        : t("tenders.common.empty");

    return (
        <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
            <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Chip label={t("tenders.workspace.header.type")} size="small" color="primary" />

                    <Chip
                        label={statusMeta.label}
                        size="small"
                        color={statusMeta.color}
                        variant="outlined"
                    />

                    <Chip label={auctionTypeLabel} size="small" variant="outlined" />

                    <Chip
                        label={
                            isOwner
                                ? t("tenders.common.owner")
                                : isCurrentWinner
                                    ? t("tenders.common.winner")
                                    : t("tenders.common.participant")
                        }
                        size="small"
                        variant="outlined"
                    />

                    {isOwner && ownerCode && (
                        <Chip
                            label={`${t("tenders.workspace.header.ownerCode")}: ${ownerCode}`}
                            size="small"
                            color="success"
                        />
                    )}
                </Stack>

                <Box>
                    <Typography variant="h5" fontWeight={700}>
                        {tender.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        {t("tenders.workspace.header.startPrice")}: {tender.start_price} {tender.currency}
                        {tender.buyout_price
                            ? ` · ${t("tenders.workspace.header.buyoutPrice")}: ${tender.buyout_price} ${tender.currency}`
                            : ""}
                        {` · ${t("tenders.workspace.header.endsAt")}: ${endLabel}`}
                    </Typography>
                </Box>
            </Stack>
        </Paper>
    );
}
