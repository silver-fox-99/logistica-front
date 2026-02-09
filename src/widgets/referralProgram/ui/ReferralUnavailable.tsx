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
            <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
                <Stack spacing={2} alignItems="center" textAlign="center">
                    <Box sx={{ width: 260, maxWidth: "100%" }}>
                        <Lottie animationData={animationData} loop autoplay />
                    </Box>

                    <Box>
                        <Typography variant="h5" fontWeight={800}>
                            {t("referralProgram.unavailable.title")}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.75, mt: 0.5 }}>
                            {t("referralProgram.unavailable.subtitle")}
                        </Typography>
                    </Box>

                    {onReload && (
                        <Button
                            variant="outlined"
                            onClick={onReload}
                            startIcon={<FiRefreshCw />}
                        >
                            {t("common.reload")}
                        </Button>
                    )}
                </Stack>
            </Paper>
        </Box>
    );
}
