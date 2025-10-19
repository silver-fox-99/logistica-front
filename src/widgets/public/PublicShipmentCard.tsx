import { memo } from "react";
import { Box, Stack, Typography, Chip, Button, Paper } from "@mui/material";
import Grid from "@mui/material/Grid";
import { FiCalendar, FiMapPin, FiTag } from "react-icons/fi";
import type { PublicShipmentBase } from "@/entities/public-shipment/model/types";
import { Link as RouterLink } from "react-router-dom";

type Props = {
    data: PublicShipmentBase;
    kind: "cargo" | "transport";
    cta: { label: string; href: string; icon?: React.ReactNode };
};

export const PublicShipmentCard = memo(function PublicShipmentCard({ data, cta, kind }: Props) {
    return (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Grid container spacing={1.5} alignItems="center">
                <Grid size={{xs:12, md:8}} >
                    <Stack spacing={1}>
                        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                            <Box display="inline-flex" alignItems="center" gap={0.75}>
                                <FiMapPin />
                                <Typography fontWeight={700}>{data.routeFrom}</Typography>
                            </Box>
                            <Typography color="text.secondary">→</Typography>
                            <Box display="inline-flex" alignItems="center" gap={0.75}>
                                <FiMapPin />
                                <Typography fontWeight={700}>{data.routeTo}</Typography>
                            </Box>

                            <Chip
                                size="small"
                                icon={<FiCalendar />}
                                variant="outlined"
                                label={`${data.dates.from} – ${data.dates.to}`}
                                sx={{ ml: 0.5 }}
                            />
                            <Chip
                                size="small"
                                color="primary"
                                variant="filled"
                                label={kind === "cargo" ? "Cargo" : "Transport"}
                            />
                        </Stack>

                        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                            {data.metrics?.map((m) => (
                                <Chip key={m} size="small" variant="outlined" label={m} />
                            ))}
                            {data.price && <Chip size="small" color="success" variant="outlined" label={data.price} />}
                        </Stack>

                        {!!data.tags?.length && (
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                {data.tags.map((t) => (
                                    <Chip key={t} size="small" icon={<FiTag />} variant="outlined" label={t} />
                                ))}
                            </Stack>
                        )}

                        {data.note && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {data.note}
                            </Typography>
                        )}
                    </Stack>
                </Grid>

                <Grid size={{xs:12, md:4}}>
                    <Stack
                        direction={{ xs: "row", md: "column" }}
                        spacing={1}
                        alignItems={{ xs: "flex-start", md: "flex-end" }}
                        justifyContent="space-between"
                    >
                        <Typography variant="caption" color="text.secondary">
                            Updated: {data.createdAt?.slice(0, 10)}
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

                        <Typography variant="caption" color="text.secondary">
                            Sign in to view contacts and details.
                        </Typography>
                    </Stack>
                </Grid>
            </Grid>
        </Paper>
    );
});
