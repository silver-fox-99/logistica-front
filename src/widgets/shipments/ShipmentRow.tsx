import { useState } from "react";
import {
    Box, Stack, Chip, Typography, IconButton, Button, Tooltip, Divider
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
    FiClock, FiMapPin, FiPackage, FiTruck, FiBookmark,
    FiRepeat, FiTrash2, FiEdit2, FiCopy, FiChevronDown, FiChevronUp, FiMail, FiUser, FiPhone
} from "react-icons/fi";

export type ShipmentRowData = {
    id: string;
    routeFrom: string;
    routeTo: string;
    distanceKm: number;
    dates: { from: string; to: string };
    dims?: string;
    typeTags: string[];
    badges?: string[];
    paymentType?: "Cash" | "Bank" | "Card";
    price?: string;
    pricePerKm?: string;
    timeAgo?: string;
    repeats?: number;
    views?: number;
    contact?: { name?: string; email?: string; phone1?: string; phone2?: string; telegram?: string };
};

type Props = {
    data: ShipmentRowData;
    onBookmark?: (id: string) => void;
    onMoreOpen?: (id: string) => void;
};

export default function ShipmentRow({ data, onBookmark, onMoreOpen }: Props) {
    const [expanded, setExpanded] = useState(false);

    const openMore = () => {
        if (!expanded) onMoreOpen?.(data.id);
        setExpanded((s) => !s);
    };

    return (
        <Box sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
            <Grid container spacing={1.5} alignItems="center">

                <Grid size={{ xs: 12, md: 8 }}>
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
                            <Chip size="small" icon={<FiTruck />} label="Cargo" />
                            <Chip size="small" icon={<FiClock />} variant="outlined" label={`${data.dates.from} – ${data.dates.to}`} />
                        </Stack>

                        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                            <Chip size="small" color="primary" label={`${data.distanceKm} km`} />
                            {data.dims && <Chip size="small" variant="outlined" icon={<FiPackage />} label={data.dims} />}
                            {data.typeTags.map((t) => <Chip key={t} size="small" variant="outlined" label={t} />)}
                        </Stack>

                        {!!data.badges?.length && (
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                {data.badges.map((b) => (
                                    <Chip
                                        key={b}
                                        size="small"
                                        label={b}
                                        sx={{ bgcolor: "#FFF6D7", color: "#8A6D1F", borderColor: "transparent" }}
                                    />
                                ))}
                            </Stack>
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
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" justifyContent="flex-end">
                            {typeof data.repeats === "number" && (
                                <Chip size="small" label={`Repeats: ${data.repeats}`} sx={{ bgcolor: "#FFF1E6", color: "#B35C00" }} />
                            )}
                            {typeof data.views === "number" && (
                                <Chip size="small" label={`Views: ${data.views}`} sx={{ bgcolor: "#FFF1E6", color: "#B35C00" }} />
                            )}
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            {data.paymentType && (
                                <Chip size="small" color="success" label={data.paymentType} sx={{ color: "#0A5C2B", bgcolor: "#E7F5EA" }} />
                            )}
                            {data.price && <Chip size="small" color="success" variant="outlined" label={data.price} />}
                            {data.pricePerKm && (
                                <Typography variant="caption" color="text.secondary">{data.pricePerKm}</Typography>
                            )}
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="center">
                            <Tooltip title="Save to favorites">
                                <IconButton onClick={() => onBookmark?.(data.id)}>
                                    <FiBookmark />
                                </IconButton>
                            </Tooltip>

                            <Button
                                size="small"
                                variant="contained"
                                onClick={openMore}
                                endIcon={expanded ? <FiChevronUp /> : <FiChevronDown />}
                                sx={{ textTransform: "none" }}
                            >
                                {expanded ? "Collapse" : "More"}
                            </Button>
                        </Stack>

                        {data.timeAgo && (
                            <Typography variant="caption" color="text.secondary">
                                {data.timeAgo}
                            </Typography>
                        )}
                    </Stack>
                </Grid>
            </Grid>


            {expanded && (
                <>
                    <Divider sx={{ my: 1.5 }} />
                    <Grid container spacing={1.5}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Stack spacing={1} color="text.secondary">
                                {data.contact?.name && (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <FiUser /><Typography>{data.contact.name}</Typography>
                                    </Stack>
                                )}
                                {data.contact?.email && (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <FiMail /><Typography>{data.contact.email}</Typography>
                                    </Stack>
                                )}
                                {data.contact?.phone1 && (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <FiPhone /><Typography>{data.contact.phone1}</Typography>
                                    </Stack>
                                )}
                                {data.contact?.phone2 && (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <FiPhone /><Typography>{data.contact.phone2}</Typography>
                                    </Stack>
                                )}
                                {data.contact?.telegram && (
                                    <Typography>{data.contact.telegram}</Typography>
                                )}
                            </Stack>
                        </Grid>


                        <Grid size={{ xs: 12, md: 6 }}>
                            <Stack direction="row" spacing={1}>
                                <Tooltip title="Repeat"><IconButton><FiRepeat /></IconButton></Tooltip>
                                <Tooltip title="Delete"><IconButton color="error"><FiTrash2 /></IconButton></Tooltip>
                                <Tooltip title="Copy"><IconButton><FiCopy /></IconButton></Tooltip>
                                <Tooltip title="Edit"><IconButton><FiEdit2 /></IconButton></Tooltip>
                            </Stack>
                        </Grid>
                    </Grid>
                </>
            )}
        </Box>
    );
}
