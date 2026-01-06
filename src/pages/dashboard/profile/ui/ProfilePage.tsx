import {Stack, Paper, Typography, Rating, Avatar, Divider} from "@mui/material";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import ProfileOverviewCard from "@/features/profile/ui/ProfileOverviewCard.tsx";
import ContactInfoCard, {type ContactInfo} from "@/features/profile/ui/ContactInfoCard.tsx";
import {useUserStore} from "@/entities/user/model/user.store.ts";
import {useEffect, useState} from "react";
import {profileApi} from "@/shared/api/profileApi.ts";
import {userReviewsApi} from "@/shared/api/userReviewsApi.ts";
import type {UserReview} from "@/entities/user-reviews/model/types";
import {formatDate} from "@/shared/utils/formatDate.ts";


export default function ProfilePage() {
    const user = useUserStore(s => s.user)
    const setUser = useUserStore(s => s.setUser)
    const { t } = useTranslation()
    const [userDate, setUserDate] = useState<string>(t('profile.overview.unknown'))
    const [selfReviews, setSelfReviews] = useState<UserReview[]>([])
    const [selfReviewsLoading, setSelfReviewsLoading] = useState(false)

    useEffect(() => {
        if (user) {
            setUserDate(
                new Date(user.created_at).toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    hour12: false,
                    timeZone: 'UTC'
                }) + ' (UTC timezone)'
            );
        }
    }, [user]);

    useEffect(() => {
        const loadSelfReviews = async () => {
            if (!user?.id) return;
            setSelfReviewsLoading(true);
            try {
                const data = await userReviewsApi.list(user.id, { page: 1, limit: 20, sort: "new" });
                const items = (data.items || []).filter(r => !r.status || r.status === "PUBLISHED");
                setSelfReviews(items);
            } catch (error: any) {
                const message = error?.response?.data?.message || t("profile.messages.updateError");
                toast.error(message);
                setSelfReviews([]);
            } finally {
                setSelfReviewsLoading(false);
            }
        };

        void loadSelfReviews();
    }, [t, user?.id]);

    const updateUser = async (values: ContactInfo & { phoneMainE164?: string; phoneAltE164?: string }) => {
        try {
            const preparedData = {
                email: values.email,
                phone: values.phoneMainE164,
                meta: {
                    geo: values.geo,
                    phoneAlt: values.phoneAltE164,
                    telegram: values.telegram,
                    whatsapp: values.whatsapp,
                }
            }
            const res = await profileApi.updateProfile(preparedData)
            setUser(res.data)
            toast.success(t('profile.messages.updateSuccess'))
        } catch (error: any) {
            const message = error?.response?.data?.message || t('profile.messages.updateError')
            toast.error(message)
        }
    }

    return (
        <Stack spacing={3}>
            <ProfileOverviewCard
                fullName={user?.first_name + " " + user?.last_name}
                location={user?.meta?.geo || t('profile.overview.unknown')}
                registeredAt={userDate || t('profile.overview.unknown')}
            />
            <ContactInfoCard
                data={{
                    geo: user?.meta?.geo || '',
                    phoneMain: user?.phone || "",
                    phoneAlt: user?.meta?.phoneAlt || "",
                    telegram: user?.meta?.telegram || "",
                    whatsapp: user?.meta?.whatsapp || "",
                    email: user?.email || "",
                }}
                saving={false}
                onSave={updateUser}
            />
            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
                <Stack spacing={2}>
                    <Stack spacing={0.5}>
                        <Typography variant="h6" fontWeight={700}>Отзывы о вас</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Здесь отображаются опубликованные отзывы других пользователей.
                        </Typography>
                    </Stack>

                    {selfReviewsLoading && (
                        <Typography variant="body2" color="text.secondary">Загрузка отзывов...</Typography>
                    )}
                    {!selfReviewsLoading && selfReviews.length === 0 && (
                        <Typography variant="body2" color="text.secondary">Отзывов пока нет</Typography>
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
    const authorName =
        [review.from_first_name, review.from_last_name].filter(Boolean).join(" ") ||
        review.from_email ||
        review.from_phone ||
        review.from_user_id ||
        "Отзыв";
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
                    <Typography variant="subtitle1" fontWeight={700}>{authorName}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Rating value={Number(review.rating ?? 0)} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary">
                            {Number.isFinite(Number(review.rating)) ? Number(review.rating).toFixed(1) : ""}
                        </Typography>
                    </Stack>
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
                {review.comment || "Без комментария"}
            </Typography>
        </Stack>
    );
}
