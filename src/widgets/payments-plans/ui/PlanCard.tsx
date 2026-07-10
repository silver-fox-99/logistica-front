import React, { useMemo } from "react";
import { Box, Button, Card, CardContent, Chip, Divider, Stack, Tooltip, Typography } from "@mui/material";
import { FiCheckCircle, FiShield, FiX } from "react-icons/fi";
import { normalizeValueDisplay } from "@/entities/tariff/lib/plan";
import { formatEntitlementValue } from "@/shared/config/entitlements";
import { useTranslation } from "react-i18next";
import type {TariffPlan} from "@/entities/tariff-plan/model/types.ts";
import { useUserStore } from "@/entities/user/model/user.store";

const pleasantGreen = "#2e7d32";
const pleasantRed = "#d32f2f";

type Props = {
    plan: TariffPlan;
    isCurrent: boolean;
    checkoutLoading: boolean;
    onCheckout: (plan: TariffPlan) => void;
};

export const PlanCard: React.FC<Props> = ({ plan, isCurrent, checkoutLoading, onCheckout }) => {
    const { t } = useTranslation();
    const user = useUserStore((s: any) => s.user);

    const renderBillingPeriod = React.useCallback((plan: TariffPlan) => {
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
    }, [t]);

    const discountInfo = useMemo(() => {
        if (!user || !user.discount_percent) return null;
        const percent = Number(user.discount_percent);
        if (isNaN(percent) || percent <= 0) return null;

        const hasExpired = user.discount_expires_at && new Date(user.discount_expires_at).getTime() <= Date.now();
        if (hasExpired) return null;

        const originalPrice = Number(plan.price);
        if (isNaN(originalPrice) || originalPrice <= 0) return null;

        const discountAmount = (originalPrice * percent) / 100;
        const discountedPrice = Math.max(0, originalPrice - discountAmount);

        const suffix = `/ ${renderBillingPeriod(plan)}`;

        return {
            percent,
            originalPriceLabel: `${plan.price} ${plan.currency} ${suffix}`,
            discountedPriceLabel: `${discountedPrice.toFixed(0)} ${plan.currency} ${suffix}`,
        };
    }, [user, plan, renderBillingPeriod]);

    const enabledLabel = t("paymentsNew.enabled", "Enabled");
    const disabledLabel = t("paymentsNew.disabled", "Disabled");

    const features = useMemo(
        () => [
            { label: t("paymentsNew.orderDetails", "Order details access"), value: formatEntitlementValue("can_view_order_details", plan.entitlements?.can_view_order_details) },
            { label: t("paymentsNew.autoBump", "Can auto bump orders"), value: formatEntitlementValue("can_auto_bump", plan.entitlements?.can_auto_bump) },
            { label: t("paymentsNew.companies", "Company creation"), value: formatEntitlementValue("can_create_companies", plan.entitlements?.can_create_companies) },
            { label: t("paymentsNew.tenders", "Tender access"), value: formatEntitlementValue("can_view_tenders", plan?.entitlements?.can_view_tenders) },
            { label: t("paymentsNew.companies", "Company creation"), value: formatEntitlementValue("can_create_companies", plan.entitlements?.can_create_companies) },
            { label: t("paymentsNew.cargoLimit", "Cargo limit / month"), value: formatEntitlementValue("cargo_limit", plan.entitlements?.cargo_limit) },
            { label: t("paymentsNew.vehicleLimit", "Vehicle limit / month"), value: formatEntitlementValue("vehicle_limit", plan.entitlements?.vehicle_limit) },
            { label: t("paymentsNew.activeTenders", "Active tenders"), value: formatEntitlementValue("active_tenders", plan.entitlements?.active_tenders) },
        ],
        [plan, t]
    );



    const hasPriceInfo =
        plan.price !== null &&
        plan.price !== undefined &&
        plan.price !== "" &&
        !!plan.currency &&
        !!plan.billing_period;

    const renderFeatureValue = (value: unknown) => {
        const normalized = String(value).toLowerCase();
        if (normalized === enabledLabel.toLowerCase()) return <FiCheckCircle size={16} color={pleasantGreen} />;
        if (normalized === disabledLabel.toLowerCase()) return <FiX size={16} color={pleasantRed} />;
        return normalizeValueDisplay(String(value));
    };

    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: "16px",
                height: "100%",
                position: "relative",
                bgcolor: "background.paper",
                borderColor: isCurrent ? "success.main" : "divider",
                borderWidth: isCurrent ? "2px" : "1px",
                boxShadow: isCurrent ? "0 8px 24px rgba(46,125,50,0.08)" : "0 4px 12px rgba(0,0,0,0.03)",
                transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: isCurrent ? "0 12px 28px rgba(46,125,50,0.12)" : "0 12px 24px rgba(15, 95, 194, 0.08)",
                    borderColor: isCurrent ? "success.main" : "primary.light",
                },
            }}
        >
            <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%", p: 3, gap: 2.5 }}>
                <Stack direction="row" spacing={1} alignItems="flex-start" justifyContent="space-between">
                    <Stack spacing={0.5}>
                        <Typography variant="h5" fontWeight={900} sx={{ color: "text.primary" }}>
                            {plan.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            {plan.description || "—"}
                        </Typography>
                    </Stack>

                    {isCurrent && (
                        <Chip
                            size="small"
                            sx={{
                                bgcolor: `${pleasantGreen}22`,
                                color: pleasantGreen,
                                borderColor: `${pleasantGreen}55`,
                                borderWidth: 1,
                                borderStyle: "solid",
                                fontWeight: 700,
                            }}
                            label={t("paymentsNew.current", "Текущий")}
                            icon={<FiShield size={14} />}
                        />
                    )}
                </Stack>

                {hasPriceInfo && (
                    <Box>
                        {discountInfo ? (
                            <Stack spacing={0.5}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ textDecoration: "line-through" }}
                                    >
                                        {plan.price} {plan.currency} / {renderBillingPeriod(plan)}
                                    </Typography>
                                    <Chip
                                        size="small"
                                        color="error"
                                        label={`-${discountInfo.percent}%`}
                                        sx={{ height: 18, fontSize: "0.7rem", fontWeight: 700 }}
                                    />
                                </Stack>
                                <Typography variant="h4" fontWeight={900} color="success.main">
                                    {discountInfo.discountedPriceLabel}
                                </Typography>
                            </Stack>
                        ) : (
                            <Typography variant="h4" fontWeight={900} sx={{ color: "text.primary", letterSpacing: "-0.03em" }}>
                                {Number(plan.price) === 0 ? t("paymentsNew.free", "Бесплатно") : `${plan.price} ${plan.currency}`}
                                {Number(plan.price) !== 0 && (
                                    <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5, fontWeight: 500 }}>
                                        / {renderBillingPeriod(plan)}
                                    </Typography>
                                )}
                            </Typography>
                        )}
                    </Box>
                )}

                <Divider />

                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: "text.primary" }}>
                        {t("paymentsNew.perks", "Что входит:")}
                    </Typography>
                    <Stack spacing={1}>
                        {features.map((row, idx) => {
                            const labelText = (row.label || "").toString().replace(/[:：]\s*$/, "");
                            return (
                                <Box key={idx} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                        {labelText}
                                    </Typography>
                                    {renderFeatureValue(row.value)}
                                </Box>
                            );
                        })}
                    </Stack>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Box sx={{ mt: "auto" }}>
                    <Tooltip title={isCurrent ? t("paymentsNew.tooltips.current", "This is your current plan.") : t("paymentsNew.buttons.upgrade", "Create an invoice to upgrade.")}>
                        <span style={{ width: "100%", display: "block" }}>
                            <Button
                                fullWidth
                                size="large"
                                variant={isCurrent ? "outlined" : "contained"}
                                color={isCurrent ? "inherit" : "primary"}
                                disabled={isCurrent || checkoutLoading}
                                onClick={() => (isCurrent ? undefined : onCheckout(plan))}
                                sx={{
                                    height: "44px",
                                    borderRadius: "10px",
                                    fontWeight: 700,
                                    fontSize: "0.95rem",
                                    textTransform: "none",
                                }}
                            >
                                {checkoutLoading
                                    ? t("paymentsNew.buttons.processing", "Обработка...")
                                    : isCurrent
                                        ? t("paymentsNew.buttons.current", "Текущий")
                                        : t("paymentsNew.buttons.upgrade", "Подключить")}
                            </Button>
                        </span>
                    </Tooltip>
                </Box>
            </CardContent>
        </Card>
    );
};
