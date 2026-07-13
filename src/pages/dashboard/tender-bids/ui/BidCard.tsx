import { Avatar, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import {
  FiAward,
  FiCalendar,
  FiEdit3,
  FiPhone,
  FiTruck,
  FiUserCheck,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";

import type { TenderBid } from "@/entities/tender/model/types";
import { getBidderName } from "../model/helpers";

type Props = {
  bid: TenderBid;
  index: number;
  currency: string;
  isLeader: boolean;
  isOwner: boolean;
  selectingId: string;
  formatTime: (value?: string | null) => string;
  formatPrice: (
    value: number | string | null | undefined,
  ) => string | undefined;
  onSelectWinner: (bidId: string) => void;
};

export function BidCard({
  bid,
  index,
  currency,
  isLeader,
  isOwner,
  selectingId,
  formatTime,
  formatPrice,
  onSelectWinner,
}: Props) {
  const { t } = useTranslation();

  const bidderName = getBidderName(
    bid,
    t("tenders.bids.unknownBidder", "Unknown bidder"),
  );

  const formattedAmount = formatPrice(bid.amount) ?? bid.amount;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: "16px",
        borderColor: isLeader ? "success.light" : "divider",
        bgcolor: isLeader ? "success.50" : "background.paper",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        gap={2}
      >
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar
            sx={{
              width: 42,
              height: 42,
              bgcolor: isLeader ? "success.main" : "grey.100",
              color: isLeader ? "common.white" : "text.primary",
              fontWeight: 600,
            }}
          >
            {index + 1}
          </Avatar>

          <Stack spacing={1}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
            >
              {isLeader && <FiAward size={20} color="#2e7d32" />}

              <Typography variant="h6" fontWeight={800}>
                {formattedAmount} {currency}
              </Typography>

              {isLeader && (
                <Chip
                  size="small"
                  color="success"
                  label={t("tenders.bids.currentLeader")}
                />
              )}
            </Stack>

            <Stack spacing={0.5}>
              <Typography variant="body1" fontWeight={600}>
                {bidderName}
              </Typography>

              {bid.bidder?.phone && (
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <FiPhone size={15} />
                  <Typography variant="body2" color="text.secondary">
                    {bid.bidder.phone}
                  </Typography>
                </Stack>
              )}
            </Stack>

            {bid.transport_details && (
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  width: "fit-content",
                  px: 1.25,
                  py: 0.75,
                  borderRadius: "6px",
                  bgcolor: "grey.100",
                }}
              >
                <FiTruck size={16} />
                <Typography variant="body2" color="text.secondary">
                  {bid.transport_details}
                </Typography>
              </Stack>
            )}

            <Stack
              direction="row"
              spacing={1.25}
              flexWrap="wrap"
              color="text.secondary"
            >
              <Stack direction="row" spacing={0.5} alignItems="center">
                <FiCalendar size={14} />
                <Typography variant="caption">
                  {t("tenders.bids.createdAt", {
                    value: formatTime(bid.created_at),
                  })}
                </Typography>
              </Stack>

              {bid.last_changed_at && (
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <FiEdit3 size={14} />
                  <Typography variant="caption">
                    {t("tenders.bids.changedAt", {
                      value: formatTime(bid.last_changed_at),
                    })}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Stack>
        </Stack>

        {isOwner && (
          <Button
            variant={isLeader ? "contained" : "outlined"}
            size="small"
            startIcon={<FiUserCheck />}
            onClick={() => onSelectWinner(bid.id)}
            disabled={!!selectingId}
            sx={{
              alignSelf: { xs: "flex-start", md: "center" },
              minWidth: 0,
              px: 2,
              py: 0.85,
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {selectingId === bid.id
              ? t("tenders.bids.selecting")
              : t("tenders.bids.selectWinner")}
          </Button>
        )}
      </Stack>
    </Paper>
  );
}
