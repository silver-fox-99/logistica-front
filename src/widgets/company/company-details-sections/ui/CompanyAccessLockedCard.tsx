import { Alert, Paper, Stack, Typography } from "@mui/material";

export function CompanyAccessLockedCard() {
    return (
        <Paper variant="outlined" sx={{ borderRadius: "16px", borderColor: "divider", p: { xs: 2.5, md: 3 } }}>
            <Stack spacing={1.5}>
                <Typography variant="h6" fontWeight={700}>
                    Team access
                </Typography>

                <Alert severity="info" sx={{ borderRadius: "8px" }}>
                    Team members, roles, permissions, invitations, and join requests will become available after company verification.
                </Alert>
            </Stack>
        </Paper>
    );
}