import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Stack,
    Typography,
} from "@mui/material";
import { useParams } from "react-router-dom";

import { adminCompaniesApi } from "@/shared/api/adminCompaniesApi";
import type { Company } from "@/entities/company/model/types";

import { AdminUpdateCompanyForm } from "@/features/admin-company/edit-company/ui/AdminUpdateCompanyForm";
import { AdminCompanyStatusForm } from "@/features/admin-company/update-status/ui/AdminCompanyStatusForm";
import { AdminDeleteCompanyDialog } from "@/features/admin-company/delete-company/ui/AdminDeleteCompanyDialog";

import { AdminCompanyDocumentsCard } from "@/widgets/admin-companies/company-documents/ui/AdminCompanyDocumentsCard";

export default function AdminCompanyPage() {
    const { id = "" } = useParams();

    const [company, setCompany] = useState<Company | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleteOpen, setDeleteOpen] = useState(false);

    const load = async () => {
        try {
            setIsLoading(true);
            setError("");
            const data = await adminCompaniesApi.getById(id);
            setCompany(data);
        } catch (e: any) {
            const message =
                e?.response?.data?.message ||
                e?.message ||
                "Failed to load company.";
            setError(Array.isArray(message) ? message[0] : message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            load();
        }
    }, [id]);

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
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
                            Управление компанией, статусом и документами.
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

                <AdminCompanyStatusForm company={company} onUpdated={setCompany} />
                <AdminUpdateCompanyForm company={company} onUpdated={setCompany} />
                <AdminCompanyDocumentsCard companyId={company.id} />

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