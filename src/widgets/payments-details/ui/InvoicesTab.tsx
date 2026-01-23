import React from "react";
import { Box, Chip, IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import { FiExternalLink } from "react-icons/fi";
import type { TariffInvoice } from "@/shared/api/tariffsApi.ts";

import { useTranslation } from "react-i18next";
import {formatDateTimeEnGB} from "@/shared/lib/formatDateTime.ts";

type Props = {
    invoices: TariffInvoice[];
    loading: boolean;
    error: string | null;
};

export const InvoicesTab: React.FC<Props> = ({ invoices, loading, error }) => {
    const { t } = useTranslation();

    return (
        <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>{t("paymentsNew.table.plan", "Plan")}</TableCell>
                        <TableCell sx={{ width: 140 }}>{t("paymentsNew.table.amount", "Amount")}</TableCell>
                        <TableCell sx={{ width: 140 }}>{t("paymentsNew.table.status", "Status")}</TableCell>
                        <TableCell sx={{ width: 140 }}>{t("paymentsNew.table.provider", "Provider")}</TableCell>
                        <TableCell sx={{ width: 180 }}>{t("paymentsNew.table.created", "Created")}</TableCell>
                        <TableCell sx={{ width: 80 }}>{t("paymentsNew.table.link", "Link")}</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {loading && (
                        <TableRow>
                            <TableCell colSpan={6}>
                                <Typography align="center" color="text.secondary" sx={{ py: 2 }}>
                                    {t("paymentsNew.loading", "Loading...")}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading && error && (
                        <TableRow>
                            <TableCell colSpan={6}>
                                <Typography align="center" color="text.secondary" sx={{ py: 2 }}>
                                    {error}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading && !error && invoices.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6}>
                                <Typography align="center" color="text.secondary" sx={{ py: 2 }}>
                                    {t("paymentsNew.emptyInvoices", "No invoices.")}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading &&
                        !error &&
                        invoices.map((inv) => {
                            const status = inv.status ?? "";
                            const color =
                                status === "PAID"
                                    ? "success"
                                    : status === "PENDING"
                                        ? "warning"
                                        : status === "CANCELLED" || status === "FAILED"
                                            ? "error"
                                            : "default";

                            return (
                                <TableRow key={inv.id}>
                                    <TableCell>
                                        <Stack spacing={0.25}>
                                            <Typography variant="body2" fontWeight={700}>
                                                {inv.plan_name ?? inv.plan_code ?? "—"}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                #{inv.subscription_id ?? "—"}
                                            </Typography>
                                        </Stack>
                                    </TableCell>

                                    <TableCell>
                                        {inv.amount ?? "—"} {inv.currency}
                                    </TableCell>

                                    <TableCell>
                                        <Chip size="small" label={status || "—"} color={color as any} variant="outlined" />
                                    </TableCell>

                                    <TableCell>{inv.provider ?? "—"}</TableCell>
                                    <TableCell>{formatDateTimeEnGB(inv.created_at)}</TableCell>

                                    <TableCell>
                                        {inv.short_link || inv.checkout_url ? (
                                            <Tooltip title={t("paymentsNew.table.openLink", "Open link")}>
                                                <IconButton
                                                    size="small"
                                                    component="a"
                                                    href={(inv.short_link || inv.checkout_url) ?? "#"}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <FiExternalLink />
                                                </IconButton>
                                            </Tooltip>
                                        ) : (
                                            "—"
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                </TableBody>
            </Table>
        </Box>
    );
};
