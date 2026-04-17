import { Stack } from "@mui/material";
import { useCompanyWorkspaceContext } from "@/pages/dashboard/company/workspace/model/useCompanyWorkspaceContext";
import { CompanyStatusCard } from "@/widgets/company/company-details-sections/ui/CompanyStatusCard";
import { CompanyProgressCard } from "@/widgets/company/company-progress-card/ui/CompanyProgressCard";
import { CompanyNextStepsCard } from "@/widgets/company/company-next-steps-card/ui/CompanyNextStepsCard";

export default function CompanyOverviewPage() {
    const { company } = useCompanyWorkspaceContext();

    return (
        <Stack spacing={3}>
            <CompanyStatusCard company={company} />
            <CompanyProgressCard company={company} />
            <CompanyNextStepsCard company={company} />
        </Stack>
    );
}