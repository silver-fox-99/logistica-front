import { Box, Stack, Tooltip, Typography } from "@mui/material";
import { FiMapPin } from "react-icons/fi";

type Props = {
    routeFrom: string;
    routeTo: string;
    price?: string | null;
    loadPointsCount: number;
    unloadPointsCount: number;
    pickupPointsTitle: string;
    dropoffPointsTitle: string;
};

export function ShipmentCardHeader({
                                       routeFrom,
                                       routeTo,
                                       price,
                                       loadPointsCount,
                                       unloadPointsCount,
                                       pickupPointsTitle,
                                       dropoffPointsTitle,
                                   }: Props) {


    return (
        <>
            {/* Mobile Layout (Column stacked routes, smaller font) */}
            <Stack
                direction="row"
                alignItems="flex-start"
                justifyContent="space-between"
                spacing={1}
                sx={{ display: { xs: "flex", md: "none" }, width: "100%" }}
            >
                <Stack direction="column" spacing={0.25} sx={{ minWidth: 0, flexGrow: 1 }}>
                    {/* From location */}
                    <Box display="inline-flex" alignItems="center" gap={0.75} sx={{ minWidth: 0 }}>
                        <FiMapPin size={16} style={{ color: "#1976d2", flexShrink: 0 }} />
                        <Typography
                            fontWeight={800}
                            sx={{
                                fontSize: { xs: 13, sm: 14 },
                                lineHeight: 1.2,
                                wordBreak: "break-word",
                            }}
                        >
                            {routeFrom}
                        </Typography>
                        {loadPointsCount > 1 && (
                            <Box
                                sx={{
                                    minWidth: 14,
                                    height: 14,
                                    px: 0.5,
                                    borderRadius: 999,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    bgcolor: "primary.main",
                                    color: "primary.contrastText",
                                    fontSize: 8,
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    flexShrink: 0,
                                }}
                            >
                                {loadPointsCount}
                            </Box>
                        )}
                    </Box>

                    {/* Dotted connector */}
                    <Box sx={{ borderLeft: "2px dotted", borderColor: "grey.400", ml: "7px", my: 0.25, height: 10 }} />

                    {/* To location */}
                    <Box display="inline-flex" alignItems="center" gap={0.75} sx={{ minWidth: 0 }}>
                        <FiMapPin size={16} style={{ color: "#2e7d32", flexShrink: 0 }} />
                        <Typography
                            fontWeight={800}
                            sx={{
                                fontSize: { xs: 13, sm: 14 },
                                lineHeight: 1.2,
                                wordBreak: "break-word",
                            }}
                        >
                            {routeTo}
                        </Typography>
                        {unloadPointsCount > 1 && (
                            <Box
                                sx={{
                                    minWidth: 14,
                                    height: 14,
                                    px: 0.5,
                                    borderRadius: 999,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    bgcolor: "primary.main",
                                    color: "primary.contrastText",
                                    fontSize: 8,
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    flexShrink: 0,
                                }}
                            >
                                {unloadPointsCount}
                            </Box>
                        )}
                    </Box>
                </Stack>

                <Typography
                    fontWeight={800}
                    color="success.main"
                    sx={{
                        whiteSpace: "nowrap",
                        fontSize: { xs: 15, sm: 17 },
                        lineHeight: 1.2,
                        flexShrink: 0,
                        alignSelf: "flex-start",
                        mt: 0.25,
                    }}
                >
                    {price || "—"}
                </Typography>
            </Stack>

            {/* Desktop Layout (Row, wrapped with larger maxWidth) */}
            <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{
                    display: { xs: "none", md: "flex" },
                    minWidth: 0,
                    flexWrap: "wrap",
                }}
            >
                <Box display="inline-flex" alignItems="center" gap={0.75} sx={{ minWidth: 0 }}>
                    <FiMapPin size={20} style={{ color: "#1976d2", flexShrink: 0 }} />
                    <Tooltip title={routeFrom}>
                        <Typography
                            fontWeight={800}
                            sx={{
                                maxWidth: { md: 240, lg: 320 },
                                fontSize: { md: 18, lg: 20 },
                                lineHeight: 1.2,
                                wordBreak: "break-word",
                            }}
                        >
                            {routeFrom}
                        </Typography>
                    </Tooltip>

                    {loadPointsCount > 1 && (
                        <Tooltip title={`${pickupPointsTitle}: ${loadPointsCount}`}>
                            <Box
                                sx={{
                                    minWidth: 18,
                                    height: 18,
                                    px: 0.5,
                                    borderRadius: 999,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    bgcolor: "primary.main",
                                    color: "primary.contrastText",
                                    fontSize: 10,
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    flexShrink: 0,
                                }}
                            >
                                {loadPointsCount > 99 ? "99+" : loadPointsCount}
                            </Box>
                        </Tooltip>
                    )}
                </Box>

                <Typography color="text.secondary" sx={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>
                    →
                </Typography>

                <Box display="inline-flex" alignItems="center" gap={0.75} sx={{ minWidth: 0 }}>
                    <FiMapPin size={20} style={{ color: "#2e7d32", flexShrink: 0 }} />
                    <Tooltip title={routeTo}>
                        <Typography
                            fontWeight={800}
                            sx={{
                                maxWidth: { md: 240, lg: 320 },
                                fontSize: { md: 18, lg: 20 },
                                lineHeight: 1.2,
                                wordBreak: "break-word",
                            }}
                        >
                            {routeTo}
                        </Typography>
                    </Tooltip>

                    {unloadPointsCount > 1 && (
                        <Tooltip title={`${dropoffPointsTitle}: ${unloadPointsCount}`}>
                            <Box
                                sx={{
                                    minWidth: 18,
                                    height: 18,
                                    px: 0.5,
                                    borderRadius: 999,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    bgcolor: "primary.main",
                                    color: "primary.contrastText",
                                    fontSize: 10,
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    flexShrink: 0,
                                }}
                            >
                                {unloadPointsCount > 99 ? "99+" : unloadPointsCount}
                            </Box>
                        </Tooltip>
                    )}
                </Box>
            </Stack>
        </>
    );
}