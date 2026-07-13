import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
  Chip,
} from "@mui/material";
import {
  FiDatabase,
  FiRefreshCw,
  FiLoader,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { adminUserApi } from "@/shared/api/adminUserApi";
import type { AdminUser } from "@/shared/api/adminUsersApi";

function formatDateTime(value: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function CrmIntegrationCard({
  user,
  onUpdated,
}: {
  user: AdminUser;
  onUpdated: (u: AdminUser) => void;
}) {
  const [busy, setBusy] = useState(false);

  const syncedAt = user.crm_integrated_at;

  const statusChip = useMemo(() => {
    if (syncedAt) {
      return (
        <Chip
          size="small"
          color="success"
          icon={<FiCheckCircle />}
          label="Синхронизирован"
          variant="filled"
        />
      );
    }
    return (
      <Chip
        size="small"
        icon={<FiAlertCircle />}
        label="Не синхронизирован"
        variant="outlined"
      />
    );
  }, [syncedAt]);

  const submit = async () => {
    setBusy(true);
    try {
      await adminUserApi.crmMigrate(user.id);

      const res = await adminUserApi.get(user.id);
      onUpdated(res.data.user);

      toast.success("Успешная CRM интеграция");
    } catch (error: any) {
      const message = error?.response?.data?.message || "Ошибка CRM интеграции";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Stack spacing={1.25}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <FiDatabase />
              <Typography fontWeight={600}>CRM интеграция</Typography>
            </Stack>
            {statusChip}
          </Stack>

          <Typography variant="body2" color="text.secondary">
            {syncedAt
              ? `Синхронизирован ${formatDateTime(syncedAt)}, binotel ID: ${user.binotel_id}`
              : "Этого юзера еще нет в CRM."}
          </Typography>

          <Stack direction="row" justifyContent="flex-end">
            <Button
              onClick={submit}
              disabled={busy}
              variant="contained"
              startIcon={busy ? <FiLoader /> : <FiRefreshCw />}
            >
              {busy
                ? "Синхронизация…"
                : syncedAt
                  ? "Повторить попытку"
                  : "Синхронизировать с CRM"}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
