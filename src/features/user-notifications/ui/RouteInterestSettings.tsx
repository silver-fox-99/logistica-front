import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
    Card, CardContent, Typography, Stack, Box, Button,
    Autocomplete, TextField, CircularProgress, IconButton, Alert, List, ListItem, ListItemText,
    Chip, useTheme, Divider, Slider
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { FiTrash2, FiPlus, FiMapPin, FiLayers, FiSettings, FiCheck, FiSearch } from "react-icons/fi";
import { useUserRouteInterestsStore } from "@/entities/user-route-interest/model/userRouteInterests.store";
import { publicGeoApi, type PublicGeoLocationItem } from "@/shared/api/publicGeoApi";

function getLocalizedName(
    item: { name: string; name_ru?: string; name_uz?: string } | null | undefined,
    lang: string
) {
    if (!item) return "";
    if (lang.startsWith("ru")) return item.name_ru || item.name;
    if (lang.startsWith("uz")) return item.name_uz || item.name;
    return item.name;
}

function extractCityAndCountry(item: PublicGeoLocationItem, lang: string) {
    const country = item.country
        ? getLocalizedName(item.country, lang)
        : item.type === "COUNTRY"
            ? getLocalizedName(item, lang)
            : "";

    const city = item.type === "CITY"
        ? getLocalizedName(item, lang)
        : item.type === "REGION"
            ? getLocalizedName(item, lang)
            : "";

    return {
        city: city || "",
        country: country || (item.type === "COUNTRY" ? getLocalizedName(item, lang) : "")
    };
}

