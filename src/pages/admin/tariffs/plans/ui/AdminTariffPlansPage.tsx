import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    Paper,
    Stack,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
    MenuItem,
} from "@mui/material";
import { FiEdit3, FiPlus, FiTrash2, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import {
    tariffsApi,
    type BillingPeriod,
    type TariffPlan,
    type UpsertTariffPlanPayload,
    type Entitlements,
} from "@/shared/api/tariffsApi";
import { ENTITLEMENTS } from "@/shared/config/entitlements";

type PlanFormState = UpsertTariffPlanPayload & { price_text?: string };

const BILLING_PERIODS: { value: BillingPeriod; label: string }[] = [
    { value: "MONTHLY", label: "Monthly" },
    { value: "YEARLY", label: "Yearly" },
    { value: "ONE_TIME", label: "One-time" },
];

const emptyPlan = (): PlanFormState => ({
    code: "",
    name: "",
    description: "",
    is_active: true,
    is_default: false,
    priority: 0,
    price_text: "",
    currency: "",
    billing_period: "MONTHLY",
    entitlements: {},
});

const fmtDate = (d?: string | null) =>
    d
        ? new Date(d).toLocaleString("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
            hour12: false,
        })
        : "—";

const priceLabel = (plan: TariffPlan) => {
    if (plan.price === undefined || plan.price === null || plan.price === "") return "—";
    if (!plan.currency || !plan.billing_period) return "—";
    return `${plan.price} ${plan.currency} / ${plan.billing_period}`;
};

