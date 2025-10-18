import { AddEmailCard } from "@/features/security/add-emal/ui/AddEmailCard";
import { Container, Stack } from "@mui/material";
import {ChangePasswordCard} from "@/features/security/add-emal/ui/ChangePassword.tsx";


export default function SecurityPage() {
    return (
        <Container maxWidth="md" sx={{ py: 3 }}>
            <Stack spacing={3}>
                <AddEmailCard />
                <ChangePasswordCard />
            </Stack>
        </Container>
    );
}
