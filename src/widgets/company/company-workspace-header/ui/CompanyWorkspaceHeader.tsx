import { Button, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Company } from "@/entities/company/model/types";

type Props = {
    company: Company;
};

export function CompanyWorkspaceHeader({ company }: Props) {
    const { t } = useTranslation();

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
                    {t("companyWorkspace.header.description")}
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
                {t("companyWorkspace.header.uploadDocuments")}
            </Button>
        </Stack>
    );
}