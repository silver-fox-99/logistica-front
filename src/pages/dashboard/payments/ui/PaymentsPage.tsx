import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Divider,
    LinearProgress,
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
    Collapse,
    IconButton,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import {
    FiArrowUpRight,
    FiCheckCircle,
    FiShield,
    FiPackage,
    FiTruck,
    FiEye,
    FiUsers,
    FiBriefcase,
    FiChevronDown,
    FiChevronUp,
    FiX,
} from "react-icons/fi";
import { toast } from "react-toastify";
import {
    tariffsApi,
    type TariffPlan,
    type TariffSubscription,
    type Entitlements,
    type EntitlementKey,
    type TariffMeResponse,
} from "@/shared/api/tariffsApi";
import { formatEntitlementValue } from "@/shared/config/entitlements";
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

const pleasantGreen = "#2e7d32";
const pleasantRed = "#d32f2f";

const priceLabel = (plan: TariffPlan) => {
    if (plan.price === undefined || plan.price === null || plan.price === "") return "—";
    if (!plan.currency || !plan.billing_period) return "—";
    return `${plan.price} ${plan.currency} / ${plan.billing_period}`;
};

const featureList = (t: any, plan: TariffPlan) => [
    {
        label: t("paymentsNew.cargoLimit"),
        value: formatEntitlementValue("cargo_limit", plan.entitlements?.cargo_limit),
    },
    {
        label: t("paymentsNew.vehicleLimit"),
        value: formatEntitlementValue("vehicle_limit", plan.entitlements?.vehicle_limit),
    },
    {
        label: t("paymentsNew.orderDetails"),
        value: formatEntitlementValue("can_view_order_details", plan.entitlements?.can_view_order_details),
    },
    {
        label: t("paymentsNew.companies"),
        value: formatEntitlementValue("can_create_companies", plan.entitlements?.can_create_companies),
    },
];

const normalizeValueDisplay = (val: string) => (val === "—" ? "∞" : val);

const usageKeyMap: Record<EntitlementKey, keyof NonNullable<TariffMeResponse["usage"]> | null> = {
    cargo_limit: "cargo_creates_used",
    vehicle_limit: "vehicle_creates_used",
    can_view_order_details: "order_details_views_used",
    order_details_views_per_day_limit: "order_details_views_used",
    can_create_companies: null,
    company_limit: null,
    members_per_company_limit: null,
};

type LimitItem = {
    key: EntitlementKey;
    label: string;
    icon: React.ReactNode;
    type: "numeric" | "boolean";
};

const limitItemsConfig = (t: any): LimitItem[] => [
    { key: "cargo_limit", label: t("paymentsNew.cargoLimit", "Лимит грузов/мес"), icon: <FiPackage />, type: "numeric" },
    { key: "vehicle_limit", label: t("paymentsNew.vehicleLimit", "Лимит транспорта/мес"), icon: <FiTruck />, type: "numeric" },
    { key: "order_details_views_per_day_limit", label: t("paymentsNew.orderDetailsViews", "Просмотры деталей/день"), icon: <FiEye />, type: "numeric" },
    { key: "company_limit", label: t("paymentsNew.companyLimit", "Лимит компаний"), icon: <FiBriefcase />, type: "numeric" },
    { key: "members_per_company_limit", label: t("paymentsNew.membersLimit", "Участников на компанию"), icon: <FiUsers />, type: "numeric" },
    { key: "can_view_order_details", label: t("paymentsNew.orderDetails", "Доступ к деталям заказов"), icon: <FiEye />, type: "boolean" },
    { key: "can_create_companies", label: t("paymentsNew.companies", "Создание компаний"), icon: <FiBriefcase />, type: "boolean" },
];

