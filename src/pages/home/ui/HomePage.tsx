import { useMemo, useState, useEffect } from "react";
import {
    Box,
    Paper,
    Stack,
    Typography,
    Button,
    Tabs,
    Tab,
    Pagination,
    Chip,
    CircularProgress,
    Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
    FiFilter,
    FiTruck,
    FiPackage,
    FiChevronRight,
    FiSearch,
    FiPhoneCall,
    FiShield,
    FiSend,
    FiCheck,
    FiTrendingUp,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { usePublicShipments } from "@/entities/public-shipment/model/usePublicShipmets";
import { PublicShipmentCard } from "@/widgets/public/PublicShipmentCard";
import { ShipmentsFilterDrawer } from "@/widgets/shipments/ShipmentsFilterDrawer";
import type { PublicFilters } from "@/widgets/shipments/ShipmentsFilterDrawer";
import { useInitStore } from "@/shared/store/initStore";
import { useUserStore } from "@/entities/user/model/user.store";
import { useFilterSettingsStore } from "@/shared/store/filterSettingsStore";
import { resolveFilters } from "@/shared/utils/filterSettings";
import { tariffsApi } from "@/shared/api/tariffsApi";
import type { TariffPlan } from "@/entities/tariff-plan/model/types";

type TabKind = "cargo" | "transport";

export default function HomePage() {
    const { t } = useTranslation();
    const { loadInit } = useInitStore();
    const user = useUserStore((s) => s.user);

    const isAuthenticated = !!user;

    const [tab, setTab] = useState<TabKind>("cargo");
    const [page, setPage] = useState(1);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [filters, setFilters] = useState<PublicFilters>(() => {
        const storedKey = `shipments:public-filters:cargo`;
        try {
            const raw = localStorage.getItem(storedKey);
            if (raw) return JSON.parse(raw);
        } catch {}
        const settings = useFilterSettingsStore.getState().settings;
        const defaults = settings?.home.default || { pickup_date_from: "today" };
        return resolveFilters(defaults);
    });

    // Public tariffs state
    const [plans, setPlans] = useState<TariffPlan[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(false);

    useEffect(() => {
        const syncSettings = async () => {
            const settings = await useFilterSettingsStore.getState().loadSettings();
            const storedKey = `shipments:public-filters:${tab}`;
            const raw = localStorage.getItem(storedKey);
            if (!raw) {
                const defaults = settings.home.default;
                setFilters(resolveFilters(defaults));
            }
        };
        syncSettings();
    }, [tab]);

    useEffect(() => {
        loadInit();
        
        // Fetch public plans
        setLoadingPlans(true);
        tariffsApi.listPublicPlans()
            .then((res) => {
                // Sort active plans by priority
                const activePlans = (res.items || []).filter(p => p.is_active);
                activePlans.sort((a, b) => (a.priority || 0) - (b.priority || 0));
                setPlans(activePlans);
            })
            .catch((err) => console.error("Failed to load public tariffs", err))
            .finally(() => setLoadingPlans(false));
    }, [loadInit]);

    const limit = 5;

    const { items, pages, total, loading } = usePublicShipments(tab, page, limit, filters);

    const list = useMemo(() => items, [items]);

    const activeFiltersCount = useMemo(() => {
        return Object.values(filters).filter((value) => value !== undefined && value !== "").length;
    }, [filters]);

    const renderBillingPeriod = (plan: TariffPlan) => {
        const period = plan.billing_period?.toLowerCase();
        if (plan.days > 0) {
            if (plan.days === 1) return t("homePage.tariffsPeriodDay", "день");
            if (plan.days === 30) return t("homePage.tariffsPeriodMonth", "мес.");
            if (plan.days === 365) return t("homePage.tariffsPeriodYear", "год");
            return t("homePage.tariffsPeriodCustomDays", { count: plan.days, defaultValue: `${plan.days} дн.` });
        }
        if (period === "yearly" || period === "year") return t("homePage.tariffsPeriodYear", "год");
        if (period === "monthly" || period === "month") return t("homePage.tariffsPeriodMonth", "мес.");
        if (period === "daily" || period === "day") return t("homePage.tariffsPeriodDay", "день");
        return plan.billing_period || "";
    };

    return (
        <Box sx={{ pb: { xs: 6, md: 10 }, mt: 6 }}>
            {/* 1. HERO SECTION */}
            <Box
                sx={{
                    position: "relative",
                    borderRadius: 4,
                    overflow: "hidden",
                    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%)",
                    color: "white",
                    mb: 6,
                    p: { xs: 4, md: 8 },
                }}
            >
                {/* Visual Accent */}
                <Box
                    sx={{
                        position: "absolute",
                        top: -150,
                        right: -150,
                        width: 400,
                        height: 400,
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0) 70%)",
                        pointerEvents: "none",
                    }}
                />
                
                <Grid container spacing={4} alignItems="center" sx={{ position: "relative", zIndex: 1 }}>
                    <Grid size={{ xs: 12, md: 7 }}>
                        <Stack spacing={3}>
                            <Typography
                                variant="h3"
                                fontWeight={900}
                                sx={{
                                    fontSize: { xs: "2rem", md: "3.2rem" },
                                    lineHeight: 1.2,
                                    background: "linear-gradient(to right, #ffffff, #cbd5e1)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                }}
                            >
                                {t("homePage.heroTitle", "Умная логистика для вашего бизнеса")}
                            </Typography>
                            
                            <Typography
                                variant="h6"
                                color="slate.300"
                                sx={{
                                    fontWeight: 400,
                                    fontSize: { xs: "1rem", md: "1.15rem" },
                                    color: "#94a3b8",
                                    maxWidth: 600,
                                }}
                            >
                                {t("homePage.heroSubtitle", "Быстрый поиск грузов и надежного транспорта по всей стране. Без посредников и переплат.")}
                            </Typography>

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ pt: 1 }}>
                                <Button
                                    component={Link}
                                    to={isAuthenticated ? "/dashboard/search" : "/login"}
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    sx={{
                                        px: 4,
                                        py: 1.5,
                                        textTransform: "none",
                                        fontWeight: 700,
                                        borderRadius: 2.5,
                                        boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)",
                                    }}
                                >
                                    {t("homePage.startSearch", "Начать поиск")}
                                </Button>
                                <Button
                                    component={Link}
                                    to={isAuthenticated ? "/dashboard/create-cargo" : "/auth/register"}
                                    variant="outlined"
                                    size="large"
                                    sx={{
                                        px: 4,
                                        py: 1.5,
                                        textTransform: "none",
                                        fontWeight: 700,
                                        borderRadius: 2.5,
                                        color: "white",
                                        borderColor: "rgba(255, 255, 255, 0.3)",
                                        "&:hover": {
                                            borderColor: "white",
                                            bgcolor: "rgba(255, 255, 255, 0.05)",
                                        },
                                    }}
                                >
                                    {t("homePage.createListing", "Разместить заказ")}
                                </Button>
                            </Stack>

                            {/* Stats Counter */}
                            <Grid container spacing={2} sx={{ pt: 4, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                                <Grid size={4}>
                                    <Typography variant="h5" fontWeight={800} color="#60a5fa">
                                        15K+
                                    </Typography>
                                    <Typography variant="caption" color="#64748b">
                                        {t("homePage.statsCargo", "грузов в базе")}
                                    </Typography>
                                </Grid>
                                <Grid size={4}>
                                    <Typography variant="h5" fontWeight={800} color="#34d399">
                                        8K+
                                    </Typography>
                                    <Typography variant="caption" color="#64748b">
                                        {t("homePage.statsVehicles", "активных перевозчиков")}
                                    </Typography>
                                </Grid>
                                <Grid size={4}>
                                    <Typography variant="h5" fontWeight={800} color="#fbbf24">
                                        99.4%
                                    </Typography>
                                    <Typography variant="caption" color="#64748b">
                                        {t("homePage.statsDeals", "успешных сделок")}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Stack>
                    </Grid>

                    {/* Isometric Illustration Widget */}
                    <Grid size={{ xs: 12, md: 5 }} sx={{ display: { xs: "none", md: "block" } }}>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                position: "relative",
                            }}
                        >
                            <Box
                                sx={{
                                    width: 320,
                                    height: 220,
                                    borderRadius: 3,
                                    bgcolor: "rgba(255,255,255,0.03)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                                    backdropFilter: "blur(12px)",
                                    p: 3,
                                    transform: "perspective(800px) rotateY(-15deg) rotateX(10deg)",
                                    transition: "transform 0.5s ease",
                                    "&:hover": {
                                        transform: "perspective(800px) rotateY(-8deg) rotateX(6deg)",
                                    }
                                }}
                            >
                                <Stack spacing={2}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <FiTrendingUp color="#3b82f6" />
                                            <Typography variant="caption" fontWeight={700} color="#3b82f6">
                                                LIVE ACTIVITY
                                            </Typography>
                                        </Box>
                                        <Chip label="ONLINE" size="small" color="success" sx={{ fontSize: 9, height: 16 }} />
                                    </Stack>

                                    <Box sx={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: 1.5, p: 1.5, bgcolor: "rgba(0,0,0,0.2)" }}>
                                        <Typography variant="caption" color="#94a3b8" display="block">Груз: Оборудование</Typography>
                                        <Typography variant="body2" fontWeight={700} color="white">Ташкент → Самарканд</Typography>
                                        <Typography variant="caption" color="#34d399" display="block">Статус: В поиске авто</Typography>
                                    </Box>

                                    <Box sx={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: 1.5, p: 1.5, bgcolor: "rgba(0,0,0,0.2)" }}>
                                        <Typography variant="caption" color="#94a3b8" display="block">Автомобиль: Рефрижератор</Typography>
                                        <Typography variant="body2" fontWeight={700} color="white">Москва → Казань</Typography>
                                        <Typography variant="caption" color="#60a5fa" display="block">Статус: Свободен</Typography>
                                    </Box>
                                </Stack>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/* 2. BENEFITS SECTION */}
            <Box sx={{ mb: 8 }}>
                <Stack spacing={1} sx={{ textAlign: "center", mb: 5 }}>
                    <Typography variant="h4" fontWeight={800}>
                        {t("homePage.benefitsTitle", "Почему выбирают Logistica")}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: "auto !important" }}>
                        {t("homePage.benefitsSubtitle", "Мы создаем удобные инструменты для грузоперевозчиков и грузовладельцев")}
                    </Typography>
                </Stack>

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                height: "100%",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    transform: "translateY(-6px)",
                                    boxShadow: "0 10px 20px rgba(0,0,0,0.04)",
                                    borderColor: "primary.main",
                                },
                            }}
                        >
                            <Box sx={{ color: "primary.main", mb: 2 }}><FiSearch size={28} /></Box>
                            <Typography variant="subtitle1" fontWeight={700} mb={1}>
                                {t("homePage.benefit1Title", "Быстрый поиск")}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t("homePage.benefit1Desc", "Находите подходящие варианты за секунды с помощью умной фильтрации по геолокации, весу и объему.")}
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                height: "100%",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    transform: "translateY(-6px)",
                                    boxShadow: "0 10px 20px rgba(0,0,0,0.04)",
                                    borderColor: "primary.main",
                                },
                            }}
                        >
                            <Box sx={{ color: "success.main", mb: 2 }}><FiPhoneCall size={28} /></Box>
                            <Typography variant="subtitle1" fontWeight={700} mb={1}>
                                {t("homePage.benefit2Title", "Прямая связь")}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t("homePage.benefit2Desc", "Связывайтесь напрямую с грузовладельцами или перевозчиками без скрытых комиссий и дополнительных сборов.")}
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                height: "100%",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    transform: "translateY(-6px)",
                                    boxShadow: "0 10px 20px rgba(0,0,0,0.04)",
                                    borderColor: "primary.main",
                                },
                            }}
                        >
                            <Box sx={{ color: "warning.main", mb: 2 }}><FiShield size={28} /></Box>
                            <Typography variant="subtitle1" fontWeight={700} mb={1}>
                                {t("homePage.benefit3Title", "Безопасность")}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t("homePage.benefit3Desc", "Все профили компаний проходят ручную верификацию документов перед началом работы на платформе.")}
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                height: "100%",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    transform: "translateY(-6px)",
                                    boxShadow: "0 10px 20px rgba(0,0,0,0.04)",
                                    borderColor: "primary.main",
                                },
                            }}
                        >
                            <Box sx={{ color: "info.main", mb: 2 }}><FiSend size={28} /></Box>
                            <Typography variant="subtitle1" fontWeight={700} mb={1}>
                                {t("homePage.benefit4Title", "Telegram-уведомления")}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t("homePage.benefit4Desc", "Получайте мгновенные оповещения о новых подходящих грузах и сообщениях прямо в Telegram-бот.")}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            {/* 4. SHIPMENTS TABBED PREVIEW LIST */}
            <Box>
                <Paper
                    variant="outlined"
                    sx={{
                        p: { xs: 2, md: 3 },
                        mb: 3,
                        borderRadius: 3,
                        bgcolor: "background.paper",
                    }}
                >
                    <Stack spacing={2}>
                        <Stack
                            direction={{ xs: "column", md: "row" }}
                            justifyContent="space-between"
                            alignItems={{ xs: "stretch", md: "center" }}
                            gap={2}
                        >
                            <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                                <Typography variant="h5" fontWeight={800}>
                                    {t("homePage.freshListings", "Свежие объявления")}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t("homePage.subtitle")}
                                </Typography>
                            </Stack>

                            <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                                <Button
                                    variant="outlined"
                                    startIcon={<FiFilter />}
                                    sx={{ textTransform: "none", borderRadius: 2 }}
                                    onClick={() => setDrawerOpen(true)}
                                >
                                    {t("homePage.filtersButton")}
                                </Button>

                                {activeFiltersCount > 0 ? (
                                    <Chip
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                        label={t("homePage.filtersCount", { count: activeFiltersCount })}
                                    />
                                ) : null}

                                <Chip
                                    size="small"
                                    variant="outlined"
                                    label={t("homePage.totalCount", { count: total })}
                                />
                            </Stack>
                        </Stack>

                        <Tabs
                            value={tab}
                            onChange={(_, value: TabKind) => {
                                setTab(value);
                                setPage(1);
                                const storedKey = `shipments:public-filters:${value}`;
                                try {
                                    const raw = localStorage.getItem(storedKey);
                                    if (raw) {
                                        setFilters(JSON.parse(raw));
                                        return;
                                    }
                                } catch {}
                                const settings = useFilterSettingsStore.getState().settings;
                                const defaults = settings?.home.default || { pickup_date_from: "today" };
                                setFilters(resolveFilters(defaults));
                            }}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{ borderBottom: 1, borderColor: "divider" }}
                        >
                            <Tab
                                value="cargo"
                                icon={<FiPackage />}
                                iconPosition="start"
                                label={t("homePage.cargoTab")}
                                sx={{ textTransform: "none", fontWeight: 700 }}
                            />
                            <Tab
                                value="transport"
                                icon={<FiTruck />}
                                iconPosition="start"
                                label={t("homePage.transportTab")}
                                sx={{ textTransform: "none", fontWeight: 700 }}
                            />
                        </Tabs>
                    </Stack>
                </Paper>

                <Grid container spacing={2}>
                    {list.map((item) => (
                        <Grid size={{ xs: 12 }} key={item.id}>
                            <PublicShipmentCard
                                data={item}
                                kind={tab}
                                cta={{
                                    label: isAuthenticated ? t("homePage.moreDetails") : t("header.register"),
                                    href: isAuthenticated ? "/dashboard/search" : "/auth/register",
                                    icon: <FiChevronRight />,
                                }}
                            />
                        </Grid>
                    ))}

                    {!loading && list.length === 0 ? (
                        <Grid size={{ xs: 12 }}>
                            <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, textAlign: "center" }}>
                                <Typography fontWeight={700} variant="h6">{t("homePage.noResults")}</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    {t("homePage.noResultsHint")}
                                </Typography>
                            </Paper>
                        </Grid>
                    ) : null}

                    {loading ? (
                        <Grid size={{ xs: 12 }}>
                            <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, textAlign: "center" }}>
                                <CircularProgress size={24} sx={{ mb: 1.5 }} />
                                <Typography variant="body2" color="text.secondary">
                                    {t("homePage.loading")}
                                </Typography>
                            </Paper>
                        </Grid>
                    ) : null}
                </Grid>

                {pages > 1 ? (
                    <Stack direction="row" alignItems="center" justifyContent="center" sx={{ mt: 3 }}>
                        <Pagination count={pages} page={page} onChange={(_, value) => setPage(value)} siblingCount={1} />
                    </Stack>
                ) : null}

                {/* View All CTA */}
                <Stack direction="row" justifyContent="center" sx={{ mt: 5 }}>
                    <Button
                        component={Link}
                        to="/dashboard/search"
                        variant="outlined"
                        color="primary"
                        size="large"
                        endIcon={<FiChevronRight />}
                        sx={{
                            px: 4,
                            py: 1.5,
                            borderRadius: 2.5,
                            textTransform: "none",
                            fontWeight: 700,
                        }}
                    >
                        {t("homePage.viewAllShipments", "Посмотреть все объявления")}
                    </Button>
                </Stack>
            </Box>

            <ShipmentsFilterDrawer
                open={drawerOpen}
                pageKey="home"
                initialKind={tab}
                initialFilters={filters}
                showKindSelect={false}
                onClose={() => setDrawerOpen(false)}
                onApply={(_, nextFilters) => {
                    setFilters(nextFilters);
                    setPage(1);
                    setDrawerOpen(false);
                }}
            />

            {/* 3. TARIFFS SECTION */}
            {plans.length > 0 && (
                <Box sx={{ mb: 8, mt: 8 }}>
                    <Stack spacing={1} sx={{ textAlign: "center", mb: 5 }}>
                        <Typography variant="h4" fontWeight={800}>
                            {t("homePage.tariffsTitle", "Тарифные планы")}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: "auto !important" }}>
                            {t("homePage.tariffsSubtitle", "Выберите подходящий тариф для масштабирования вашего логистического бизнеса")}
                        </Typography>
                    </Stack>

                    {loadingPlans ? (
                        <Stack alignItems="center" justifyContent="center" py={4}>
                            <CircularProgress />
                        </Stack>
                    ) : (
                        <Grid container spacing={3} justifyContent="center" alignItems="stretch">
                            {plans.map((plan) => {
                                const isPopular = plan.code.toLowerCase().includes("pro") || plan.code.toLowerCase().includes("popular") || plan.priority === 2;

                                return (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={plan.id}>
                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                p: 3.5,
                                                borderRadius: 3.5,
                                                height: "100%",
                                                display: "flex",
                                                flexDirection: "column",
                                                position: "relative",
                                                border: isPopular ? "2px solid" : "1px solid",
                                                borderColor: isPopular ? "primary.main" : "divider",
                                                boxShadow: isPopular ? "0 10px 30px -10px rgba(59, 130, 246, 0.15)" : "none",
                                            }}
                                        >
                                            {isPopular && (
                                                <Chip
                                                    label={t("homePage.tariffsPopular", "Популярный")}
                                                    color="primary"
                                                    size="small"
                                                    sx={{
                                                        position: "absolute",
                                                        top: -12,
                                                        left: "50%",
                                                        transform: "translateX(-50%)",
                                                        fontWeight: 700,
                                                        fontSize: 10,
                                                        height: 24,
                                                    }}
                                                />
                                            )}

                                            <Stack spacing={2} sx={{ flexGrow: 1 }}>
                                                <Box>
                                                    <Typography variant="subtitle2" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                                                        {plan.code}
                                                    </Typography>
                                                    <Typography variant="h5" fontWeight={800} mt={0.5}>
                                                        {plan.name}
                                                    </Typography>
                                                </Box>

                                                <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
                                                    {plan.description}
                                                </Typography>

                                                <Box sx={{ display: "flex", alignItems: "baseline", my: 2 }}>
                                                    <Typography variant="h3" fontWeight={900}>
                                                        {plan.price !== null ? plan.price : "0"}
                                                    </Typography>
                                                    <Typography variant="h6" color="text.secondary" sx={{ ml: 0.5, fontWeight: 500 }}>
                                                        {plan.currency || "UZS"}
                                                    </Typography>
                                                    <Typography variant="body2" color="slate.500" sx={{ ml: 1 }}>
                                                        / {renderBillingPeriod(plan)}
                                                    </Typography>
                                                </Box>

                                                <Divider />

                                                {/* Entitlements list */}
                                                <Stack spacing={1.5} sx={{ py: 2 }}>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <FiCheck size={16} color="#10b981" style={{ flexShrink: 0 }} />
                                                        <Typography variant="body2">
                                                            {plan.cargo_limit === null
                                                                ? t("homePage.tariffsCargoUnlimited", "Безлимитно грузов")
                                                                : t("homePage.tariffsCargoLimit", { count: plan.cargo_limit, defaultValue: `Лимит грузов: ${plan.cargo_limit}` })}
                                                        </Typography>
                                                    </Stack>

                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <FiCheck size={16} color="#10b981" style={{ flexShrink: 0 }} />
                                                        <Typography variant="body2">
                                                            {plan.vehicle_limit === null
                                                                ? t("homePage.tariffsVehicleUnlimited", "Безлимитно транспорта")
                                                                : t("homePage.tariffsVehicleLimit", { count: plan.vehicle_limit, defaultValue: `Лимит транспорта: ${plan.vehicle_limit}` })}
                                                        </Typography>
                                                    </Stack>

                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <FiCheck size={16} color="#10b981" style={{ flexShrink: 0 }} />
                                                        <Typography variant="body2">
                                                            {plan.order_details_views_per_day_limit === null
                                                                ? t("homePage.tariffsViewDetailsUnlimited", "Безлимитные контакты")
                                                                : t("homePage.tariffsViewDetails", { count: plan.order_details_views_per_day_limit, defaultValue: `Контакты: ${plan.order_details_views_per_day_limit}/день` })}
                                                        </Typography>
                                                    </Stack>

                                                    {plan.can_view_tenders && (
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <FiCheck size={16} color="#10b981" style={{ flexShrink: 0 }} />
                                                            <Typography variant="body2">
                                                                {t("homePage.tariffsTenders", "Доступ к тендерам")}
                                                            </Typography>
                                                        </Stack>
                                                    )}

                                                    {plan.can_auto_bump && (
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <FiCheck size={16} color="#10b981" style={{ flexShrink: 0 }} />
                                                            <Typography variant="body2">
                                                                {t("homePage.tariffsAutoBump", "Автоподъем объявлений")}
                                                            </Typography>
                                                        </Stack>
                                                    )}
                                                </Stack>
                                            </Stack>

                                            <Button
                                                component={Link}
                                                to={isAuthenticated ? "/dashboard/payments" : "/login"}
                                                fullWidth
                                                variant={isPopular ? "contained" : "outlined"}
                                                color="primary"
                                                sx={{
                                                    mt: 3,
                                                    py: 1.2,
                                                    borderRadius: 2,
                                                    textTransform: "none",
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {t("homePage.tariffsSelect", "Выбрать тариф")}
                                            </Button>
                                        </Paper>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    )}
                </Box>
            )}
        </Box>
    );
}