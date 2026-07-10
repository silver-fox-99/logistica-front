import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { FiRefreshCw } from "react-icons/fi";
import animationData from "@/pages/dashboard/referral/animations/share.json";
import Lottie from "lottie-react";
import { useTranslation } from "react-i18next";

type Props = {
    onReload?: () => void;
};

export function ReferralUnavailable({ onReload }: Props) {
    const { t } = useTranslation();

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Paper
                variant="outlined"
                sx={{
                    p: { xs: 2, md: 3 },
                    borderRadius: "16px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                    bgcolor: "background.paper",
                    borderColor: "divider",
                }}
            >
                <Stack spacing={2} alignItems="center" textAlign="center">
                    <Box sx={{ width: 260, maxWidth: "100%" }}>
                        <Lottie animationData={animationData} loop autoplay />
                    </Box>

                    <Box>
                        <Typography variant="h5" fontWeight={850}>
                            {t("referralProgram.unavailable.title")}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.75, mt: 0.5, fontWeight: 500 }}>
                            {t("referralProgram.unavailable.subtitle")}
                        </Typography>
                    </Box>

                    {onReload && (
                        <Button
                            variant="outlined"
                            onClick={onReload}
                            startIcon={<FiRefreshCw />}
                            sx={{
                                height: 38,
                                borderRadius: "8px",
                                textTransform: "none",
                                fontWeight: 700,
                            }}
                        >
                            {t("common.reload")}
                        </Button>
                    )}
                </Stack>
            </Paper>
        </Box>
    );
}
