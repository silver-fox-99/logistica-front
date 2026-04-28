import { Box, Paper, Typography } from "@mui/material";
import { useMediaQuery, useTheme } from "@mui/material";

import "./AddCargoPage.scss";

import { useAddCargoForm } from "@/features/add-cargo-form/model/useAddCargoForm";
import { AddCargoMobileForm } from "@/features/add-cargo-form/ui/AddCargoMobileForm";
import { AddCargoDesktopForm } from "@/features/add-cargo-form/ui/AddCargoDesktopForm";
import {LimitReachedModal} from "@/shared/ui/limit/LimitReachedModal.tsx";

export default function AddCargoPage() {
    const {
        t,
        i18nLang,
        getLocalizedLabel,
        loadingInit,

        currencyOpts,
        vehicleOpts,
        loadOpts,
        cargoOpts,
        payMethodOpts,
        payTermOpts,

        form,
        onSubmit,

        pickupCountryErrors,
        dropoffCountryErrors,
        loading,
        imagePreviews,

        createLimitOpen,
        closeCreateLimit,
    } = useAddCargoForm();

    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

    return (
        <Box className="add-cargo-page">
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }} className="add-cargo-page__paper">
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }} className="add-cargo-page__header">
                    <Box className="add-cargo-page__icon">
                        <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="20.833" cy="20.833" r="20.833" fill="#EEF4F7" />
                            <path
                                d="M20.833 13.889c.48 0 .868.388.868.868v5.208h5.209a.868.868 0 1 1 0 1.736H21.7v5.209a.868.868 0 1 1-1.736 0V21.7h-5.208a.868.868 0 0 1 0-1.736h5.208v-5.208c0-.48.389-.868.868-.868"
                                fill="#4472B8"
                            />
                        </svg>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" mb={1} className="add-cargo-page__title">
                            {t("addCargo.pageTitle")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={2} className="add-cargo-page__subtitle">
                            {t("addCargo.pageSubtitle")}
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            <Paper variant="outlined" sx={{
                p: {
                    xs: "14px !important",
                    sm: "18px !important",
                    md: "24px !important",
                },
            }} className="add-cargo-page__content-paper">
                <Typography variant="h6" mb={1} className="add-cargo-page__title">
                    {t("addCargo.infoTitle")}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2} className="add-cargo-page__subtitle">
                    {t("addCargo.infoSubtitle")}
                </Typography>

                {isDesktop ? (
                    <AddCargoDesktopForm
                        t={t}
                        i18nLang={i18nLang}
                        form={form}
                        onSubmit={onSubmit}
                        loadingInit={loadingInit}
                        cargoOpts={cargoOpts}
                        loading={loading}
                        vehicleOpts={vehicleOpts}
                        loadOpts={loadOpts}
                        payMethodOpts={payMethodOpts}
                        payTermOpts={payTermOpts}
                        currencyOpts={currencyOpts}
                        getLocalizedLabel={getLocalizedLabel}

                        pickupCountryErrors={pickupCountryErrors}
                        dropoffCountryErrors={dropoffCountryErrors}
                        imagePreviews={imagePreviews}
                    />
                ) : (
                    <AddCargoMobileForm
                        t={t}
                        loading={loading}
                        i18nLang={i18nLang}
                        form={form}
                        onSubmit={onSubmit}
                        loadingInit={loadingInit}
                        cargoOpts={cargoOpts}
                        vehicleOpts={vehicleOpts}
                        loadOpts={loadOpts}
                        payMethodOpts={payMethodOpts}
                        payTermOpts={payTermOpts}
                        currencyOpts={currencyOpts}
                        getLocalizedLabel={getLocalizedLabel}

                        pickupCountryErrors={pickupCountryErrors}
                        dropoffCountryErrors={dropoffCountryErrors}
                        imagePreviews={imagePreviews}
                    />
                )}
            </Paper>

            <LimitReachedModal
                open={createLimitOpen}
                onClose={closeCreateLimit}
                titleKey="limits.createCargo.title"
                descriptionKey="limits.createCargo.description"
            />
        </Box>
    );
}
