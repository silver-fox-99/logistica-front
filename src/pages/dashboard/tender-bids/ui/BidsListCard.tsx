import { Alert, Box, Chip, Divider, Paper, Stack, Tooltip, Typography } from "@mui/material";
import { FiArrowDown, FiInfo, FiShoppingBag, FiTag } from "react-icons/fi";
import { useTranslation } from "react-i18next";

import type { TenderBid } from "@/entities/tender/model/types";
import { BidCard } from "./BidCard";

type Props = {
    bids: TenderBid[];
    leader?: TenderBid;
    currency: string;
    isOwner: boolean;
    selectingId: string;
    startPrice?: string | number | null;
    buyoutPrice?: string | number | null;
    minBidStep?: string | number | null;
    formatTime: (value?: string | null) => string;
    formatPrice: (value: number | string | null | undefined) => string | undefined;
    onSelectWinner: (bidId: string) => void;
};

type ParamItemProps = {
    icon: React.ReactNode;
    label: string;
    value: string;
    tooltip?: string;
    color?: string;
};

function ParamItem({ icon, label, value, tooltip, color }: ParamItemProps) {
    const content = (
        <Stack
            spacing={0.5}
            sx={{
                flex: 1,
                minWidth: 0,
                px: 1.5,
                py: 1,
                borderRadius: 1.5,
                bgcolor: "grey.50",
                border: "1px solid",
                borderColor: "divider",
            }}
        >
            <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
                {icon}
                <Typography variant="caption" noWrap>
                    {label}
                </Typography>
                {tooltip && <FiInfo size={11} />}
            </Stack>
            <Typography variant="body2" fontWeight={800} color={color ?? "text.primary"} noWrap>
                {value}
            </Typography>
        </Stack>
    );

    return tooltip ? <Tooltip title={tooltip} placement="top">{content}</Tooltip> : content;
}

export function BidsListCard({
    bids,
    leader,
    currency,
    isOwner,
    selectingId,
    startPrice,
    buyoutPrice,
    minBidStep,
    formatTime,
    formatPrice,
    onSelectWinner,
}: Props) {
    const { t } = useTranslation();

    const leaderFormatted = leader ? (formatPrice(leader.amount) ?? leader.amount) : null;
    const startFormatted = startPrice != null ? (formatPrice(startPrice) ?? String(startPrice)) : null;
    const buyoutFormatted = buyoutPrice != null ? (formatPrice(buyoutPrice) ?? String(buyoutPrice)) : null;
    const stepFormatted = minBidStep != null && Number(minBidStep) > 0
        ? (formatPrice(minBidStep) ?? String(minBidStep))
        : null;

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

                    {leader && leaderFormatted && (
                        <Chip
                            color="success"
                            label={t("tenders.bids.leader", {
                                amount: leaderFormatted,
                                currency,
                            })}
                        />
                    )}
                </Stack>

                {/* ── Tender price params ── */}
                {(startFormatted || buyoutFormatted || stepFormatted) && (
                    <>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                            {startFormatted && (
                                <ParamItem
                                    icon={<FiTag size={12} />}
                                    label={t("tenders.bids.params.startPrice")}
                                    value={`${startFormatted} ${currency}`}
                                    tooltip={t("tenders.bids.params.startPriceHint")}
                                    color="text.primary"
                                />
                            )}
                            {buyoutFormatted && (
                                <ParamItem
                                    icon={<FiShoppingBag size={12} />}
                                    label={t("tenders.bids.params.buyoutPrice")}
                                    value={`${buyoutFormatted} ${currency}`}
                                    tooltip={t("tenders.bids.params.buyoutPriceHint")}
                                    color="warning.dark"
                                />
                            )}
                            {stepFormatted && (
                                <ParamItem
                                    icon={<FiArrowDown size={12} />}
                                    label={t("tenders.bids.params.minBidStep")}
                                    value={`−${stepFormatted} ${currency}`}
                                    tooltip={t("tenders.bids.params.minBidStepHint")}
                                    color="info.dark"
                                />
                            )}
                        </Stack>
                        <Divider />
                    </>
                )}

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
                        formatPrice={formatPrice}
                        onSelectWinner={onSelectWinner}
                    />
                ))}
            </Stack>
        </Paper>
    );
}
