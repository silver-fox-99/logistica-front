import { Box, Container } from "@mui/material";
import { CreateCompanyForm } from "@/features/company/create-company/ui/CreateCompanyForm";

export default function CompanyCreatePage() {
    return (
        <Box sx={{ py: 3 }}>
            <Container maxWidth="sm">
                <CreateCompanyForm />
            </Container>
        </Box>
    );
}