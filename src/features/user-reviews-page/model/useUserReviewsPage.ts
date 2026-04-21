import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { userReviewsApi } from "@/shared/api/userReviewsApi";
import { companiesApi } from "@/shared/api/companiesApi";
import { useGeoCascade } from "@/shared/lib/useGeoCascade";
import { useLocalizedGeo } from "@/shared/utils/lookupUtils";
import { useUserStore } from "@/entities/user/model/user.store";
import type { GeoImportItem } from "@/shared/api/geoImportApi";
import type { UserProfileSummary, UserReview } from "@/entities/user-reviews/model/types";
import type { CompanyMembershipHistoryItem } from "@/entities/company/model/types";
import type {Place} from "@/features/user-reviews-page/model/types.ts";

export function useUserReviewsPage() {
    const { id = "" } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const currentUserId = useUserStore((s) => s.user?.id);

    const [profile, setProfile] = useState<UserProfileSummary | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);

    const [membershipHistory, setMembershipHistory] = useState<CompanyMembershipHistoryItem[]>([]);
    const [membershipHistoryLoading, setMembershipHistoryLoading] = useState(false);

    const [reviews, setReviews] = useState<UserReview[]>([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loadingReviews, setLoadingReviews] = useState(false);

    const [ratingFilter, setRatingFilter] = useState<number | null>(null);
    const [avgRating, setAvgRating] = useState<number | null>(null);
    const [ratingCountsAll, setRatingCountsAll] = useState<[number, number, number, number, number]>([0, 0, 0, 0, 0]);

    const [creating, setCreating] = useState(false);
    const [ratingValue, setRatingValue] = useState<number | null>(null);
    const [comment, setComment] = useState("");
    const [routeDate, setRouteDate] = useState("");

    const [loadPlace, setLoadPlace] = useState<Place>({});
    const [unloadPlace, setUnloadPlace] = useState<Place>({});

    const { getLocalizedGeoName } = useLocalizedGeo();
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

    const canRender = useMemo(() => Boolean(id), [id]);

    const mockTags = useMemo(
        () => [
            t("userReviews.tags.fastDelivery", "Fast delivery"),
            t("userReviews.tags.reliability", "Reliable"),
            t("userReviews.tags.positive", "Positive experience"),
            t("userReviews.tags.communication", "Great communication"),
        ],
        [t],
    );

    const loadRegionsList = useMemo(
        () => getRegions(loadPlace.countryId),
        [getRegions, loadPlace.countryId],
    );

    const loadCitiesList = useMemo(
        () => getCities(loadPlace.countryId, loadPlace.regionId),
        [getCities, loadPlace.countryId, loadPlace.regionId],
    );

    const unloadRegionsList = useMemo(
        () => getRegions(unloadPlace.countryId),
        [getRegions, unloadPlace.countryId],
    );

    const unloadCitiesList = useMemo(
        () => getCities(unloadPlace.countryId, unloadPlace.regionId),
        [getCities, unloadPlace.countryId, unloadPlace.regionId],
    );

    const findCountry = useCallback(
        (value?: string | null) => countries.find((country) => country.id === value) ?? null,
        [countries],
    );

    const findRegion = useCallback(
        (list: GeoImportItem[], value?: string | null) =>
            list.find((region) => region.id === value) ?? null,
        [],
    );

    const findCity = useCallback(
        (list: GeoImportItem[], value?: string | null) =>
            list.find((city) => city.id === value) ?? null,
        [],
    );

    const geoNameById = useCallback(
        (value?: string | null) => {
            if (!value) return "";
            const item = findById(value);
            return item ? getLocalizedGeoName(item as any) : "";
        },
        [findById, getLocalizedGeoName],
    );

    const resetForm = useCallback(() => {
        setRatingValue(null);
        setComment("");
        setRouteDate("");
        setLoadPlace({});
        setUnloadPlace({});
    }, []);

    const loadGeoForReviews = useCallback(
        async (list: UserReview[]) => {
            const countryIds = new Set<string>();
            const regionPairs = new Set<string>();

            list.forEach((review) => {
                if (review.pickup_country_id) countryIds.add(review.pickup_country_id);
                if (review.dropoff_country_id) countryIds.add(review.dropoff_country_id);

                if (review.pickup_country_id && review.pickup_region_id) {
                    regionPairs.add(`${review.pickup_country_id}|${review.pickup_region_id}`);
                }

                if (review.dropoff_country_id && review.dropoff_region_id) {
                    regionPairs.add(`${review.dropoff_country_id}|${review.dropoff_region_id}`);
                }
            });

            try {
                await Promise.all(Array.from(countryIds).map((countryId) => ensureRegions(countryId)));
                await Promise.all(
                    Array.from(regionPairs).map((pair) => {
                        const [countryId, regionId] = pair.split("|");
                        return ensureCities(countryId, regionId);
                    }),
                );
            } catch {
                // graceful degradation
            }
        },
        [ensureCities, ensureRegions],
    );

    const fetchProfile = useCallback(async () => {
        if (!id) return null;

        setProfileLoading(true);
        try {
            const data = await userReviewsApi.getUserProfile(id);
            setProfile(data);
            return data;
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t("userReviews.toasts.profileLoadError"));
            setProfile(null);
            return null;
        } finally {
            setProfileLoading(false);
        }
    }, [id, t]);

    const fetchMembershipHistory = useCallback(async () => {
        if (!id) return [];

        setMembershipHistoryLoading(true);
        try {
            const data = await companiesApi.getUserMembershipHistory(id);
            setMembershipHistory(data || []);
            return data || [];
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                t("profile.membershipHistory.loadError", "Failed to load company history"),
            );
            setMembershipHistory([]);
            return [];
        } finally {
            setMembershipHistoryLoading(false);
        }
    }, [id, t]);

    const fetchReviews = useCallback(
        async (nextPage = 1, append = false) => {
            if (!id) return null;

            setLoadingReviews(true);
            try {
                const data = await userReviewsApi.list(id, {
                    page: nextPage,
                    limit: 5,
                    sort: "new",
                });

                const allItems = (data.items || []).filter(
                    (review) => !review.status || review.status === "PUBLISHED",
                );

                const counts = [0, 0, 0, 0, 0];
                let ratingsSum = 0;

                allItems.forEach((review) => {
                    const value = Number(review.rating ?? 0) || 0;
                    const index = Math.min(5, Math.max(1, Math.round(value))) - 1;
                    counts[index] += 1;
                    ratingsSum += value;
                });

                setRatingCountsAll(counts as [number, number, number, number, number]);
                setAvgRating(allItems.length ? ratingsSum / allItems.length : null);

                const filteredItems =
                    ratingFilter != null
                        ? allItems.filter(
                            (review) => Math.round(Number(review.rating ?? 0)) === ratingFilter,
                        )
                        : allItems;

                setPage(data.page);
                setPages(data.pages);
                setReviews((prev) => (append ? [...prev, ...filteredItems] : filteredItems));

                return data;
            } catch (error: any) {
                toast.error(error?.response?.data?.message || t("userReviews.toasts.reviewsLoadError"));

                if (!append) {
                    setReviews([]);
                    setPage(1);
                    setPages(1);
                }

                return null;
            } finally {
                setLoadingReviews(false);
            }
        },
        [id, ratingFilter, t],
    );

    const loadByUserId = useCallback(
        (nextUserId?: string | null) => {
            if (!nextUserId) return;

            if (currentUserId && nextUserId === currentUserId) {
                toast.info(t("userReviews.toasts.selfProfileHint"));
                navigate("/dashboard/profile");
                return;
            }

            navigate(`/dashboard/user-reviews/${nextUserId}`);
        },
        [currentUserId, navigate, t],
    );

    const handleTagClick = useCallback((tag: string) => {
        setComment((prev) => {
            const trimmed = prev.trim();
            if (!trimmed) return tag;
            if (trimmed.split(/\s*,?\s*/).includes(tag)) return prev;
            return `${prev}${prev.endsWith(" ") ? "" : " "}${tag}`;
        });
    }, []);

    const handleCreateReview = useCallback(async () => {
        if (!id) return;

        if (currentUserId && id === currentUserId) {
            toast.info(t("userReviews.toasts.selfReviewForbidden"));
            return;
        }

        if (!ratingValue) {
            toast.warn(t("userReviews.toasts.ratingRequired"));
            return;
        }

        if (!routeDate) {
            toast.warn(t("userReviews.toasts.dateRequired"));
            return;
        }

        setCreating(true);
        try {
            const orderDateIso = new Date(`${routeDate}T00:00:00.000Z`).toISOString();

            await userReviewsApi.create(id, {
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

            toast.success(t("userReviews.toasts.reviewSent"));
            resetForm();
            await fetchReviews(1, false);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t("userReviews.toasts.reviewSendError"));
        } finally {
            setCreating(false);
        }
    }, [
        comment,
        currentUserId,
        fetchReviews,
        id,
        loadPlace.cityId,
        loadPlace.countryId,
        loadPlace.regionId,
        ratingValue,
        resetForm,
        routeDate,
        t,
        unloadPlace.cityId,
        unloadPlace.countryId,
        unloadPlace.regionId,
    ]);

    const handleLoadMore = useCallback(async () => {
        if (loadingReviews || page >= pages) return;
        await fetchReviews(page + 1, true);
    }, [fetchReviews, loadingReviews, page, pages]);

    const handleSelfRedirect = useCallback(() => {
        if (!id) return;
        if (currentUserId && id === currentUserId) {
            toast.info(t("userReviews.toasts.selfProfileHint"));
            navigate("/dashboard/profile");
        }
    }, [currentUserId, id, navigate, t]);

    const handleInitialLoad = useCallback(async () => {
        if (!id) return;
        await Promise.all([fetchProfile(), fetchMembershipHistory()]);
    }, [fetchMembershipHistory, fetchProfile, id]);

    const handleReviewsLoad = useCallback(async () => {
        if (!id) return;
        await fetchReviews(1, false);
    }, [fetchReviews, id]);

    const handleSelectLoadCountry = useCallback(
        (value?: string | null) => {
            setLoadPlace({
                countryId: value ?? null,
                regionId: null,
                cityId: null,
            });

            void ensureRegions(value ?? null);
        },
        [ensureRegions],
    );

    const handleSelectLoadRegion = useCallback(
        (value?: string | null) => {
            setLoadPlace((prev) => ({
                ...prev,
                regionId: value ?? null,
                cityId: null,
            }));

            void ensureCities(loadPlace.countryId ?? null, value ?? null);
        },
        [ensureCities, loadPlace.countryId],
    );

    const handleSelectLoadCity = useCallback((value?: string | null) => {
        setLoadPlace((prev) => ({
            ...prev,
            cityId: value ?? null,
        }));
    }, []);

    const handleSelectUnloadCountry = useCallback(
        (value?: string | null) => {
            setUnloadPlace({
                countryId: value ?? null,
                regionId: null,
                cityId: null,
            });

            void ensureRegions(value ?? null);
        },
        [ensureRegions],
    );

    const handleSelectUnloadRegion = useCallback(
        (value?: string | null) => {
            setUnloadPlace((prev) => ({
                ...prev,
                regionId: value ?? null,
                cityId: null,
            }));

            void ensureCities(unloadPlace.countryId ?? null, value ?? null);
        },
        [ensureCities, unloadPlace.countryId],
    );

    const handleSelectUnloadCity = useCallback((value?: string | null) => {
        setUnloadPlace((prev) => ({
            ...prev,
            cityId: value ?? null,
        }));
    }, []);

    useEffect(() => {
        void loadCountries();
    }, [loadCountries]);

    useEffect(() => {
        handleSelfRedirect();
    }, [handleSelfRedirect]);

    useEffect(() => {
        if (!id || (currentUserId && id === currentUserId)) return;
        void handleInitialLoad();
    }, [currentUserId, handleInitialLoad, id]);

    useEffect(() => {
        if (!id || (currentUserId && id === currentUserId)) return;
        void handleReviewsLoad();
    }, [currentUserId, handleReviewsLoad, id, ratingFilter]);

    useEffect(() => {
        if (!reviews.length) return;
        void loadGeoForReviews(reviews);
    }, [loadGeoForReviews, reviews]);

    return {
        userId: id,
        profile,
        profileLoading,
        membershipHistory,
        membershipHistoryLoading,
        reviews,
        loadingReviews,
        page,
        pages,
        ratingFilter,
        ratingCountsAll,
        avgRating,
        ratingValue,
        comment,
        routeDate,
        loadPlace,
        unloadPlace,
        countries,
        loadRegionsList,
        loadCitiesList,
        unloadRegionsList,
        unloadCitiesList,
        loading,
        findCountry,
        findRegion,
        findCity,
        getLocalizedGeoName,
        handleSelectLoadCountry,
        handleSelectLoadRegion,
        handleSelectLoadCity,
        handleSelectUnloadCountry,
        handleSelectUnloadRegion,
        handleSelectUnloadCity,
        setRouteDate,
        setRatingValue,
        setComment,
        handleTagClick,
        handleCreateReview,
        handleLoadMore,
        setRatingFilter,
        geoNameById,
        loadByUserId,
        creating,
        canRender,
        mockTags,
    };
}