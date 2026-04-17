import { Stack } from "@mui/material";
import { useCompanyWorkspaceContext } from "@/pages/dashboard/company/workspace/model/useCompanyWorkspaceContext";
import { UpdateCompanyForm } from "@/features/company/update-company/ui/UpdateCompanyForm";

export default function CompanyInfoPage() {
    const { company, reload } = useCompanyWorkspaceContext();

    return (
        <Stack spacing={3}>
            <UpdateCompanyForm
                company={company}
                onUpdated={async () => {
                    await reload();
                }}
            />
        </Stack>
    );
}