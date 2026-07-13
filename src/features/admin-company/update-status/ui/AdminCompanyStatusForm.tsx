import {
  Alert,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { Company } from "@/entities/company/model/types";
import { useAdminUpdateCompanyStatus } from "../model/useAdminUpdateCompanyStatus";

type Props = {
  company: Company | null;
  onUpdated?: (company: Company) => void;
};

export function AdminCompanyStatusForm({ company, onUpdated }: Props) {
  const {
    status,
    setStatus,
    verificationComment,
    setVerificationComment,
    submit,
    isSubmitting,
    error,
    success,
  } = useAdminUpdateCompanyStatus(company, onUpdated);

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={600}>
            Статус компании
          </Typography>

          {error ? <Alert severity="error">{error}</Alert> : null}
          {success ? <Alert severity="success">{success}</Alert> : null}

          <TextField
            select
            label="Статус"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            fullWidth
          >
            <MenuItem value="UNVERIFIED">Не подтверждена</MenuItem>
            <MenuItem value="PENDING_REVIEW">На проверке</MenuItem>
            <MenuItem value="VERIFIED">Подтверждена</MenuItem>
            <MenuItem value="REJECTED">Отклонена</MenuItem>
            <MenuItem value="BLOCKED">Заблокирована</MenuItem>
          </TextField>

          <TextField
            label="Комментарий к проверке"
            value={verificationComment}
            onChange={(e) => setVerificationComment(e.target.value)}
            multiline
            minRows={3}
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
            {isSubmitting ? "Сохранение..." : "Обновить статус"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
