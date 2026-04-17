import { Alert, Card, CardContent, Stack, Typography } from "@mui/material";

export function CompanyAccessLockedCard() {
    return (
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack spacing={1.5}>
                    <Typography variant="h6" fontWeight={700}>
                        Team access
                    </Typography>

                    <Alert severity="info">
                        Team members, roles, permissions, invitations, and join requests will become available after company verification.
                    </Alert>
                </Stack>
            </CardContent>
        </Card>
    );
}