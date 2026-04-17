import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { FiPlusCircle } from "react-icons/fi";
import { useCreateCompany } from "../model/useCreateCompany";

export function CreateCompanyForm() {
    const { values, error, isSubmitting, setField, submit } = useCreateCompany();

    return (
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack spacing={2.5}>
                    <Stack spacing={0.5}>
                        <Typography variant="h5" fontWeight={700}>
                            Create company
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Start with the company name. You can complete the rest of the profile later.
                        </Typography>
                    </Stack>

                    {error ? <Alert severity="error">{error}</Alert> : null}

                    <TextField
                        label="Company name"
                        placeholder="Enter company name"
                        value={values.name}
                        onChange={(e) => setField("name", e.target.value)}
                        fullWidth
                    />

                    <Button
                        onClick={submit}
                        disabled={isSubmitting}
                        variant="contained"
                        sx={{
                            height: 48,
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 700,
                            gap: 1,
                            alignSelf: "flex-start",
                            px: 2.5,
                        }}
                    >
                        <FiPlusCircle size={18} />
                        {isSubmitting ? "Creating..." : "Create company"}
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}