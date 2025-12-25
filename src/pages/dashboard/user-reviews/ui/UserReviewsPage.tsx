import type React from "react";
import { useEffect, useMemo, useState, useCallback } from "react";
import {
    Avatar,
    Box,
    Button,
    Chip,
    Divider,
    Paper,
    Rating,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import Grid from "@mui/material/Grid";
import Autocomplete from "@mui/material/Autocomplete";
import VerifiedIcon from "@mui/icons-material/Verified";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import WorkHistoryOutlinedIcon from "@mui/icons-material/WorkHistoryOutlined";
import DirectionsOutlinedIcon from "@mui/icons-material/DirectionsOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useGeoCascade } from "@/shared/lib/useGeoCascade";
import { useLocalizedGeo } from "@/shared/utils/lookupUtils";
import type { GeoImportItem } from "@/shared/api/geoImportApi";
import { useTranslation } from "react-i18next";
import { userReviewsApi } from "@/shared/api/userReviewsApi";
import { adminUsersApi } from "@/shared/api/adminUsersApi";
import type { UserProfileSummary, UserReview } from "@/entities/user-reviews/model/types";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";

const mockTags = ["Быстрая доставка", "Надежность", "Позитивный опыт", "Отличная коммуникация"];

type Place = {
    countryId?: string | null;
    regionId?: string | null;
    cityId?: string | null;
};

export default function UserReviewsPage() {
    const [searchParams] = useSearchParams();
    const [loadPlace, setLoadPlace] = useState<Place>({});
    const [unloadPlace, setUnloadPlace] = useState<Place>({});
    const [routeDate, setRouteDate] = useState<string>("");
    const [ratingValue, setRatingValue] = useState<number | null>(null);
    const [comment, setComment] = useState<string>("");

    const [userId, setUserId] = useState<string | null>(null);
    const [profile, setProfile] = useState<UserProfileSummary | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);

    const [reviews, setReviews] = useState<UserReview[]>([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [creating, setCreating] = useState(false);
    const { getLocalizedGeoName } = useLocalizedGeo();
    const { t } = useTranslation();
    const {
        countries,
        getRegions,
        getCities,
        loadCountries,
        ensureRegions,
        ensureCities,
        loading,
        findById,
    } = useGeoCascade();

    const ratingCounts = useMemo(() => {
        const counts = [0, 0, 0, 0, 0]; // index 0 -> 1 star, 4 -> 5 stars
        reviews.forEach((r) => {
            const num = Number(r.rating ?? 0) || 0;
            const idx = Math.min(5, Math.max(1, Math.round(num))) - 1;
            counts[idx] += 1;
        });
        return counts;
    }, [reviews]);

    const loadGeoForReviews = useCallback(
        async (list: UserReview[]) => {
            const countryIds = new Set<string>();
            const regionPairs = new Set<string>();

            list.forEach((r) => {
                if (r.pickup_country_id) countryIds.add(r.pickup_country_id);
                if (r.dropoff_country_id) countryIds.add(r.dropoff_country_id);
                if (r.pickup_country_id && r.pickup_region_id)
                    regionPairs.add(`${r.pickup_country_id}|${r.pickup_region_id}`);
                if (r.dropoff_country_id && r.dropoff_region_id)
                    regionPairs.add(`${r.dropoff_country_id}|${r.dropoff_region_id}`);
            });

            try {
                await Promise.all(Array.from(countryIds).map((id) => ensureRegions(id)));
                await Promise.all(
                    Array.from(regionPairs).map((pair) => {
                        const [cid, rid] = pair.split("|");
                        return ensureCities(cid, rid);
                    })
                );
            } catch {
                // ignore geo load errors here; graceful degradation
            }
        },
        [ensureRegions, ensureCities]
    );

    useEffect(() => {
        void loadCountries();
    }, [loadCountries]);
    useEffect(() => {
        if (reviews.length) {
            void loadGeoForReviews(reviews);
        }
    }, [reviews, loadGeoForReviews]);

    const loadRegionsList = useMemo(() => getRegions(loadPlace.countryId), [getRegions, loadPlace.countryId]);
    const loadCitiesList = useMemo(
        () => getCities(loadPlace.countryId, loadPlace.regionId),
        [getCities, loadPlace.countryId, loadPlace.regionId]
    );

    const unloadRegionsList = useMemo(() => getRegions(unloadPlace.countryId), [getRegions, unloadPlace.countryId]);
    const unloadCitiesList = useMemo(
        () => getCities(unloadPlace.countryId, unloadPlace.regionId),
        [getCities, unloadPlace.countryId, unloadPlace.regionId]
    );

    const findCountry = (id?: string | null) => countries.find((c) => c.id === id) ?? null;
    const findRegion = (list: GeoImportItem[], id?: string | null) => list.find((r) => r.id === id) ?? null;
    const findCity = (list: GeoImportItem[], id?: string | null) => list.find((c) => c.id === id) ?? null;
    const formatRating = (value?: number | string | null) => {
        const num = Number(value ?? 0);
        return Number.isFinite(num) ? num.toFixed(1) : "0.0";
    };
    const geoNameById = useCallback(
        (id?: string | null) => {
            if (!id) return "";
            const g = findById(id);
            return g ? getLocalizedGeoName(g as any) : "";
        },
        [findById, getLocalizedGeoName]
    );

    const resetForm = () => {
        setRatingValue(null);
        setComment("");
        setLoadPlace({});
        setUnloadPlace({});
        setRouteDate("");
    };

    const fetchProfile = useCallback(async (id: string) => {
        setProfileLoading(true);
        try {
            const data = await userReviewsApi.getUserProfile(id);
            setProfile(data);
        } catch (e: any) {
            toast.error(e?.message || "Не удалось загрузить профиль");
            setProfile(null);
        } finally {
            setProfileLoading(false);
        }
    }, []);

    const fetchReviews = useCallback(
        async (id: string, nextPage = 1, append = false) => {
            setLoadingReviews(true);
            try {
                const data = await userReviewsApi.list(id, { page: nextPage, limit: 5, sort: "new" });
                const items = (data.items || []).filter((r) => !r.status || r.status === "PUBLISHED");
                setPage(data.page);
                setPages(data.pages);
                setReviews((prev) => (append ? [...prev, ...items] : items));
            } catch (e: any) {
                toast.error(e?.message || "Не удалось загрузить отзывы");
                if (!append) {
                    setReviews([]);
                    setPage(1);
                    setPages(1);
                }
            } finally {
                setLoadingReviews(false);
            }
        },
        []
    );

    const loadByUserId = useCallback(
        async (id: string) => {
            setUserId(id);
            await fetchProfile(id);
            await fetchReviews(id, 1, false);
        },
        [fetchProfile, fetchReviews]
    );

    const handleCreateReview = async () => {
        if (!userId) {
            toast.warn("Сначала выберите пользователя");
            return;
        }
        if (!ratingValue) {
            toast.warn("Поставьте оценку");
            return;
        }
        if (!routeDate) {
            toast.warn("Выберите дату маршрута");
            return;
        }
        setCreating(true);
        try {
            const orderDateIso = routeDate ? new Date(`${routeDate}T00:00:00.000Z`).toISOString() : undefined;

            await userReviewsApi.create(userId, {
                rating: ratingValue,
                comment: comment || "",
                order_date: orderDateIso,
                pickup_country_id: loadPlace.countryId || undefined,
                pickup_region_id: loadPlace.regionId || undefined,
                pickup_city_id: loadPlace.cityId || undefined,
                dropoff_country_id: unloadPlace.countryId || undefined,
                dropoff_region_id: unloadPlace.regionId || undefined,
                dropoff_city_id: unloadPlace.cityId || undefined,
            });
            toast.success("Отзыв отправлен");
            resetForm();
            await fetchReviews(userId, 1, false);
        } catch (e: any) {
            toast.error(e?.message || "Не удалось отправить отзыв");
        } finally {
            setCreating(false);
        }
    };

    useEffect(() => {
        const q = searchParams.get("search");
        if (q) {
            (async () => {
                const query = q.trim();
                if (!query) return;
                try {
                    const res = await adminUsersApi.list({ search: query, limit: 1, page: 1 });
                    const first = res.items?.[0];
                    if (first?.id) {
                        await loadByUserId(first.id);
                        return;
                    }
                } catch {
                    // fallback to direct load by id
                }
                await loadByUserId(query);
            })();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    return (
        <Stack spacing={3} sx={{ maxWidth: 1200, width: "100%", mx: "auto" }}>
            {!userId && (
                <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Найдите пользователя через поиск в шапке, чтобы увидеть профиль и отзывы.
                    </Typography>
                </Paper>
            )}

            {userId && (
                <Paper
                    variant="outlined"
                    sx={{
                        p: { xs: 2, md: 3 },
                        borderRadius: 2,
                        boxShadow: "0px 8px 24px rgba(15, 23, 42, 0.06)",
                        borderColor: "rgba(0,0,0,0.05)"
                    }}
                >
                    {profileLoading ? (
                        <Typography variant="body2" color="text.secondary">Загрузка профиля...</Typography>
                    ) : profile ? (
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ width: 64, height: 64 }} src={profile.avatar_url || undefined}>
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
                                {(() => {
                                    const name =
                                        [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
                                        (profile as any).full_name ||
                                        (profile as any).name ||
                                        profile.email ||
                                        profile.phone ||
                                        "—";
                                    return (
                                        <Typography variant="h6" fontWeight={700}>
                                            {name}
                                        </Typography>
                                    );
                                })()}
                                    {profile.is_admin ? <VerifiedIcon color="primary" fontSize="small" /> : null}
                                </Stack>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                        <Rating
                                            value={Number(
                                                profile.rating ??
                                                (profile as any).rating_value ??
                                                (profile as any).reviews_rating ??
                                                0
                                            )}
                                            precision={0.1}
                                            readOnly
                                            size="small"
                                        />
                                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                            {formatRating(
                                                profile.rating ??
                                                (profile as any).rating_value ??
                                                (profile as any).reviews_rating
                                            )}
                                        </Typography>
                                    </Stack>
                                    {(
                                        profile.location ||
                                        (profile as any).meta?.geo ||
                                        (profile as any).meta?.location
                                    ) && (
                                        <Chip
                                            size="small"
                                            label={`Местоположение: ${
                                                profile.location ||
                                                (profile as any).meta?.geo ||
                                                (profile as any).meta?.location
                                            }`}
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
                                        label="Дата регистрации"
                                        value={profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}
                                    />
                                    <InfoItem
                                        icon={<Inventory2OutlinedIcon fontSize="small" />}
                                        label="Всего отзывов"
                                        value={String(
                                            profile.reviews_count ??
                                            (profile as any).reviews ??
                                            (profile as any).review_count ??
                                            0
                                        )}
                                    />
                                    <InfoItem
                                        icon={<WorkHistoryOutlinedIcon fontSize="small" />}
                                        label="Всего заявок"
                                        value={String(
                                            profile.orders_count ??
                                            (profile as any).orders ??
                                            (profile as any).order_count ??
                                            0
                                        )}
                                    />
                                </Stack>
                            </Stack>
                        </Stack>
                    ) : (
                        <Typography variant="body2" color="text.secondary">Профиль не найден</Typography>
                    )}
                </Paper>
            )}

            {userId && (
                <Paper
                    variant="outlined"
                    sx={{
                        p: { xs: 2, md: 3 },
                        borderRadius: 2,
                        borderColor: "rgba(0,0,0,0.05)",
                        boxShadow: "0px 6px 20px rgba(15, 23, 42, 0.04)"
                    }}
                >
                    <Stack spacing={3}>
                        <Stack spacing={1}>
                            <Typography variant="h6" fontWeight={700}>Ваша оценка</Typography>
                            <Typography variant="body2" color="text.secondary">Как прошел ваш опыт поездки?</Typography>
                        <Box
                            sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 1,
                                px: 1.5,
                                py: 1,
                                borderRadius: 2,
                                bgcolor: "rgba(68,114,184,0.08)",
                            }}
                        >
                            <Rating
                                value={ratingValue ?? 0}
                                onChange={(_, v) => setRatingValue(v)}
                                size="large"
                            />
                            <Typography variant="body2" color="text.secondary">Выберите оценку</Typography>
                        </Box>
                    </Stack>

                    <Stack spacing={1.5}>
                        <Typography variant="body1" fontWeight={700}>Маршрут</Typography>
                        <Typography variant="body2" color="text.secondary">Выберите способ введения маршрута</Typography>

                        <Grid container spacing={2}>
                            <Grid
                                size={{ xs: 12, md: 6 }}
                                sx={{ minWidth: 0, boxSizing: "border-box", width: { xs: "100%", md: "49%" } }}
                            >
                                <Stack spacing={1.25}>
                                    <Typography variant="body2" color="text.primary" fontWeight={700}>
                                        {t("addTransport.fields.loadSection", { defaultValue: "Загрузка" })}
                                    </Typography>
                                    <Autocomplete
                                        options={countries}
                                        getOptionLabel={(o) => getLocalizedGeoName(o) || o.name || ""}
                                        value={findCountry(loadPlace.countryId)}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        onChange={(_, v) => {
                                            setLoadPlace({ countryId: v?.id ?? null, regionId: null, cityId: null });
                                            void ensureRegions(v?.id ?? null);
                                        }}
                                        loading={loading.countries}
                                        noOptionsText={loading.countries ? "Загрузка..." : (countries.length ? "Нет вариантов" : "Данные не загружены")}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                fullWidth
                                                label={t("addTransport.fields.countryLoad")}
                                                placeholder={t("addTransport.fields.startTypingCountry")}
                                            />
                                        )}
                                    />
                                    <Autocomplete
                                        options={loadRegionsList}
                                        getOptionLabel={(o) => getLocalizedGeoName(o)}
                                        value={findRegion(loadRegionsList, loadPlace.regionId)}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        onChange={(_, v) => {
                                            setLoadPlace((p) => ({ ...p, regionId: v?.id ?? null, cityId: null }));
                                            void ensureCities(loadPlace.countryId ?? null, v?.id ?? null);
                                        }}
                                        loading={loading.regionsFor === (loadPlace.countryId || "")}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                fullWidth
                                                label={t("addTransport.fields.regionLoad")}
                                                placeholder={t("addTransport.fields.startTypingRegion")}
                                            />
                                        )}
                                        disabled={!loadPlace.countryId}
                                    />
                                    <Autocomplete
                                        options={loadCitiesList}
                                        getOptionLabel={(o) => getLocalizedGeoName(o)}
                                        value={findCity(loadCitiesList, loadPlace.cityId)}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        onChange={(_, v) => {
                                            setLoadPlace((p) => ({ ...p, cityId: v?.id ?? null }));
                                        }}
                                        loading={loading.citiesFor === `${loadPlace.countryId ?? ""}/${loadPlace.regionId ?? ""}`}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                fullWidth
                                                label={t("addTransport.fields.cityLoad")}
                                                placeholder={t("addTransport.fields.startTypingCity")}
                                            />
                                        )}
                                        disabled={!loadPlace.countryId || !loadPlace.regionId}
                                    />
                                </Stack>
                            </Grid>
                            <Grid
                                size={{ xs: 12, md: 6 }}
                                sx={{ minWidth: 0, boxSizing: "border-box", width: { xs: "100%", md: "49%" } }}
                            >
                                <Stack spacing={1.25}>
                                    <Typography variant="body2" color="text.primary" fontWeight={700}>
                                        {t("addTransport.fields.unloadSection", { defaultValue: "Выгрузка" })}
                                    </Typography>
                                    <Autocomplete
                                        options={countries}
                                        getOptionLabel={(o) => getLocalizedGeoName(o) || o.name || ""}
                                        value={findCountry(unloadPlace.countryId)}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        onChange={(_, v) => {
                                            setUnloadPlace({ countryId: v?.id ?? null, regionId: null, cityId: null });
                                            void ensureRegions(v?.id ?? null);
                                        }}
                                        loading={loading.countries}
                                        noOptionsText={loading.countries ? "Загрузка..." : (countries.length ? "Нет вариантов" : "Данные не загружены")}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                fullWidth
                                                label={t("addTransport.fields.countryUnload")}
                                                placeholder={t("addTransport.fields.startTypingCountry")}
                                            />
                                        )}
                                    />
                                    <Autocomplete
                                        options={unloadRegionsList}
                                        getOptionLabel={(o) => getLocalizedGeoName(o)}
                                        value={findRegion(unloadRegionsList, unloadPlace.regionId)}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        onChange={(_, v) => {
                                            setUnloadPlace((p) => ({ ...p, regionId: v?.id ?? null, cityId: null }));
                                            void ensureCities(unloadPlace.countryId ?? null, v?.id ?? null);
                                        }}
                                        loading={loading.regionsFor === (unloadPlace.countryId || "")}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                fullWidth
                                                label={t("addTransport.fields.regionUnload")}
                                                placeholder={t("addTransport.fields.startTypingRegion")}
                                            />
                                        )}
                                        disabled={!unloadPlace.countryId}
                                    />
                                    <Autocomplete
                                        options={unloadCitiesList}
                                        getOptionLabel={(o) => getLocalizedGeoName(o)}
                                        value={findCity(unloadCitiesList, unloadPlace.cityId)}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        onChange={(_, v) => {
                                            setUnloadPlace((p) => ({ ...p, cityId: v?.id ?? null }));
                                        }}
                                        loading={loading.citiesFor === `${unloadPlace.countryId ?? ""}/${unloadPlace.regionId ?? ""}`}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                fullWidth
                                                label={t("addTransport.fields.cityUnload")}
                                                placeholder={t("addTransport.fields.startTypingCity")}
                                            />
                                        )}
                                        disabled={!unloadPlace.countryId || !unloadPlace.regionId}
                                    />
                                </Stack>
                            </Grid>
                        </Grid>

                        <Stack spacing={1.25} sx={{ maxWidth: { xs: "100%", md: 320 } }}>
                            <Typography variant="body2" color="text.primary" fontWeight={700}>Дата маршрута</Typography>
                            <TextField
                                fullWidth
                                value={routeDate}
                                onChange={(e) => setRouteDate(e.target.value)}
                                type="date"
                                placeholder="мм/дд/гггг"
                            />
                        </Stack>
                    </Stack>

                        <Stack spacing={1.5}>
                            <Typography variant="body1" fontWeight={700}>Оставить комментарий пользователю</Typography>
                            <Stack direction="row" flexWrap="wrap" gap={1}>
                                {mockTags.map((tag) => (
                                    <Chip
                                        key={tag}
                                        label={tag}
                                        variant="outlined"
                                        sx={{
                                            borderColor: "divider",
                                            bgcolor: "background.default",
                                            "&:hover": { bgcolor: "action.hover" },
                                        }}
                                    />
                                ))}
                            </Stack>
                            <TextField
                                fullWidth
                                multiline
                                minRows={3}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Оставьте комментарий про ваш опыт взаимодействия"
                            />
                            <Button
                                variant="contained"
                                size="large"
                                sx={{ alignSelf: "flex-start", px: 4 }}
                                onClick={handleCreateReview}
                                disabled={creating || !userId}
                            >
                                Отправить отзыв
                            </Button>
                        </Stack>
                    </Stack>
                </Paper>
            )}

            {userId && (
                <Paper
                    variant="outlined"
                    sx={{
                        p: { xs: 2, md: 3 },
                        borderRadius: 2,
                        borderColor: "rgba(0,0,0,0.05)",
                        boxShadow: "0px 6px 20px rgba(15, 23, 42, 0.04)"
                    }}
                >
                    <Stack spacing={2.5}>
                        <Stack spacing={0.5}>
                            <Typography variant="h6" fontWeight={700}>Посмотрите отзывы пользователя</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Ознакомьтесь с отзывами пользователя за всё время и решите, хотите ли вы сотрудничать.
                            </Typography>
                        </Stack>

                        <Stack direction="row" flexWrap="wrap" gap={1}>
                        {[
                            { label: "Все", count: reviews.length, active: true },
                            { label: "5", count: ratingCounts[4] },
                            { label: "4", count: ratingCounts[3] },
                            { label: "3", count: ratingCounts[2] },
                            { label: "2", count: ratingCounts[1] },
                            { label: "1", count: ratingCounts[0] },
                        ].map((item, idx) => (
                            <Chip
                                key={item.label}
                                label={`${item.label} (${item.count})`}
                                color={idx === 0 ? "primary" : "default"}
                                variant={idx === 0 ? "filled" : "outlined"}
                                sx={{
                                    borderColor: idx === 0 ? "primary.main" : "divider",
                                    borderRadius: 1,
                                }}
                            />
                        ))}
                    </Stack>

                    <Stack spacing={2.25}>
                        {loadingReviews && reviews.length === 0 && (
                            <Typography variant="body2" color="text.secondary">Загрузка отзывов...</Typography>
                        )}
                        {!loadingReviews && reviews.length === 0 && (
                            <Typography variant="body2" color="text.secondary">Отзывов пока нет</Typography>
                        )}
                        {reviews.map((review, idx) => (
                            <Box key={review.id}>
                                <ReviewCard
                                    data={review}
                                    geoName={geoNameById}
                                    onSelectAuthor={(id) => { if (id) void loadByUserId(id); }}
                                />
                                {idx < reviews.length - 1 && <Divider sx={{ mt: 2, mb: 1 }} />}
                            </Box>
                        ))}
                    </Stack>

                        <Box display="flex" justifyContent="center">
                            <Button
                                variant="outlined"
                                sx={{ minWidth: 200 }}
                                onClick={() => userId && fetchReviews(userId, page + 1, true)}
                                disabled={loadingReviews || !userId || page >= pages}
                            >
                                Загрузить ещё
                            </Button>
                        </Box>
                    </Stack>
                </Paper>
            )}
        </Stack>
    );
}

