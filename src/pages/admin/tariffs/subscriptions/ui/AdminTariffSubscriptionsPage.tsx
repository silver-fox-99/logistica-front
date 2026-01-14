import { useEffect, useMemo, useState } from "react";
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
    MenuItem,
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
} from "@mui/material";
import { FiCheck, FiEdit3, FiPlus, FiRefreshCw, FiTrash2, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import {
    tariffsApi,
    type Entitlements,
    type TariffPlan,
    type TariffSubscription,
    type IssueSubscriptionPayload,
} from "@/shared/api/tariffsApi";
import { ENTITLEMENTS, formatEntitlementValue } from "@/shared/config/entitlements";

const fmt = (d?: string | null) =>
    d
        ? new Date(d).toLocaleString("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
            hour12: false,
        })
        : "—";

type IssueForm = IssueSubscriptionPayload & { lifetime?: boolean };

export function IssueSubscriptionDialog({
    open,
    plans,
    subscription,
    onClose,
    onSubmit,
    loading,
}: {
    open: boolean;
    plans: TariffPlan[];
    subscription?: TariffSubscription | null;
    onClose: () => void;
    onSubmit: (payload: IssueForm) => void;
    loading: boolean;
}) {
    const [form, setForm] = useState<IssueForm>({ plan_id: "", lifetime: false });

    useEffect(() => {
        if (open) {
            const isLifetime =
                subscription?.lifetime ??
                ((subscription?.ends_at === null || subscription?.ends_at === undefined) ? true : false);
            setForm({
                plan_id: subscription?.plan_id ?? "",
                lifetime: !!isLifetime,
                starts_at: subscription?.starts_at ?? "",
                ends_at: isLifetime ? "" : subscription?.ends_at ?? "",
                note: subscription?.note ?? "",
            });
        }
    }, [open, subscription]);

    const update = (field: keyof IssueForm, value: unknown) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Выдать подписку</DialogTitle>
            <DialogContent dividers sx={{ display: "grid", gap: 2, pt: 2 }}>
                <TextField
                    select
                    label="Тариф"
                    value={form.plan_id}
                    onChange={(e) => update("plan_id", e.target.value)}
                    required
                >
                    {plans
                        .filter((p) => p.is_active)
                        .map((plan) => (
                            <MenuItem key={plan.id} value={plan.id}>
                                {plan.name} ({plan.code})
                            </MenuItem>
                        ))}
                </TextField>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                        label="Дата начала"
                        type="datetime-local"
                        InputLabelProps={{ shrink: true }}
                        value={form.starts_at ?? ""}
                        onChange={(e) => update("starts_at", e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Дата окончания"
                        type="datetime-local"
                        InputLabelProps={{ shrink: true }}
                        value={form.lifetime ? "" : form.ends_at ?? ""}
                        onChange={(e) => update("ends_at", e.target.value)}
                        fullWidth
                        disabled={!!form.lifetime}
                    />
                </Stack>

                <FormControlLabel
                    control={
                        <Switch
                            checked={!!form.lifetime}
                            onChange={(e) => update("lifetime", e.target.checked)}
                        />
                    }
                    label="Бессрочно"
                />

                <TextField
                    label="Комментарий"
                    multiline
                    minRows={2}
                    value={form.note ?? ""}
                    onChange={(e) => update("note", e.target.value)}
                    fullWidth
                />
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} startIcon={<FiX />} variant="outlined">
                    Отмена
                </Button>
                <Button
                    onClick={() => onSubmit(form)}
                    variant="contained"
                    startIcon={<FiCheck />}
                    disabled={loading}
                >
                    Выдать подписку
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export function EditEntitlementsDialog({
                                     open,
                                     subscription,
                                     onClose,
                                     onSubmit,
                                     loading,
                                 }: {
    open: boolean;
    subscription: TariffSubscription | null;
    onClose: () => void;
    onSubmit: (entitlements: Entitlements, reason: string) => void;
    loading: boolean;
}) {
    const [entitlementsState, setEntitlementsState] = useState<Entitlements>({});
    const [reason, setReason] = useState("");

    useEffect(() => {
        if (subscription) {
            setEntitlementsState(subscription.entitlements ?? {});
        } else {
            setEntitlementsState({});
        }
        setReason("");
    }, [subscription, open]);

    const updateEntitlement = (key: keyof Entitlements, value: unknown) => {
        setEntitlementsState((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = () => {
        onSubmit(entitlementsState, reason);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Изменить квоты</DialogTitle>
            <DialogContent dividers sx={{ display: "grid", gap: 1.5 }}>
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
                                        checked={!!(entitlementsState?.[ent.key] as boolean)}
                                        onChange={(e) => updateEntitlement(ent.key, e.target.checked)}
                                    />
                                }
                                label={entitlementsState?.[ent.key] ? "Включено" : "Выключено"}
                            />
                        ) : (
                            <TextField
                                type="number"
                                placeholder="Без ограничений"
                                value={
                                    entitlementsState?.[ent.key] === null ||
                                    entitlementsState?.[ent.key] === undefined
                                        ? ""
                                        : (entitlementsState?.[ent.key] as number | string)
                                }
                                onChange={(e) =>
                                    updateEntitlement(ent.key, e.target.value === "" ? null : Number(e.target.value))
                                }
                                sx={{ maxWidth: 240 }}
                            />
                        )}
                    </Stack>
                ))}

                <TextField
                    label="Причина"
                    placeholder="Почему меняем лимиты?"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    fullWidth
                    required
                    multiline
                    minRows={2}
                />
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} startIcon={<FiX />} variant="outlined">
                    Отмена
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    startIcon={<FiCheck />}
                    disabled={loading}
                >
                    Сохранить
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default function AdminTariffSubscriptionsPage() {
    const [userIdInput, setUserIdInput] = useState("");
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [active, setActive] = useState<TariffSubscription | null>(null);
    const [effective, setEffective] = useState<Entitlements | null>(null);
    const [history, setHistory] = useState<TariffSubscription[]>([]);
    const [loading, setLoading] = useState(false);

    const [plans, setPlans] = useState<TariffPlan[]>([]);
    const [issueOpen, setIssueOpen] = useState(false);
    const [issueLoading, setIssueLoading] = useState(false);

    const [editEntitlementsOpen, setEditEntitlementsOpen] = useState(false);
    const [entitlementsLoading, setEntitlementsLoading] = useState(false);
    const [targetSubscription, setTargetSubscription] = useState<TariffSubscription | null>(null);

    const [cancelId, setCancelId] = useState<string | null>(null);
    const [cancelLoading, setCancelLoading] = useState(false);

    useEffect(() => {
        const loadPlans = async () => {
            try {
                const res = await tariffsApi.adminListPlans();
                setPlans(res.items);
            } catch (e: any) {
                console.error(e);
            }
        };
        void loadPlans();
    }, []);

    const loadUserData = async (userId: string) => {
        setLoading(true);
        try {
            const [activeRes, effectiveRes, historyRes] = await Promise.all([
                tariffsApi.adminGetActiveSubscription(userId),
                tariffsApi.adminGetEffectiveEntitlements(userId),
                tariffsApi.adminListUserSubscriptions(userId),
            ]);
            setActive(activeRes);
            setEffective(effectiveRes.effective_entitlements);
            setHistory(historyRes.items);
            setCurrentUserId(userId);
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? "Request failed. Please try again.";
            toast.error(msg);
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadClick = () => {
        const trimmed = userIdInput.trim();
        if (!trimmed) return;
        void loadUserData(trimmed);
    };

    const handleIssue = async (payload: IssueForm) => {
        if (!currentUserId) return;
        setIssueLoading(true);
        try {
            await tariffsApi.adminIssueSubscription(currentUserId, {
                plan_id: payload.plan_id,
                starts_at: payload.starts_at || undefined,
                ends_at: payload.lifetime ? null : payload.ends_at || undefined,
                lifetime: payload.lifetime,
                note: payload.note,
            });
            setIssueOpen(false);
            await loadUserData(currentUserId);
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? "Request failed. Please try again.";
            toast.error(msg);
            console.error(e);
        } finally {
            setIssueLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!cancelId || !currentUserId) return;
        setCancelLoading(true);
        try {
            await tariffsApi.adminCancelSubscription(cancelId);
            setCancelId(null);
            await loadUserData(currentUserId);
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? "Request failed. Please try again.";
            toast.error(msg);
            console.error(e);
        } finally {
            setCancelLoading(false);
        }
    };

    const handleUpdateEntitlements = async (ent: Entitlements, reason: string) => {
        if (!targetSubscription || !currentUserId) return;
        if (!reason.trim()) {
            toast.error("Нужна причина изменения");
            return;
        }
        setEntitlementsLoading(true);
        try {
            const entList: import("@/shared/api/tariffsApi").SubscriptionEntitlementInput[] = [];
            ENTITLEMENTS.forEach((meta) => {
                const value = ent?.[meta.key];
                if (value === undefined) return;
                if (meta.type === "boolean") {
                    entList.push({ key: meta.key.toUpperCase(), bool_value: !!value, reason });
                } else {
                    entList.push({
                        key: meta.key.toUpperCase(),
                        int_value: value === null ? null : Number(value),
                        reason,
                    });
                }
            });
            await tariffsApi.adminUpdateSubscriptionEntitlements(targetSubscription.id, {
                entitlements: entList,
                replace: false,
            });
            setEditEntitlementsOpen(false);
            await loadUserData(currentUserId);
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? "Request failed. Please try again.";
            toast.error(msg);
            console.error(e);
        } finally {
            setEntitlementsLoading(false);
        }
    };

    const planLookup = useMemo(() => {
        const map = new Map<string, TariffPlan>();
        plans.forEach((p) => map.set(p.id, p));
        return map;
    }, [plans]);

    const renderEntitlements = (ent: Entitlements | null | undefined) => (
        <Stack spacing={1}>
            {ENTITLEMENTS.map((item) => (
                <Stack key={item.key} direction="row" spacing={1.5} alignItems="center">
                    <Typography variant="body2" sx={{ minWidth: 220 }} fontWeight={600}>
                        {item.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {formatEntitlementValue(item.key, ent?.[item.key])}
                    </Typography>
                </Stack>
            ))}
        </Stack>
    );

    return (
        <Stack spacing={2}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
                <Stack flex={1} spacing={0.25}>
                    <Typography variant="h5" fontWeight={800}>
                        Подписки пользователей
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Загрузите пользователя по ID, чтобы управлять планами, квотами и историей.
                    </Typography>
                </Stack>
                <TextField
                    size="small"
                    placeholder="Введите ID пользователя"
                    value={userIdInput}
                    onChange={(e) => setUserIdInput(e.target.value)}
                    sx={{ minWidth: 260 }}
                />
                <Button variant="contained" onClick={handleLoadClick} startIcon={<FiRefreshCw />} disabled={loading}>
                    Загрузить
                </Button>
            </Stack>

            {currentUserId && (
                <Stack spacing={2}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6" fontWeight={700}>
                                Активная подписка
                            </Typography>
                            <Stack direction="row" spacing={1}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<FiRefreshCw />}
                                    onClick={() => loadUserData(currentUserId)}
                                    disabled={loading}
                                >
                                    Обновить
                                </Button>
                                {active ? (
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<FiPlus />}
                        onClick={() => setIssueOpen(true)}
                    >
                        Сменить тариф
                    </Button>
                                ) : (
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<FiPlus />}
                                        onClick={() => setIssueOpen(true)}
                                    >
                                        Назначить тариф
                                    </Button>
                                )}
                            </Stack>
                        </Stack>

                        {!active && (
                            <Typography variant="body2" color="text.secondary">
                                Активной подписки нет
                            </Typography>
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

                                <Stack direction="row" spacing={1}>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        color="warning"
                                        startIcon={<FiEdit3 />}
                                        onClick={() => {
                                            setTargetSubscription(active);
                                            setEditEntitlementsOpen(true);
                                        }}
                                    >
                                        Редактировать квоты
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        color="error"
                                        startIcon={<FiTrash2 />}
                                        onClick={() => setCancelId(active.id)}
                                        disabled={active.status !== "ACTIVE"}
                                    >
                                        Отменить подписку
                                    </Button>
                                </Stack>
                            </Stack>
                        )}
                    </Paper>

                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                            Текущие лимиты
                        </Typography>
                        {loading && (
                            <Typography variant="body2" color="text.secondary">
                                Загрузка...
                            </Typography>
                        )}
                        {!loading && renderEntitlements(effective)}
                    </Paper>

                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
                            История подписок
                        </Typography>
                        <Box sx={{ overflowX: "auto" }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Тариф</TableCell>
                                        <TableCell>Статус</TableCell>
                                        <TableCell>Начало</TableCell>
                                        <TableCell>Окончание</TableCell>
                                        <TableCell>Источник</TableCell>
                                        <TableCell>Создана</TableCell>
                                        <TableCell>Действия</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading && (
                                        <TableRow>
                                            <TableCell colSpan={7}>
                                                <Typography align="center" color="text.secondary" sx={{ py: 2 }}>
                                                    Загрузка...
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {!loading && history.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7}>
                                                <Typography align="center" color="text.secondary" sx={{ py: 2 }}>
                                                    Подписок нет
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {!loading &&
                                        history.map((sub) => (
                                            <TableRow key={sub.id} hover>
                                                <TableCell>
                                                    {sub.plan?.name ??
                                                        planLookup.get(sub.plan_id)?.name ??
                                                        sub.plan_id}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        size="small"
                                                        label={sub.status}
                                                        color={sub.status === "ACTIVE" ? "success" : "default"}
                                                        variant={sub.status === "ACTIVE" ? "filled" : "outlined"}
                                                    />
                                                </TableCell>
                                                <TableCell>{fmt(sub.starts_at)}</TableCell>
                                                <TableCell>{sub.lifetime ? "Бессрочно" : fmt(sub.ends_at)}</TableCell>
                                                <TableCell>{sub.source ?? "—"}</TableCell>
                                                <TableCell>{fmt(sub.created_at)}</TableCell>
                                                <TableCell>
                                                    <Stack direction="row" spacing={1}>
                                                        {sub.status === "ACTIVE" && (
                                                            <>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => setCancelId(sub.id)}
                                                                >
                                                                    <FiTrash2 />
                                                                </IconButton>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => {
                                                                        setTargetSubscription(sub);
                                                                        setEditEntitlementsOpen(true);
                                                                    }}
                                                                >
                                                                    <FiEdit3 />
                                                                </IconButton>
                                                            </>
                                                        )}
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Paper>
                </Stack>
            )}

            <IssueSubscriptionDialog
                open={issueOpen}
                onClose={() => setIssueOpen(false)}
                plans={plans}
                loading={issueLoading}
                onSubmit={handleIssue}
            />

            <EditEntitlementsDialog
                open={editEntitlementsOpen}
                subscription={targetSubscription}
                onClose={() => setEditEntitlementsOpen(false)}
                onSubmit={handleUpdateEntitlements}
                loading={entitlementsLoading}
            />

            <Dialog open={!!cancelId} onClose={() => setCancelId(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Отменить подписку?</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body2" color="text.secondary">
                        Подписка будет отменена. Доступ сохранится до даты окончания.
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
                        startIcon={<FiTrash2 />}
                        disabled={cancelLoading}
                    >
                        Отменить
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}
