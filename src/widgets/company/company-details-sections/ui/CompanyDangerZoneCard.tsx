import { Button, Card, CardContent, Stack, Typography } from "@mui/material";

type Props = {
    onDeleteClick: () => void;
};

export function CompanyDangerZoneCard({ onDeleteClick }: Props) {
    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 4,
                borderColor: "error.light",
            }}
        >
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack spacing={2}>
                    <Stack spacing={0.5}>
                        <Typography variant="h6" fontWeight={700}>
                            Danger zone
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            If you no longer need this company, you can delete it.
                        </Typography>
                    </Stack>

                    <Button
                        color="error"
                        variant="contained"
                        onClick={onDeleteClick}
                        sx={{
                            height: 44,
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 700,
                            alignSelf: "flex-start",
                        }}
                    >
                        Delete company
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}