function PlanDialog({
                        open,
                        onClose,
                        initial,
                        onSubmit,
                        loading,
                    }: {
    open: boolean;
    initial: PlanFormState | null;
    onClose: () => void;
    onSubmit: (payload: PlanFormState) => void;
    loading: boolean;
}) {
    const [state, setState] = useState<PlanFormState>(emptyPlan());

    useEffect(() => {
        if (initial) {
            setState({
                ...initial,
                price_text:
                    initial.price_text ??
                    (initial.price !== null && initial.price !== undefined ? String(initial.price) : ""),
            });
        } else {
            setState(emptyPlan());
        }
    }, [initial, open]);

    const updateField = (field: keyof PlanFormState, value: unknown) => {
        setState((prev) => ({ ...prev, [field]: value }));
    };

    const updateEntitlement = (key: keyof Entitlements, value: unknown) => {
        setState((prev) => ({
            ...prev,
            entitlements: { ...(prev.entitlements ?? {}), [key]: value },
        }));
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{initial?.code ? "Редактировать тариф" : "Создать тариф"}</DialogTitle>
            <DialogContent dividers sx={{ display: "grid", gap: 2, pt: 2 }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <TextField
                        label="Код"
                        value={state.code}
                        onChange={(e) => updateField("code", e.target.value)}
                        fullWidth
                        required
                        helperText="Код тарифа должен быть уникален"
                    />
                    <TextField
                        label="Название"
                        value={state.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        fullWidth
                        required
                    />
                </Stack>

                <TextField
                    label="Описание"
                    value={state.description ?? ""}
                    onChange={(e) => updateField("description", e.target.value)}
                    fullWidth
                    multiline
                    minRows={2}
                />

                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={!!state.is_active}
                                onChange={(e) => updateField("is_active", e.target.checked)}
                            />
                        }
                        label="Активен"
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={!!state.is_default}
                                onChange={(e) => updateField("is_default", e.target.checked)}
                            />
                        }
                        label="По умолчанию"
                    />
                    <TextField
                        label="Приоритет"
                        type="number"
                        value={state.priority ?? ""}
                        onChange={(e) => updateField("priority", e.target.value === "" ? null : Number(e.target.value))}
                        sx={{ maxWidth: 160 }}
                    />
                </Stack>

                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <TextField
                        label="Цена"
                        type="number"
                        value={state.price_text ?? ""}
                        onChange={(e) => updateField("price_text", e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Валюта"
                        value={state.currency ?? ""}
                        onChange={(e) => updateField("currency", e.target.value.toUpperCase())}
                        inputProps={{ maxLength: 3 }}
                        sx={{ maxWidth: 160 }}
                    />
                    <TextField
                        select
                        label="Период биллинга"
                        value={state.billing_period ?? ""}
                        onChange={(e) => updateField("billing_period", e.target.value as BillingPeriod)}
                        sx={{ minWidth: 180 }}
                    >
                        {BILLING_PERIODS.map((p) => (
                            <MenuItem key={p.value} value={p.value}>
                                {p.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Stack>

                <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                        Лимиты и функции
                    </Typography>
                    <Stack spacing={1.5}>
                        {ENTITLEMENTS.map((ent) => (
                            <Stack
                                key={ent.key}
                                direction={{ xs: "column", sm: "row" }}
                                spacing={1.5}
                                alignItems={{ sm: "center" }}
                            >
                                <Box sx={{ minWidth: 220 }}>
                                        <Typography variant="body2" fontWeight={600}>
                                            {ent.label}
                                        </Typography>
                                        {ent.hint && (
                                            <Typography variant="caption" color="text.secondary">
                                                {ent.hint}
                                            </Typography>
                                        )}
                                    </Box>
                                    {ent.type === "boolean" ? (
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={!!(state.entitlements?.[ent.key] as boolean)}
                                                    onChange={(e) => updateEntitlement(ent.key, e.target.checked)}
                                                />
                                            }
                                            label={state.entitlements?.[ent.key] ? "Включено" : "Выключено"}
                                        />
                                    ) : (
                                        <TextField
                                            type="number"
                                            placeholder="Без ограничений"
                                            value={
                                                state.entitlements?.[ent.key] === null ||
                                                state.entitlements?.[ent.key] === undefined
                                                    ? ""
                                                    : (state.entitlements?.[ent.key] as number | string)
                                        }
                                        onChange={(e) =>
                                            updateEntitlement(
                                                ent.key,
                                                e.target.value === "" ? null : Number(e.target.value)
                                            )
                                        }
                                        sx={{ maxWidth: 240 }}
                                    />
                                )}
                            </Stack>
                        ))}
                    </Stack>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} startIcon={<FiX />} variant="outlined">
                    Отмена
                </Button>
                <Button
                    onClick={() => onSubmit(state)}
                    variant="contained"
                    disabled={loading}
                    startIcon={<FiPlus />}
                >
                    {initial?.code ? "Сохранить" : "Создать"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function DeactivateDialog({
                              open,
                              onClose,
                              onConfirm,
                              loading,
                          }: {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading: boolean;
}) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Удалить тариф?</DialogTitle>
            <DialogContent dividers>
                <Typography variant="body2" color="text.secondary">
                    Тарифный план будет удален и недоступен для новых подписок.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} startIcon={<FiX />} variant="outlined">
                    Отмена
                </Button>
                <Button
                    color="error"
                    variant="contained"
                    onClick={onConfirm}
                    startIcon={<FiTrash2 />}
                    disabled={loading}
                >
                    Удалить
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default function AdminTariffPlansPage() {
    const [plans, setPlans] = useState<TariffPlan[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogLoading, setDialogLoading] = useState(false);
    const [deactivateId, setDeactivateId] = useState<string | null>(null);
    const [deactivateLoading, setDeactivateLoading] = useState(false);
    const [editing, setEditing] = useState<TariffPlan | null>(null);

    const loadPlans = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await tariffsApi.adminListPlans();
            setPlans(res.items);
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? "Request failed. Please try again.";
            setError(msg);
            toast.error(msg);
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadPlans();
    }, [loadPlans]);

    const openCreate = () => {
        setEditing(null);
        setDialogOpen(true);
    };

    const openEdit = (plan: TariffPlan) => {
        setEditing(plan);
        setDialogOpen(true);
    };

    const handleSave = async (payload: PlanFormState) => {
        const trimmedCode = payload.code.trim();
        if (!trimmedCode) {
            toast.error("Код обязателен");
            return;
        }
        const priorityRaw = payload.priority as any;
        const priorityValue =
            priorityRaw === "" || priorityRaw === null || priorityRaw === undefined ? null : Number(priorityRaw);
        if (priorityValue === 0) {
            toast.error("Приоритет не может быть 0");
            return;
        }
        const duplicate = plans.some(
            (p) => p.code.toLowerCase() === trimmedCode.toLowerCase() && (!editing || p.id !== editing.id)
        );
        if (duplicate) {
            toast.error("Код тарифа должен быть уникален");
            return;
        }
        setDialogLoading(true);
        const entitlements: Entitlements = {};
        ENTITLEMENTS.forEach((ent) => {
            const value = payload.entitlements?.[ent.key];
            if (ent.type === "boolean") {
                entitlements[ent.key] = !!value;
            } else {
                if (value === null || value === undefined) {
                    entitlements[ent.key] = null;
                } else if (typeof value === "number") {
                    entitlements[ent.key] = value;
                } else {
                    const parsed = Number(value);
                    entitlements[ent.key] = Number.isFinite(parsed) ? parsed : null;
                }
            }
        });

        const prepared: UpsertTariffPlanPayload = {
            code: payload.code.trim(),
            name: payload.name.trim(),
            description: payload.description ?? null,
            is_active: !!payload.is_active,
            is_default: !!payload.is_default,
            priority: priorityValue,
            price:
                payload.price_text === "" || payload.price_text === null || payload.price_text === undefined
                    ? null
                    : String(payload.price_text).trim(),
            currency: payload.currency ? payload.currency.trim().toUpperCase() : null,
            billing_period: payload.billing_period ? payload.billing_period : null,
            entitlements,
        };

        try {
            if (editing) {
                await tariffsApi.adminUpdatePlan(editing.id, prepared);
            } else {
                await tariffsApi.adminCreatePlan(prepared);
            }
            setDialogOpen(false);
            await loadPlans();
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? "Request failed. Please try again.";
            toast.error(msg);
            console.error(e);
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
            await loadPlans();
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? "Request failed. Please try again.";
            toast.error(msg);
            console.error(e);
        } finally {
            setDeactivateLoading(false);
        }
    };

    const tableContent = useMemo(() => {
        if (loading) {
            return (
                <TableRow>
                    <TableCell colSpan={8}>
                        <Typography align="center" color="text.secondary" sx={{ py: 3 }}>
                            Загрузка...
                        </Typography>
                    </TableCell>
                </TableRow>
            );
        }

        if (error) {
            return (
                <TableRow>
                    <TableCell colSpan={8}>
                        <Typography align="center" color="text.secondary" sx={{ py: 3 }}>
                            {error}
                        </Typography>
                    </TableCell>
                </TableRow>
            );
        }

        if (!plans.length) {
            return (
                <TableRow>
                    <TableCell colSpan={8}>
                        <Typography align="center" color="text.secondary" sx={{ py: 3 }}>
                            Тарифы отсутствуют
                        </Typography>
                    </TableCell>
                </TableRow>
            );
        }

        return plans.map((plan) => (
            <TableRow key={plan.id} hover>
                <TableCell>
                    <Stack spacing={0.5}>
                        <Typography fontWeight={700}>{plan.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {plan.description || "—"}
                        </Typography>
                    </Stack>
                </TableCell>
                <TableCell>{plan.code}</TableCell>
                <TableCell>
                    <Chip
                        size="small"
                        label={plan.is_active ? "Активен" : "Неактивен"}
                        color={plan.is_active ? "success" : "default"}
                        variant={plan.is_active ? "filled" : "outlined"}
                    />
                </TableCell>
                <TableCell>
                    <Chip
                        size="small"
                        label={plan.is_default ? "По умолчанию" : "—"}
                        color={plan.is_default ? "primary" : "default"}
                        variant={plan.is_default ? "filled" : "outlined"}
                    />
                </TableCell>
                <TableCell>{plan.priority ?? "—"}</TableCell>
                <TableCell>{priceLabel(plan)}</TableCell>
                <TableCell>{fmtDate(plan.updated_at)}</TableCell>
                <TableCell>
                    <Stack direction="row" spacing={1}>
                        <IconButton size="small" onClick={() => openEdit(plan)}>
                            <FiEdit3 />
                        </IconButton>
                        <IconButton
                            size="small"
                            onClick={() => setDeactivateId(plan.id)}
                            disabled={!plan.is_active}
                        >
                            <FiTrash2 />
                        </IconButton>
                    </Stack>
                </TableCell>
            </TableRow>
        ));
    }, [error, loading, plans]);

    return (
        <Stack spacing={2}>
            <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between">
                <Stack spacing={0.25}>
                    <Typography variant="h5" fontWeight={800}>
                        Тарифные планы
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Управляйте тарифами, квотами и доступными функциями.
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                    <Button variant="outlined" onClick={() => loadPlans()} disabled={loading}>
                        Обновить
                    </Button>
                    <Button variant="contained" startIcon={<FiPlus />} onClick={openCreate}>
                        Создать тариф
                    </Button>
                </Stack>
            </Stack>

            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                <Box sx={{ overflowX: "auto" }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Название</TableCell>
                                <TableCell>Код</TableCell>
                                <TableCell>Активен</TableCell>
                                <TableCell>По умолчанию</TableCell>
                                <TableCell>Приоритет</TableCell>
                                <TableCell>Цена</TableCell>
                                <TableCell>Обновлен</TableCell>
                                <TableCell>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>{tableContent}</TableBody>
                    </Table>
                </Box>
            </Paper>

            <PlanDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                initial={
                    editing
                        ? {
                            ...editing,
                            price_text:
                                editing.price === null || editing.price === undefined
                                    ? ""
                                    : String(editing.price),
                            entitlements: editing.entitlements ?? {},
                        }
                        : null
                }
                loading={dialogLoading}
                onSubmit={handleSave}
            />

            <DeactivateDialog
                open={!!deactivateId}
                onClose={() => setDeactivateId(null)}
                onConfirm={handleDeactivate}
                loading={deactivateLoading}
            />
        </Stack>
    );
}
