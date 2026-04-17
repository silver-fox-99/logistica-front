import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import type { Company } from "@/entities/company/model/types";
import { CompanyCard } from "@/entities/company/ui/CompanyCard";

type Props = {
    items: Company[];
    isLoading?: boolean;
    error?: string;
};

export function CompanyList({ items, isLoading, error }: Props) {
    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    if (!items.length) {
        return (
            <Box
                sx={{
                    border: "1px dashed",
                    borderColor: "divider",
                    borderRadius: 3,
                    p: 3,
                    textAlign: "center",
                }}
            >
                <Typography variant="h6" fontWeight={700}>
                    No companies yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Create your first company to start working as a business account.
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: {
                    xs: "1fr",
                    md: "repeat(2, minmax(0, 1fr))",
                },
                gap: 2,
            }}
        >
            {items.map((company) => (
                <CompanyCard key={company.id} company={company} />
            ))}
        </Box>
    );
}