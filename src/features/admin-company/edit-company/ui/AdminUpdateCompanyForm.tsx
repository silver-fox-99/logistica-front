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
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={600}>
            Основные данные компании
          </Typography>

          {error ? <Alert severity="error">{error}</Alert> : null}
          {success ? <Alert severity="success">{success}</Alert> : null}

          <TextField
            label="Название"
            value={values.name ?? ""}
            onChange={(e) => setField("name", e.target.value)}
            fullWidth
          />
          <TextField
            label="Юридическое название"
            value={values.legal_name ?? ""}
            onChange={(e) => setField("legal_name", e.target.value)}
            fullWidth
          />
          <TextField
            label="Регистрационный номер"
            value={values.registration_number ?? ""}
            onChange={(e) => setField("registration_number", e.target.value)}
            fullWidth
          />
          <TextField
            label="Налоговый номер"
            value={values.tax_number ?? ""}
            onChange={(e) => setField("tax_number", e.target.value)}
            fullWidth
          />
          <TextField
            label="Телефон"
            value={values.phone ?? ""}
            onChange={(e) => setField("phone", e.target.value)}
            fullWidth
          />
          <TextField
            label="Email"
            value={values.email ?? ""}
            onChange={(e) => setField("email", e.target.value)}
            fullWidth
          />
          <TextField
            label="Сайт"
            value={values.website ?? ""}
            onChange={(e) => setField("website", e.target.value)}
            fullWidth
          />
          <TextField
            label="Страна"
            value={values.country ?? ""}
            onChange={(e) => setField("country", e.target.value)}
            fullWidth
          />
          <TextField
            label="Регион"
            value={values.region ?? ""}
            onChange={(e) => setField("region", e.target.value)}
            fullWidth
          />
          <TextField
            label="Город"
            value={values.city ?? ""}
            onChange={(e) => setField("city", e.target.value)}
            fullWidth
          />
          <TextField
            label="Адрес"
            value={values.address ?? ""}
            onChange={(e) => setField("address", e.target.value)}
            fullWidth
          />
          <TextField
            label="Ссылка на логотип"
            value={values.logo ?? ""}
            onChange={(e) => setField("logo", e.target.value)}
            fullWidth
          />
          <TextField
            label="Лимит участников"
            type="number"
            value={values.members_limit ?? ""}
            onChange={(e) => setField("members_limit", e.target.value)}
            fullWidth
          />
          <TextField
            label="Описание"
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
            sx={{
              textTransform: "none",
              fontWeight: 600,
              alignSelf: "flex-start",
            }}
          >
            {isSubmitting ? "Сохранение..." : "Сохранить изменения"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
