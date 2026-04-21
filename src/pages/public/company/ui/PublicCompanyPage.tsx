import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Alert,
    Box,
    CircularProgress,
    Container,
    Stack,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { usePublicCompany } from "@/pages/public/company/model/usePublicCompany";
import { PublicCompanyHeader } from "@/widgets/company/public-company-profile/ui/PublicCompanyHeader";
import { PublicCompanyOverviewSection } from "@/widgets/company/public-company-profile/ui/PublicCompanyOverviewSection";
import { PublicCompanyContactsSidebar } from "@/widgets/company/public-company-profile/ui/PublicCompanyContactsSidebar";
import { PublicCompanyMembersSection } from "@/widgets/company/public-company-profile/ui/PublicCompanyMembersSection";
import { CreateCompanyJoinRequestDialog } from "@/features/company/join-request/ui/CreateCompanyJoinRequestDialog";
import { companiesApi } from "@/shared/api/companiesApi";

export default function PublicCompanyPage() {
    const { id = "" } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
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
        setIsSubmitting(true);
        setSubmitError("");
        setSuccess("");

        try {
            await companiesApi.createJoinRequest(id, payload);
            setSuccess(t("publicCompany.page.joinRequestSuccess"));
        } catch (e: any) {
            const message =
                e?.response?.data?.message ||
                e?.message ||
                t("publicCompany.page.joinRequestError");

            setSubmitError(Array.isArray(message) ? message[0] : message);
        } finally {
            setIsSubmitting(false);
            setDialogOpen(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100dvh",
                bgcolor: "#f7f8fa",
                py: { xs: 2.5, md: 4 },
            }}
        >
            <Container maxWidth="lg">
                {isLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                        <CircularProgress />
                    </Box>
                ) : error || !company ? (
                    <Alert severity="error">
                        {error || t("publicCompany.page.notFound")}
                    </Alert>
                ) : (
                    <Stack spacing={{ xs: 2, md: 3 }}>
                        {submitError ? <Alert severity="error">{submitError}</Alert> : null}
                        {success ? <Alert severity="success">{success}</Alert> : null}

                        <PublicCompanyHeader
                            company={company}
                            isAuthenticated={isAuthenticated}
                            isSubmitting={isSubmitting}
                            onJoinClick={handleJoinClick}
                        />

                        {!isAuthenticated ? (
                            <Alert severity="info">
                                {t("publicCompany.page.joinInfoAuthRequired")}
                            </Alert>
                        ) : null}

                        <Stack
                            direction={{ xs: "column", lg: "row" }}
                            spacing={{ xs: 2, md: 3 }}
                            alignItems="flex-start"
                        >
                            <Stack
                                spacing={{ xs: 2, md: 3 }}
                                sx={{
                                    flex: 1,
                                    minWidth: 0,
                                }}
                            >
                                <PublicCompanyOverviewSection company={company} />
                                <PublicCompanyMembersSection members={company.members || []} />
                            </Stack>

                            <Box
                                sx={{
                                    width: { xs: "100%", lg: 320 },
                                    flexShrink: 0,
                                }}
                            >
                                <PublicCompanyContactsSidebar
                                    company={company}
                                    isAuthenticated={isAuthenticated}
                                    isSubmitting={isSubmitting}
                                    onJoinClick={handleJoinClick}
                                    onBack={() => navigate(-1)}
                                />
                            </Box>
                        </Stack>

                        <CreateCompanyJoinRequestDialog
                            open={dialogOpen}
                            isSubmitting={isSubmitting}
                            submitError={submitError}
                            onClose={() => setDialogOpen(false)}
                            onSubmit={handleSubmitJoinRequest}
                        />
                    </Stack>
                )}
            </Container>
        </Box>
    );
}