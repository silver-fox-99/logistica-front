import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Alert,
    Box,
    CircularProgress,
    Paper,
    Stack,
    Typography,
    Button,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { FiBriefcase, FiChevronLeft } from "react-icons/fi";
import { usePublicCompany } from "@/pages/public/company/model/usePublicCompany";
import { PublicCompanyHeader } from "@/widgets/company/public-company-profile/ui/PublicCompanyHeader";
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
        <Stack spacing={3}>
            {/* Page Header (Matching ShipmentsPage and standard redesign pattern) */}
            <Paper
                variant="outlined"
                sx={{
                    p: { xs: 2, md: 2.5 },
                    borderRadius: "16px",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "#EEF4F7",
                            color: "primary.main",
                            flexShrink: 0,
                        }}
                    >
                        <FiBriefcase size={20} />
                    </Box>
                    <Stack spacing={0.25}>
                        <Typography variant="h6" fontWeight={800}>
                            {t("companyPage.title", "Компании")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t("companyPage.subtitle", "Управляйте своими компаниями или просматривайте публичные профили компаний")}
                        </Typography>
                    </Stack>
                </Stack>
            </Paper>

            {/* Back button */}
            <Button
                onClick={() => navigate(-1)}
                startIcon={<FiChevronLeft />}
                sx={{
                    alignSelf: "flex-start",
                    textTransform: "none",
                    color: "primary.main",
                    fontWeight: 700,
                    p: 0,
                    minWidth: 0,
                    "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
                }}
            >
                {t("publicCompany.contacts.goBack", "Назад")}
            </Button>

            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                    <CircularProgress />
                </Box>
            ) : error || !company ? (
                <Alert severity="error">
                    {error || t("publicCompany.page.notFound")}
                </Alert>
            ) : (
                <Stack spacing={3}>
                    {submitError ? <Alert severity="error">{submitError}</Alert> : null}
                    {success ? <Alert severity="success">{success}</Alert> : null}

                    {/* Main Company Card */}
                    <PublicCompanyHeader
                        company={company}
                        isAuthenticated={isAuthenticated}
                        isSubmitting={isSubmitting}
                        onJoinClick={handleJoinClick}
                    />

                    {!isAuthenticated && (
                        <Alert severity="info" sx={{ borderRadius: "8px" }}>
                            {t("publicCompany.page.joinInfoAuthRequired")}
                        </Alert>
                    )}

                    {/* Team Members List */}
                    <PublicCompanyMembersSection members={company.members || []} />

                    <CreateCompanyJoinRequestDialog
                        open={dialogOpen}
                        isSubmitting={isSubmitting}
                        submitError={submitError}
                        onClose={() => setDialogOpen(false)}
                        onSubmit={handleSubmitJoinRequest}
                    />
                </Stack>
            )}
        </Stack>
    );
}