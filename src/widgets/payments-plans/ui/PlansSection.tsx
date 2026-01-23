import React from "react";
import { Box, Typography } from "@mui/material";
import type { TariffPlan } from "@/shared/api/tariffsApi";
import { PlanCard } from "./PlanCard";
import { useTranslation } from "react-i18next";

type Props = {
    plans: TariffPlan[];
    loading: boolean;
    currentPlanId: string | null;
    checkoutLoadingId: string | null;
    onCheckout: (plan: TariffPlan) => void;
};

export const PlansSection: React.FC<Props> = ({ plans, loading, currentPlanId, checkoutLoadingId, onCheckout }) => {
    const { t } = useTranslation();

    return (
        <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "repeat(2, 1fr)" }} gap={2}>
            {loading && (
                <Box>
                    <Typography variant="body2" color="text.secondary">
                        {t("paymentsNew.loading", "Loading...")}
                    </Typography>
                </Box>
            )}

            {!loading &&
                plans.map((plan) => (
                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        isCurrent={currentPlanId === plan.id}
                        checkoutLoading={checkoutLoadingId === plan.id}
                        onCheckout={onCheckout}
                    />
                ))}
        </Box>
    );
};
