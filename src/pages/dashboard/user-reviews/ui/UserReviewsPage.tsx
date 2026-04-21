import { Stack } from "@mui/material";
import { memo } from "react";
import { useUserReviewsPage } from "@/features/user-reviews-page/model/useUserReviewsPage";
import { UserProfileSummaryCard } from "@/features/user-reviews-page/ui/UserProfileSummaryCard";
import { CreateUserReviewCard } from "@/features/user-reviews-page/ui/CreateUserReviewCard";
import { UserReviewsListCard } from "@/features/user-reviews-page/ui/UserReviewsListCard";
import ProfileMembershipHistoryCard from "@/features/profile/ui/ProfileMembershipHistoryCard";

function UserReviewsPage() {
    const {
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
    } = useUserReviewsPage();

    if (!canRender) {
        return null;
    }

    return (
        <Stack spacing={3} sx={{ maxWidth: 1200, width: "100%", mx: "auto" }}>
            <UserProfileSummaryCard
                profile={profile}
                profileLoading={profileLoading}
                avgRating={avgRating}
            />

            <ProfileMembershipHistoryCard
                items={membershipHistory}
                loading={membershipHistoryLoading}
            />

            <CreateUserReviewCard
                countries={countries}
                loadRegionsList={loadRegionsList}
                loadCitiesList={loadCitiesList}
                unloadRegionsList={unloadRegionsList}
                unloadCitiesList={unloadCitiesList}
                loading={loading}
                ratingValue={ratingValue}
                comment={comment}
                routeDate={routeDate}
                loadPlace={loadPlace}
                unloadPlace={unloadPlace}
                mockTags={mockTags}
                getLocalizedGeoName={getLocalizedGeoName}
                findCountry={findCountry}
                findRegion={findRegion}
                findCity={findCity}
                onSelectLoadCountry={handleSelectLoadCountry}
                onSelectLoadRegion={handleSelectLoadRegion}
                onSelectLoadCity={handleSelectLoadCity}
                onSelectUnloadCountry={handleSelectUnloadCountry}
                onSelectUnloadRegion={handleSelectUnloadRegion}
                onSelectUnloadCity={handleSelectUnloadCity}
                onRouteDateChange={setRouteDate}
                onRatingChange={setRatingValue}
                onCommentChange={setComment}
                onTagClick={handleTagClick}
                onSubmit={handleCreateReview}
                creating={creating}
            />

            <UserReviewsListCard
                reviews={reviews}
                loadingReviews={loadingReviews}
                page={page}
                pages={pages}
                ratingFilter={ratingFilter}
                ratingCountsAll={ratingCountsAll}
                onChangeRatingFilter={setRatingFilter}
                onLoadMore={handleLoadMore}
                geoNameById={geoNameById}
                onSelectAuthor={loadByUserId}
            />
        </Stack>
    );
}

export default memo(UserReviewsPage);