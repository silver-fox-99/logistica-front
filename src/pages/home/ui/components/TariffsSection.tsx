import { Box, Typography, Stack, ToggleButtonGroup, ToggleButton, CircularProgress, Paper, Chip, Divider, Button } from "@mui/material";
import Grid from "@mui/material/Grid";
import { FiCheck } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { TariffPlan } from "@/entities/tariff-plan/model/types";

interface TariffsSectionProps {
    plans: TariffPlan[];
    loadingPlans: boolean;
    billingPeriodToggle: "monthly" | "yearly";
    onBillingPeriodChange: (period: "monthly" | "yearly") => void;
    renderBillingPeriod: (plan: TariffPlan) => string;
    isAuthenticated: boolean;
}

export default function TariffsSection({
    plans,
    loadingPlans,
    billingPeriodToggle,
    onBillingPeriodChange,
    renderBillingPeriod,
    isAuthenticated,
}: TariffsSectionProps) {
    const { t } = useTranslation();

    const handleToggleChange = (
        _event: React.MouseEvent<HTMLElement>,
        newPeriod: "monthly" | "yearly" | null
    ) => {
        if (newPeriod !== null) {
            onBillingPeriodChange(newPeriod);
        }
    };

    return (
        <Box
            id="tariffs"
            sx={{
                bgcolor: "#FFFFFF",
                borderTop: "1px solid",
                borderBottom: "1px solid",
                borderColor: "divider",
                py: 10,
                mb: 10,
            }}
        >
            <Box sx={{ maxWidth: 1200, mx: "auto", px: 3 }}>
                <Stack spacing={2} sx={{ textAlign: "center", mb: 5 }}>
                    <Typography variant="h2">
                        {t("homePage.tariffsMainTitle", "Тарифы")}
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: "1.1rem", maxWidth: 700, mx: "auto" }}>
                        {t("homePage.tariffsMainSubtitle", "Выберите подходящий тариф для масштабирования вашего логистического бизнеса. Перевозка ваших грузов по всей стране.")}
                    </Typography>

                    {/* Monthly/Yearly toggle */}
                    <Box sx={{ display: "flex", justifyContent: "center", pt: 2 }}>
                        <ToggleButtonGroup
                            value={billingPeriodToggle}
                            exclusive
                            onChange={handleToggleChange}
                            aria-label="billing period switcher"
                            color="primary"
                            sx={{
                                bgcolor: "#F1F5F9",
                                p: 0.5,
                                borderRadius: "12px",
                                "& .MuiToggleButtonGroup-grouped": {
                                    border: 0,
                                    borderRadius: "10px",
                                    fontWeight: 700,
                                    px: 3,
                                    py: 1,
                                    "&.Mui-selected": {
                                        bgcolor: "background.paper",
                                        color: "primary.main",
                                        boxShadow: "0px 2px 8px rgba(15, 23, 42, 0.08)",
                                        "&:hover": {
                                            bgcolor: "background.paper",
                                        }
                                    }
                                }
                            }}
                        >
                            <ToggleButton value="monthly" aria-label="monthly billing">
                                {t("homePage.billingMonthly", "Ежемесячно")}
                            </ToggleButton>
                            <ToggleButton value="yearly" aria-label="yearly billing">
                                {t("homePage.billingYearly", "Ежегодно")}
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                </Stack>

                {loadingPlans ? (
                    <Stack alignItems="center" justifyContent="center" py={6}>
                        <CircularProgress />
                    </Stack>
                ) : (
                    <Grid container spacing={4} justifyContent="center" alignItems="stretch">
                        {plans.map((plan) => {
                            const isFree = plan.price === "0" || !plan.price || Number(plan.price) === 0;
                            const isPopular = plan.code.toLowerCase().includes("pro") || plan.code.toLowerCase().includes("popular") || plan.priority === 2;

                            // Display annual or monthly price helper
                            let priceDisplay = plan.price !== null ? plan.price : "0";
                            let billingText = `/ ${renderBillingPeriod(plan)}`;

                            if (!isFree && billingPeriodToggle === "yearly" && plan.billing_period?.toLowerCase() !== "yearly") {
                                const originalPrice = Number(plan.price) || 0;
                                const annualPrice = Math.round(originalPrice * 12 * 0.8);
                                priceDisplay = annualPrice.toLocaleString();
                                billingText = "/ год";
                            } else if (!isFree) {
                                priceDisplay = (Number(plan.price) || 0).toLocaleString();
                            }

                            return (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={plan.id}>
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 4,
                                            borderRadius: "16px",
                                            height: "100%",
                                            display: "flex",
                                            flexDirection: "column",
                                            position: "relative",
                                            border: isPopular ? "2px solid" : "1px solid",
                                            borderColor: isPopular ? "primary.main" : "divider",
                                            boxShadow: isPopular ? "0 10px 30px -10px rgba(15, 95, 194, 0.12)" : "none",
                                            transition: "transform 0.3s ease",
                                            "&:hover": {
                                                transform: "translateY(-4px)"
                                            }
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
                                                    fontSize: 11,
                                                    height: 24,
                                                }}
                                            />
                                        )}

                                        <Stack spacing={2} sx={{ flexGrow: 1 }}>
                                            <Box>
                                                <Typography variant="subtitle2" color="primary.main" fontWeight={700} textTransform="uppercase" letterSpacing={0.8} sx={{ fontSize: "0.75rem" }}>
                                                    {plan.code}
                                                </Typography>
                                                <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
                                                    {plan.name}
                                                </Typography>
                                            </Box>

                                            <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40, lineHeight: 1.5 }}>
                                                {plan.description}
                                            </Typography>

                                            <Box sx={{ display: "flex", alignItems: "baseline", my: 2.5 }}>
                                                <Typography variant="h3" sx={{ fontWeight: 900, color: "text.primary" }}>
                                                    {priceDisplay}
                                                </Typography>
                                                <Typography variant="h6" color="text.secondary" sx={{ ml: 1, fontWeight: 600 }}>
                                                    {plan.currency || "UZS"}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                                                    {billingText}
                                                </Typography>
                                            </Box>

                                            <Divider />

                                            {/* Entitlements list */}
                                            <Stack spacing={1.5} sx={{ py: 2 }}>
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Box sx={{ color: "success.main", display: "flex" }}><FiCheck size={18} strokeWidth={2.5} /></Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                                                        {plan.cargo_limit === null
                                                            ? t("homePage.tariffsCargoUnlimited", "Безлимитно грузов")
                                                            : t("homePage.tariffsCargoLimit", { count: plan.cargo_limit, defaultValue: `Лимит грузов: ${plan.cargo_limit}` })}
                                                    </Typography>
                                                </Stack>

                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Box sx={{ color: "success.main", display: "flex" }}><FiCheck size={18} strokeWidth={2.5} /></Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                                                        {plan.vehicle_limit === null
                                                            ? t("homePage.tariffsVehicleUnlimited", "Безлимитно транспорта")
                                                            : t("homePage.tariffsVehicleLimit", { count: plan.vehicle_limit, defaultValue: `Лимит транспорта: ${plan.vehicle_limit}` })}
                                                    </Typography>
                                                </Stack>

                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Box sx={{ color: "success.main", display: "flex" }}><FiCheck size={18} strokeWidth={2.5} /></Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                                                        {plan.order_details_views_per_day_limit === null
                                                            ? t("homePage.tariffsViewDetailsUnlimited", "Безлимитные контакты")
                                                            : t("homePage.tariffsViewDetails", { count: plan.order_details_views_per_day_limit, defaultValue: `Контакты: ${plan.order_details_views_per_day_limit}/день` })}
                                                    </Typography>
                                                </Stack>

                                                {plan.can_view_tenders && (
                                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                                        <Box sx={{ color: "success.main", display: "flex" }}><FiCheck size={18} strokeWidth={2.5} /></Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                                                            {t("homePage.tariffsTenders", "Доступ к тендерам")}
                                                        </Typography>
                                                    </Stack>
                                                )}

                                                {plan.can_auto_bump && (
                                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                                        <Box sx={{ color: "success.main", display: "flex" }}><FiCheck size={18} strokeWidth={2.5} /></Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
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
                                                py: 1.5,
                                                borderRadius: "10px",
                                                fontWeight: 700,
                                                fontSize: "0.95rem"
                                            }}
                                        >
                                            {isFree ? t("homePage.tariffsSelectFree", "Попробовать бесплатно") : t("homePage.tariffsSelect", "Выбрать тариф")}
                                        </Button>
                                    </Paper>
                                </Grid>
                            );
                        })}
                    </Grid>
                )}
            </Box>
        </Box>
    );
}
