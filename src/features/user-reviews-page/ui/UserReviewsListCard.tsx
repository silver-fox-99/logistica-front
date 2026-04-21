import { memo } from "react";
import {
    Avatar,
    Box,
    Button,
    Chip,
    Divider,
    Paper,
    Rating,
    Stack,
    Typography,
} from "@mui/material";
import DirectionsOutlinedIcon from "@mui/icons-material/DirectionsOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useTranslation } from "react-i18next";
import type { UserReview } from "@/entities/user-reviews/model/types";
import { formatDate } from "@/shared/utils/formatDate";

type Props = {
    reviews: UserReview[];
    loadingReviews: boolean;
    page: number;
    pages: number;
    ratingFilter: number | null;
    ratingCountsAll: [number, number, number, number, number];
    onChangeRatingFilter: (value: number | null) => void;
    onLoadMore: () => void;
    geoNameById: (id?: string | null) => string;
    onSelectAuthor: (id?: string | null) => void;
};

function UserReviewsListCardComponent({
                                          reviews,
                                          loadingReviews,
                                          page,
                                          pages,
                                          ratingFilter,
                                          ratingCountsAll,
                                          onChangeRatingFilter,
                                          onLoadMore,
                                          geoNameById,
                                          onSelectAuthor,
                                      }: Props) {
    const { t } = useTranslation();

    return (
        <Paper
            variant="outlined"
            sx={{
                p: { xs: 2, md: 3 },
                borderRadius: 2,
                borderColor: "rgba(0,0,0,0.05)",
                boxShadow: "0px 6px 20px rgba(15, 23, 42, 0.04)",
            }}
        >
            <Stack spacing={2.5}>
                <Stack spacing={0.5}>
                    <Typography variant="h6" fontWeight={700}>
                        {t("userReviews.reviews.title")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t("userReviews.reviews.subtitle")}
                    </Typography>
                </Stack>

                <Stack direction="row" flexWrap="wrap" gap={1}>
                    {[
                        {
                            label: t("userReviews.filters.all"),
                            value: null,
                            count: ratingCountsAll.reduce((a, b) => a + b, 0),
                        },
                        {
                            label: t("userReviews.filters.rating", { value: 5 }),
                            value: 5,
                            count: ratingCountsAll[4],
                        },
                        {
                            label: t("userReviews.filters.rating", { value: 4 }),
                            value: 4,
                            count: ratingCountsAll[3],
                        },
                        {
                            label: t("userReviews.filters.rating", { value: 3 }),
                            value: 3,
                            count: ratingCountsAll[2],
                        },
                        {
                            label: t("userReviews.filters.rating", { value: 2 }),
                            value: 2,
                            count: ratingCountsAll[1],
                        },
                        {
                            label: t("userReviews.filters.rating", { value: 1 }),
                            value: 1,
                            count: ratingCountsAll[0],
                        },
                    ].map((item) => (
                        <Chip
                            key={`${item.label}-${String(item.value)}`}
                            label={`${item.label} (${item.count})`}
                            color={ratingFilter === item.value ? "primary" : "default"}
                            variant={ratingFilter === item.value ? "filled" : "outlined"}
                            onClick={() => onChangeRatingFilter(item.value)}
                            sx={{
                                borderColor: ratingFilter === item.value ? "primary.main" : "divider",
                                borderRadius: 1,
                            }}
                        />
                    ))}
                </Stack>

                <Stack spacing={2.25}>
                    {loadingReviews && reviews.length === 0 && (
                        <Typography variant="body2" color="text.secondary">
                            {t("userReviews.reviews.loading")}
                        </Typography>
                    )}

                    {!loadingReviews && reviews.length === 0 && (
                        <Typography variant="body2" color="text.secondary">
                            {t("userReviews.reviews.empty")}
                        </Typography>
                    )}

                    {reviews.map((review, idx) => (
                        <Box key={review.id}>
                            <ReviewCard
                                data={review}
                                geoName={geoNameById}
                                onSelectAuthor={onSelectAuthor}
                            />
                            {idx < reviews.length - 1 && <Divider sx={{ mt: 2, mb: 1 }} />}
                        </Box>
                    ))}
                </Stack>

                <Box display="flex" justifyContent="center">
                    <Button
                        variant="outlined"
                        sx={{ minWidth: 200 }}
                        onClick={onLoadMore}
                        disabled={loadingReviews || page >= pages}
                    >
                        {t("userReviews.reviews.loadMore")}
                    </Button>
                </Box>
            </Stack>
        </Paper>
    );
}

