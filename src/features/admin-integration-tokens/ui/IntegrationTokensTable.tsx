import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  IconButton,
  Pagination,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { FiEdit2, FiKey, FiTrash2 } from "react-icons/fi";

import type { IntegrationTokenItem } from "@/entities/integration/model/types";
import {
  formatIntegrationDate,
  getIntegrationOwnerLabel,
} from "@/entities/integration/lib/formatters";

type Props = {
  items: IntegrationTokenItem[];
  total: number;
  page: number;
  pages: number;
  loading: boolean;
  submitting: boolean;
  onPageChange: (page: number) => void;
  onEdit: (item: IntegrationTokenItem) => void;
  onRegenerate: (item: IntegrationTokenItem) => void;
  onToggle: (item: IntegrationTokenItem) => void;
  onDelete: (item: IntegrationTokenItem) => void;
};

export const IntegrationTokensTable = React.memo(
  function IntegrationTokensTable({
    items,
    total,
    page,
    pages,
    loading,
    submitting,
    onPageChange,
    onEdit,
    onRegenerate,
    onToggle,
    onDelete,
  }: Props) {
    return (
      <Card sx={{ borderRadius: 3 }}>
        <CardHeader
          title="Токены интеграции"
          subheader={`Всего: ${total}`}
          action={loading ? <CircularProgress size={22} /> : null}
        />

        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Название</TableCell>
                  <TableCell>Владелец</TableCell>
                  <TableCell>Компания</TableCell>
                  <TableCell>Префикс</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Scopes</TableCell>
                  <TableCell>Использование</TableCell>
                  <TableCell>Истекает</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {!loading && items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <Typography variant="body2" color="text.secondary">
                        Токены интеграции не найдены
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {items.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {item.name}
                      </Typography>
                    </TableCell>

                    <TableCell>{getIntegrationOwnerLabel(item.user)}</TableCell>
                    <TableCell>{item.company_name || "—"}</TableCell>
                    <TableCell>{item.token_prefix}</TableCell>

                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        flexWrap="wrap"
                      >
                        <Chip
                          size="small"
                          label={
                            item.status === "ACTIVE" ? "Активный" : item.status
                          }
                          color={
                            item.status === "ACTIVE" ? "success" : "default"
                          }
                        />
                        <Chip
                          size="small"
                          label={item.is_active ? "Включён" : "Выключен"}
                          variant="outlined"
                        />
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={0.75}
                        useFlexGap
                        flexWrap="wrap"
                      >
                        {item.scopes?.length ? (
                          item.scopes.map((scope) => (
                            <Chip key={scope} size="small" label={scope} />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            —
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>

                    <TableCell>
                      {item.usage_count}
                      {item.usage_limit != null
                        ? ` / ${item.usage_limit}`
                        : " / ∞"}
                    </TableCell>

                    <TableCell>
                      {formatIntegrationDate(item.expires_at)}
                    </TableCell>

                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                        alignItems="center"
                      >
                        <Tooltip title="Редактировать">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => onEdit(item)}
                              disabled={submitting}
                            >
                              <FiEdit2 />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title="Перевыпустить токен">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => onRegenerate(item)}
                              disabled={submitting}
                            >
                              <FiKey />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip
                          title={item.is_active ? "Выключить" : "Включить"}
                        >
                          <span>
                            <Switch
                              checked={item.is_active}
                              onChange={() => onToggle(item)}
                              disabled={submitting}
                            />
                          </span>
                        </Tooltip>

                        <Tooltip title="Удалить">
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => onDelete(item)}
                              disabled={submitting}
                            >
                              <FiTrash2 />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
            <Pagination
              page={page}
              count={pages}
              onChange={(_, value) => onPageChange(value)}
              color="primary"
            />
          </Stack>
        </CardContent>
      </Card>
    );
  },
);
