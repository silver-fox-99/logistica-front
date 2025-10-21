import { memo, useMemo } from "react";
import { Box, Stack, Typography, Chip, Button, Paper, Tooltip as MuiTooltip } from "@mui/material";
import Grid from "@mui/material/Grid";
import { FiCalendar, FiMapPin, FiTag } from "react-icons/fi";
import type { PublicShipmentBase, PublicPoint, PublicPointType } from "@/entities/public-shipment/model/types";
import { Link as RouterLink } from "react-router-dom";

type Props = {
    data: PublicShipmentBase;
    kind: "cargo" | "transport";
    cta: { label: string; href: string; icon?: React.ReactNode };
};

const fmtPoint = (p?: PublicPoint) => p
    ? [p.city, p.region, p.country].filter(Boolean).join(", ")
    : "";

// порядок для сортировки: pickup/departure → waypoints → dropoff/arrival
const ORDER: Record<PublicPointType, number> = {
    PICKUP: 0, DEPARTURE: 0,
    WAYPOINT: 1,
    DROPOFF: 2, ARRIVAL: 2,
};

// максимум видимых точек
const MAX_VISIBLE_POINTS = 4;

export const PublicShipmentCard = memo(function PublicShipmentCard({ data, cta, kind }: Props) {

    console.log(data)
    const labels = useMemo(() => {
        const pts = (data.points ?? []).slice();

        // стабильная сортировка: по ORDER, при равенстве — как пришло из API
        pts.sort((a, b) => (ORDER[a.type] ?? 1) - (ORDER[b.type] ?? 1));

        const seq = pts.map(fmtPoint).filter(Boolean);

        // если вдруг поинты пустые — просто ничего не выводим (или можно fallback-строку)
        const clean = seq.length ? seq : [];

        const overflow = clean.length > MAX_VISIBLE_POINTS ? clean.length - MAX_VISIBLE_POINTS : 0;
        const visible = overflow > 0 ? clean.slice(0, MAX_VISIBLE_POINTS) : clean;

        return { visible, overflow };
    }, [data.points]);

    return (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Grid container spacing={1.5} alignItems="center">
                <Grid size={{ xs: 12, md: 8 }}>
                    <Stack spacing={1}>
                        {/* Маршрут: точки из points[] */}
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                            {labels.visible.map((label, idx) => (
                                <Stack key={`${label}-${idx}`} direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
                                    {idx > 0 && <Typography color="text.secondary" sx={{ mx: 0.25 }}>→</Typography>}
                                    <Box display="inline-flex" alignItems="center" gap={0.75} sx={{ minWidth: 0 }}>
                                        <FiMapPin />
                                        <MuiTooltip title={label}>
                                            <Typography fontWeight={700} noWrap sx={{ maxWidth: { xs: 220, md: 360 } }}>
                                                {label || "—"}
                                            </Typography>
                                        </MuiTooltip>
                                    </Box>
                                </Stack>
                            ))}
                            {labels.overflow > 0 && (
                                <Chip size="small" variant="outlined" label={`+${labels.overflow} more`} />
                            )}

                            <Chip
                                size="small"
                                icon={<FiCalendar />}
                                variant="outlined"
                                label={`${data.dates?.from ?? ""} – ${data.dates?.to ?? ""}`}
                                sx={{ ml: 0.5 }}
                            />
                            <Chip
                                size="small"
                                color="primary"
                                variant="filled"
                                label={kind === "cargo" ? "Cargo" : "Transport"}
                            />
                        </Stack>

                        {/* Метрики / цена */}
                        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                            {data.metrics?.map((m) => (
                                <Chip key={m} size="small" variant="outlined" label={m} />
                            ))}
                            {data.price && <Chip size="small" color="success" variant="outlined" label={data.price} />}
                        </Stack>

                        {/* Теги */}
                        {!!data.tags?.length && (
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                {data.tags.map((t) => (
                                    <Chip key={t} size="small" icon={<FiTag />} variant="outlined" label={t} />
                                ))}
                            </Stack>
                        )}

                        {/* Примечание */}
                        {data.note && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {data.note}
                            </Typography>
                        )}
                    </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Stack
                        direction={{ xs: "row", md: "column" }}
                        spacing={1}
                        alignItems={{ xs: "flex-start", md: "flex-end" }}
                        justifyContent="space-between"
                    >
                        <Typography variant="caption" color="text.secondary">
                            Updated: {data.createdAt?.slice(0, 10) ?? ""}
                        </Typography>

                        <Button
                            component={RouterLink}
                            to={cta.href}
                            variant="contained"
                            size="small"
                            sx={{ textTransform: "none" }}
                            endIcon={cta.icon}
                        >
                            {cta.label}
                        </Button>

                        <Typography variant="caption" color="text.secondary" textAlign={{ md: "right" }}>
                            Sign in to view contacts and details.
                        </Typography>
                    </Stack>
                </Grid>
            </Grid>
        </Paper>
    );
});
