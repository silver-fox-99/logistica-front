import { Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCompanyWorkspaceContext } from "@/pages/dashboard/company/workspace/model/useCompanyWorkspaceContext";
import { CompanyDangerZoneCard } from "@/widgets/company/company-details-sections/ui/CompanyDangerZoneCard";
import { DeleteCompanyDialog } from "@/features/company/delete-company/ui/DeleteCompanyDialog";

export default function CompanySettingsPage() {
  const { t } = useTranslation();
  const { company } = useCompanyWorkspaceContext();
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h5" fontWeight={600}>
          {t("companySettings.title")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("companySettings.description")}
        </Typography>
      </Stack>

      <CompanyDangerZoneCard onDeleteClick={() => setDeleteOpen(true)} />

      <DeleteCompanyDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        companyId={company.id}
        companyName={company.name}
      />
    </Stack>
  );
}
