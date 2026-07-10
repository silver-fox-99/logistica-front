import { useState } from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { FiCreditCard } from "react-icons/fi";

import { useRefreshMe } from "@/entities/user/model/useRefreshMe";

import { useTariffMe } from "@/entities/tariff/model/useTariffMe";
import { useTariffPlans } from "@/entities/tariff/model/useTariffPlans";
import { useTariffHistory } from "@/entities/tariff/model/useTariffHistory";
import { useTariffInvoices } from "@/entities/tariff/model/useTariffInvoices";

import { useTariffCheckout } from "@/features/tariff-checkout/model/useTariffCheckout";
import { PaymentsTabs } from "@/widgets/payments-details/ui/PaymentsTabs.tsx";
import { PlansSection } from "@/widgets/payments-plans/ui/PlansSection.tsx";
import { PaymentWarningDialog } from "./PaymentWarningDialog";
import type { TariffPlan } from "@/entities/tariff-plan/model/types.ts";

export default function PaymentsPage() {
  const { t } = useTranslation();

  useRefreshMe();
  const { activeSubscription, effectiveEntitlements, usage } = useTariffMe();

  const currentSubscription = activeSubscription ?? null;
  const currentPlanId = currentSubscription?.plan_id ?? null;

  const usageData = usage ?? null;

  const { plans, loading: plansLoading } = useTariffPlans(t);
  const {
    history,
    loading: historyLoading,
    error: historyError,
  } = useTariffHistory(t);
  const {
    invoices,
    loading: invoicesLoading,
    error: invoicesError,
  } = useTariffInvoices(t);

  const { checkout, loadingId } = useTariffCheckout(t);

  const [selectedPlanForCheckout, setSelectedPlanForCheckout] =
    useState<TariffPlan | null>(null);

  const handleCheckoutClick = (plan: TariffPlan) => {
    setSelectedPlanForCheckout(plan);
  };

  const handleConfirmCheckout = () => {
    if (selectedPlanForCheckout) {
      checkout(selectedPlanForCheckout);
      setSelectedPlanForCheckout(null);
    }
  };

  const handleCancelCheckout = () => {
    setSelectedPlanForCheckout(null);
  };

  return (
    <Box sx={{ minHeight: "calc(100dvh - 120px)" }}>
      <Stack spacing={3}>
        <Paper
          variant="outlined"
          sx={{
            p: 2.25,
            borderRadius: "16px",
            mb: 0.5,
            display: "flex",
            alignItems: "center",
            gap: 2,
            bgcolor: "background.paper",
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "12px",
              bgcolor: "rgba(15, 95, 194, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "primary.main",
            }}
          >
            <FiCreditCard size={24} />
          </Box>
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 850,
                color: "text.primary",
                letterSpacing: "-0.02em",
                mb: 0.25,
              }}
            >
              {t("paymentsNew.title", { defaultValue: "Тарифы" })}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", fontWeight: 500 }}
            >
              {t("paymentsNew.subtitle", {
                defaultValue:
                  "Выберите подходящий тариф и управляйте вашими лимитами использования.",
              })}
            </Typography>
          </Box>
        </Paper>

        {/*<Alert*/}
        {/*    severity="info"*/}
        {/*    variant="outlined"*/}
        {/*    sx={{*/}
        {/*        borderRadius: 2,*/}
        {/*        borderColor: "info.light",*/}
        {/*        backgroundColor: "rgba(2, 136, 209, 0.02)",*/}
        {/*        fontSize: "0.9rem"*/}
        {/*    }}*/}
        {/*>*/}
        {/*    {t("paymentsNew.cardBindingTip", {*/}
        {/*        defaultValue: "💡 Хотите оплатить без привязки карты? В окне платежной системы выберите любой альтернативный метод оплаты вместо сохранения карты."*/}
        {/*    })}*/}
        {/*</Alert>*/}

        <PlansSection
          plans={plans}
          loading={plansLoading}
          currentPlanId={currentPlanId}
          checkoutLoadingId={loadingId}
          onCheckout={handleCheckoutClick}
        />

        <PaymentsTabs
          effectiveEntitlements={effectiveEntitlements}
          usage={usageData}
          plans={plans}
          history={history}
          historyLoading={historyLoading}
          historyError={historyError}
          invoices={invoices}
          invoicesLoading={invoicesLoading}
          invoicesError={invoicesError}
        />
      </Stack>

      <PaymentWarningDialog
        open={!!selectedPlanForCheckout}
        onClose={handleCancelCheckout}
        onConfirm={handleConfirmCheckout}
      />
    </Box>
  );
}
