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

    console.log(routeFrom, routeTo)
    return (
        <>
            <Stack
                direction="row"
                alignItems="flex-start"
                justifyContent="space-between"
                spacing={1}
                sx={{ display: { xs: "flex", md: "none" } }}
            >
                <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0, flexWrap: "wrap" }}>
                    <Box display="inline-flex" alignItems="center" gap={0.5} sx={{ minWidth: 0 }}>
                        <FiMapPin size={18} />
                        <Tooltip title={routeFrom}>
                            <Typography
                                fontWeight={800}
                                noWrap
                                sx={{
                                    maxWidth: { xs: 95, sm: 140 },
                                    fontSize: { xs: 16, sm: 18 },
                                    lineHeight: 1.2,
                                }}
                            >
                                {routeFrom}
                            </Typography>
                        </Tooltip>
                    </Box>

                    <Typography color="text.secondary" sx={{ fontSize: 18, lineHeight: 1 }}>
                        →
                    </Typography>

                    <Box display="inline-flex" alignItems="center" gap={0.5} sx={{ minWidth: 0 }}>
                        <FiMapPin size={18} />
                        <Tooltip title={routeTo}>
                            <Typography
                                fontWeight={800}
                                noWrap
                                sx={{
                                    maxWidth: { xs: 95, sm: 140 },
                                    fontSize: { xs: 16, sm: 18 },
                                    lineHeight: 1.2,
                                }}
                            >
                                {routeTo}
                            </Typography>
                        </Tooltip>
                    </Box>
                </Stack>

                <Typography
                    fontWeight={800}
                    color="success.main"
                    sx={{
                        whiteSpace: "nowrap",
                        fontSize: { xs: 16, sm: 18 },
                        lineHeight: 1.2,
                        flexShrink: 0,
                    }}
                >
                    {price || "—"}
                </Typography>
            </Stack>

            <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                    display: { xs: "none", md: "flex" },
                    minWidth: 0,
                }}
            >
                <Box display="inline-flex" alignItems="center" gap={0.5} sx={{ minWidth: 0 }}>
                    <FiMapPin size={20} />
                    <Tooltip title={routeFrom}>
                        <Typography
                            fontWeight={800}
                            noWrap
                            sx={{
                                maxWidth: 190,
                                fontSize: { md: 18, lg: 20 },
                                lineHeight: 1.2,
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
                                }}
                            >
                                {loadPointsCount > 99 ? "99+" : loadPointsCount}
                            </Box>
                        </Tooltip>
                    )}
                </Box>

                <Typography color="text.secondary" sx={{ fontSize: 20, lineHeight: 1 }}>
                    →
                </Typography>

                <Box display="inline-flex" alignItems="center" gap={0.5} sx={{ minWidth: 0 }}>
                    <FiMapPin size={20} />
                    <Tooltip title={routeTo}>
                        <Typography
                            fontWeight={800}
                            noWrap
                            sx={{
                                maxWidth: 190,
                                fontSize: { md: 18, lg: 20 },
                                lineHeight: 1.2,
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