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
import { FiHome, FiArrowLeft, FiRefreshCw, FiSearch } from "react-icons/fi";
import animation from "./animation.json";
import { useTranslation } from "react-i18next";

export default function NotFoundPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <Box
            sx={{
                minHeight: "100dvh",
                display: "grid",
                alignItems: "center",
                bgcolor: (t) => (t.palette.mode === "light" ? "#f7f9fc" : "background.default"),
                backgroundImage: (t) =>
                    t.palette.mode === "light"
                        ? "radial-gradient( circle at 20% 10%, rgba(25,118,210,0.06), transparent 40% ), radial-gradient( circle at 80% 90%, rgba(156,39,176,0.06), transparent 45% )"
                        : "none",
            }}
        >
            <Container maxWidth="md" sx={{ py: 6 }}>
                <Card
                    variant="outlined"
                    sx={{
                        borderRadius: 4,
                        borderColor: "divider",
                        bgcolor: "background.paper",
                        boxShadow: (t) => (t.palette.mode === "light" ? "0 10px 32px rgba(0,0,0,0.06)" : "none"),
                    }}
                >
                    <CardContent sx={{ p: { xs: 2.75, md: 3.5 } }}>
                        <Stack spacing={3} direction={{ xs: "column", md: "row" }} alignItems="center">
                            <Box sx={{ width: { xs: "100%", md: "45%" }, maxWidth: 460, mx: "auto" }}>
                                <Lottie
                                    animationData={animation}
                                    loop
                                    style={{ width: "100%", height: "auto" }}
                                />
                            </Box>
                            <Stack spacing={1.5} sx={{ flex: 1, width: "100%" }}>
                                <Typography variant="h2" fontWeight={800} sx={{ fontSize: { xs: 52, md: 64 }, lineHeight: 1 }}>
                                    {t("notFound.code")}
                                </Typography>
                                <Typography variant="h5" fontWeight={700}>
                                    {t("notFound.title")}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    {t("notFound.description")}
                                </Typography>

                                <Stack direction="column" spacing={1.1} sx={{ mt: 1, width: "100%" }}>
                                    <Button
                                        variant="contained"
                                        startIcon={<FiHome />}
                                        onClick={() => navigate("/")}
                                        sx={{
                                            height: 48,
                                            borderRadius: 2,
                                            textTransform: "none",
                                            fontWeight: 700,
                                            justifyContent: "flex-start",
                                            boxShadow: "none",
                                            "&:hover": { boxShadow: "none" },
                                        }}
                                    >
                                        {t("notFound.home")}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<FiArrowLeft />}
                                        onClick={() => navigate(-1)}
                                        sx={{
                                            height: 48,
                                            borderRadius: 2,
                                            textTransform: "none",
                                            fontWeight: 700,
                                            justifyContent: "flex-start",
                                            borderColor: "divider",
                                        }}
                                    >
                                        {t("notFound.back")}
                                    </Button>
                                    <Button
                                        variant="text"
                                        startIcon={<FiRefreshCw />}
                                        onClick={() => window.location.reload()}
                                        sx={{ justifyContent: "flex-start", textTransform: "none", fontWeight: 600 }}
                                    >
                                        {t("notFound.reload")}
                                    </Button>
                                    <Button
                                        variant="text"
                                        startIcon={<FiSearch />}
                                        onClick={() => navigate("/dashboard/search")}
                                        sx={{ justifyContent: "flex-start", textTransform: "none", fontWeight: 600 }}
                                    >
                                        {t("notFound.search")}
                                    </Button>
                                </Stack>
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
}