function ReviewCard({
                        data,
                        geoName,
                        onSelectAuthor,
                    }: {
    data: UserReview;
    geoName: (id?: string | null) => string;
    onSelectAuthor: (id?: string | null) => void;
}) {
    const { t } = useTranslation();

    const routeFrom =
        [data.pickup_country, data.pickup_region, data.pickup_city]
            .filter(Boolean)
            .join(", ") ||
        [geoName(data.pickup_country_id), geoName(data.pickup_region_id), geoName(data.pickup_city_id)]
            .filter(Boolean)
            .join(", ") ||
        data.pickup_city_id ||
        data.pickup_region_id ||
        data.pickup_country_id ||
        "—";

    const routeTo =
        [data.dropoff_country, data.dropoff_region, data.dropoff_city]
            .filter(Boolean)
            .join(", ") ||
        [geoName(data.dropoff_country_id), geoName(data.dropoff_region_id), geoName(data.dropoff_city_id)]
            .filter(Boolean)
            .join(", ") ||
        data.dropoff_city_id ||
        data.dropoff_region_id ||
        data.dropoff_country_id ||
        "—";

    const created = data.order_date || data.created_at;
    const createdLabel = created ? formatDate(created as any) : "";
    const timeLabel = data.created_at ? formatDate(data.created_at as any) : "";
    const text = data.comment || t("userReviews.reviewCard.noComment");
    const ratingNum = Number(data.rating ?? 0);

    const price =
        data.price_amount != null &&
        data.price_amount !== 0 &&
        data.price_currency
            ? `${data.price_amount} ${data.price_currency}`
            : null;

    const statusColor =
        data.status === "PUBLISHED" ? "success" : data.status === "REJECTED" ? "error" : "warning";

    const authorName =
        [data.from_first_name, data.from_last_name].filter(Boolean).join(" ") ||
        data.from_email ||
        data.from_phone ||
        data.from_user_id ||
        t("userReviews.reviewCard.defaultTitle");

    return (
        <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar
                        sx={{ width: 40, height: 40, cursor: data.from_user_id ? "pointer" : "default" }}
                        onClick={() => {
                            if (data.from_user_id) onSelectAuthor(data.from_user_id);
                        }}
                    >
                        <PersonOutlineIcon />
                    </Avatar>

                    <Stack spacing={0.5}>
                        <Typography
                            variant="subtitle1"
                            fontWeight={700}
                            sx={{ cursor: data.from_user_id ? "pointer" : "default" }}
                            onClick={() => {
                                if (data.from_user_id) onSelectAuthor(data.from_user_id);
                            }}
                        >
                            {authorName}
                        </Typography>

                        <Stack direction="row" spacing={1} alignItems="center">
                            <Rating value={ratingNum} readOnly size="small" />
                            <Typography variant="body2" color="text.secondary">
                                {Number.isFinite(ratingNum) ? ratingNum.toFixed(1) : ""}
                            </Typography>
                        </Stack>

                        {data.status && (
                            <Chip
                                size="small"
                                label={data.status}
                                color={statusColor as any}
                                variant="outlined"
                                sx={{ alignSelf: "flex-start" }}
                            />
                        )}

                        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                            <RouteLine from={routeFrom} to={routeTo} />

                            <Stack direction="row" spacing={0.75} alignItems="center">
                                <EventOutlinedIcon fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                    {createdLabel}
                                </Typography>
                            </Stack>

                            {price && (
                                <Typography variant="body2" color="text.secondary">
                                    {price}
                                </Typography>
                            )}

                            {data.order_id && (
                                <Typography variant="body2" color="text.secondary">
                                    Order: {data.order_id}
                                </Typography>
                            )}
                        </Stack>
                    </Stack>
                </Stack>

                <Typography variant="body2" color="text.secondary" minWidth={72} textAlign="right">
                    {timeLabel}
                </Typography>
            </Stack>

            <Typography variant="body2" color="text.primary" lineHeight={1.6}>
                {text}
            </Typography>
        </Stack>
    );
}

function RouteLine({ from, to }: { from: string; to: string }) {
    return (
        <Stack direction="row" spacing={0.75} alignItems="center">
            <DirectionsOutlinedIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
                {from} <Typography component="span" color="text.secondary">→</Typography> {to}
            </Typography>
        </Stack>
    );
}

export const UserReviewsListCard = memo(UserReviewsListCardComponent);