export function RouteInterestSettings() {
    const { t, i18n } = useTranslation();
    const theme = useTheme();

    const {
        interests,
        loading,
        error,
        fetchInterests,
        createInterest,
        deleteInterest
    } = useUserRouteInterestsStore();

    const [activeTab, setActiveTab] = useState<"auto" | "manual">("auto");

    const [autoMatchPct, setAutoMatchPct] = useState<number>(50);
    const [manualMatchPct, setManualMatchPct] = useState<number>(50);

    // Autocomplete states for manual mode
    const [originOptions, setOriginOptions] = useState<PublicGeoLocationItem[]>([]);
    const [originLoading, setOriginLoading] = useState(false);
    const [selectedOrigin, setSelectedOrigin] = useState<PublicGeoLocationItem | null>(null);

    const [destOptions, setDestOptions] = useState<PublicGeoLocationItem[]>([]);
    const [destLoading, setDestLoading] = useState(false);
    const [selectedDest, setSelectedDest] = useState<PublicGeoLocationItem | null>(null);

    useEffect(() => {
        void fetchInterests();
    }, []);

    // Check if auto mode interest is active
    const autoInterest = useMemo(() => {
        return interests.find((interest) => !interest.manual);
    }, [interests]);

    useEffect(() => {
        if (autoInterest) {
            setAutoMatchPct(autoInterest.match_percentage);
        }
    }, [autoInterest]);

    const isSearching = useMemo(() => {
        if (!autoInterest) return false;
        return !(
            autoInterest.origin_city ||
            autoInterest.origin_country ||
            autoInterest.destination_city ||
            autoInterest.destination_country
        );
    }, [autoInterest]);

    const manualInterests = useMemo(() => {
        return interests.filter((interest) => interest.manual);
    }, [interests]);

    // Handle search for origin
    const handleOriginSearch = useCallback(async (value: string) => {
        const q = value.trim();
        if (q.length < 2) {
            setOriginOptions([]);
            return;
        }
        try {
            setOriginLoading(true);
            const data = await publicGeoApi.search(q);
            setOriginOptions(data);
        } catch (err) {
            console.error(err);
        } finally {
            setOriginLoading(false);
        }
    }, []);

    // Handle search for destination
    const handleDestSearch = useCallback(async (value: string) => {
        const q = value.trim();
        if (q.length < 2) {
            setDestOptions([]);
            return;
        }
        try {
            setDestLoading(true);
            const data = await publicGeoApi.search(q);
            setDestOptions(data);
        } catch (err) {
            console.error(err);
        } finally {
            setDestLoading(false);
        }
    }, []);

    // Enable auto tracking
    const handleEnableAuto = async () => {
        const isUpdate = !!autoInterest;
        const ok = await createInterest({
            manual: false,
            origin_city: "",
            origin_country: "",
            destination_city: "",
            destination_country: "",
            match_percentage: autoMatchPct
        });
        if (ok) {
            if (isUpdate) {
                toast.success(
                    t(
                        "notifications.routeInterests.saveThresholdSuccess",
                        "Порог совпадения успешно обновлен!"
                    )
                );
            } else {
                toast.success(
                    t(
                        "notifications.routeInterests.autoEnabledSuccess",
                        "Автоматический подбор маршрутов успешно активирован!"
                    )
                );
            }
        } else {
            toast.error(error || t("notifications.routeInterests.error", "Произошла ошибка"));
        }
    };

    // Disable auto tracking
    const handleDisableAuto = async () => {
        if (!autoInterest) return;
        const ok = await deleteInterest(autoInterest.id);
        if (ok) {
            toast.success(
                t(
                    "notifications.routeInterests.autoDisabledSuccess",
                    "Автоматический подбор маршрутов отключен"
                )
            );
        } else {
            toast.error(error || t("notifications.routeInterests.error", "Произошла ошибка"));
        }
    };

    // Add manual route interest
    const handleAddManualRoute = async () => {
        if (!selectedOrigin && !selectedDest) {
            toast.error(
                t(
                    "notifications.routeInterests.selectAtLeastOneLocationError",
                    "Пожалуйста, выберите хотя бы одно направление (откуда или куда)"
                )
            );
            return;
        }

        const origin = selectedOrigin ? extractCityAndCountry(selectedOrigin, i18n.language) : { city: "", country: "" };
        const dest = selectedDest ? extractCityAndCountry(selectedDest, i18n.language) : { city: "", country: "" };

        const ok = await createInterest({
            manual: true,
            origin_city: origin.city,
            origin_country: origin.country,
            destination_city: dest.city,
            destination_country: dest.country,
            match_percentage: manualMatchPct
        });

        if (ok) {
            toast.success(t("notifications.routeInterests.manualAddedSuccess", "Маршрут успешно добавлен!"));
            setSelectedOrigin(null);
            setSelectedDest(null);
            setOriginOptions([]);
            setDestOptions([]);
        } else {
            toast.error(error || t("notifications.routeInterests.error", "Произошла ошибка"));
        }
    };

    // Delete manual route interest
    const handleDeleteManualRoute = async (id: string) => {
        const ok = await deleteInterest(id);
        if (ok) {
            toast.success(t("notifications.routeInterests.manualDeletedSuccess", "Маршрут удален из отслеживания"));
        } else {
            toast.error(error || t("notifications.routeInterests.error", "Произошла ошибка"));
        }
    };

    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 4,
                borderColor: "divider",
                boxShadow: "0 4px 20px 0 rgba(0,0,0,0.05)",
                background: theme.palette.mode === "dark"
                    ? "linear-gradient(145deg, #1e1e1e 0%, #121212 100%)"
                    : "linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)",
                overflow: "hidden",
                transition: "all 0.3s ease"
            }}
        >
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                {/* Card Title & Icon */}
                <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 42,
                            height: 42,
                            borderRadius: 3,
                            bgcolor: "primary.lighter",
                            color: "primary.main"
                        }}
                    >
                        <FiSettings size={22} />
                    </Box>
                    <Stack spacing={0.5}>
                        <Typography variant="h6" fontWeight={800} color="text.primary">
                            {t("notifications.routeInterests.cardTitle", "Умные уведомления по маршрутам")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t(
                                "notifications.routeInterests.cardSubtitle",
                                "Управляйте подписками на грузы и транспорт по интересующим направлениям"
                            )}
                        </Typography>
                    </Stack>
                </Stack>

                <Divider sx={{ my: 2, borderColor: "divider" }} />

                {/* Mode Selection Segmented Control */}
                <Box
                    sx={{
                        display: "flex",
                        p: 0.5,
                        borderRadius: 3.5,
                        bgcolor: "action.hover",
                        border: "1px solid",
                        borderColor: "divider",
                        width: "100%",
                        maxWidth: 480,
                        mx: "auto",
                        mb: 4,
                        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)"
                    }}
                >
                    <Box
                        onClick={() => setActiveTab("auto")}
                        sx={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                            py: 1.25,
                            px: { xs: 1, sm: 2 },
                            borderRadius: 3,
                            cursor: "pointer",
                            userSelect: "none",
                            bgcolor: activeTab === "auto" ? "background.paper" : "transparent",
                            boxShadow: activeTab === "auto" 
                                ? theme.palette.mode === "dark" 
                                    ? "0 2px 8px rgba(0,0,0,0.4)" 
                                    : "0 2px 8px rgba(0,0,0,0.08)"
                                : "none",
                            color: activeTab === "auto" ? "primary.main" : "text.secondary",
                            transition: "all 0.2s ease-in-out",
                            "&:hover": {
                                color: "primary.main"
                            }
                        }}
                    >
                        <FiLayers size={16} style={{ transform: activeTab === "auto" ? "scale(1.1)" : "scale(1)", transition: "transform 0.2s" }} />
                        <Typography 
                            variant="body2" 
                            fontWeight={activeTab === "auto" ? 800 : 600}
                            sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" }, whiteSpace: "nowrap" }}
                        >
                            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                                {t("notifications.routeInterests.tabAuto", "Автоматический режим (ИИ)")}
                            </Box>
                            <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                                {t("notifications.routeInterests.tabAutoShort", "Авто-ИИ")}
                            </Box>
                        </Typography>
                    </Box>

                    <Box
                        onClick={() => setActiveTab("manual")}
                        sx={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                            py: 1.25,
                            px: { xs: 1, sm: 2 },
                            borderRadius: 3,
                            cursor: "pointer",
                            userSelect: "none",
                            bgcolor: activeTab === "manual" ? "background.paper" : "transparent",
                            boxShadow: activeTab === "manual"
                                ? theme.palette.mode === "dark" 
                                    ? "0 2px 8px rgba(0,0,0,0.4)" 
                                    : "0 2px 8px rgba(0,0,0,0.08)"
                                : "none",
                            color: activeTab === "manual" ? "primary.main" : "text.secondary",
                            transition: "all 0.2s ease-in-out",
                            "&:hover": {
                                color: "primary.main"
                            }
                        }}
                    >
                        <FiMapPin size={16} style={{ transform: activeTab === "manual" ? "scale(1.1)" : "scale(1)", transition: "transform 0.2s" }} />
                        <Typography 
                            variant="body2" 
                            fontWeight={activeTab === "manual" ? 800 : 600}
                            sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" }, whiteSpace: "nowrap" }}
                        >
                            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                                {t("notifications.routeInterests.tabManual", "Ручной режим")}
                            </Box>
                            <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                                {t("notifications.routeInterests.tabManualShort", "Вручную")}
                            </Box>
                        </Typography>
                    </Box>
                </Box>

                {/* Active Tab Content */}
                {activeTab === "auto" ? (
                    <Stack spacing={2.5}>
                        <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                            {t(
                                "notifications.routeInterests.autoDescription",
                                "В этом режиме система автоматически анализирует историю ваших поисков, созданных отправлений и просмотров. Когда появятся новые подходящие элементы по вашим вероятным направлениям, вы мгновенно получите уведомление."
                            )}
                        </Typography>

                        {autoInterest ? (
                            <Stack spacing={2.5}>
                                {isSearching ? (
                                    <Stack
                                        spacing={3}
                                        alignItems="center"
                                        sx={{
                                            p: 3,
                                            borderRadius: 3,
                                            bgcolor: "action.hover",
                                            border: "1px dashed",
                                            borderColor: "divider",
                                            textAlign: "center"
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                position: "relative",
                                                display: "inline-flex",
                                                width: 80,
                                                height: 80,
                                                alignItems: "center",
                                                justifyContent: "center",
                                                borderRadius: "50%",
                                                bgcolor: "primary.lighter",
                                                color: "primary.main",
                                                my: 3,
                                                "@keyframes pulse": {
                                                    "0%": {
                                                        transform: "scale(0.95)",
                                                        boxShadow: "0 0 0 0 rgba(25, 118, 210, 0.4)",
                                                    },
                                                    "70%": {
                                                        transform: "scale(1)",
                                                        boxShadow: "0 0 0 16px rgba(25, 118, 210, 0)",
                                                    },
                                                    "100%": {
                                                        transform: "scale(0.95)",
                                                        boxShadow: "0 0 0 0 rgba(25, 118, 210, 0)",
                                                    },
                                                },
                                                animation: "pulse 2s infinite ease-in-out",
                                            }}
                                        >
                                            <FiSearch size={32} />
                                        </Box>
                                        <Stack spacing={1} sx={{ maxWidth: 450 }}>
                                            <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                                                {t("notifications.routeInterests.analyzingPreferences", "Анализируем ваши предпочтения...")}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {t(
                                                    "notifications.routeInterests.analyzingPreferencesSub",
                                                    "Мы изучаем вашу историю поисков и просмотров, чтобы определить наиболее частые маршруты. Это займет некоторое время."
                                                )}
                                            </Typography>
                                        </Stack>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={handleDisableAuto}
                                            disabled={loading}
                                            sx={{
                                                textTransform: "none",
                                                borderRadius: 2,
                                                fontWeight: 600,
                                                px: 3,
                                                "&:hover": { bgcolor: "error.lighter" }
                                            }}
                                        >
                                            {loading ? (
                                                <CircularProgress size={20} color="inherit" />
                                            ) : (
                                                t("notifications.routeInterests.disableAutoBtn", "Отключить")
                                            )}
                                        </Button>
                                    </Stack>
                                ) : (
                                    <Stack
                                        direction={{ xs: "column", sm: "row" }}
                                        spacing={2}
                                        justifyContent="space-between"
                                        alignItems={{ xs: "stretch", sm: "center" }}
                                        sx={{
                                            p: 2.5,
                                            borderRadius: 3,
                                            bgcolor: "success.lighter",
                                            border: "1px solid",
                                            borderColor: "success.light",
                                            transition: "all 0.2s ease-in-out"
                                        }}
                                    >
                                        <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                            <Box
                                                sx={{
                                                    display: { xs: "none", sm: "flex" },
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: "50%",
                                                    bgcolor: "success.main",
                                                    color: "white",
                                                    flexShrink: 0
                                                }}
                                            >
                                                <FiCheck size={18} />
                                            </Box>
                                            <Stack>
                                                <Typography variant="subtitle2" fontWeight={700} color="success.dark">
                                                    {t("notifications.routeInterests.autoActive", "Автоматический подбор включен")}
                                                </Typography>
                                                <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ mt: 0.5 }}>
                                                    {t("notifications.routeInterests.detectedPreferences", "Подобранное направление:")}{" "}
                                                    {[autoInterest.origin_city, autoInterest.origin_country].filter(Boolean).join(", ")}
                                                    {" → "}
                                                    {[autoInterest.destination_city, autoInterest.destination_country].filter(Boolean).join(", ")}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {t("notifications.routeInterests.autoActiveSub", "Система слушает новые элементы")} • {t("notifications.routeInterests.threshold", "Порог совпадения:")} {autoInterest.match_percentage}%
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={handleDisableAuto}
                                            disabled={loading}
                                            sx={{
                                                textTransform: "none",
                                                borderRadius: 2,
                                                fontWeight: 600,
                                                px: 3,
                                                "&:hover": { bgcolor: "error.lighter" }
                                            }}
                                        >
                                            {loading ? (
                                                <CircularProgress size={20} color="inherit" />
                                            ) : (
                                                t("notifications.routeInterests.disableAutoBtn", "Отключить")
                                            )}
                                        </Button>
                                    </Stack>
                                )}

                                <Card variant="outlined" sx={{ p: 2.5, borderRadius: 3, borderColor: "divider" }}>
                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems={{ xs: "stretch", sm: "center" }}>
                                        <Box sx={{ flexGrow: 1, width: "100%", px: 1 }}>
                                            <Typography variant="body2" fontWeight={600} color="text.secondary" gutterBottom>
                                                {t("notifications.routeInterests.matchPercentageThreshold", "Минимальный порог совпадения:")} {autoMatchPct}%
                                            </Typography>
                                            <Slider
                                                value={autoMatchPct}
                                                onChange={(_, val) => setAutoMatchPct(val as number)}
                                                min={10}
                                                max={100}
                                                step={10}
                                                marks={[
                                                    { value: 10, label: "10%" },
                                                    { value: 50, label: "50%" },
                                                    { value: 100, label: "100%" }
                                                ]}
                                                valueLabelDisplay="auto"
                                                disabled={loading}
                                            />
                                        </Box>
                                        

                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handleEnableAuto}
                                                disabled={loading || autoMatchPct === autoInterest.match_percentage}
                                                sx={{
                                                    textTransform: "none",
                                                    borderRadius: 2,
                                                    fontWeight: 700,
                                                    px: 3,
                                                    height: 40,
                                                    whiteSpace: "nowrap",
                                                    width: { xs: "100%", sm: "auto" }
                                                }}
                                            >
                                                {loading ? (
                                                    <CircularProgress size={20} color="inherit" />
                                                ) : (
                                                    t("notifications.routeInterests.saveThresholdBtn", "Сохранить порог")
                                                )}
                                            </Button>

                                    </Stack>
                                </Card>
                            </Stack>
                        ) : (
                            <Stack
                                direction="column"
                                spacing={2}
                                alignItems="center"
                                sx={{
                                    py: 4,
                                    px: 2,
                                    borderRadius: 3,
                                    bgcolor: "action.hover",
                                    border: "1px dashed",
                                    borderColor: "divider",
                                    textAlign: "center"
                                }}
                            >
                                <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                                    {t("notifications.routeInterests.autoInactive", "Автоматический подбор не активен")}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mb: 1 }}>
                                    {t(
                                        "notifications.routeInterests.autoInactiveSub",
                                        "Включите функцию автоматического отслеживания, чтобы доверить анализ предпочтений нашей умной системе."
                                    )}
                                </Typography>
                                
                                <Box sx={{ width: "100%", maxWidth: 360, px: 2, mb: 2 }}>
                                    <Typography variant="body2" fontWeight={600} color="text.secondary" align="left" gutterBottom>
                                        {t("notifications.routeInterests.matchPercentageThreshold", "Минимальный порог совпадения:")} {autoMatchPct}%
                                    </Typography>
                                    <Slider
                                        value={autoMatchPct}
                                        onChange={(_, val) => setAutoMatchPct(val as number)}
                                        min={10}
                                        max={100}
                                        step={10}
                                        marks={[
                                            { value: 10, label: "10%" },
                                            { value: 50, label: "50%" },
                                            { value: 100, label: "100%" }
                                        ]}
                                        valueLabelDisplay="auto"
                                    />
                                </Box>

                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleEnableAuto}
                                    disabled={loading}
                                    sx={{
                                        textTransform: "none",
                                        borderRadius: 2.5,
                                        fontWeight: 700,
                                        px: 4,
                                        py: 1.25,
                                        boxShadow: theme.shadows[2],
                                        width: { xs: "100%", sm: "auto" }
                                    }}
                                >
                                    {loading ? (
                                        <CircularProgress size={22} color="inherit" />
                                    ) : (
                                        t("notifications.routeInterests.enableAutoBtn", "Включить автоподбор")
                                    )}
                                </Button>
                            </Stack>
                        )}
                    </Stack>
                ) : (
                    <Stack spacing={3}>
                        <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                            {t(
                                "notifications.routeInterests.manualDescription",
                                "Настройте конкретные направления вручную. Укажите города отправления и прибытия, и мы будем отправлять уведомления о каждом новом объявлении на этих маршрутах."
                            )}
                        </Typography>

                        {/* Input Fields */}
                        <Stack spacing={3}>
                            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="stretch">
                                <Autocomplete
                                    fullWidth
                                    options={originOptions}
                                    loading={originLoading}
                                    value={selectedOrigin}
                                    onChange={(_, newValue) => setSelectedOrigin(newValue)}
                                    onInputChange={(_, value, reason) => {
                                        if (reason === "input") handleOriginSearch(value);
                                    }}
                                    getOptionLabel={(option) => {
                                        const loc = extractCityAndCountry(option, i18n.language);
                                        return [loc.city, loc.country].filter(Boolean).join(", ");
                                    }}
                                    isOptionEqualToValue={(option, val) => option.id === val.id}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label={t("notifications.routeInterests.originLabel", "Откуда (Город/Страна)")}
                                            placeholder={t("notifications.routeInterests.originPlaceholder", "Начните вводить...")}
                                            InputProps={{
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <>
                                                        <FiMapPin style={{ marginRight: 8, color: theme.palette.text.secondary }} />
                                                        {params.InputProps.startAdornment}
                                                    </>
                                                ),
                                                endAdornment: (
                                                    <>
                                                        {originLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                )
                                            }}
                                        />
                                    )}
                                />

                                <Autocomplete
                                    fullWidth
                                    options={destOptions}
                                    loading={destLoading}
                                    value={selectedDest}
                                    onChange={(_, newValue) => setSelectedDest(newValue)}
                                    onInputChange={(_, value, reason) => {
                                        if (reason === "input") handleDestSearch(value);
                                    }}
                                    getOptionLabel={(option) => {
                                        const loc = extractCityAndCountry(option, i18n.language);
                                        return [loc.city, loc.country].filter(Boolean).join(", ");
                                    }}
                                    isOptionEqualToValue={(option, val) => option.id === val.id}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label={t("notifications.routeInterests.destLabel", "Куда (Город/Страна)")}
                                            placeholder={t("notifications.routeInterests.destPlaceholder", "Начните вводить...")}
                                            InputProps={{
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <>
                                                        <FiMapPin style={{ marginRight: 8, color: theme.palette.text.secondary }} />
                                                        {params.InputProps.startAdornment}
                                                    </>
                                                ),
                                                endAdornment: (
                                                    <>
                                                        {destLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                )
                                            }}
                                        />
                                    )}
                                />
                            </Stack>

                            <Box sx={{ width: "100%", maxWidth: 500, px: 1 }}>
                                <Typography variant="body2" fontWeight={600} color="text.secondary" gutterBottom>
                                    {t("notifications.routeInterests.matchPercentageThreshold", "Минимальный порог совпадения:")} {manualMatchPct}%
                                </Typography>
                                <Slider
                                    value={manualMatchPct}
                                    onChange={(_, val) => setManualMatchPct(val as number)}
                                    min={10}
                                    max={100}
                                    step={10}
                                    marks={[
                                        { value: 10, label: "10%" },
                                        { value: 50, label: "50%" },
                                        { value: 100, label: "100%" }
                                    ]}
                                    valueLabelDisplay="auto"
                                />
                            </Box>

                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleAddManualRoute}
                                disabled={loading}
                                startIcon={<FiPlus />}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: 2.5,
                                    fontWeight: 700,
                                    width: { xs: "100%", md: "fit-content" },
                                    px: 4,
                                    height: 48
                                }}
                            >
                                {loading ? (
                                    <CircularProgress size={22} color="inherit" />
                                ) : (
                                    t("notifications.routeInterests.addRouteBtn", "Добавить маршрут")
                                )}
                            </Button>
                        </Stack>

                        {/* List of active manual interests */}
                        <Box>
                            <Typography variant="subtitle2" fontWeight={800} color="text.primary" mb={1.5}>
                                {t("notifications.routeInterests.trackedRoutesTitle", "Отслеживаемые маршруты")} ({manualInterests.length})
                            </Typography>

                            {manualInterests.length === 0 ? (
                                <Alert
                                    severity="info"
                                    variant="outlined"
                                    sx={{ borderRadius: 3, borderStyle: "dashed" }}
                                >
                                    {t(
                                        "notifications.routeInterests.noTrackedRoutes",
                                        "Вы пока не добавили ни одного маршрута для ручного отслеживания."
                                    )}
                                </Alert>
                            ) : (
                                <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "divider", overflow: "hidden" }}>
                                    <List disablePadding>
                                        {manualInterests.map((interest, index) => {
                                            const originText = [interest.origin_city, interest.origin_country].filter(Boolean).join(", ");
                                            const destText = [interest.destination_city, interest.destination_country].filter(Boolean).join(", ");
                                            return (
                                                <React.Fragment key={interest.id}>
                                                    <ListItem
                                                        sx={{ 
                                                            p: 2,
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "center",
                                                            gap: 1.5
                                                        }}
                                                    >
                                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ flexGrow: 1, minWidth: 0 }}>
                                                            <Box
                                                                sx={{
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    width: 32,
                                                                    height: 32,
                                                                    borderRadius: 2,
                                                                    bgcolor: "action.hover",
                                                                    color: "text.secondary",
                                                                    flexShrink: 0
                                                                }}
                                                            >
                                                                <FiMapPin size={16} />
                                                            </Box>
                                                            <ListItemText
                                                                sx={{ minWidth: 0 }}
                                                                primary={
                                                                    <Typography variant="body1" fontWeight={700} sx={{ wordBreak: "break-word" }}>
                                                                        {originText && destText ? (
                                                                            `${originText} → ${destText}`
                                                                        ) : originText ? (
                                                                            `${t("notifications.routeInterests.from", "Из:")} ${originText} (${t("notifications.routeInterests.anyDirection", "в любом направлении")})`
                                                                        ) : destText ? (
                                                                            `${t("notifications.routeInterests.to", "В:")} ${destText} (${t("notifications.routeInterests.fromAnyDirection", "из любого направления")})`
                                                                        ) : (
                                                                            "—"
                                                                        )}
                                                                    </Typography>
                                                                }
                                                                secondary={
                                                                    <Chip
                                                                        label={`${t("notifications.routeInterests.matchPercentage", "Совпадение:")} ${interest.match_percentage}%`}
                                                                        size="small"
                                                                        sx={{ mt: 0.5, fontSize: "0.75rem", height: 20 }}
                                                                    />
                                                                }
                                                            />
                                                        </Stack>
                                                        <IconButton
                                                            color="error"
                                                            onClick={() => handleDeleteManualRoute(interest.id)}
                                                            disabled={loading}
                                                            sx={{
                                                                bgcolor: "error.lighter",
                                                                "&:hover": { bgcolor: "error.light", color: "white" },
                                                                transition: "all 0.2s",
                                                                flexShrink: 0
                                                            }}
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </IconButton>
                                                    </ListItem>
                                                    {index < manualInterests.length - 1 && <Divider />}
                                                </React.Fragment>
                                            );
                                        })}
                                    </List>
                                </Card>
                            )}
                        </Box>
                    </Stack>
                )}
            </CardContent>
        </Card>
    );
}
