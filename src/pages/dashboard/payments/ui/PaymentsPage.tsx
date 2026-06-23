import {Alert, Box, Container, Stack, Typography} from "@mui/material";
import { useTranslation } from "react-i18next";

import { useRefreshMe } from "@/entities/user/model/useRefreshMe";

import { useTariffMe } from "@/entities/tariff/model/useTariffMe";
import { useTariffPlans } from "@/entities/tariff/model/useTariffPlans";
import { useTariffHistory } from "@/entities/tariff/model/useTariffHistory";
import { useTariffInvoices } from "@/entities/tariff/model/useTariffInvoices";

import { useTariffCheckout } from "@/features/tariff-checkout/model/useTariffCheckout";
import {PaymentsTabs} from "@/widgets/payments-details/ui/PaymentsTabs.tsx";
import {PlansSection} from "@/widgets/payments-plans/ui/PlansSection.tsx";



export default function PaymentsPage() {
    const { t } = useTranslation();

    useRefreshMe();
    const { activeSubscription, effectiveEntitlements, usage } = useTariffMe();

    const currentSubscription = activeSubscription ?? null;
    const currentPlanId = currentSubscription?.plan_id ?? null;

    const usageData = usage ?? null;

    const { plans, loading: plansLoading } = useTariffPlans(t);
    const { history, loading: historyLoading, error: historyError } = useTariffHistory(t);
    const { invoices, loading: invoicesLoading, error: invoicesError } = useTariffInvoices(t);

    const { checkout, loadingId } = useTariffCheckout(t);

    return (
        <Box sx={{ minHeight: "calc(100dvh - 120px)", py: 3 }}>
            <Container maxWidth="lg">
                <Stack spacing={3}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack spacing={0.25}>
                            <Typography variant="h5" fontWeight={800}>
                                {t("paymentsNew.title", { defaultValue: "Payments" })}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t("paymentsNew.subtitle", { defaultValue: "Manage your plan, limits, and invoices." })}
                            </Typography>
                        </Stack>
                    </Stack>

                    <Alert
                        severity="info"
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            borderColor: "info.light",
                            backgroundColor: "rgba(2, 136, 209, 0.02)",
                            fontSize: "0.9rem"
                        }}
                    >
                        {t("paymentsNew.cardBindingTip", {
                            defaultValue: "💡 Хотите оплатить без привязки карты? В окне платежной системы выберите любой альтернативный метод оплаты вместо сохранения карты."
                        })}
                    </Alert>

                    <PlansSection
                        plans={plans}
                        loading={plansLoading}
                        currentPlanId={currentPlanId}
                        checkoutLoadingId={loadingId}
                        onCheckout={checkout}
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
            </Container>
        </Box>
    );
}
