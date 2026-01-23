import { Box, Container, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import { useUserStore } from "@/entities/user/model/user.store";
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

    // держим актуального юзера
    useRefreshMe();
    const user = useUserStore((s) => s.user);

    const currentSubscription = user?.tariff?.active_subscription ?? null;
    const currentPlanId = currentSubscription?.plan_id ?? null;

    const { effectiveEntitlements: effectiveFromApi, usage: usageFromApi } = useTariffMe();
    const effectiveEntitlements = effectiveFromApi ?? user?.tariff?.effective_entitlements ?? null;
    const usageData = usageFromApi ?? (user as any)?.usage ?? null;

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
