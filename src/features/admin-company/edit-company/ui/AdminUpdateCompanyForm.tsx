import {
    Alert,
    Button,
    Card,
    CardContent,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import type { Company } from "@/entities/company/model/types";
import { useAdminUpdateCompany } from "../model/useAdminUpdateCompany";

type Props = {
    company: Company | null;
    onUpdated?: (company: Company) => void;
};

export function AdminUpdateCompanyForm({ company, onUpdated }: Props) {
    const { values, setField, submit, isSubmitting, error, success } =
        useAdminUpdateCompany(company, onUpdated);

    return (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
                <Stack spacing={2}>
                    <Typography variant="h6" fontWeight={700}>
                        Данные компании
                    </Typography>

                    {error ? <Alert severity="error">{error}</Alert> : null}
                    {success ? <Alert severity="success">{success}</Alert> : null}

                    <TextField label="Name" value={values.name ?? ""} onChange={(e) => setField("name", e.target.value)} fullWidth />
                    <TextField label="Legal name" value={values.legal_name ?? ""} onChange={(e) => setField("legal_name", e.target.value)} fullWidth />
                    <TextField label="Registration number" value={values.registration_number ?? ""} onChange={(e) => setField("registration_number", e.target.value)} fullWidth />
                    <TextField label="Tax number" value={values.tax_number ?? ""} onChange={(e) => setField("tax_number", e.target.value)} fullWidth />
                    <TextField label="Phone" value={values.phone ?? ""} onChange={(e) => setField("phone", e.target.value)} fullWidth />
                    <TextField label="Email" value={values.email ?? ""} onChange={(e) => setField("email", e.target.value)} fullWidth />
                    <TextField label="Website" value={values.website ?? ""} onChange={(e) => setField("website", e.target.value)} fullWidth />
                    <TextField label="Country" value={values.country ?? ""} onChange={(e) => setField("country", e.target.value)} fullWidth />
                    <TextField label="Region" value={values.region ?? ""} onChange={(e) => setField("region", e.target.value)} fullWidth />
                    <TextField label="City" value={values.city ?? ""} onChange={(e) => setField("city", e.target.value)} fullWidth />
                    <TextField label="Address" value={values.address ?? ""} onChange={(e) => setField("address", e.target.value)} fullWidth />
                    <TextField label="Logo URL" value={values.logo ?? ""} onChange={(e) => setField("logo", e.target.value)} fullWidth />
                    <TextField
                        label="Members limit"
                        type="number"
                        value={values.members_limit ?? ""}
                        onChange={(e) => setField("members_limit", e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Description"
                        value={values.description ?? ""}
                        onChange={(e) => setField("description", e.target.value)}
                        multiline
                        minRows={4}
                        fullWidth
                    />

                    <Button
                        variant="contained"
                        onClick={submit}
                        disabled={isSubmitting}
                        sx={{ textTransform: "none", fontWeight: 700, alignSelf: "flex-start" }}
                    >
                        {isSubmitting ? "Сохранение..." : "Сохранить"}
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}