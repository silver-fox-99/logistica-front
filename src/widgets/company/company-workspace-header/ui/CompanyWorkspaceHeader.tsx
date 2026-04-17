import { Button, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import type { Company } from "@/entities/company/model/types";

type Props = {
    company: Company;
};

export function CompanyWorkspaceHeader({ company }: Props) {
    return (
        <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
        >
            <Stack spacing={0.5}>
                <Typography variant="h4" fontWeight={700}>
                    {company.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Manage company profile, documents, verification, and team access.
                </Typography>
            </Stack>

            <Button
                component={RouterLink}
                to="documents"
                variant="contained"
                sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                }}
            >
                Upload documents
            </Button>
        </Stack>
    );
}