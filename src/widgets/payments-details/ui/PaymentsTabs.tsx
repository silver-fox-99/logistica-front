import React, { useState } from "react";
import { Card, CardContent, Tab, Tabs } from "@mui/material";
import { LimitsTab } from "./LimitsTab";
import { HistoryTab } from "./HistoryTab";
import { InvoicesTab } from "./InvoicesTab";
import { useTranslation } from "react-i18next";
import type {
    Entitlements, TariffInvoice,
    TariffMeResponse,
    TariffPlan,
    TariffSubscription
} from "@/entities/tariff-plan/model/types.ts";

type Props = {
    effectiveEntitlements: Entitlements | null;
    usage: TariffMeResponse["usage"] | null;

    plans: TariffPlan[];

    history: TariffSubscription[];
    historyLoading: boolean;
    historyError: string | null;

    invoices: TariffInvoice[];
    invoicesLoading: boolean;
    invoicesError: string | null;
};

export const PaymentsTabs: React.FC<Props> = ({
                                                  effectiveEntitlements,
                                                  usage,
                                                  plans,
                                                  history,
                                                  historyLoading,
                                                  historyError,
                                                  invoices,
                                                  invoicesLoading,
                                                  invoicesError,
                                              }) => {
    const { t } = useTranslation();
    const [tab, setTab] = useState(0);

    return (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                    <Tab label={t("paymentsNew.tabs.limits", "Limits")} />
                    <Tab label={t("paymentsNew.tabs.history", "History")} />
                    <Tab label={t("paymentsNew.tabs.invoices", "Invoices")} />
                </Tabs>

                {tab === 0 && <LimitsTab effectiveEntitlements={effectiveEntitlements} usage={usage} />}

                {tab === 1 && (
                    <HistoryTab
                        plans={plans}
                        history={history}
                        loading={historyLoading}
                        error={historyError}
                    />
                )}

                {tab === 2 && (
                    <InvoicesTab
                        invoices={invoices}
                        loading={invoicesLoading}
                        error={invoicesError}
                    />
                )}
            </CardContent>
        </Card>
    );
};