export default function PaymentsPage() {
    const user = useUserStore((s) => s.user);
    const setUser = useUserStore((s) => s.setUser);
    const { t } = useTranslation();

    const [plans, setPlans] = useState<TariffPlan[]>([]);
    const [plansLoading, setPlansLoading] = useState(false);

    const [history, setHistory] = useState<TariffSubscription[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const [effectiveFromApi, setEffectiveFromApi] = useState<Entitlements | null>(null);
    const [usage, setUsage] = useState<TariffMeResponse["usage"]>(null);

    const [tab, setTab] = useState(0);
    const [expandedHistory, setExpandedHistory] = useState<Set<string>>(new Set());

    const currentSubscription = user?.tariff?.active_subscription ?? null;
    const currentPlanId = currentSubscription?.plan_id ?? null;
    const effectiveEntitlements = effectiveFromApi ?? user?.tariff?.effective_entitlements ?? null;
    const usageData = usage ?? (user as any)?.usage ?? null;
    const theme = useTheme();
    const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));
    const enabledLabel = t("paymentsNew.enabled", "Enabled");
    const disabledLabel = t("paymentsNew.disabled", "Disabled");

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
        const loadMe = async () => {
            try {
                const res = await tariffsApi.getMyTariff();
                setEffectiveFromApi(res.effective_entitlements);
                setUsage(res.usage ?? null);
            } catch (e) {
                console.error("Failed to load tariff details", e);
            }
        };
        void loadMe();
    }, []);

    useEffect(() => {
        const loadPlans = async () => {
            setPlansLoading(true);
            try {
                const res = await tariffsApi.listPublicPlans();
                setPlans(res.items);
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

    const toggleHistoryRow = (id: string) => {
        setExpandedHistory((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };
    const resolveEntitlementLabel = (key: EntitlementKey | string) => {
        const meta = limitsConfig.find((l) => l.key === key);
        if (meta?.label) return meta.label;
        const fallback: Partial<Record<EntitlementKey, string>> = {
            cargo_limit: t("paymentsNew.cargoLimit", "Лимит грузов/мес"),
            vehicle_limit: t("paymentsNew.vehicleLimit", "Лимит транспорта/мес"),
            order_details_views_per_day_limit: t("paymentsNew.orderDetailsViews", "Просмотры деталей/день"),
            company_limit: t("paymentsNew.companyLimit", "Лимит компаний"),
            members_per_company_limit: t("paymentsNew.membersLimit", "Участников на компанию"),
            can_view_order_details: t("paymentsNew.orderDetails", "Доступ к деталям заказов"),
            can_create_companies: t("paymentsNew.companies", "Создание компаний"),
        };
        return (fallback as Record<string, string>)[key] ?? key;
    };

    const renderPlanCard = (plan: TariffPlan) => {
        const isCurrent = currentPlanId === plan.id;
        const gradient = isCurrent
            ? "linear-gradient(135deg, rgba(76,175,80,0.16), rgba(76,175,80,0.05))"
            : "linear-gradient(135deg, rgba(68,114,184,0.08), rgba(68,114,184,0.02))";
        const hasPriceInfo =
            plan.price !== null &&
            plan.price !== undefined &&
            plan.price !== "" &&
            !!plan.currency &&
            !!plan.billing_period;

        const renderFeatureValue = (value: unknown) => {
            const normalized = String(value).toLowerCase();
            if (normalized === enabledLabel.toLowerCase()) {
                return <FiCheckCircle size={16} color={pleasantGreen} />;
            }
            if (normalized === disabledLabel.toLowerCase()) {
                return <FiX size={16} color={pleasantRed} />;
            }
            return normalizeValueDisplay(String(value));
        };

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
                    <Stack direction="row" spacing={1} alignItems="baseline" justifyContent="space-between">
                        <Stack spacing={0.25}>
                            <Typography variant="h6" fontWeight={800}>
                                {plan.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {plan.description || "—"}
                            </Typography>
                        </Stack>
                        {isCurrent && (
                            <Chip
                                size="small"
                                sx={{
                                    bgcolor: `${pleasantGreen}22`,
                                    color: pleasantGreen,
                                    borderColor: `${pleasantGreen}55`,
                                    borderWidth: 1,
                                    borderStyle: "solid",
                                }}
                                label={t("paymentsNew.current")}
                                icon={<FiShield size={14} />}
                            />
                        )}
                    </Stack>

                    <Box>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                            {t("paymentsNew.perks")}
                        </Typography>
                        <Stack spacing={0.6}>
                            {featureList(t, plan).map((row, idx) => {
                                const labelText = (row.label || "").toString().replace(/[:：]\s*$/, "");
                                return (
                                    <Typography
                                        key={idx}
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                                    >
                                        <strong>{labelText}:</strong> {renderFeatureValue(row.value)}
                                    </Typography>
                                );
                            })}
                        </Stack>
                    </Box>

                    <Divider />

                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        justifyContent={hasPriceInfo ? "space-between" : "flex-end"}
                        mt="auto"
                    >
                        {hasPriceInfo && (
                            <Stack spacing={0.25}>
                                <Typography variant="subtitle2" fontWeight={800}>
                                    {priceLabel(plan)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {t("paymentsNew.billingPeriod", "Период биллинга")}: {plan.billing_period || "—"}
                                </Typography>
                            </Stack>
                        )}
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
                            {t("paymentsNew.supportShort", "Покупка через поддержку")}
                        </Typography>
                    )}
                </CardContent>
            </Card>
        );
    };

    const limitsConfig = limitItemsConfig(t);

    const renderLimitsBlock = () => (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ display: "grid", gap: 1 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                    {t("paymentsNew.tabs.limits")}
                </Typography>
                <Stack spacing={{ xs: 2.5, sm: 3 }}>
                    {limitsConfig.map((item) => {
                        if (item.type === "boolean") {
                            const val = effectiveEntitlements?.[item.key as keyof Entitlements];
                            const enabled = val === undefined ? false : Boolean(val);
                            return (
                                <Stack
                                    key={item.key}
                                    direction={{ xs: "column", sm: "row" }}
                                    spacing={0.75}
                                    alignItems={{ xs: "baseline", sm: "center" }}
                                    justifyContent="space-between"
                                >
                                    <Stack
                                        direction="row"
                                        spacing={0.75}
                                        alignItems="center"
                                        flex={1.2}
                                        minWidth={0}
                                        sx={{ width: { xs: "100%", sm: "auto" } }}
                                    >
                                        <Box
                                            sx={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 0.75,
                                                bgcolor: "action.hover",
                                                px: 1,
                                                py: 0.5,
                                                borderRadius: 1,
                                                minWidth: 0,
                                                whiteSpace: { xs: "normal", sm: "nowrap" },
                                                wordBreak: "break-word",
                                            }}
                                        >
                                            {item.icon}
                                            <Typography
                                                variant="body2"
                                                sx={{ lineHeight: 1.2, whiteSpace: { xs: "normal", sm: "nowrap" } }}
                                            >
                                                {item.label}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                    <Chip
                                        size="small"
                                        label={enabled ? t("paymentsNew.enabled", "Enabled") : t("paymentsNew.disabled", "Disabled")}
                                        sx={{
                                            bgcolor: enabled ? `${pleasantGreen}22` : `${pleasantRed}15`,
                                            color: enabled ? pleasantGreen : pleasantRed,
                                            borderColor: enabled ? `${pleasantGreen}55` : `${pleasantRed}55`,
                                            borderWidth: 1,
                                            borderStyle: "solid",
                                            "& .MuiChip-icon": { color: enabled ? pleasantGreen : pleasantRed },
                                        }}
                                        variant="filled"
                                        icon={<FiCheckCircle size={14} />}
                                    />
                                </Stack>
                            );
                        }
                        const limitVal = effectiveEntitlements?.[item.key];
                        const numericValue = typeof limitVal === "number" ? limitVal : null;
                        const usageKey = usageKeyMap[item.key];
                        const usedRaw = usageKey && usageData ? usageData[usageKey] : null;
                        const usedParsed = usedRaw !== null && usedRaw !== undefined ? Number(usedRaw) : 0;
                        const used = Number.isFinite(usedParsed) ? usedParsed : 0;
                        const total = numericValue ?? null;
                        const overLimit = total !== null && total > 0 && used >= total;
                        const progress = total && total > 0 ? Math.min(100, (used / total) * 100) : 100;
                        const totalLabel = total === null ? "∞" : total;
                        return (
                            <Stack
                                key={item.key}
                                direction={{ xs: "column", sm: "row" }}
                                spacing={{ xs: 0.75, sm: 1 }}
                                alignItems={{ xs: "flex-start", sm: "center" }}
                                justifyContent="space-between"
                                sx={{ width: "100%" }}
                            >
                                <Stack
                                    direction="row"
                                    spacing={0.75}
                                    alignItems="center"
                                    minWidth={0}
                                    flex={1.2}
                                    sx={{ width: { xs: "100%", sm: "auto" } }}
                                >
                                    <Box
                                        sx={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 0.75,
                                            bgcolor: "action.hover",
                                            px: 1,
                                            py: 0.5,
                                            borderRadius: 1,
                                            minWidth: 0,
                                            whiteSpace: { xs: "normal", sm: "nowrap" },
                                            wordBreak: "break-word",
                                        }}
                                    >
                                        {item.icon}
                                        <Typography
                                            variant="body2"
                                            sx={{ lineHeight: 1.2, whiteSpace: { xs: "normal", sm: "nowrap" } }}
                                        >
                                            {item.label}
                                        </Typography>
                                    </Box>
                                </Stack>
                                <Box sx={{ flex: 1.3, width: { xs: "100%", sm: "auto" } }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={progress}
                                        color={overLimit ? "error" : "primary"}
                                        sx={{ height: 8, borderRadius: 999, bgcolor: overLimit ? "#fdecea" : undefined }}
                                    />
                                </Box>
                                <Typography
                                    variant="body2"
                                    color={overLimit ? pleasantRed : "text.secondary"}
                                    sx={{
                                        minWidth: { xs: "auto", sm: 80 },
                                        textAlign: { xs: "left", sm: "right" },
                                        fontWeight: overLimit ? 700 : 400,
                                    }}
                                >
                                    {used} / {totalLabel}
                                </Typography>
                            </Stack>
                        );
                    })}
                </Stack>
            </CardContent>
        </Card>
    );

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

                    <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "repeat(2, 1fr)" }} gap={2}>
                        {plansLoading && (
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    {t("paymentsNew.loading")}
                                </Typography>
                            </Box>
                        )}

                        {!plansLoading && plans.map(renderPlanCard)}
                    </Box>

                    <Card variant="outlined" sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                                <Tab label={t("paymentsNew.tabs.limits")} />
                                <Tab label={t("paymentsNew.tabs.history")} />
                            </Tabs>

                            {tab === 0 && (
                                effectiveEntitlements ? (
                                    <Box display="grid" gridTemplateColumns={{ xs: "1fr" }} gap={2}>
                                        {renderLimitsBlock()}
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        {t("paymentsNew.emptyLimits")}
                                    </Typography>
                                )
                            )}

                            {tab === 1 && (
                                <Box sx={{ overflowX: "auto" }}>
                                    <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ width: 48 }} />
                                            <TableCell>{t("paymentsNew.table.plan")}</TableCell>
                                            <TableCell sx={{ width: 140 }}>{t("paymentsNew.table.status")}</TableCell>
                                            <TableCell sx={{ width: 160 }}>{t("paymentsNew.table.starts")}</TableCell>
                                            <TableCell sx={{ width: 160 }}>{t("paymentsNew.table.ends")}</TableCell>
                                            <TableCell sx={{ width: 140 }}>{t("paymentsNew.table.source")}</TableCell>
                                            <TableCell sx={{ width: 160 }}>{t("paymentsNew.table.created")}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {historyLoading && (
                                            <TableRow>
                                                <TableCell colSpan={7}>
                                                    <Typography align="center" color="text.secondary" sx={{ py: 2 }}>
                                                        {t("paymentsNew.loading")}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {!historyLoading && historyError && (
                                            <TableRow>
                                                <TableCell colSpan={7}>
                                                    <Typography align="center" color="text.secondary" sx={{ py: 2 }}>
                                                        {historyError}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {!historyLoading && !historyError && history.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={7}>
                                                    <Typography align="center" color="text.secondary" sx={{ py: 2 }}>
                                                        {t("paymentsNew.emptyHistory")}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                            )}
                                            {!historyLoading &&
                                                !historyError &&
                                                history.map((item) => (
                                                    <React.Fragment key={item.id}>
                                                        <TableRow>
                                                            <TableCell>
                                                                {Array.isArray(item.entitlements_overrides) && item.entitlements_overrides.length > 0 && (
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => toggleHistoryRow(item.id)}
                                                                        aria-label="expand row"
                                                                    >
                                                                        {expandedHistory.has(item.id) ? <FiChevronUp /> : <FiChevronDown />}
                                                                    </IconButton>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {item.plan?.name ??
                                                                    planLookup.get(item.plan_id)?.name ??
                                                                    item.plan_id}
                                                            </TableCell>
                                                            <TableCell sx={{ width: 140 }}>
                                                                <Chip
                                                                    size="small"
                                                                    label={item.status}
                                                                    color={item.status === "ACTIVE" ? "success" : "default"}
                                                                    variant={item.status === "ACTIVE" ? "filled" : "outlined"}
                                                                />
                                                            </TableCell>
                                                            <TableCell sx={{ width: 160 }}>{fmt(item.starts_at)}</TableCell>
                                                            <TableCell sx={{ width: 160 }}>{item.lifetime ? t("paymentsNew.lifetime") : fmt(item.ends_at)}</TableCell>
                                                            <TableCell sx={{ width: 140 }}>{item.source ?? "—"}</TableCell>
                                                            <TableCell sx={{ width: 160 }}>{fmt(item.created_at)}</TableCell>
                                                        </TableRow>
                                                        {Array.isArray(item.entitlements_overrides) && item.entitlements_overrides.length > 0 && (
                                                            <TableRow>
                                                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                                                                    <Collapse in={expandedHistory.has(item.id)} timeout="auto" unmountOnExit>
                                                                        <Box sx={{ margin: 1, maxWidth: "100%", overflowX: "auto" }}>
                                                                            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                                                                                {t("paymentsNew.personalEntitlements", "Персональные квоты")}
                                                                            </Typography>
                                                                            {isSmDown ? (
                                                                                <Stack spacing={1}>
                                                                                    {item.entitlements_overrides.map((ent) => {
                                                                                        const meta = limitsConfig.find((l) => l.key === ent.key);
                                                                                        const label = resolveEntitlementLabel(ent.key);
                                                                                        const valueRaw =
                                                                                            ent.bool_value !== null && ent.bool_value !== undefined
                                                                                                ? (ent.bool_value ? t("paymentsNew.enabled", "Enabled") : t("paymentsNew.disabled", "Disabled"))
                                                                                                : ent.int_value !== null && ent.int_value !== undefined
                                                                                                    ? ent.int_value
                                                                                                    : "—";
                                                                                        return (
                                                                                            <Box
                                                                                                key={`${item.id}-${ent.key}-${ent.created_at ?? ""}`}
                                                                                                sx={{
                                                                                                    border: "1px solid",
                                                                                                    borderColor: "divider",
                                                                                                    borderRadius: 2,
                                                                                                    p: 1.25,
                                                                                                    bgcolor: "action.hover",
                                                                                                }}
                                                                                            >
                                                                                                <Stack spacing={0.75}>
                                                                                                    <Stack direction="row" spacing={0.75} alignItems="center">
                                                                                                        {meta?.icon}
                                                                                                        <Typography variant="body2" fontWeight={600}>
                                                                                                            {label}
                                                                                                        </Typography>
                                                                                                    </Stack>
                                                                                                    <Typography variant="body2">
                                                                                                        {t("paymentsNew.entitlementValue", "Значение")}: {valueRaw}
                                                                                                    </Typography>
                                                                                                    <Typography variant="body2" color="text.secondary">
                                                                                                        {t("paymentsNew.reason", "Причина")}: {ent.reason || t("paymentsNew.noReason", "—")}
                                                                                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {t("paymentsNew.updated")}: {fmt(ent.updated_at ?? undefined)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {t("paymentsNew.created")}: {fmt(ent.created_at ?? undefined)}
                                    </Typography>
                                </Stack>
                            </Box>
                        );
                    })}
                </Stack>
                                                                            ) : (
                                                                                <Table size="small" sx={{ tableLayout: "fixed", width: "100%" }}>
                                                                                    <TableHead>
                                                                                        <TableRow>
                                                                                        <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                                                                                            {t("paymentsNew.entitlementKey", "Категория")}
                                                                                        </TableCell>
                                                                                        <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                                                                                            {t("paymentsNew.entitlementValue", "Значение")}
                                                                                        </TableCell>
                                                                                        <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                                                                                            {t("paymentsNew.reason", "Причина")}
                                                                                        </TableCell>
                                                                                        <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                                                                                            {t("paymentsNew.updated", "Обновлено")}
                                                                                        </TableCell>
                                                                                        <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                                                                                            {t("paymentsNew.created", "Создано")}
                                                                                        </TableCell>
                                                                                        </TableRow>
                                                                                    </TableHead>
                                                                                    <TableBody>
                                                                                        {item.entitlements_overrides.map((ent) => {
                                                                                            const label = resolveEntitlementLabel(ent.key);
                                                                                            const valueRaw =
                                                                                                ent.bool_value !== null && ent.bool_value !== undefined
                                                                                                    ? (ent.bool_value ? t("paymentsNew.enabled", "Enabled") : t("paymentsNew.disabled", "Disabled"))
                                                                                                    : ent.int_value !== null && ent.int_value !== undefined
                                                                                                        ? ent.int_value
                                                                                                        : "—";
                                                                                            return (
                                                                                                <TableRow key={`${item.id}-${ent.key}-${ent.created_at ?? ""}`}>
                                                                                                    <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                                                                                                        <Stack direction="row" spacing={0.75} alignItems="center">
                                                                                                            <Typography variant="body2">{label}</Typography>
                                                                                                        </Stack>
                                                                                                    </TableCell>
                                                                                                    <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                                                                                                        <Typography variant="body2">{valueRaw}</Typography>
                                                                                                    </TableCell>
                                                                                                <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                                                                                                    <Typography variant="body2" color="text.secondary">
                                                                                                        {ent.reason || t("paymentsNew.noReason", "—")}
                                                                                                    </Typography>
                                                                                                </TableCell>
                                                                                                <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                                                                                                    <Typography variant="body2" color="text.secondary">
                                                                                                        {fmt(ent.updated_at ?? undefined)}
                                                                                                    </Typography>
                                                                                                </TableCell>
                                                                                                <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                                                                                                    <Typography variant="body2" color="text.secondary">
                                                                                                        {fmt(ent.created_at ?? undefined)}
                                                                                                    </Typography>
                                                                                                </TableCell>
                                                                                                </TableRow>
                                                                                            );
                                                                                        })}
                                                                                    </TableBody>
                                                                                </Table>
                                                                            )}
                                                                        </Box>
                                                                    </Collapse>
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    </React.Fragment>
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
