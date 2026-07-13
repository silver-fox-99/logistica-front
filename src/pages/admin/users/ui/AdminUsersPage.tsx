import {
  Avatar,
  Box,
  Chip,
  InputAdornment,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { FiSearch, FiShield } from "react-icons/fi";
import { useAdminUsers } from "@/features/admin/users-list/model/useAdminUsers";
import type { AdminUser } from "@/shared/api/adminUsersApi";
import { useNavigate } from "react-router-dom";
import { useAdminAccessStore } from "@/entities/adminAccess/model/adminAccess.store.ts";
import { viewCode } from "@/shared/ui/layout/AdminLayout.tsx";
import NoAccess from "@/shared/ui/no-access/NoAccess.tsx";

// ---------- helpers ----------
const fmt = (d?: string | null) =>
  d
    ? new Date(d).toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
        hour12: false,
      })
    : "—";

const n = (v: unknown, def = 0) =>
  typeof v === "number" && Number.isFinite(v) ? v : def;

type NameCellProps = {
  user: AdminUser;
  onNavigate?: () => void;
};

// ---------- sub components ----------
function NameCell({ user, onNavigate }: NameCellProps) {
  const name =
    [user.first_name, user.last_name].filter(Boolean).join(" ") || "—";

  return (
    <Stack
      onClick={onNavigate}
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{ cursor: onNavigate ? "pointer" : "default" }}
      role={onNavigate ? "button" : undefined}
      tabIndex={onNavigate ? 0 : undefined}
    >
      <Avatar
        src={user.avatar ?? undefined}
        alt={name}
        sx={{ width: 28, height: 28 }}
      />
      <Stack spacing={0}>
        <Typography variant="body2" fontWeight={600}>
          {name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user.id.slice(0, 8)}…
        </Typography>
      </Stack>
    </Stack>
  );
}

// ---------- page ----------
export default function AdminUsersPage() {
  const {
    items,
    pages,
    total,
    loading,
    error,
    params,
    setPage,
    setLimit,
    setSort,
    setSearch,
  } = useAdminUsers({ page: 1, limit: 20, sort: "created_at", dir: "desc" });

  const canViewUsers = useAdminAccessStore((s) =>
    s.hasPermission(viewCode("USERS" as any)),
  );

  const totalSafe = n(total, 0);
  const pagesSafe = n(pages, 1);
  const pageSafe = n(params.page, 1);
  const limitSafe = n(params.limit, 20);
  const dirSafe =
    params.dir === "asc" || params.dir === "desc" ? params.dir : "desc";

  const toggleCreatedSort = () =>
    setSort("created_at", dirSafe === "desc" ? "asc" : "desc");

  const toggleLoginSort = () =>
    setSort(
      "last_login_at",
      params.sort === "last_login_at" && dirSafe === "desc" ? "asc" : "desc",
    );

  const navigate = useNavigate();

  if (!canViewUsers) {
    return <NoAccess />;
  }

  return (
    <Stack spacing={2}>
      {/* header + controls */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
      >
        <Stack spacing={0}>
          <Typography variant="h5" fontWeight={600}>
            Пользователи
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {totalSafe.toLocaleString()} user{totalSafe === 1 ? "" : "s"}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1.5}>
          <TextField
            size="small"
            placeholder="Поиск по телефону или email…"
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FiSearch />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 280 }}
          />
          <Select
            size="small"
            value={String(limitSafe)}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            {[10, 20, 50, 100].map((n) => (
              <MenuItem key={n} value={n}>
                {n}/страница
              </MenuItem>
            ))}
          </Select>
        </Stack>
      </Stack>

      {/* table */}
      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  onClick={toggleCreatedSort}
                  sx={{ cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  Создан{" "}
                  {params.sort === "created_at"
                    ? dirSafe === "desc"
                      ? "↓"
                      : "↑"
                    : ""}
                </TableCell>
                <TableCell>Имя</TableCell>
                <TableCell>Телефон</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Тип</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Этап регистрации</TableCell>
                <TableCell
                  onClick={toggleLoginSort}
                  sx={{ cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  Последний вход{" "}
                  {params.sort === "last_login_at"
                    ? dirSafe === "desc"
                      ? "↓"
                      : "↑"
                    : ""}
                </TableCell>
                <TableCell>Роль</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {items.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>{fmt(u.created_at)}</TableCell>
                  <TableCell>
                    <NameCell
                      user={u}
                      onNavigate={() => navigate(`/admin/user/${u.id}`)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{u.phone}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {u.phone_verified_at ? "Подтвержден" : "Не подтвержден"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{u.email || "—"}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {u.email
                        ? u.email_verified_at
                          ? "Подтвержден"
                          : "Не подтвержден"
                        : ""}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{u.type || "-"}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={u.status}
                      color={u.status === "ACTIVE" ? "success" : "default"}
                      variant={u.status === "ACTIVE" ? "filled" : "outlined"}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={u.registration_stage}
                    />
                  </TableCell>
                  <TableCell>{fmt(u.last_login_at)}</TableCell>
                  <TableCell>
                    {u.is_admin ? (
                      <Chip
                        size="small"
                        icon={<FiShield />}
                        color="warning"
                        label="Администратор"
                      />
                    ) : (
                      <Chip
                        size="small"
                        variant="outlined"
                        label="Пользователь"
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {!loading && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Typography
                      align="center"
                      color="text.secondary"
                      sx={{ py: 4 }}
                    >
                      {error ?? "Пользователи не найдены"}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {loading && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Typography
                      align="center"
                      color="text.secondary"
                      sx={{ py: 4 }}
                    >
                      Загрузка…
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      {/* pagination */}
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="caption" color="text.secondary">
          Страница {pageSafe} из {pagesSafe}
        </Typography>
        <Pagination
          count={pagesSafe}
          page={pageSafe}
          onChange={(_, p) => setPage(p)}
          siblingCount={1}
        />
      </Stack>
    </Stack>
  );
}
