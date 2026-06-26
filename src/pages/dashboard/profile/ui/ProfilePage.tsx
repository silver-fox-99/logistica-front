import { Stack, Paper, Typography, Rating, Avatar, Divider } from "@mui/material";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import ProfileOverviewCard from "@/features/profile/ui/ProfileOverviewCard.tsx";
import TelegramBindingCard from "@/features/profile/ui/TelegramBindingCard.tsx";
import NotificationSettingsCard from "@/features/profile/ui/NotificationSettingsCard.tsx";
import ContactInfoCard, { type ContactInfo } from "@/features/profile/ui/ContactInfoCard.tsx";
import ProfileMembershipHistoryCard from "@/features/profile/ui/ProfileMembershipHistoryCard.tsx";
import { useUserStore } from "@/entities/user/model/user.store.ts";
import { useTariffStore } from "@/entities/tariff/model/tariff.store";
import { useCallback, useEffect, useMemo, useState } from "react";
import { profileApi } from "@/shared/api/profileApi.ts";
import { userReviewsApi } from "@/shared/api/userReviewsApi.ts";
import { companiesApi } from "@/shared/api/companiesApi.ts";
import type { UserReview } from "@/entities/user-reviews/model/types";
import { formatDate } from "@/shared/utils/formatDate.ts";
import type {CompanyMembershipHistoryItem} from "@/entities/company/model/types.ts";

export default function ProfilePage() {
    const user = useUserStore((s) => s.user);
    const setUser = useUserStore((s) => s.setUser);
    const activeSubscription = useTariffStore((s) => s.activeSubscription);
    const { t } = useTranslation();

    const [selfReviews, setSelfReviews] = useState<UserReview[]>([]);
    const [selfReviewsLoading, setSelfReviewsLoading] = useState(false);

    const [membershipHistory, setMembershipHistory] = useState<CompanyMembershipHistoryItem[]>([]);
    const [membershipHistoryLoading, setMembershipHistoryLoading] = useState(false);

    const userDate = useMemo(() => {
        if (!user?.created_at) return t("profile.overview.unknown");

        return (
            new Date(user.created_at).toLocaleString("en-GB", {
                dateStyle: "medium",
                timeStyle: "short",
                hour12: false,
                timeZone: "UTC",
            }) + ` (${t("profile.overview.utcTimezone")})`
        );
    }, [t, user?.created_at]);

    const loadSelfReviews = useCallback(async () => {
        if (!user?.id) {
            setSelfReviews([]);
            return;
        }

        setSelfReviewsLoading(true);
        try {
            const data = await userReviewsApi.list(user.id, { page: 1, limit: 20, sort: "new" });
            const items = (data.items || []).filter((r) => !r.status || r.status === "PUBLISHED");
            setSelfReviews(items);
        } catch (error: any) {
            const message = error?.response?.data?.message || t("profile.messages.updateError");
            toast.error(message);
            setSelfReviews([]);
        } finally {
            setSelfReviewsLoading(false);
        }
    }, [t, user?.id]);

    const loadMembershipHistory = useCallback(async () => {
        if (!user?.id) {
            setMembershipHistory([]);
            return;
        }

        setMembershipHistoryLoading(true);
        try {
            const data = await companiesApi.getUserMembershipHistory(user.id);
            setMembershipHistory(data || []);
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                t("profile.membershipHistory.loadError", "Failed to load company history");
            toast.error(message);
            setMembershipHistory([]);
        } finally {
            setMembershipHistoryLoading(false);
        }
    }, [t, user?.id]);

    const loadProfileExtras = useCallback(async () => {
        if (!user?.id) return;

        await Promise.all([
            loadSelfReviews(),
            loadMembershipHistory(),
        ]);
    }, [loadMembershipHistory, loadSelfReviews, user?.id]);

    useEffect(() => {
        void loadProfileExtras();
    }, [loadProfileExtras]);

    const avgRating = useMemo(() => {
        if (!selfReviews.length) return null;
        const sum = selfReviews.reduce((acc, r) => acc + (Number(r.rating ?? 0) || 0), 0);
        return selfReviews.length ? sum / selfReviews.length : null;
    }, [selfReviews]);

    const overviewRatings = useMemo(() => {
        const fallback =
            (user as any)?.rating ??
            (user as any)?.rating_value ??
            (user as any)?.reviews_rating ??
            null;
        const value = avgRating ?? (fallback != null ? Number(fallback) : null);
        return value != null ? [{ label: "★", value, color: "success" as const }] : [];
    }, [avgRating, user]);

    const planLabel =
        activeSubscription?.plan?.name ??
        activeSubscription?.plan?.code ??
        (activeSubscription
            ? t("profile.overview.activePlan")
            : t("profile.overview.freePlan"));

    const baseName =
        [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim() ||
        t("profile.overview.unknown");

    const fullNameWithPlan = `${baseName} (${planLabel})`;

    const subscriptionExpiresAt = useMemo(() => {
        if (!activeSubscription) return null;
        if (activeSubscription.lifetime) {
            return t("profile.overview.lifetime", "бессрочно");
        }
        if (!activeSubscription.ends_at) return null;

        const dt = new Date(activeSubscription.ends_at);
        return dt.toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }, [activeSubscription, t]);

    const updateUser = async (
        values: ContactInfo & { phoneMainE164?: string; phoneAltE164?: string }
    ) => {
        try {
            const preparedData = {
                firstName: values.firstName?.trim() || undefined,
                lastName: values.lastName?.trim() || undefined,
                email: values.email,
                phone: values.phoneMainE164,
                meta: {
                    geo: values.geo,
                    phoneAlt: values.phoneAltE164,
                    telegram: values.telegram,
                    whatsapp: values.whatsapp,
                },
            };

            const res = await profileApi.updateProfile(preparedData);
            setUser(res.data);
            toast.success(t("profile.messages.updateSuccess"));
        } catch (error: any) {
            const message = error?.response?.data?.message || t("profile.messages.updateError");
            toast.error(message);
        }
    };

    return (
        <Stack spacing={3}>
            <ProfileOverviewCard
                fullName={fullNameWithPlan}
                location={user?.meta?.geo || t("profile.overview.unknown")}
                registeredAt={userDate || t("profile.overview.unknown")}
                subscriptionExpiresAt={subscriptionExpiresAt}
                ratings={overviewRatings}
            />

            <TelegramBindingCard />

            <NotificationSettingsCard />

            <ProfileMembershipHistoryCard
                items={membershipHistory}
                loading={membershipHistoryLoading}
            />

            <ContactInfoCard
                data={{
                    firstName: user?.first_name || "",
                    lastName: user?.last_name || "",
                    geo: user?.meta?.geo || "",
                    phoneMain: user?.phone || "",
                    phoneAlt: user?.meta?.phoneAlt || "",
                    telegram: user?.meta?.telegram || "",
                    whatsapp: user?.meta?.whatsapp || "",
                    email: user?.email || "",
                    phoneVerified: !!user?.phone_verified_at,
                    emailVerified: !!user?.email_verified_at,
                }}
                saving={false}
                onSave={updateUser}
            />

            <Paper
                variant="outlined"
                sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}
            >
                <Stack spacing={2}>
                    <Stack spacing={0.5}>
                        <Typography variant="h6" fontWeight={700}>
                            {t("profile.reviews.title")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t("profile.reviews.description")}
                        </Typography>
                    </Stack>

                    {selfReviewsLoading && (
                        <Typography variant="body2" color="text.secondary">
                            {t("profile.reviews.loading")}
                        </Typography>
                    )}

                    {!selfReviewsLoading && selfReviews.length === 0 && (
                        <Typography variant="body2" color="text.secondary">
                            {t("profile.reviews.empty")}
                        </Typography>
                    )}

                    {!selfReviewsLoading && selfReviews.length > 0 && (
                        <Stack spacing={2.5}>
                            {selfReviews.map((review, idx) => (
                                <Stack key={review.id} spacing={1.5}>
                                    <ProfileReviewRow review={review} />
                                    {idx < selfReviews.length - 1 && <Divider />}
                                </Stack>
                            ))}
                        </Stack>
                    )}
                </Stack>
            </Paper>
        </Stack>
    );
}