function ReviewCard({
    data,
    geoName,
    onSelectAuthor,
}: {
    data: UserReview;
    geoName: (id?: string | null) => string;
    onSelectAuthor?: (id?: string | null) => void;
}) {
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
    const createdLabel = created ? new Date(created as any).toLocaleDateString() : "";
    const timeLabel = data.created_at ? new Date(data.created_at as any).toLocaleDateString() : "";
    const text = data.comment || "Без комментария";
    const ratingNum = Number(data.rating ?? 0);
    const price =
        data.price_amount != null && data.price_currency
            ? `${data.price_amount} ${data.price_currency}`
            : null;
    const statusColor =
        data.status === "PUBLISHED" ? "success" : data.status === "REJECTED" ? "error" : "warning";

    const authorName =
        [data.from_first_name, data.from_last_name].filter(Boolean).join(" ") ||
        data.from_email ||
        data.from_phone ||
        data.from_user_id ||
        "Отзыв";
    const authorAvatar = null;

    return (
        <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar
                                sx={{ width: 40, height: 40, cursor: data.from_user_id ? "pointer" : "default" }}
                                src={authorAvatar || undefined}
                                onClick={() => {
                                    if (data.from_user_id) onSelectAuthor?.(data.from_user_id);
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
                                if (data.from_user_id) {
                                    onSelectAuthor?.(data.from_user_id);
                                }
                            }}
                        >
                            {authorName}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Rating value={ratingNum} readOnly size="small" />
                            <Typography variant="body2" color="text.secondary">{Number.isFinite(ratingNum) ? ratingNum.toFixed(1) : ""}</Typography>
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
                                <Typography variant="body2" color="text.secondary">{createdLabel}</Typography>
                            </Stack>
                            {price && (
                                <Typography variant="body2" color="text.secondary">
                                    {price}
                                </Typography>
                            )}
                            {data.order_id && (
                                <Typography variant="body2" color="text.secondary">
                                    Заказ: {data.order_id}
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

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <Stack direction="row" spacing={1} alignItems="center">
            <Box color="text.secondary" display="flex" alignItems="center">{icon}</Box>
            <Typography variant="body2" color="text.secondary">
                {label}: <Typography component="span" color="text.primary" fontWeight={600}>{value}</Typography>
            </Typography>
        </Stack>
    );
}
