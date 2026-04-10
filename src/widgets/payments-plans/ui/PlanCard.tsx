import React, { useMemo } from "react";
import { Box, Button, Card, CardContent, Chip, Divider, Stack, Tooltip, Typography } from "@mui/material";
import { FiArrowUpRight, FiCheckCircle, FiShield, FiX } from "react-icons/fi";
import { priceLabel, normalizeValueDisplay } from "@/entities/tariff/lib/plan";
import { formatEntitlementValue } from "@/shared/config/entitlements";
import { useTranslation } from "react-i18next";
import type {TariffPlan} from "@/entities/tariff-plan/model/types.ts";

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

    const enabledLabel = t("paymentsNew.enabled", "Enabled");
    const disabledLabel = t("paymentsNew.disabled", "Disabled");

    const features = useMemo(
        () => [
            { label: t("paymentsNew.cargoLimit", "Cargo limit / month"), value: formatEntitlementValue("cargo_limit", plan.entitlements?.cargo_limit) },
            { label: t("paymentsNew.vehicleLimit", "Vehicle limit / month"), value: formatEntitlementValue("vehicle_limit", plan.entitlements?.vehicle_limit) },
            { label: t("paymentsNew.orderDetails", "Order details access"), value: formatEntitlementValue("can_view_order_details", plan.entitlements?.can_view_order_details) },
            { label: t("paymentsNew.autoBump", "Can auto bump orders"), value: formatEntitlementValue("can_auto_bump", plan.entitlements?.can_auto_bump) },
            { label: t("paymentsNew.companies", "Company creation"), value: formatEntitlementValue("can_create_companies", plan.entitlements?.can_create_companies) },
        ],
        [plan, t]
    );

    const gradient = isCurrent
        ? "linear-gradient(135deg, rgba(76,175,80,0.16), rgba(76,175,80,0.05))"
        : "linear-gradient(135deg, rgba(68,114,184,0.08), rgba(68,114,184,0.02))";

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
                borderRadius: 3,
                height: "100%",
                position: "relative",
                background: gradient,
                borderColor: isCurrent ? "success.light" : "divider",
                boxShadow: isCurrent ? "0 10px 25px rgba(76,175,80,0.15)" : "0 6px 18px rgba(0,0,0,0.05)",
                transition: "transform 200ms ease, box-shadow 200ms ease",
                "&:hover": { transform: "translateY(-2px)", boxShadow: "0 10px 28px rgba(0,0,0,0.12)" },
            }}
        >
            <CardContent sx={{ display: "grid", gap: 1.25, height: "100%", p: 2.5 }}>
                <Stack direction="row" spacing={1} alignItems="baseline" justifyContent="space-between">
                    <Stack spacing={0.25}>
                        <Typography variant="h6" fontWeight={800}>
                            {plan.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
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
                            }}
                            label={t("paymentsNew.current", "Current")}
                            icon={<FiShield size={14} />}
                        />
                    )}
                </Stack>

                <Box>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                        {t("paymentsNew.perks", "Perks")}
                    </Typography>
                    <Stack spacing={0.6}>
                        {features.map((row, idx) => {
                            const labelText = (row.label || "").toString().replace(/[:：]\s*$/, "");
                            return (
                                <Typography key={idx} variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <strong>{labelText}:</strong> {renderFeatureValue(row.value)}
                                </Typography>
                            );
                        })}
                    </Stack>
                </Box>

                <Divider />

                <Stack direction="row" spacing={1} alignItems="center" justifyContent={hasPriceInfo ? "space-between" : "flex-end"} mt="auto">
                    {hasPriceInfo && (
                        <Stack spacing={0.25}>
                            <Typography variant="subtitle2" fontWeight={800}>
                                {priceLabel(plan)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {t("paymentsNew.billingPeriod", "Billing period")}: {plan.billing_period || "—"}
                            </Typography>
                        </Stack>
                    )}

                    <Tooltip title={isCurrent ? t("paymentsNew.tooltips.current", "This is your current plan.") : t("paymentsNew.tooltips.upgrade", "Create an invoice to upgrade.")}>
            <span>
              <Button
                  size="small"
                  variant={isCurrent ? "outlined" : "contained"}
                  color={isCurrent ? "success" : "primary"}
                  disabled={isCurrent || checkoutLoading}
                  endIcon={<FiArrowUpRight />}
                  onClick={() => (isCurrent ? undefined : onCheckout(plan))}
              >
                {checkoutLoading
                    ? t("paymentsNew.buttons.processing", "Processing...")
                    : isCurrent
                        ? t("paymentsNew.buttons.current", "Current")
                        : t("paymentsNew.buttons.upgrade", "Upgrade")}
              </Button>
            </span>
                    </Tooltip>
                </Stack>

                {!isCurrent && (
                    <Typography variant="caption" color="text.secondary">
                        {t("paymentsNew.supportShort", "Purchase via support")}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};
