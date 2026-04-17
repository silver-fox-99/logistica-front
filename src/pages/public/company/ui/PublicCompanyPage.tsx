import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Stack,
    Typography,
} from "@mui/material";
import { usePublicCompany } from "@/pages/public/company/model/usePublicCompany";
import { PublicCompanyHeroCard } from "@/widgets/company/public-company-profile/ui/PublicCompanyHeroCard";
import { PublicCompanyDetailsCard } from "@/widgets/company/public-company-profile/ui/PublicCompanyDetailsCard";
import { CreateCompanyJoinRequestDialog } from "@/features/company/join-request/ui/CreateCompanyJoinRequestDialog";
import { companiesApi } from "@/shared/api/companiesApi";

export default function PublicCompanyPage() {
    const { id = "" } = useParams();
    const navigate = useNavigate();
    const { company, isLoading, error } = usePublicCompany(id);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [success, setSuccess] = useState("");

    const isAuthenticated = useMemo(() => {
        return Boolean(localStorage.getItem("accessToken"));
    }, []);

    const handleJoinClick = () => {
        setSubmitError("");
        setSuccess("");

        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        setDialogOpen(true);
    };

    const handleSubmitJoinRequest = async (payload: {
        requested_role?: "VIEWER" | "LOGIST" | "MANAGER" | "ADMIN" | "OWNER";
        message?: string;
    }) => {
        try {
            setIsSubmitting(true);
            setSubmitError("");
            setSuccess("");

            await companiesApi.createJoinRequest(id, payload);

            setSuccess("Your join request has been sent successfully.");
            setDialogOpen(false);
        } catch (e: any) {
            const message =
                e?.response?.data?.message ||
                e?.message ||
                "Failed to send join request.";

            setSubmitError(Array.isArray(message) ? message[0] : message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box sx={{ bgcolor: "#F5F5F5", minHeight: "100dvh", py: { xs: 3, md: 5 } }}>
            <Container maxWidth="lg">
                <Stack spacing={3}>
                    {isLoading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                            <CircularProgress />
                        </Box>
                    ) : error || !company ? (
                        <Alert severity="error">
                            {error || "Company profile not found."}
                        </Alert>
                    ) : (
                        <>
                            <Stack spacing={1}>
                                <Typography variant="overline" color="text.secondary">
                                    Public company page
                                </Typography>
                                <Typography variant="h3" fontWeight={800}>
                                    Company profile
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    View the company information and submit a join request.
                                </Typography>
                            </Stack>

                            {submitError ? <Alert severity="error">{submitError}</Alert> : null}
                            {success ? <Alert severity="success">{success}</Alert> : null}

                            <PublicCompanyHeroCard
                                company={company}
                                isAuthenticated={isAuthenticated}
                                isSubmitting={isSubmitting}
                                onJoinClick={handleJoinClick}
                            />

                            <PublicCompanyDetailsCard company={company} />

                            <CreateCompanyJoinRequestDialog
                                open={dialogOpen}
                                isSubmitting={isSubmitting}
                                onClose={() => setDialogOpen(false)}
                                onSubmit={handleSubmitJoinRequest}
                            />

                            {!isAuthenticated ? (
                                <Alert severity="info">
                                    You need to be logged in to submit a join request.
                                </Alert>
                            ) : null}

                            <Stack direction="row" spacing={2}>
                                <Button variant="outlined" onClick={() => navigate(-1)}>
                                    Go back
                                </Button>
                            </Stack>
                        </>
                    )}
                </Stack>
            </Container>
        </Box>
    );
}