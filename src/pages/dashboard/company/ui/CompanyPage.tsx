import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Stack,
    Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { FiBriefcase, FiHome, FiPlus } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import type { StackProps } from "@mui/material";
import animation from "./BusinessTeam.json";

type CompanyPageButtonsProps = {
    direction?: StackProps["direction"];
    gap?: number;
    marginTop?: number;
};

function CompanyPageButtons({ direction = "row", gap = 12, marginTop = 3 }: CompanyPageButtonsProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: direction,
                gap: `${gap}px`,
                mt: marginTop,
                width: "100%",
                "& > *": {
                    marginTop: "0 !important",
                    marginLeft: "0 !important",
                    marginRight: "0 !important",
                    marginBottom: "0 !important",
                },
                "& .MuiButton-root": {
                    width: { xs: "100%", md: "auto" },
                    marginTop: "0 !important",
                    marginLeft: "0 !important",
                    marginRight: "0 !important",
                    marginBottom: "0 !important",
                }
            }}
        >
            <Button variant="contained" startIcon={<FiPlus />} onClick={() => navigate("/dashboard/company/create")}>
                {t('company.createButton')}
            </Button>
            <Button variant="outlined" startIcon={<FiHome />} onClick={() => navigate("/dashboard")}>
                {t('company.backButton')}
            </Button>
        </Box>
    );
}

export default function CompanyPage() {
    const { t } = useTranslation();

    return (
        <Box
            sx={{
                minHeight: "calc(100dvh - 120px)",
                display: "grid",
                alignItems: "start",
                py: 3,
            }}
        >
            <Container maxWidth="md">
                <Grid container spacing={3} alignItems="center">
                    {/* Анимация */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card
                            variant="outlined"
                            sx={{
                                borderRadius: 4,
                                borderColor: "divider",
                                bgcolor: "background.paper",
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ maxWidth: 520, mx: "auto" }}>
                                    <Lottie animationData={animation} loop style={{ width: "100%", height: "auto" }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Текст и действия */}
                    <Grid size={{ xs: 12, md: 6 }} sx={{ marginLeft: { xs: 0, md: "auto" } }}>
                        <Stack spacing={1}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <FiBriefcase />
                                <Typography variant="h5" fontWeight={700}>{t('company.title')}</Typography>
                            </Stack>

                            <Typography variant="body1" color="text.secondary">
                                {t('company.description')}
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                                {t('company.meanwhile')}
                            </Typography>
                        </Stack>

                        <CompanyPageButtons direction={{ xs: "column", md: "row" }} gap={12} />
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
