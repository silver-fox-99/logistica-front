import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { FiPlusCircle } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useCreateCompany } from "../model/useCreateCompany";

export function CreateCompanyForm() {
    const { t } = useTranslation();
    const { values, error, isSubmitting, setField, submit } = useCreateCompany();

    return (
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack spacing={2.5}>
                    <Stack spacing={0.5}>
                        <Typography variant="h5" fontWeight={700}>
                            {t("createCompanyForm.title")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t("createCompanyForm.subtitle")}
                        </Typography>
                    </Stack>

                    {error ? <Alert severity="error">{error}</Alert> : null}

                    <TextField
                        label={t("createCompanyForm.fields.name")}
                        placeholder={t("createCompanyForm.fields.namePlaceholder")}
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
                        {isSubmitting
                            ? t("createCompanyForm.actions.creating")
                            : t("createCompanyForm.actions.create")}
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}