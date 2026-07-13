import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { adminCompaniesApi } from "@/shared/api/adminCompaniesApi";
import type {
  ChangeCompanyOwnerAdminPayload,
  Company,
  CompanyMember,
  CompanyMemberRole,
  CompanyMemberStatus,
} from "@/entities/company/model/types";

type Props = {
  company: Company;
  onCompanyUpdated?: (company: Company) => void;
};

const roleOptions: CompanyMemberRole[] = [
  "OWNER",
  "ADMIN",
  "LOGIST",
  "MANAGER",
  "VIEWER",
];
const statusOptions: CompanyMemberStatus[] = [
  "INVITED",
  "ACTIVE",
  "BLOCKED",
  "REMOVED",
];

export function AdminCompanyMembersCard({ company, onCompanyUpdated }: Props) {
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [history, setHistory] = useState<CompanyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      setError("");

      const [membersData, historyData] = await Promise.all([
        adminCompaniesApi.listMembers(company.id),
        adminCompaniesApi.listMembersHistory(company.id),
      ]);

      setMembers(membersData);
      setHistory(historyData);
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        e?.message ||
        "Не удалось загрузить участников.";
      setError(Array.isArray(message) ? message[0] : message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [company.id]);

  const visibleItems = useMemo(() => {
    return showHistory ? history : members;
  }, [showHistory, history, members]);

  const handleMemberUpdated = (updated: CompanyMember) => {
    setMembers((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item)),
    );
    setHistory((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item)),
    );
  };

  const handleMemberRemoved = (memberId: string) => {
    setMembers((prev) => prev.filter((item) => item.id !== memberId));
    setHistory((prev) =>
      prev.map((item) =>
        item.id === memberId
          ? {
              ...item,
              status: "REMOVED",
              removed_at: new Date().toISOString(),
            }
          : item,
      ),
    );
  };

  const handleOwnerChanged = async () => {
    const freshCompany = await adminCompaniesApi.getById(company.id);
    onCompanyUpdated?.(freshCompany);
    await loadMembers();
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
          >
            <Stack spacing={0.5}>
              <Typography variant="h6" fontWeight={600}>
                Участники компании
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Здесь администратор может менять роли, статусы, назначать нового
                владельца и удалять участников.
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                История
              </Typography>
              <Switch
                checked={showHistory}
                onChange={(e) => setShowHistory(e.target.checked)}
              />
            </Stack>
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}

          {isLoading ? (
            <Typography>Загрузка...</Typography>
          ) : visibleItems.length === 0 ? (
            <Typography color="text.secondary">
              {showHistory
                ? "История участников пуста."
                : "Участники не найдены."}
            </Typography>
          ) : (
            visibleItems.map((member) => (
              <AdminCompanyMemberRow
                key={member.id}
                companyId={company.id}
                member={member}
                currentOwnerUserId={company.owner_user_id}
                onUpdated={handleMemberUpdated}
                onRemoved={handleMemberRemoved}
                onOwnerChanged={handleOwnerChanged}
              />
            ))
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function AdminCompanyMemberRow(props: {
  companyId: string;
  member: CompanyMember;
  currentOwnerUserId: string;
  onUpdated: (member: CompanyMember) => void;
  onRemoved: (memberId: string) => void;
  onOwnerChanged: () => Promise<void>;
}) {
  const {
    companyId,
    member,
    currentOwnerUserId,
    onUpdated,
    onRemoved,
    onOwnerChanged,
  } = props;

  const [role, setRole] = useState<CompanyMemberRole>(member.role);
  const [status, setStatus] = useState<CompanyMemberStatus>(member.status);
  const [isDefault, setIsDefault] = useState(Boolean(member.is_default));
  const [note, setNote] = useState(member.note ?? "");
  const [demotePreviousOwner, setDemotePreviousOwner] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isChangingOwner, setIsChangingOwner] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fullName = [member.user?.first_name, member.user?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  const title =
    fullName || member.user?.email || member.user?.phone || member.user_id;

  const isCurrentOwner = member.user_id === currentOwnerUserId;

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      const updated = await adminCompaniesApi.updateMember(
        companyId,
        member.id,
        {
          role,
          status,
          is_default: isDefault,
          note: note.trim() || null,
        },
      );

      onUpdated(updated);
      setSuccess("Изменения по участнику сохранены.");
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        e?.message ||
        "Не удалось обновить участника.";
      setError(Array.isArray(message) ? message[0] : message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    try {
      setIsRemoving(true);
      setError("");
      setSuccess("");

      await adminCompaniesApi.removeMember(companyId, member.id);
      onRemoved(member.id);
      setSuccess("Участник удалён из компании.");
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        e?.message ||
        "Не удалось удалить участника.";
      setError(Array.isArray(message) ? message[0] : message);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleMakeOwner = async () => {
    try {
      setIsChangingOwner(true);
      setError("");
      setSuccess("");

      const payload: ChangeCompanyOwnerAdminPayload = {
        demote_previous_owner_to_admin: demotePreviousOwner,
      };

      await adminCompaniesApi.makeOwner(companyId, member.id, payload);
      await onOwnerChanged();
      setSuccess("Владелец компании успешно изменён.");
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        e?.message ||
        "Не удалось назначить нового владельца.";
      setError(Array.isArray(message) ? message[0] : message);
    } finally {
      setIsChangingOwner(false);
    }
  };

  return (
    <Stack
      spacing={1.5}
      sx={{
        p: 2,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        spacing={1.5}
      >
        <Stack spacing={0.5}>
          <Typography fontWeight={600}>{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {member.user?.email || "Email не указан"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {member.user?.phone || "Телефон не указан"}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip label={`Роль: ${member.role}`} size="small" />
          <Chip label={`Статус: ${member.status}`} size="small" />
          {isCurrentOwner ? (
            <Chip label="Текущий владелец" color="primary" size="small" />
          ) : null}
          {member.is_default ? (
            <Chip label="По умолчанию" color="success" size="small" />
          ) : null}
        </Stack>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}
      {success ? <Alert severity="success">{success}</Alert> : null}

      <TextField
        select
        label="Роль"
        value={role}
        onChange={(e) => setRole(e.target.value as CompanyMemberRole)}
        fullWidth
      >
        {roleOptions.map((item) => (
          <MenuItem key={item} value={item}>
            {item}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Статус"
        value={status}
        onChange={(e) => setStatus(e.target.value as CompanyMemberStatus)}
        fullWidth
      >
        {statusOptions.map((item) => (
          <MenuItem key={item} value={item}>
            {item}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Профиль по умолчанию"
        value={isDefault ? "yes" : "no"}
        onChange={(e) => setIsDefault(e.target.value === "yes")}
        fullWidth
      >
        <MenuItem value="no">Нет</MenuItem>
        <MenuItem value="yes">Да</MenuItem>
      </TextField>

      <TextField
        label="Заметка администратора"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        multiline
        minRows={3}
        fullWidth
      />

      {!isCurrentOwner ? (
        <>
          <Divider />
          <TextField
            select
            label="Понизить прошлого владельца до ADMIN"
            value={demotePreviousOwner ? "yes" : "no"}
            onChange={(e) => setDemotePreviousOwner(e.target.value === "yes")}
            fullWidth
          >
            <MenuItem value="yes">Да</MenuItem>
            <MenuItem value="no">Нет</MenuItem>
          </TextField>

          <Button
            variant="outlined"
            onClick={handleMakeOwner}
            disabled={isChangingOwner}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              alignSelf: "flex-start",
            }}
          >
            {isChangingOwner ? "Назначение..." : "Назначить владельцем"}
          </Button>
        </>
      ) : null}

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          {isSaving ? "Сохранение..." : "Сохранить"}
        </Button>

        <Button
          color="error"
          variant="outlined"
          onClick={handleRemove}
          disabled={isRemoving}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          {isRemoving ? "Удаление..." : "Удалить участника"}
        </Button>
      </Stack>
    </Stack>
  );
}
