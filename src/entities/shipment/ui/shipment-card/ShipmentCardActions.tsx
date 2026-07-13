import {
  Button,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { FiChevronDown, FiChevronUp, FiStar, FiUser } from "react-icons/fi";
import type { ShipmentScope } from "@/entities/shipment/model/shipment-row.types";

type Props = {
  scope: ShipmentScope;
  isFavorite: boolean;
  favoriteLoading: boolean;
  detailsLoading: boolean;
  expanded: boolean;
  repeats?: number | null;
  views?: number | null;
  timeAgo?: string | null;
  price?: string | null;
  display_type?: string | null;
  labels: {
    addFavorite: string;
    removeFavorite: string;
    contacts: string;
    orderInfo: string;
    more: string;
    collapse: string;
    repeats: string;
    views: string;
  };
  onToggleFavorite: () => void;
  onContacts: () => void;
  onOrderInfo: () => void;
  onMore: () => void;
};

export function ShipmentCardActions({
  scope,
  isFavorite,
  favoriteLoading,
  detailsLoading,
  expanded,
  repeats,
  views,
  timeAgo,
  price,
  display_type,
  labels,
  onToggleFavorite,
  onContacts,
  onMore,
}: Props) {
  const hasStats =
    (typeof repeats === "number" && repeats > 0) ||
    (typeof views === "number" && views > 0);

  return (
    <Stack
      sx={{ height: "100%", minWidth: 0 }}
      justifyContent="space-between"
      alignItems={{ xs: "stretch", md: "flex-end" }}
      spacing={1}
    >
      <Typography
        fontWeight={800}
        color="success.main"
        sx={{
          whiteSpace: "nowrap",
          fontSize: { xs: 0, md: 18, lg: 20 },
          lineHeight: 1.2,
          display: { xs: "none", md: "block" },
          alignSelf: "flex-end",
        }}
      >
        {price || "—"}
      </Typography>

      <Stack
        direction={{ xs: "row", md: "row" }}
        spacing={0.75}
        alignItems="center"
        justifyContent={{ xs: "flex-start", md: "flex-end" }}
        sx={{
          width: "100%",
          flexWrap: { xs: "nowrap", md: "wrap" },
          rowGap: 0.75,
        }}
      >
        {scope === "public" && (
          <Tooltip
            title={isFavorite ? labels.removeFavorite : labels.addFavorite}
          >
            <span>
              <IconButton
                onClick={onToggleFavorite}
                disabled={favoriteLoading || display_type === "inactive"}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1.5,
                  width: 40,
                  height: 40,
                  color: isFavorite ? "#ff9800" : "text.primary",
                  flexShrink: 0,
                }}
              >
                <FiStar size={16} fill={isFavorite ? "#ff9800" : "none"} />
              </IconButton>
            </span>
          </Tooltip>
        )}

        {scope === "public" && (
          <Button
            variant="contained"
            onClick={onContacts}
            disabled={detailsLoading || display_type === "inactive"}
            startIcon={<FiUser size={15} />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 1.5,
              minHeight: 40,
              height: 40,
              px: 1.5,
              minWidth: { xs: 0, md: 120 },
              flex: { xs: 1, md: "0 0 auto" },
              fontSize: 13,
              whiteSpace: "nowrap",
            }}
          >
            {labels.contacts}
          </Button>
        )}

        {scope === "my" && (
          <Button
            variant="outlined"
            onClick={onMore}
            endIcon={
              expanded ? <FiChevronUp size={15} /> : <FiChevronDown size={15} />
            }
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 1.5,
              minHeight: 40,
              height: 40,
              px: 1.5,
              fontSize: 13,
              whiteSpace: "nowrap",
            }}
          >
            {expanded ? labels.collapse : labels.more}
          </Button>
        )}
      </Stack>

      {hasStats ? (
        <Stack
          direction="row"
          spacing={0.75}
          flexWrap="wrap"
          justifyContent={{ xs: "flex-start", md: "flex-end" }}
          sx={{ width: "100%" }}
        >
          {typeof repeats === "number" && repeats > 0 && (
            <Chip
              size="small"
              label={`${labels.repeats}: ${repeats}`}
              sx={{
                borderRadius: 999,
                height: 24,
                "& .MuiChip-label": {
                  px: 1,
                  fontSize: 11,
                  fontWeight: 500,
                },
              }}
            />
          )}

          {typeof views === "number" && views > 0 && (
            <Chip
              size="small"
              label={`${labels.views}: ${views}`}
              sx={{
                borderRadius: 999,
                height: 24,
                "& .MuiChip-label": {
                  px: 1,
                  fontSize: 11,
                  fontWeight: 500,
                },
              }}
            />
          )}
        </Stack>
      ) : (
        <span />
      )}

      {!!timeAgo && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            alignSelf: { xs: "flex-start", md: "flex-end" },
            width: "100%",
            textAlign: { xs: "left", md: "right" },
            fontSize: 11,
          }}
        >
          {timeAgo}
        </Typography>
      )}
    </Stack>
  );
}
