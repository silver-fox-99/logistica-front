import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { FiArrowUpRight, FiRefreshCw } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Lottie from "lottie-react";

import animationData from "@/widgets/shipment-details/order-details-limit/animations/limit.json";

type Props = {
    onReload?: () => void;
};

export function OrderDetailsLimitReached({ onReload }: Props) {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <Box sx={{ py: { xs: 2, md: 4 } }}>
            <Paper
                variant="outlined"
                sx={{
                    p: { xs: 2.5, md: 4 },
                    borderRadius: 2,
                    borderColor: "divider",
                }}
            >
                <Stack spacing={2.5} alignItems="center" textAlign="center">
                    <Box sx={{ width: 260, maxWidth: "100%" }}>
                        <Lottie animationData={animationData} loop autoplay />
                    </Box>

                    <Stack spacing={1} alignItems="center" sx={{ maxWidth: 560 }}>
                        <Typography variant="h5" fontWeight={800}>
                            {t(
                                "shipments.orderDetailsLimit.title",
                                "Monthly order details limit reached",
                            )}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            {t(
                                "shipments.orderDetailsLimit.description",
                                "You have used all available order detail views for your current plan. Upgrade your plan to continue viewing full order information.",
                            )}
                        </Typography>
                    </Stack>

                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1.25}
                        justifyContent="center"
                        sx={{ width: "100%", maxWidth: 420 }}
                    >
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={() => navigate("/dashboard/payments")}
                            startIcon={<FiArrowUpRight />}
                            sx={{
                                textTransform: "none",
                                fontWeight: 700,
                                borderRadius: 1.5,
                                minHeight: 44,
                            }}
                        >
                            {t("shipments.orderDetailsLimit.upgrade", "Upgrade plan")}
                        </Button>

                        {onReload && (
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={onReload}
                                startIcon={<FiRefreshCw />}
                                sx={{
                                    textTransform: "none",
                                    fontWeight: 700,
                                    borderRadius: 1.5,
                                    minHeight: 44,
                                }}
                            >
                                {t("common.reload", "Reload")}
                            </Button>
                        )}
                    </Stack>
                </Stack>
            </Paper>
        </Box>
    );
}