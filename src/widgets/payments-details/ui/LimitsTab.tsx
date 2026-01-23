import React, { useMemo } from "react";
import { Box, Card, CardContent, Chip, LinearProgress, Stack, Typography } from "@mui/material";
import { FiCheckCircle } from "react-icons/fi";
import type { Entitlements, TariffMeResponse } from "@/shared/api/tariffsApi";
import { buildLimitItemsConfig, usageKeyMap } from "@/entities/tariff/lib/limits";
import { useTranslation } from "react-i18next";

const pleasantGreen = "#2e7d32";
const pleasantRed = "#d32f2f";

type Props = {
    effectiveEntitlements: Entitlements | null;
    usage: TariffMeResponse["usage"] | null;
};

export const LimitsTab: React.FC<Props> = ({ effectiveEntitlements, usage }) => {
    const { t } = useTranslation();

    const limitsConfig = useMemo(() => buildLimitItemsConfig(t), [t]);

    if (!effectiveEntitlements) {
        return (
            <Typography variant="body2" color="text.secondary">
                {t("paymentsNew.emptyLimits", { defaultValue: "No limits data." })}
            </Typography>
        );
    }

    return (
        <Box display="grid" gridTemplateColumns={{ xs: "1fr" }} gap={2}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ display: "grid", gap: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700}>
                        {t("paymentsNew.tabs.limits", { defaultValue: "Limits" })}
                    </Typography>

                    <Stack spacing={{ xs: 2.5, sm: 3 }}>
                        {limitsConfig.map((item) => {
                            const Icon = item.icon;

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
                                                <Icon size={16} />
                                                <Typography variant="body2" sx={{ lineHeight: 1.2, whiteSpace: { xs: "normal", sm: "nowrap" } }}>
                                                    {item.label}
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        <Chip
                                            size="small"
                                            label={
                                                enabled
                                                    ? t("paymentsNew.enabled", { defaultValue: "Enabled" })
                                                    : t("paymentsNew.disabled", { defaultValue: "Disabled" })
                                            }
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
                            const usedRaw = usageKey && usage ? usage[usageKey] : null;

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
                                            <Icon size={16} />
                                            <Typography variant="body2" sx={{ lineHeight: 1.2, whiteSpace: { xs: "normal", sm: "nowrap" } }}>
                                                {item.label}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Box sx={{ flex: 1.3, width: { xs: "100%", sm: "auto" } }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={progress}
                                            sx={{
                                                height: 8,
                                                borderRadius: 999,
                                                bgcolor: overLimit ? "#fdecea" : undefined,
                                                "& .MuiLinearProgress-bar": {
                                                    backgroundColor: overLimit ? pleasantRed : undefined,
                                                },
                                            }}
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
        </Box>
    );
};
