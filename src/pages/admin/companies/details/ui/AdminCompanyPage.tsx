import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Stack,
    Tab,
    Tabs,
    Typography,
} from "@mui/material";
import { useParams } from "react-router-dom";

import { adminCompaniesApi } from "@/shared/api/adminCompaniesApi";
import type { Company } from "@/entities/company/model/types";

import { AdminUpdateCompanyForm } from "@/features/admin-company/edit-company/ui/AdminUpdateCompanyForm";
import { AdminCompanyStatusForm } from "@/features/admin-company/update-status/ui/AdminCompanyStatusForm";
import { AdminDeleteCompanyDialog } from "@/features/admin-company/delete-company/ui/AdminDeleteCompanyDialog";

import { AdminCompanyDocumentsCard } from "@/widgets/admin-companies/company-documents/ui/AdminCompanyDocumentsCard";
import { AdminCompanyMembersCard } from "@/widgets/admin-companies/company-members/ui/AdminCompanyMembersCard";
import { AdminCompanyInvitationsCard } from "@/widgets/admin-companies/company-invitations/ui/AdminCompanyInvitationsCard";
import { AdminCompanyJoinRequestsCard } from "@/widgets/admin-companies/company-join-requests/ui/AdminCompanyJoinRequestsCard";

type TabValue = "overview" | "members" | "invitations" | "joinRequests" | "documents";

export default function AdminCompanyPage() {
    const { id = "" } = useParams();

    const [company, setCompany] = useState<Company | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [tab, setTab] = useState<TabValue>("overview");

    const loadCompany = async () => {
        try {
            setIsLoading(true);
            setError("");
            const data = await adminCompaniesApi.getById(id);
            setCompany(data);
        } catch (e: any) {
            const message =
                e?.response?.data?.message ||
                e?.message ||
                "Не удалось загрузить компанию.";
            setError(Array.isArray(message) ? message[0] : message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!id) return;
        loadCompany();
    }, [id]);

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg">
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!company) return null;

    return (
        <Container maxWidth="lg">
            <Stack spacing={3}>
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "center" }}
                    spacing={2}
                >
                    <Stack spacing={0.5}>
                        <Typography variant="h4" fontWeight={800}>
                            {company.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Управление компанией, участниками, заявками, приглашениями и документами.
                        </Typography>
                    </Stack>

                    <Button
                        color="error"
                        variant="contained"
                        onClick={() => setDeleteOpen(true)}
                        sx={{ textTransform: "none", fontWeight: 700 }}
                    >
                        Удалить компанию
                    </Button>
                </Stack>

                <Tabs
                    value={tab}
                    onChange={(_, value: TabValue) => setTab(value)}
                    variant="scrollable"
                    allowScrollButtonsMobile
                >
                    <Tab value="overview" label="Обзор" />
                    <Tab value="members" label="Участники" />
                    <Tab value="invitations" label="Приглашения" />
                    <Tab value="joinRequests" label="Заявки" />
                    <Tab value="documents" label="Документы" />
                </Tabs>

                {tab === "overview" ? (
                    <Stack spacing={2}>
                        <AdminCompanyStatusForm company={company} onUpdated={setCompany} />
                        <AdminUpdateCompanyForm company={company} onUpdated={setCompany} />
                    </Stack>
                ) : null}

                {tab === "members" ? (
                    <AdminCompanyMembersCard
                        company={company}
                        onCompanyUpdated={setCompany}
                    />
                ) : null}

                {tab === "invitations" ? (
                    <AdminCompanyInvitationsCard companyId={company.id} />
                ) : null}

                {tab === "joinRequests" ? (
                    <AdminCompanyJoinRequestsCard companyId={company.id} />
                ) : null}

                {tab === "documents" ? (
                    <AdminCompanyDocumentsCard companyId={company.id} />
                ) : null}

                <AdminDeleteCompanyDialog
                    open={deleteOpen}
                    onClose={() => setDeleteOpen(false)}
                    companyId={company.id}
                    companyName={company.name}
                />
            </Stack>
        </Container>
    );
}