function ProfileReviewRow({ review }: { review: UserReview }) {
    const { t } = useTranslation();

    const authorName =
        [review.from_first_name, review.from_last_name].filter(Boolean).join(" ") ||
        review.from_email ||
        review.from_phone ||
        review.from_user_id ||
        t("profile.reviews.defaultAuthor");

    const routeFrom =
        [review.pickup_country, review.pickup_region, review.pickup_city].filter(Boolean).join(", ") ||
        review.pickup_city ||
        review.pickup_region ||
        review.pickup_country ||
        "—";

    const routeTo =
        [review.dropoff_country, review.dropoff_region, review.dropoff_city].filter(Boolean).join(", ") ||
        review.dropoff_city ||
        review.dropoff_region ||
        review.dropoff_country ||
        "—";

    const dateLabel = review.order_date || review.created_at;

    return (
        <Stack spacing={1}>
            <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ width: 40, height: 40 }}>
                    {authorName?.[0]?.toUpperCase()}
                </Avatar>

                <Stack spacing={0.5}>
                    <Typography variant="subtitle1" fontWeight={700}>
                        {authorName}
                    </Typography>

                    <Rating value={Number(review.rating ?? 0)} readOnly size="small" />

                    <Typography variant="body2" color="text.secondary">
                        {routeFrom} → {routeTo}
                    </Typography>

                    {dateLabel && (
                        <Typography variant="body2" color="text.secondary">
                            {formatDate(dateLabel as any)}
                        </Typography>
                    )}
                </Stack>
            </Stack>

            <Typography variant="body2" color="text.primary" lineHeight={1.6}>
                {review.comment || t("profile.reviews.noComment")}
            </Typography>
        </Stack>
    );
}