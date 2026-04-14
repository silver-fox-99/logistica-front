import { Box, Paper, Typography, useMediaQuery, useTheme } from "@mui/material";

import "./AddTransportPage.scss";

import { useAddTransportForm } from "@/features/add-transport-form/model/useAddTransportForm";
import { AddTransportDesktopForm } from "@/features/add-transport-form/ui/AddTransportDesktopForm";
import { AddTransportMobileForm } from "@/features/add-transport-form/ui/AddTransportMobileForm";

export default function AddTransportPage() {
    const {
        t,
        i18nLang,
        getLocalizedLabel,
        loadingInit,

        currencyOpts,
        vehicleOpts,
        payMethodOpts,
        payTermOpts,

        geo,

        form,
        onSubmit,

        loadCountryErrors,
        unloadCountryErrors,
        loading
    } = useAddTransportForm();

    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

    return (
        <Box className="add-transport-page">
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }} className="add-transport-page__paper">
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }} className="add-transport-page__header">
                    <Box className="add-transport-page__icon">
                        <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="20.833" cy="20.833" r="20.833" fill="#EEF4F7" />
                            <path
                                d="M20.833 13.889c.48 0 .868.388.868.868v5.208h5.209a.868.868 0 1 1 0 1.736H21.7v5.209a.868.868 0 1 1-1.736 0V21.7h-5.208a.868.868 0 0 1 0-1.736h5.208v-5.208c0-.48.389-.868.868-.868"
                                fill="#4472B8"
                            />
                        </svg>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" mb={1} className="add-transport-page__title">
                            {t("addTransport.pageTitle")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={2} className="add-transport-page__subtitle">
                            {t("addTransport.pageSubtitle")}
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
            }} className="add-transport-page__content-paper">
                <Typography variant="h6" mb={1} className="add-transport-page__title">
                    {t("addTransport.infoTitle")}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2} className="add-transport-page__subtitle">
                    {t("addTransport.infoSubtitle")}
                </Typography>

                {isDesktop ? (
                    <AddTransportDesktopForm
                        t={t}
                        i18nLang={i18nLang}
                        form={form}
                        onSubmit={onSubmit}
                        loadingInit={loadingInit}
                        vehicleOpts={vehicleOpts}
                        payMethodOpts={payMethodOpts}
                        payTermOpts={payTermOpts}
                        currencyOpts={currencyOpts}
                        getLocalizedLabel={getLocalizedLabel}
                        geo={geo}
                        loading={loading}
                        loadCountryErrors={loadCountryErrors}
                        unloadCountryErrors={unloadCountryErrors}
                    />
                ) : (
                    <AddTransportMobileForm
                        t={t}
                        i18nLang={i18nLang}
                        form={form}
                        onSubmit={onSubmit}
                        loadingInit={loadingInit}
                        vehicleOpts={vehicleOpts}
                        payMethodOpts={payMethodOpts}
                        payTermOpts={payTermOpts}
                        currencyOpts={currencyOpts}
                        getLocalizedLabel={getLocalizedLabel}
                        geo={geo}
                        loading={loading}
                        loadCountryErrors={loadCountryErrors}
                        unloadCountryErrors={unloadCountryErrors}
                    />
                )}
            </Paper>
        </Box>
    );
}
