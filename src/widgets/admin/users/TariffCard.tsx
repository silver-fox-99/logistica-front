import { useEffect, useMemo, useState } from "react";
import {
    Paper,
    Stack,
    Typography,
    Chip,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import { FiEdit3, FiPlus, FiRefreshCw, FiX } from "react-icons/fi";
import { BiBlock } from "react-icons/bi";
import { toast } from "react-toastify";

import { tariffsApi } from "@/shared/api/tariffsApi";
import { ENTITLEMENTS, formatEntitlementValue } from "@/shared/config/entitlements";
import type {
    Entitlements,
    TariffPlan,
    TariffSubscription, UpdateEntitlementsPayload,
} from "@/entities/tariff-plan/model/types";
import { IssueSubscriptionDialog } from "@/features/admin/tariffs/issue-subscription/ui/IssueSubscriptionDialog";
import { EditEntitlementsDialog } from "@/features/admin/tariffs/edit-entitlements/ui/EditEntitlementsDialog";

const fmt = (d?: string | null) =>
    d
        ? new Date(d).toLocaleString("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
            hour12: false,
        })
        : "—";

type TariffCardProps = {
    userId: string;
};

export default function TariffCard({ userId }: TariffCardProps) {
    const [active, setActive] = useState<TariffSubscription | null>(null);
    const [effective, setEffective] = useState<Entitlements | null>(null);
    const [plans, setPlans] = useState<TariffPlan[]>([]);
    const [loading, setLoading] = useState(false);

    const [issueOpen, setIssueOpen] = useState(false);
    const [issueLoading, setIssueLoading] = useState(false);

    const [editOpen, setEditOpen] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [targetSub, setTargetSub] = useState<TariffSubscription | null>(null);

    const [cancelId, setCancelId] = useState<string | null>(null);
    const [cancelLoading, setCancelLoading] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const [activeRes, effectiveRes, plansRes] = await Promise.all([
                tariffsApi.adminGetActiveSubscription(userId),
                tariffsApi.adminGetEffectiveEntitlements(userId),
                tariffsApi.adminListPlans(),
            ]);

            setActive(activeRes);
            setEffective(effectiveRes.effective_entitlements);
            setPlans(plansRes.items);
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? "Request failed. Please try again.";
            toast.error(msg);
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadData();
    }, [userId]);

    const planLookup = useMemo(() => {
        const map = new Map<string, TariffPlan>();
        plans.forEach((plan) => map.set(plan.id, plan));
        return map;
    }, [plans]);

    const handleIssue = async (payload: {
        plan_id: string;
        starts_at?: string | null;
        ends_at?: string | null;
        lifetime?: boolean;
        note?: string | null;
        source?: string | null;
        cancel_previous?: boolean;
    }) => {
        setIssueLoading(true);
        try {
            await tariffsApi.adminIssueSubscription(userId, {
                plan_id: payload.plan_id,
                starts_at: payload.starts_at || undefined,
                ends_at: payload.lifetime ? null : payload.ends_at || undefined,
                lifetime: payload.lifetime,
                note: payload.note,
                source: payload.source,
                cancel_previous: payload.cancel_previous ?? true,
            });

            setIssueOpen(false);
            await loadData();
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? "Request failed. Please try again.";
            toast.error(msg);
            console.error(e);
        } finally {
            setIssueLoading(false);
        }
    };

    const handleEntitlements = async (payload: UpdateEntitlementsPayload) => {
        if (!targetSub) return;

        setEditLoading(true);
        try {
            await tariffsApi.adminUpdateSubscriptionEntitlements(targetSub.id, payload);

            setEditOpen(false);
            await loadData();
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? "Request failed. Please try again.";
            toast.error(msg);
            console.error(e);
        } finally {
            setEditLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!cancelId) return;

        setCancelLoading(true);
        try {
            await tariffsApi.adminCancelSubscription(cancelId);
            setCancelId(null);
            await loadData();
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? "Request failed. Please try again.";
            toast.error(msg);
            console.error(e);
        } finally {
            setCancelLoading(false);
        }
    };

    return (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="h6" fontWeight={700}>
                    Тариф
                </Typography>

                <IconButton onClick={() => void loadData()} disabled={loading} size="small">
                    <FiRefreshCw />
                </IconButton>
            </Stack>

            {!active && (
                <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                        Активной подписки нет
                    </Typography>

                    <Button
                        size="small"
                        variant="contained"
                        startIcon={<FiPlus />}
                        onClick={() => setIssueOpen(true)}
                    >
                        Назначить тариф
                    </Button>
                </Stack>
            )}

            {active && (
                <Stack spacing={1.25}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center">
                        <Typography variant="body1" fontWeight={700}>
                            Тариф: {active.plan?.name ?? planLookup.get(active.plan_id)?.name ?? "—"} (
                            {active.plan?.code ?? planLookup.get(active.plan_id)?.code ?? active.plan_id})
                        </Typography>

                        <Chip
                            size="small"
                            label={active.status}
                            color={active.status === "ACTIVE" ? "success" : "default"}
                            variant={active.status === "ACTIVE" ? "filled" : "outlined"}
                        />
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                        Начало: {fmt(active.starts_at)}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        Окончание: {active.lifetime ? "Бессрочно" : fmt(active.ends_at)}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        Источник: {active.source ?? "—"}
                    </Typography>

                    {active.note && (
                        <Typography variant="body2" color="text.secondary">
                            Комментарий: {active.note}
                        </Typography>
                    )}

                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Button
                            size="small"
                            variant="contained"
                            startIcon={<FiPlus />}
                            onClick={() => setIssueOpen(true)}
                        >
                            Сменить тариф
                        </Button>

                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<FiEdit3 />}
                            onClick={() => {
                                setTargetSub(active);
                                setEditOpen(true);
                            }}
                        >
                            Редактировать квоты
                        </Button>

                        <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<BiBlock />}
                            onClick={() => setCancelId(active.id)}
                        >
                            Деактивировать
                        </Button>
                    </Stack>
                </Stack>
            )}

            <Stack spacing={1} mt={2}>
                <Typography variant="subtitle2" fontWeight={700}>
                    Текущие лимиты
                </Typography>

                {effective ? (
                    ENTITLEMENTS.map((ent) => (
                        <Stack key={ent.key} direction="row" spacing={1.25} alignItems="center">
                            <Typography variant="body2" sx={{ minWidth: 200 }} fontWeight={600}>
                                {ent.label}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {formatEntitlementValue(ent.key, effective[ent.key])}
                            </Typography>
                        </Stack>
                    ))
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        —
                    </Typography>
                )}
            </Stack>

            <IssueSubscriptionDialog
                open={issueOpen}
                onClose={() => setIssueOpen(false)}
                plans={plans}
                loading={issueLoading}
                onSubmit={handleIssue}
            />

            <EditEntitlementsDialog
                open={editOpen}
                subscription={targetSub}
                onClose={() => setEditOpen(false)}
                onSubmit={handleEntitlements}
                loading={editLoading}
            />

            <Dialog open={!!cancelId} onClose={() => setCancelId(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Деактивировать подписку?</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body2" color="text.secondary">
                        Подписка будет деактивирована. Доступ сохранится до даты окончания.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setCancelId(null)} startIcon={<FiX />} variant="outlined">
                        Закрыть
                    </Button>
                    <Button
                        onClick={handleCancel}
                        color="error"
                        variant="contained"
                        startIcon={<BiBlock />}
                        disabled={cancelLoading}
                    >
                        Деактивировать
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}