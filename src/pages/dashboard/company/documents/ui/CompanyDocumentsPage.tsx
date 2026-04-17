import { Stack } from "@mui/material";
import { useCompanyWorkspaceContext } from "@/pages/dashboard/company/workspace/model/useCompanyWorkspaceContext";
import { UploadCompanyDocumentForm } from "@/features/company/company-documents/ui/UploadCompanyDocumentForm";

export default function CompanyDocumentsPage() {
    const { company } = useCompanyWorkspaceContext();

    return (
        <Stack spacing={3}>
            <UploadCompanyDocumentForm companyId={company.id} />
        </Stack>
    );
}