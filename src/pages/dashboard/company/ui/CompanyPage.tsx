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
    desktopAlignItems?: "flex-start" | "center" | "flex-end";
};

function CompanyPageButtons({ 
    direction = "row", 
    gap = 12, 
    marginTop = 3,
    desktopAlignItems = "flex-start"
}: CompanyPageButtonsProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <>
            {/* Десктоп: Stack с улучшенными стилями */}
            <Stack 
                direction="row" 
                flexWrap="wrap" 
                alignItems={desktopAlignItems}
                sx={{ 
                    mt: marginTop,
                    display: { xs: "none", md: "flex" },
                    gap: "12px",
                    "& > *": {
                        marginLeft: "0 !important"
                    }
                }}
            >
                <Button 
                    variant="contained" 
                    startIcon={<FiPlus />} 
                    onClick={() => navigate("/dashboard/company/create")}
                    sx={{ 
                        textTransform: "none",
                        borderRadius: 2,
                        px: 3,
                        py: 1
                    }}
                >
                    {t('company.createButton')}
                </Button>
                <Button 
                    variant="outlined" 
                    startIcon={<FiHome />} 
                    onClick={() => navigate("/dashboard")}
                    sx={{ 
                        textTransform: "none",
                        borderRadius: 2,
                        px: 3,
                        py: 1
                    }}
                >
                    {t('company.backButton')}
                </Button>
            </Stack>

            {/* Мобилка: Box с gap */}
            <Box
                sx={{
                    display: { xs: "flex", md: "none" },
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
                        width: "100%",
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
        </>
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
                    <Grid size={{ xs: 12, md: 6 }} sx={{ marginLeft: { xs: 0 } }}>
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

                        <CompanyPageButtons 
                            direction={{ xs: "column", md: "row" }} 
                            gap={12}
                            desktopAlignItems="flex-start"
                        />
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
