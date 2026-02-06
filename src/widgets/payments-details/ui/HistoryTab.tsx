import React, { useMemo, useState } from "react";
import {
    Box,
    Chip,
    Collapse,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import type { TariffPlan, TariffSubscription } from "@/shared/api/tariffsApi.ts";

import { buildLimitItemsConfig } from "@/entities/tariff/lib/limits.ts";
import { useTranslation } from "react-i18next";
import { formatDateTimeEnGB } from "@/shared/lib/format/formatDateTime.ts";

type Props = {
    history: TariffSubscription[];
    loading: boolean;
    error: string | null;
    plans: TariffPlan[];
};

export const HistoryTab: React.FC<Props> = ({ history, loading, error, plans }) => {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    const theme = useTheme();
    const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));
    const limitsConfig = useMemo(() => buildLimitItemsConfig(t), [t]);

    const planLookup = useMemo(() => {
        const map = new Map<string, TariffPlan>();
        plans.forEach((p) => map.set(p.id, p));
        return map;
    }, [plans]);

    const toggleRow = (id: string) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const resolveEntitlementLabel = (key: string) => {
        const meta = limitsConfig.find((l) => l.key === key);
        if (meta?.label) return meta.label;
        return key;
    };

    return (
        <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ width: 48 }} />
                        <TableCell>{t("paymentsNew.table.plan", "Plan")}</TableCell>
                        <TableCell sx={{ width: 140 }}>{t("paymentsNew.table.status", "Status")}</TableCell>
                        <TableCell sx={{ width: 160 }}>{t("paymentsNew.table.starts", "Starts")}</TableCell>
                        <TableCell sx={{ width: 160 }}>{t("paymentsNew.table.ends", "Ends")}</TableCell>
                        <TableCell sx={{ width: 140 }}>{t("paymentsNew.table.source", "Source")}</TableCell>
                        <TableCell sx={{ width: 160 }}>{t("paymentsNew.table.created", "Created")}</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {loading && (
                        <TableRow>
                            <TableCell colSpan={7}>
                                <Typography align="center" color="text.secondary" sx={{ py: 2 }}>
                                    {t("paymentsNew.loading", "Loading...")}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading && error && (
                        <TableRow>
                            <TableCell colSpan={7}>
                                <Typography align="center" color="text.secondary" sx={{ py: 2 }}>
                                    {error}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading && !error && history.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={7}>
                                <Typography align="center" color="text.secondary" sx={{ py: 2 }}>
                                    {t("paymentsNew.emptyHistory", "No history yet.")}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading &&
                        !error &&
                        history.map((item) => {
                            const hasOverrides = Array.isArray(item.entitlements_overrides) && item.entitlements_overrides.length > 0;
                            const overrides = Array.isArray(item.entitlements_overrides)
                                ? item.entitlements_overrides
                                : [];

                            return (
                                <React.Fragment key={item.id}>
                                    <TableRow>
                                        <TableCell>
                                            {hasOverrides && (
                                                <IconButton size="small" onClick={() => toggleRow(item.id)} aria-label="expand row">
                                                    {expanded.has(item.id) ? <FiChevronUp /> : <FiChevronDown />}
                                                </IconButton>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            {item.plan?.name ?? planLookup.get(item.plan_id)?.name ?? item.plan_id}
                                        </TableCell>

                                        <TableCell sx={{ width: 140 }}>
                                            <Chip
                                                size="small"
                                                label={item.status}
                                                color={item.status === "ACTIVE" ? "success" : "default"}
                                                variant={item.status === "ACTIVE" ? "filled" : "outlined"}
                                            />
                                        </TableCell>

                                        <TableCell sx={{ width: 160 }}>{formatDateTimeEnGB(item.starts_at)}</TableCell>
                                        <TableCell sx={{ width: 160 }}>
                                            {item.lifetime ? t("paymentsNew.lifetime", "Lifetime") : formatDateTimeEnGB(item.ends_at)}
                                        </TableCell>
                                        <TableCell sx={{ width: 140 }}>{item.source ?? "—"}</TableCell>
                                        <TableCell sx={{ width: 160 }}>{formatDateTimeEnGB(item.created_at)}</TableCell>
                                    </TableRow>

                                    {hasOverrides && (
                                        <TableRow>
                                            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                                                <Collapse in={expanded.has(item.id)} timeout="auto" unmountOnExit>
                                                    <Box sx={{ margin: 1, maxWidth: "100%", overflowX: "auto" }}>
                                                        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                                                            {t("paymentsNew.personalEntitlements", "Personal entitlements")}
                                                        </Typography>

                                                        {isSmDown ? (
                                                            <Stack spacing={1}>
                                                                {overrides.map((ent) => {
                                                                    const label = resolveEntitlementLabel(ent.key);
                                                                    const valueRaw =
                                                                        ent.bool_value !== null && ent.bool_value !== undefined
                                                                            ? ent.bool_value
                                                                                ? t("paymentsNew.enabled", "Enabled")
                                                                                : t("paymentsNew.disabled", "Disabled")
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
                                                                                <Typography variant="body2" fontWeight={600}>
                                                                                    {label}
                                                                                </Typography>
                                                                                <Typography variant="body2">
                                                                                    {t("paymentsNew.entitlementValue", "Value")}: {valueRaw}
                                                                                </Typography>
                                                                                <Typography variant="body2" color="text.secondary">
                                                                                    {t("paymentsNew.reason", "Reason")}: {ent.reason || "—"}
                                                                                </Typography>
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    {t("paymentsNew.updated", "Updated")}: {formatDateTimeEnGB(ent.updated_at ?? undefined)}
                                                                                </Typography>
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    {t("paymentsNew.created", "Created")}: {formatDateTimeEnGB(ent.created_at ?? undefined)}
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
                                                                            {t("paymentsNew.entitlementKey", "Category")}
                                                                        </TableCell>
                                                                        <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                                                                            {t("paymentsNew.entitlementValue", "Value")}
                                                                        </TableCell>
                                                                        <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                                                                            {t("paymentsNew.reason", "Reason")}
                                                                        </TableCell>
                                                                        <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                                                                            {t("paymentsNew.updated", "Updated")}
                                                                        </TableCell>
                                                                        <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                                                                            {t("paymentsNew.created", "Created")}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                </TableHead>

                                                                <TableBody>
                                                                    {overrides.map((ent) => {
                                                                        const label = resolveEntitlementLabel(ent.key);
                                                                        const valueRaw =
                                                                            ent.bool_value !== null && ent.bool_value !== undefined
                                                                                ? ent.bool_value
                                                                                    ? t("paymentsNew.enabled", "Enabled")
                                                                                    : t("paymentsNew.disabled", "Disabled")
                                                                                : ent.int_value !== null && ent.int_value !== undefined
                                                                                    ? ent.int_value
                                                                                    : "—";

                                                                        return (
                                                                            <TableRow key={`${item.id}-${ent.key}-${ent.created_at ?? ""}`}>
                                                                                <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                                                                                    <Typography variant="body2">{label}</Typography>
                                                                                </TableCell>
                                                                                <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                                                                                    <Typography variant="body2">{valueRaw}</Typography>
                                                                                </TableCell>
                                                                                <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                                                                                    <Typography variant="body2" color="text.secondary">
                                                                                        {ent.reason || "—"}
                                                                                    </Typography>
                                                                                </TableCell>
                                                                                <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                                                                                    <Typography variant="body2" color="text.secondary">
                                                                                        {formatDateTimeEnGB(ent.updated_at ?? undefined)}
                                                                                    </Typography>
                                                                                </TableCell>
                                                                                <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                                                                                    <Typography variant="body2" color="text.secondary">
                                                                                        {formatDateTimeEnGB(ent.created_at ?? undefined)}
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
                            );
                        })}
                </TableBody>
            </Table>
        </Box>
    );
};
