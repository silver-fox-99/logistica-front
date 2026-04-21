import {
    Alert,
    Button,
    Card,
    CardContent,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { FiSave } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import type { Company } from "@/entities/company/model/types";
import { useUpdateCompany } from "../model/useUpdateCompany";

type Props = {
    company: Company | null;
    onUpdated?: (company: Company) => void;
};

export function UpdateCompanyForm({ company, onUpdated }: Props) {
    const { t } = useTranslation();
    const { values, isSubmitting, error, success, setField, submit } = useUpdateCompany(company, onUpdated);

    return (
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack spacing={2.5}>
                    <Stack spacing={0.5}>
                        <Typography variant="h5" fontWeight={700}>
                            {t("companyInfoForm.title")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t("companyInfoForm.description")}
                        </Typography>
                    </Stack>

                    {error ? <Alert severity="error">{error}</Alert> : null}
                    {success ? <Alert severity="success">{success}</Alert> : null}

                    <TextField
                        label={t("companyInfoForm.fields.name")}
                        value={values.name ?? ""}
                        onChange={(e) => setField("name", e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label={t("companyInfoForm.fields.legalName")}
                        value={values.legal_name ?? ""}
                        onChange={(e) => setField("legal_name", e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label={t("companyInfoForm.fields.registrationNumber")}
                        value={values.registration_number ?? ""}
                        onChange={(e) => setField("registration_number", e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label={t("companyInfoForm.fields.taxNumber")}
                        value={values.tax_number ?? ""}
                        onChange={(e) => setField("tax_number", e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label={t("companyInfoForm.fields.phone")}
                        value={values.phone ?? ""}
                        onChange={(e) => setField("phone", e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label={t("companyInfoForm.fields.email")}
                        value={values.email ?? ""}
                        onChange={(e) => setField("email", e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label={t("companyInfoForm.fields.website")}
                        value={values.website ?? ""}
                        onChange={(e) => setField("website", e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label={t("companyInfoForm.fields.logo")}
                        value={values.logo ?? ""}
                        onChange={(e) => setField("logo", e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label={t("companyInfoForm.fields.country")}
                        value={values.country ?? ""}
                        onChange={(e) => setField("country", e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label={t("companyInfoForm.fields.region")}
                        value={values.region ?? ""}
                        onChange={(e) => setField("region", e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label={t("companyInfoForm.fields.city")}
                        value={values.city ?? ""}
                        onChange={(e) => setField("city", e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label={t("companyInfoForm.fields.address")}
                        value={values.address ?? ""}
                        onChange={(e) => setField("address", e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label={t("companyInfoForm.fields.description")}
                        value={values.description ?? ""}
                        onChange={(e) => setField("description", e.target.value)}
                        fullWidth
                        multiline
                        minRows={4}
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
                        <FiSave size={18} />
                        {isSubmitting
                            ? t("companyInfoForm.actions.saving")
                            : t("companyInfoForm.actions.save")}
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}