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
import { FiBriefcase, FiHome, FiPlusCircle } from "react-icons/fi";
import animation from "./BusinessTeam.json";

function InfoBox({ title, items }: { title: string; items: string[] }) {
    return (
        <Box
            sx={{
                p: 1.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.default",
            }}
        >
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                {title}
            </Typography>

            <Stack spacing={0.5}>
                {items.map((it, idx) => (
                    <Typography key={idx} variant="body2" color="text.secondary">
                        • {it}
                    </Typography>
                ))}
            </Stack>
        </Box>
    );
}

export function CompanyEmptyState() {
    const navigate = useNavigate();

    return (
        <Box sx={{ minHeight: "calc(100dvh - 120px)", display: "grid", alignItems: "start", py: 3 }}>
            <Container maxWidth="md">
                <Stack spacing={3}>
                    <Card variant="outlined" sx={{ borderRadius: 4, borderColor: "divider" }}>
                        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                            <Stack spacing={3} direction={{ xs: "column", md: "row" }} alignItems="center">
                                <Box sx={{ width: { xs: "100%", md: "45%" }, maxWidth: 520, mx: "auto" }}>
                                    <Lottie animationData={animation} loop style={{ width: "100%", height: "auto" }} />
                                </Box>

                                <Stack spacing={1.5} sx={{ flex: 1, width: "100%" }}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <FiBriefcase />
                                        <Typography variant="h5" fontWeight={700}>
                                            Company workspace
                                        </Typography>
                                    </Stack>

                                    <Typography variant="body1" color="text.secondary">
                                        Create your company workspace to manage business activity, documents, members, and shipping operations.
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        Start with a company name. You can fill in the rest of the profile after creation.
                                    </Typography>

                                    <Stack direction="column" spacing={1.25} sx={{ mt: 1, width: "100%" }}>
                                        <Button
                                            onClick={() => navigate("/dashboard/company/create")}
                                            sx={{
                                                height: 48,
                                                borderRadius: 2,
                                                textTransform: "none",
                                                fontWeight: 700,
                                                px: 2.75,
                                                gap: 1,
                                                display: "inline-flex",
                                                alignItems: "center",
                                                justifyContent: "flex-start",
                                                color: "#fff",
                                                bgcolor: "primary.main",
                                                boxShadow: "none",
                                                "&:hover": { bgcolor: "primary.dark", boxShadow: "none" },
                                                width: "100%",
                                            }}
                                        >
                                            <FiPlusCircle size={18} />
                                            Create company
                                        </Button>

                                        <Button
                                            onClick={() => navigate("/dashboard")}
                                            sx={{
                                                height: 48,
                                                borderRadius: 2,
                                                textTransform: "none",
                                                fontWeight: 700,
                                                px: 2.75,
                                                gap: 1,
                                                display: "inline-flex",
                                                alignItems: "center",
                                                justifyContent: "flex-start",
                                                color: "text.primary",
                                                bgcolor: "background.default",
                                                border: "1px solid",
                                                borderColor: "divider",
                                                boxShadow: "none",
                                                "&:hover": { bgcolor: "action.hover", borderColor: "primary.main" },
                                                width: "100%",
                                            }}
                                        >
                                            <FiHome size={18} />
                                            Back to dashboard
                                        </Button>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Card variant="outlined" sx={{ borderRadius: 4, borderColor: "divider" }}>
                        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                            <Stack spacing={1.5}>
                                <InfoBox
                                    title="Coming next"
                                    items={[
                                        "Upload company documents for verification",
                                        "Invite team members into the workspace",
                                        "Manage company shipping activity",
                                    ]}
                                />
                                <InfoBox
                                    title="What you can do now"
                                    items={[
                                        "Create your company profile",
                                        "Prepare data for verification",
                                        "Open the company workspace",
                                    ]}
                                />
                            </Stack>
                        </CardContent>
                    </Card>
                </Stack>
            </Container>
        </Box>
    );
}