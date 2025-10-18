import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import {
    Box,
    Button,
    Container,
    Stack,
    Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { FiHome, FiArrowLeft, FiRefreshCw, FiSearch } from "react-icons/fi";
import animation from "./animation.json";

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                minHeight: "100dvh",
                display: "grid",
                placeItems: "center",
                bgcolor: (t) => (t.palette.mode === "light" ? "#f7f9fc" : "background.default"),
                backgroundImage: (t) =>
                    t.palette.mode === "light"
                        ? "radial-gradient( circle at 20% 10%, rgba(25,118,210,0.06), transparent 40% ), radial-gradient( circle at 80% 90%, rgba(156,39,176,0.06), transparent 45% )"
                        : "none",
            }}
        >
            <Container maxWidth="md" sx={{ py: 6 }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box
                            sx={{
                                p: 3,
                                borderRadius: 4,
                                bgcolor: "background.paper",
                                border: "1px solid",
                                borderColor: "divider",
                                boxShadow: (t) => (t.palette.mode === "light" ? "0 6px 24px rgba(0,0,0,0.06)" : "none"),
                            }}
                        >
                            <Box sx={{ maxWidth: 420, mx: "auto" }}>
                                <Lottie
                                    animationData={animation}
                                    loop
                                    style={{ width: "100%", height: "auto" }}
                                />
                            </Box>
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={1}>
                            <Typography variant="h1" fontWeight={800} lineHeight={1} sx={{ fontSize: { xs: 72, md: 96 } }}>
                                404
                            </Typography>
                            <Typography variant="h5" fontWeight={700}>
                                Oops, this page is missing
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                The page you are looking for might have been removed, had its name changed,
                                or is temporarily unavailable.
                            </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ mt: 3 }}>
                            <Button
                                variant="contained"
                                startIcon={<FiHome />}
                                onClick={() => navigate("/")}
                            >
                                Go home
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<FiArrowLeft />}
                                onClick={() => navigate(-1)}
                            >
                                Go back
                            </Button>
                            <Button
                                variant="text"
                                startIcon={<FiRefreshCw />}
                                onClick={() => window.location.reload()}
                            >
                                Reload
                            </Button>
                            <Button
                                variant="text"
                                startIcon={<FiSearch />}
                                onClick={() => navigate("/dashboard/search")}
                            >
                                Browse shipments
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
