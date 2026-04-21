import { memo } from "react";
import {
    Box,
    Button,
    Chip,
    Paper,
    Rating,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import Autocomplete from "@mui/material/Autocomplete";
import { useTranslation } from "react-i18next";
import type { GeoImportItem } from "@/shared/api/geoImportApi";
import type {Place, ReviewGeoLoadingState} from "@/features/user-reviews-page/model/types.ts";

type Props = {
    countries: GeoImportItem[];
    loadRegionsList: GeoImportItem[];
    loadCitiesList: GeoImportItem[];
    unloadRegionsList: GeoImportItem[];
    unloadCitiesList: GeoImportItem[];
    loading: ReviewGeoLoadingState;
    ratingValue: number | null;
    comment: string;
    routeDate: string;
    loadPlace: Place;
    unloadPlace: Place;
    mockTags: string[];
    getLocalizedGeoName: (item: GeoImportItem) => string;
    findCountry: (id?: string | null) => GeoImportItem | null;
    findRegion: (list: GeoImportItem[], id?: string | null) => GeoImportItem | null;
    findCity: (list: GeoImportItem[], id?: string | null) => GeoImportItem | null;
    onSelectLoadCountry: (id?: string | null) => void;
    onSelectLoadRegion: (id?: string | null) => void;
    onSelectLoadCity: (id?: string | null) => void;
    onSelectUnloadCountry: (id?: string | null) => void;
    onSelectUnloadRegion: (id?: string | null) => void;
    onSelectUnloadCity: (id?: string | null) => void;
    onRouteDateChange: (value: string) => void;
    onRatingChange: (value: number | null) => void;
    onCommentChange: (value: string) => void;
    onTagClick: (tag: string) => void;
    onSubmit: () => void;
    creating: boolean;
};

function CreateUserReviewCardComponent({
                                           countries,
                                           loadRegionsList,
                                           loadCitiesList,
                                           unloadRegionsList,
                                           unloadCitiesList,
                                           loading,
                                           ratingValue,
                                           comment,
                                           routeDate,
                                           loadPlace,
                                           unloadPlace,
                                           mockTags,
                                           getLocalizedGeoName,
                                           findCountry,
                                           findRegion,
                                           findCity,
                                           onSelectLoadCountry,
                                           onSelectLoadRegion,
                                           onSelectLoadCity,
                                           onSelectUnloadCountry,
                                           onSelectUnloadRegion,
                                           onSelectUnloadCity,
                                           onRouteDateChange,
                                           onRatingChange,
                                           onCommentChange,
                                           onTagClick,
                                           onSubmit,
                                           creating,
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
            <Stack spacing={3}>
                <Stack spacing={1}>
                    <Typography variant="h6" fontWeight={700}>
                        {t("userReviews.form.yourRatingTitle")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t("userReviews.form.yourRatingSubtitle")}
                    </Typography>

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
                            onChange={(_, value) => onRatingChange(value)}
                            size="large"
                        />
                        <Typography variant="body2" color="text.secondary">
                            {t("userReviews.form.ratingSelect")}
                        </Typography>
                    </Box>
                </Stack>

                <Stack spacing={1.5}>
                    <Typography variant="body1" fontWeight={700}>
                        {t("userReviews.form.routeTitle")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t("userReviews.form.routeSubtitle")}
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid
                            size={{ xs: 12, md: 6 }}
                            sx={{ minWidth: 0, boxSizing: "border-box", width: { xs: "100%", md: "49%" } }}
                        >
                            <Stack spacing={1.25}>
                                <Typography variant="body2" color="text.primary" fontWeight={700}>
                                    {t("userReviews.form.loadTitle")}
                                </Typography>

                                <Autocomplete
                                    options={countries}
                                    getOptionLabel={(option) => getLocalizedGeoName(option) || option.name || ""}
                                    value={findCountry(loadPlace.countryId)}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    onChange={(_, value) => onSelectLoadCountry(value?.id ?? null)}
                                    loading={loading.countries}
                                    noOptionsText={
                                        loading.countries
                                            ? t("userReviews.form.options.loading")
                                            : countries.length
                                                ? t("userReviews.form.options.empty")
                                                : t("userReviews.form.options.notLoaded")
                                    }
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
                                    getOptionLabel={(option) => getLocalizedGeoName(option)}
                                    value={findRegion(loadRegionsList, loadPlace.regionId)}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    onChange={(_, value) => onSelectLoadRegion(value?.id ?? null)}
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
                                    getOptionLabel={(option) => getLocalizedGeoName(option)}
                                    value={findCity(loadCitiesList, loadPlace.cityId)}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    onChange={(_, value) => onSelectLoadCity(value?.id ?? null)}
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
                                    {t("userReviews.form.unloadTitle")}
                                </Typography>

                                <Autocomplete
                                    options={countries}
                                    getOptionLabel={(option) => getLocalizedGeoName(option) || option.name || ""}
                                    value={findCountry(unloadPlace.countryId)}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    onChange={(_, value) => onSelectUnloadCountry(value?.id ?? null)}
                                    loading={loading.countries}
                                    noOptionsText={
                                        loading.countries
                                            ? t("userReviews.form.options.loading")
                                            : countries.length
                                                ? t("userReviews.form.options.empty")
                                                : t("userReviews.form.options.notLoaded")
                                    }
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
                                    getOptionLabel={(option) => getLocalizedGeoName(option)}
                                    value={findRegion(unloadRegionsList, unloadPlace.regionId)}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    onChange={(_, value) => onSelectUnloadRegion(value?.id ?? null)}
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
                                    getOptionLabel={(option) => getLocalizedGeoName(option)}
                                    value={findCity(unloadCitiesList, unloadPlace.cityId)}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    onChange={(_, value) => onSelectUnloadCity(value?.id ?? null)}
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
                        <Typography variant="body2" color="text.primary" fontWeight={700}>
                            {t("userReviews.form.routeDate")}
                        </Typography>
                        <TextField
                            fullWidth
                            value={routeDate}
                            onChange={(e) => onRouteDateChange(e.target.value)}
                            type="date"
                            placeholder={t("userReviews.form.datePlaceholder")}
                        />
                    </Stack>
                </Stack>

                <Stack spacing={1.5}>
                    <Typography variant="body1" fontWeight={700}>
                        {t("userReviews.form.commentTitle")}
                    </Typography>

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
                                onClick={() => onTagClick(tag)}
                            />
                        ))}
                    </Stack>

                    <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        value={comment}
                        onChange={(e) => onCommentChange(e.target.value)}
                        placeholder={t("userReviews.form.commentPlaceholder")}
                    />

                    <Button
                        variant="contained"
                        size="large"
                        sx={{ alignSelf: "flex-start", px: 4 }}
                        onClick={onSubmit}
                        disabled={creating}
                    >
                        {t("userReviews.form.send")}
                    </Button>
                </Stack>
            </Stack>
        </Paper>
    );
}

export const CreateUserReviewCard = memo(CreateUserReviewCardComponent);