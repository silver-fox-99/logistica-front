import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    InputAdornment,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
} from "@mui/material";
import { FiArrowRight, FiGlobe, FiPlus, FiSearch } from "react-icons/fi";
import { useMyCompanies } from "@/pages/dashboard/company/model/useMyCompanies";
import { usePublicCompanies } from "@/pages/dashboard/company/model/usePublicCompanies";

const statusMap: Record<string, { label: string; color: "default" | "success" | "warning" | "error" }> = {
    UNVERIFIED: { label: "Unverified", color: "default" },
    PENDING_REVIEW: { label: "Pending review", color: "warning" },
    VERIFIED: { label: "Verified", color: "success" },
    REJECTED: { label: "Rejected", color: "error" },
    BLOCKED: { label: "Blocked", color: "error" },
};

export default function CompanyPage() {
    const [tab, setTab] = useState<"my" | "public">("my");

    const myCompanies = useMyCompanies();
    const publicCompanies = usePublicCompanies();

    const current = tab === "my" ? myCompanies : publicCompanies;
    const hasItems = useMemo(() => current.items.length > 0, [current.items]);

    return (
        <Stack spacing={3}>
            <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", md: "center" }}
            >
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        Companies
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Quickly open your workspace or explore verified companies.
                    </Typography>
                </Box>

                <Button
                    component={NavLink}
                    to="/dashboard/company/create"
                    variant="contained"
                    startIcon={<FiPlus />}
                >
                    Create company
                </Button>
            </Stack>

            <Card variant="outlined" sx={{ borderRadius: 1 }}>
                <CardContent sx={{ p: '0 !important' }}>
                    <Tabs
                        value={tab}
                        onChange={(_, value) => setTab(value)}
                        variant="fullWidth"
                    >
                        <Tab value="my" label="My companies" />
                        <Tab value="public" label="Explore companies" />
                    </Tabs>
                </CardContent>
            </Card>

            <TextField
                fullWidth
                value={current.query}
                onChange={(e) => current.setQuery(e.target.value)}
                placeholder={
                    tab === "my"
                        ? "Search my companies by name, legal name, tax number, or phone"
                        : "Search verified companies by name or location"
                }
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <FiSearch />
                        </InputAdornment>
                    ),
                }}
            />

            {current.error ? <Alert severity="error">{current.error}</Alert> : null}

            <Typography variant="body2" color="text.secondary">
                Total companies: {current.total}
            </Typography>

            {current.isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            ) : !hasItems ? (
                <Card variant="outlined" sx={{ borderRadius: 4 }}>
                    <CardContent>
                        <Stack spacing={1}>
                            <Typography variant="h6" fontWeight={700}>
                                No companies found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {tab === "my"
                                    ? "Create a new company or refine the search."
                                    : "Try another company name or location."}
                            </Typography>
                        </Stack>
                    </CardContent>
                </Card>
            ) : (
                <Stack spacing={2}>
                    {current.items.map((company: any) => {
                        const status = statusMap[company.status] ?? {
                            label: company.status,
                            color: "default" as const,
                        };

                        return (
                            <Card key={company.id} variant="outlined" sx={{ borderRadius: 4 }}>
                                <CardContent>
                                    <Stack
                                        direction={{ xs: "column", md: "row" }}
                                        spacing={2}
                                        alignItems={{ xs: "flex-start", md: "center" }}
                                        justifyContent="space-between"
                                    >
                                        <Stack spacing={1}>
                                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                                <Typography variant="h6" fontWeight={700}>
                                                    {company.name}
                                                </Typography>
                                                <Chip
                                                    label={status.label}
                                                    color={status.color}
                                                    size="small"
                                                />
                                            </Stack>

                                            <Typography variant="body2" color="text.secondary">
                                                {company.legal_name || "No legal name"}
                                            </Typography>

                                            <Typography variant="body2" color="text.secondary">
                                                {[company.country, company.region, company.city]
                                                    .filter(Boolean)
                                                    .join(", ") || "No location"}
                                            </Typography>

                                            <Typography variant="body2" color="text.secondary">
                                                {company.email || "No email"} · {company.phone || "No phone"}
                                            </Typography>
                                        </Stack>

                                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                                            {tab === "public" ? (
                                                <Button
                                                    component={NavLink}
                                                    to={`/dashboard/companies/${company.id}`}
                                                    variant="outlined"
                                                    startIcon={<FiGlobe />}
                                                >
                                                    Public page
                                                </Button>
                                            ) : null}

                                            <Button
                                                component={NavLink}
                                                to={`/dashboard/company/${company.id}/overview`}
                                                variant="outlined"
                                                endIcon={<FiArrowRight />}
                                            >
                                                Open workspace
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        );
                    })}
                </Stack>
            )}
        </Stack>
    );
}