import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Paper, Stack, Typography } from "@mui/material";
import { FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";

import {
    tariffsApi,
} from "@/shared/api/tariffsApi";
import {
    buildTariffPlanPayload,
    FALLBACK_BILLING_PERIODS,
    mapPlanToFormValues,
    validateTariffPlanForm,
} from "@/entities/tariff-plan/model/tariff-plan.form";
import type {
    BillingPeriodOption,
    TariffPlanFormValues,
} from "@/entities/tariff-plan/model/tariff-plan.types";
import { TariffPlanDialog } from "@/features/admin-tariff-plan/ui/TariffPlanDialog";
import { TariffPlanDeactivateDialog } from "@/features/admin-tariff-plan/ui/TariffPlanDeactivateDialog";
import { TariffPlanDeleteDialog } from "@/features/admin-tariff-plan/ui/TariffPlanDeleteDialog";
import { TariffPlansTable } from "@/widgets/admin-tariff-plans/ui/TariffPlansTable";
import type {BillingPeriod, TariffPlan} from "@/entities/tariff-plan/model/types.ts";

export default function AdminTariffPlansPage() {
    const [plans, setPlans] = useState<TariffPlan[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogLoading, setDialogLoading] = useState(false);

    const [deactivateId, setDeactivateId] = useState<string | null>(null);
    const [deactivateLoading, setDeactivateLoading] = useState(false);

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [editing, setEditing] = useState<TariffPlan | null>(null);
    const [billingPeriods, setBillingPeriods] = useState<BillingPeriodOption[]>([]);

    const loadPlans = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await tariffsApi.adminListPlans();
            setPlans(response.items);
        } catch (e: any) {
            const message = e?.response?.data?.message ?? "Не удалось загрузить тарифы. Попробуйте ещё раз.";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadInit = useCallback(async () => {
        try {
            const init = await tariffsApi.adminInit();

            const options =
                init.billing_period?.map((item) => ({
                    value: item.value as BillingPeriod,
                    label: item.name || item.value,
                })) ?? [];

            setBillingPeriods(options.length ? options : FALLBACK_BILLING_PERIODS);
        } catch (e) {
            console.error("Failed to load tariffs init", e);
            setBillingPeriods(FALLBACK_BILLING_PERIODS);
        }
    }, []);

    useEffect(() => {
        void loadPlans();
    }, [loadPlans]);

    useEffect(() => {
        void loadInit();
    }, [loadInit]);

    const billingPeriodOptions = billingPeriods.length ? billingPeriods : FALLBACK_BILLING_PERIODS;

    const dialogInitialValues = useMemo<TariffPlanFormValues | null>(() => {
        if (!editing) return null;
        return mapPlanToFormValues(editing);
    }, [editing]);

    const handleOpenCreate = () => {
        setEditing(null);
        setDialogOpen(true);
    };

    const handleOpenEdit = (plan: TariffPlan) => {
        setEditing(plan);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        if (dialogLoading) return;
        setDialogOpen(false);
        setEditing(null);
    };

    const handleSave = async (values: TariffPlanFormValues) => {
        const validationError = validateTariffPlanForm(values, plans, editing?.id);

        if (validationError) {
            toast.error(validationError);
            return;
        }

        setDialogLoading(true);

        try {
            const payload = buildTariffPlanPayload(values);

            if (editing) {
                await tariffsApi.adminUpdatePlan(editing.id, payload);
                toast.success("Тариф успешно обновлён.");
            } else {
                await tariffsApi.adminCreatePlan(payload);
                toast.success("Тариф успешно создан.");
            }

            setDialogOpen(false);
            setEditing(null);
            await loadPlans();
        } catch (e: any) {
            const message = e?.response?.data?.message ?? "Не удалось сохранить изменения. Попробуйте ещё раз.";
            toast.error(message);
        } finally {
            setDialogLoading(false);
        }
    };

    const handleDeactivate = async () => {
        if (!deactivateId) return;

        setDeactivateLoading(true);

        try {
            await tariffsApi.adminDeactivatePlan(deactivateId);
            setDeactivateId(null);
            toast.success("Тариф отключён.");
            await loadPlans();
        } catch (e: any) {
            const message = e?.response?.data?.message ?? "Не удалось отключить тариф. Попробуйте ещё раз.";
            toast.error(message);
        } finally {
            setDeactivateLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        setDeleteLoading(true);

        try {
            await tariffsApi.adminHardDeletePlan(deleteId);
            setDeleteId(null);
            toast.success("Тариф удалён.");
            await loadPlans();
        } catch (e: any) {
            const message = e?.response?.data?.message ?? "Не удалось удалить тариф. Попробуйте ещё раз.";
            toast.error(message);
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <Stack spacing={2}>
            <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ sm: "center" }}
                justifyContent="space-between"
                spacing={2}
            >
                <Stack spacing={0.5}>
                    <Typography variant="h5" fontWeight={800}>
                        Тарифные планы
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Здесь вы можете создавать, редактировать, отключать и удалять тарифы,
                        а также управлять их стоимостью, возможностями и ограничениями.
                    </Typography>
                </Stack>

                <Stack direction="row" spacing={1}>
                    <Button variant="outlined" onClick={() => void loadPlans()} disabled={loading}>
                        Обновить список
                    </Button>

                    <Button variant="contained" startIcon={<FiPlus />} onClick={handleOpenCreate}>
                        Создать тариф
                    </Button>
                </Stack>
            </Stack>

            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                <TariffPlansTable
                    plans={plans}
                    loading={loading}
                    error={error}
                    onEdit={handleOpenEdit}
                    onDeactivate={setDeactivateId}
                    onDelete={setDeleteId}
                />
            </Paper>

            <TariffPlanDialog
                open={dialogOpen}
                initial={dialogInitialValues}
                loading={dialogLoading}
                billingPeriods={billingPeriodOptions}
                onClose={handleCloseDialog}
                onSubmit={handleSave}
            />

            <TariffPlanDeactivateDialog
                open={Boolean(deactivateId)}
                loading={deactivateLoading}
                onClose={() => setDeactivateId(null)}
                onConfirm={handleDeactivate}
            />

            <TariffPlanDeleteDialog
                open={Boolean(deleteId)}
                loading={deleteLoading}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
            />
        </Stack>
    );
}