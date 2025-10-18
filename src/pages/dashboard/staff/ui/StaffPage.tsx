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
import { FiUsers, FiHome, FiUserPlus } from "react-icons/fi";
import animation from "./SearchForUsers.json";

export default function StaffPage() {
    const navigate = useNavigate();

    return (
        <Box sx={{ minHeight: "calc(100dvh - 120px)", display: "grid", alignItems: "start", py: 3 }}>
            <Container maxWidth="md">
                <Grid container spacing={3} alignItems="center">
                    {/* Animation */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card variant="outlined" sx={{ borderRadius: 4, borderColor: "divider", bgcolor: "background.paper" }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ maxWidth: 520, mx: "auto" }}>
                                    <Lottie animationData={animation} loop style={{ width: "100%", height: "auto" }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Text + CTA */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={1}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <FiUsers />
                                <Typography variant="h5" fontWeight={700}>Staff</Typography>
                            </Stack>

                            <Typography variant="body1" color="text.secondary">
                                Team management is under development. Soon you will be able to invite teammates,
                                assign roles and permissions, and manage access across your company.
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                                You can go back to the dashboard or prepare to invite your first teammate.
                            </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ mt: 3 }}>
                            <Button variant="contained" startIcon={<FiUserPlus />} onClick={() => navigate("/dashboard/staff/invite")}>
                                Invite teammate
                            </Button>
                            <Button variant="outlined" startIcon={<FiHome />} onClick={() => navigate("/dashboard")}>
                                Back to dashboard
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
