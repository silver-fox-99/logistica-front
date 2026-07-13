import { memo, useMemo } from "react";
import { Avatar, Chip, Paper, Rating, Stack, Typography } from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import WorkHistoryOutlinedIcon from "@mui/icons-material/WorkHistoryOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/shared/utils/formatDate";
import type { UserProfileSummary } from "@/entities/user-reviews/model/types";
import { Box } from "@mui/material";

type Props = {
  profile: UserProfileSummary | null;
  profileLoading: boolean;
  avgRating: number | null;
};

function formatRating(value?: number | string | null) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num.toFixed(1) : "0.0";
}

function UserProfileSummaryCardComponent({
  profile,
  profileLoading,
  avgRating,
}: Props) {
  const { t } = useTranslation();

  const displayName = useMemo(() => {
    if (!profile) return "—";

    return (
      [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
      (profile as any).full_name ||
      (profile as any).name ||
      profile.email ||
      profile.phone ||
      "—"
    );
  }, [profile]);

  const locationLabel = useMemo(() => {
    if (!profile) return "";
    return (
      profile.location ||
      (profile as any).meta?.geo ||
      (profile as any).meta?.location ||
      ""
    );
  }, [profile]);

  const displayRating = useMemo(() => {
    if (!profile) return 0;

    const rawProfileRating =
      profile.rating ??
      (profile as any).rating_value ??
      (profile as any).reviews_rating ??
      null;

    return (
      avgRating ?? (rawProfileRating != null ? Number(rawProfileRating) : 0)
    );
  }, [avgRating, profile]);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 2,
        boxShadow: "0px 8px 24px rgba(15, 23, 42, 0.06)",
        borderColor: "rgba(0,0,0,0.05)",
      }}
    >
      {profileLoading ? (
        <Typography variant="body2" color="text.secondary">
          {t("userReviews.profile.loading")}
        </Typography>
      ) : profile ? (
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{ width: 64, height: 64 }}
            src={profile.avatar_url || undefined}
          >
            <PersonOutlineIcon fontSize="large" />
          </Avatar>

          <Stack spacing={0.5}>
            {profile.email && (
              <Typography variant="body2" color="text.secondary">
                {profile.email}
              </Typography>
            )}

            {profile.phone && (
              <Typography variant="body2" color="text.secondary">
                {profile.phone}
              </Typography>
            )}

            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6" fontWeight={600}>
                {displayName}
              </Typography>

              {profile.is_admin ? (
                <VerifiedIcon color="primary" fontSize="small" />
              ) : null}
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Rating
                  value={displayRating}
                  precision={0.1}
                  readOnly
                  size="small"
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={600}
                >
                  {formatRating(displayRating)}
                </Typography>
              </Stack>

              {locationLabel && (
                <Chip
                  size="small"
                  label={`${t("userReviews.profile.location")}: ${locationLabel}`}
                  icon={<LocationOnOutlinedIcon />}
                  variant="outlined"
                  sx={{
                    borderColor: "divider",
                    bgcolor: "background.default",
                  }}
                />
              )}
            </Stack>

            <Stack direction="row" spacing={3} flexWrap="wrap">
              <InfoItem
                icon={<CalendarTodayOutlinedIcon fontSize="small" />}
                label={t("userReviews.profile.registeredAt")}
                value={
                  profile.created_at ? formatDate(profile.created_at) : "—"
                }
              />
              <InfoItem
                icon={<Inventory2OutlinedIcon fontSize="small" />}
                label={t("userReviews.profile.totalReviews")}
                value={String(
                  profile.reviews_count ??
                    (profile as any).reviews ??
                    (profile as any).review_count ??
                    0,
                )}
              />
              <InfoItem
                icon={<WorkHistoryOutlinedIcon fontSize="small" />}
                label={t("userReviews.profile.totalOrders")}
                value={String(
                  profile.orders_count ??
                    (profile as any).orders ??
                    (profile as any).order_count ??
                    0,
                )}
              />
            </Stack>
          </Stack>
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          {t("userReviews.profile.notFound")}
        </Typography>
      )}
    </Paper>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box color="text.secondary" display="flex" alignItems="center">
        {icon}
      </Box>
      <Typography variant="body2" color="text.secondary">
        {label}:{" "}
        <Typography component="span" color="text.primary" fontWeight={600}>
          {value}
        </Typography>
      </Typography>
    </Stack>
  );
}

export const UserProfileSummaryCard = memo(UserProfileSummaryCardComponent);
