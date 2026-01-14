import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Divider,
    Stack,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tabs,
    Tooltip,
    Typography,
} from "@mui/material";
import { FiArrowUpRight, FiCheckCircle, FiShield, FiCheck } from "react-icons/fi";
import { toast } from "react-toastify";
import { tariffsApi, type TariffPlan, type TariffSubscription } from "@/shared/api/tariffsApi";
import { ENTITLEMENTS, formatEntitlementValue } from "@/shared/config/entitlements";
import { useUserStore } from "@/entities/user/model/user.store";
import { authApi } from "@/shared/api/authApi";
import { useTranslation } from "react-i18next";

const fmt = (d?: string | null) =>
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

export default function PaymentsPage() {
    const user = useUserStore((s) => s.user);
    const setUser = useUserStore((s) => s.setUser);
    const { t } = useTranslation();

    const [plans, setPlans] = useState<TariffPlan[]>([]);
    const [plansLoading, setPlansLoading] = useState(false);

    const [history, setHistory] = useState<TariffSubscription[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);

    const [tab, setTab] = useState(0);

    const currentSubscription = user?.tariff?.active_subscription ?? null;
    const currentPlanId = currentSubscription?.plan_id ?? null;
    const effectiveEntitlements = user?.tariff?.effective_entitlements ?? null;

    useEffect(() => {
        const refreshUser = async () => {
            try {
                const res = await authApi.getMe();
                setUser(res.data);
            } catch (e) {
                console.error(e);
            }
        };
        void refreshUser();
    }, [setUser]);

    useEffect(() => {
        const loadPlans = async () => {
            setPlansLoading(true);
            try {
                const res = await tariffsApi.listPublicPlans();
                const activeOnly = res.items.filter((p) => p.is_active);
                setPlans(activeOnly);
            } catch (e: any) {
                const msg = e?.response?.data?.message ?? t("paymentsNew.errors.loadPlans");
                toast.error(msg);
                console.error(e);
            } finally {
                setPlansLoading(false);
            }
        };
        void loadPlans();
    }, []);

    useEffect(() => {
        const loadHistory = async () => {
            setHistoryLoading(true);
            setHistoryError(null);
            try {
                const res = await tariffsApi.listMyHistory();
                setHistory(res.items);
            } catch (e: any) {
                const msg = e?.response?.data?.message ?? t("paymentsNew.errors.history");
                setHistoryError(msg);
                console.error(e);
            } finally {
                setHistoryLoading(false);
            }
        };
        void loadHistory();
    }, []);

    const planLookup = useMemo(() => {
        const map = new Map<string, TariffPlan>();
        plans.forEach((p) => map.set(p.id, p));
        return map;
    }, [plans]);

    return (
        <Box sx={{ minHeight: "calc(100dvh - 120px)", py: 3 }}>
            <Container maxWidth="lg">
                <Stack spacing={3}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack spacing={0.25}>
                            <Typography variant="h5" fontWeight={800}>
                                {t("paymentsNew.title")}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t("paymentsNew.subtitle")}
                            </Typography>
                        </Stack>
                    </Stack>

                    <Box
                        display="grid"
                        gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }}
                        gap={2}
                    >
                        {plansLoading && (
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    {t("paymentsNew.loading")}
                                </Typography>
                            </Box>
                        )}

                        {!plansLoading &&
                            plans.map((plan) => {
                                const isCurrent = currentPlanId === plan.id;
                                const gradient = isCurrent
                                    ? "linear-gradient(135deg, rgba(76,175,80,0.16), rgba(76,175,80,0.05))"
                                    : "linear-gradient(135deg, rgba(68,114,184,0.08), rgba(68,114,184,0.02))";
                                return (
                                    <Card
                                        key={plan.id}
                                        variant="outlined"
                                        sx={{
                                            borderRadius: 3,
                                            height: "100%",
                                            position: "relative",
                                            background: gradient,
                                            borderColor: isCurrent ? "success.light" : "divider",
                                            boxShadow: isCurrent ? "0 10px 25px rgba(76,175,80,0.15)" : "0 6px 18px rgba(0,0,0,0.05)",
                                            transition: "transform 200ms ease, box-shadow 200ms ease",
                                            "&:hover": {
                                                transform: "translateY(-2px)",
                                                boxShadow: "0 10px 28px rgba(0,0,0,0.12)",
                                            },
                                        }}
                                    >
                                        <CardContent sx={{ display: "grid", gap: 1.25, height: "100%", p: 2.5 }}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography variant="h6" fontWeight={800}>
                                                {plan.name}
                                            </Typography>
                                            {isCurrent && (
                                                <Chip
                                                    size="small"
                                                    color="success"
                                                    label={t("paymentsNew.current")}
                                                    icon={<FiShield size={14} />}
                                                />
                                            )}
                                            </Stack>
                                            <Typography variant="body2" color="text.secondary">
                                                {plan.description || "—"}
                                            </Typography>
                                            <Divider />
                                            <Stack spacing={0.75}>
                                                <Typography variant="subtitle2" fontWeight={700}>
                                                    {t("paymentsNew.perks")}
                                                </Typography>
                                                {[
                                                    {
                                                        label: t("paymentsNew.cargoLimit"),
                                                        value: formatEntitlementValue(
                                                            "cargo_limit",
                                                            plan.entitlements?.cargo_limit
                                                        ),
                                                    },
                                                    {
                                                        label: t("paymentsNew.vehicleLimit"),
                                                        value: formatEntitlementValue(
                                                            "vehicle_limit",
                                                            plan.entitlements?.vehicle_limit
                                                        ),
                                                    },
                                                    {
                                                        label: t("paymentsNew.orderDetails"),
                                                        value: formatEntitlementValue(
                                                            "can_view_order_details",
                                                            plan.entitlements?.can_view_order_details
                                                        ),
                                                    },
                                                    {
                                                        label: t("paymentsNew.companies"),
                                                        value: formatEntitlementValue(
                                                            "can_create_companies",
                                                            plan.entitlements?.can_create_companies
                                                        ),
                                                    },
                                                ].map((row, idx) => (
                                                    <Stack
                                                        key={idx}
                                                        direction="row"
                                                        spacing={0.75}
                                                        alignItems="center"
                                                        color="text.secondary"
                                                    >
                                                        <FiCheck size={14} />
                                                        <Typography variant="body2">
                                                            <strong>{row.label}</strong> {row.value}
                                                        </Typography>
                                                    </Stack>
                                                ))}
                                            </Stack>
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mt="auto"
                                                >
                                                    <Stack spacing={0.25}>
                                                        <Typography variant="subtitle2" fontWeight={800}>
                                                            {priceLabel(plan)}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {t("paymentsNew.billingPeriod")}: {plan.billing_period || "—"}
                                                        </Typography>
                                                    </Stack>
                                                    <Tooltip
                                                        title={
                                                            isCurrent
                                                                ? t("paymentsNew.tooltips.current")
                                                                : t("paymentsNew.tooltips.upgrade")
                                                        }
                                                    >
                                                        <span>
                                                            <Button
                                                                size="small"
                                                                variant={isCurrent ? "outlined" : "contained"}
                                                                color={isCurrent ? "success" : "primary"}
                                                                disabled={isCurrent}
                                                                endIcon={<FiArrowUpRight />}
                                                                onClick={() => {
                                                                    if (isCurrent) return;
                                                                    window.location.href = "/dashboard/help";
                                                                }}
                                                            >
                                                                {isCurrent ? t("paymentsNew.buttons.current") : t("paymentsNew.buttons.upgrade")}
                                                            </Button>
                                                        </span>
                                                    </Tooltip>
                                                </Stack>
                                                {!isCurrent && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {t("paymentsNew.supportNote")}
                                                    </Typography>
                                                )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                    </Box>

                    <Card variant="outlined" sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                                <Tab label={t("paymentsNew.tabs.limits")} />
                                <Tab label={t("paymentsNew.tabs.history")} />
                            </Tabs>

                            {tab === 0 && (
                                <Stack spacing={1.25}>
                                    {effectiveEntitlements ? (
                                        ENTITLEMENTS.map((ent) => (
                                            <Stack key={ent.key} direction="row" spacing={1.25} alignItems="center">
                                                <Chip
                                                    size="small"
                                                    label={ent.label}
                                                    variant="outlined"
                                                    icon={<FiCheckCircle size={14} />}
                                                />
                                                <Typography variant="body2" color="text.secondary">
                                                    {formatEntitlementValue(ent.key, effectiveEntitlements?.[ent.key])}
                                                </Typography>
                                            </Stack>
                                        ))
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            {t("paymentsNew.emptyLimits")}
                                        </Typography>
                                    )}
                                </Stack>
                            )}

                            {tab === 1 && (
                                <Box sx={{ overflowX: "auto" }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>{t("paymentsNew.table.plan")}</TableCell>
                                                <TableCell>{t("paymentsNew.table.status")}</TableCell>
                                                <TableCell>{t("paymentsNew.table.starts")}</TableCell>
                                                <TableCell>{t("paymentsNew.table.ends")}</TableCell>
                                                <TableCell>{t("paymentsNew.table.source")}</TableCell>
                                                <TableCell>{t("paymentsNew.table.created")}</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {historyLoading && (
                                                <TableRow>
                                                    <TableCell colSpan={6}>
                                                        <Typography align="center" color="text.secondary" sx={{ py: 2 }}>
                                                            {t("paymentsNew.loading")}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                            {!historyLoading && historyError && (
                                                <TableRow>
                                                    <TableCell colSpan={6}>
                                                        <Typography align="center" color="text.secondary" sx={{ py: 2 }}>
                                                            {historyError}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                            {!historyLoading && !historyError && history.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={6}>
                                                        <Typography align="center" color="text.secondary" sx={{ py: 2 }}>
                                                            {t("paymentsNew.emptyHistory")}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                            {!historyLoading &&
                                                !historyError &&
                                                history.map((item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell>
                                                            {item.plan?.name ??
                                                                planLookup.get(item.plan_id)?.name ??
                                                                item.plan_id}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                size="small"
                                                                label={item.status}
                                                                color={item.status === "ACTIVE" ? "success" : "default"}
                                                                variant={item.status === "ACTIVE" ? "filled" : "outlined"}
                                                            />
                                                        </TableCell>
                                                        <TableCell>{fmt(item.starts_at)}</TableCell>
                                                        <TableCell>{item.lifetime ? t("paymentsNew.lifetime") : fmt(item.ends_at)}</TableCell>
                                                        <TableCell>{item.source ?? "—"}</TableCell>
                                                        <TableCell>{fmt(item.created_at)}</TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Stack>
            </Container>
        </Box>
    );
}
