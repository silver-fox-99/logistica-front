import { useEffect, useState } from "react";
import {
    Alert,
    Button,
    Container,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { adminCompaniesApi } from "@/shared/api/adminCompaniesApi";
import type { Company, CompanyStatus } from "@/entities/company/model/types";
import { AdminCompaniesTable } from "@/widgets/admin-companies/company-table/ui/AdminCompaniesTable";

export default function AdminCompaniesPage() {
    const navigate = useNavigate();

    const [items, setItems] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const [q, setQ] = useState("");
    const [status, setStatus] = useState<CompanyStatus | "">("");

    const load = async () => {
        try {
            setIsLoading(true);
            setError("");

            const data = await adminCompaniesApi.list({
                q: q || undefined,
                status: status || undefined,
                limit: 20,
                offset: 0,
            });

            setItems(data.items);
        } catch (e: any) {
            const message =
                e?.response?.data?.message ||
                e?.message ||
                "Failed to load companies.";
            setError(Array.isArray(message) ? message[0] : message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <Container maxWidth="xl">
            <Stack spacing={3}>
                <Stack spacing={0.5}>
                    <Typography variant="h4" fontWeight={800}>
                        Компании
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Управление компаниями, статусами верификации и документами.
                    </Typography>
                </Stack>

                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <TextField
                        label="Поиск"
                        placeholder="Название, email, phone, tax number..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        fullWidth
                    />

                    <TextField
                        select
                        label="Статус"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as CompanyStatus | "")}
                        sx={{ minWidth: 220 }}
                    >
                        <MenuItem value="">Все</MenuItem>
                        <MenuItem value="UNVERIFIED">UNVERIFIED</MenuItem>
                        <MenuItem value="PENDING_REVIEW">PENDING_REVIEW</MenuItem>
                        <MenuItem value="VERIFIED">VERIFIED</MenuItem>
                        <MenuItem value="REJECTED">REJECTED</MenuItem>
                        <MenuItem value="BLOCKED">BLOCKED</MenuItem>
                    </TextField>

                    <Button
                        variant="contained"
                        onClick={load}
                        sx={{
                            minWidth: 150,
                            textTransform: "none",
                            fontWeight: 700,
                            gap: 1,
                        }}
                    >
                        <FiSearch />
                        Найти
                    </Button>
                </Stack>

                {error ? <Alert severity="error">{error}</Alert> : null}

                <AdminCompaniesTable
                    items={items}
                    isLoading={isLoading}
                    onOpen={(id) => navigate(`/admin/companies/${id}`)}
                />
            </Stack>
        </Container>
    );
}