import {
  Box,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { FiEdit3, FiTrash2 } from "react-icons/fi";
import { BiBlock } from "react-icons/bi";

import {
  formatTariffDate,
  formatTariffPrice,
} from "@/entities/tariff-plan/model/tariff-plan.form";
import type { TariffPlan } from "@/entities/tariff-plan/model/types.ts";

type Props = {
  plans: TariffPlan[];
  loading: boolean;
  error: string | null;
  onEdit: (plan: TariffPlan) => void;
  onDeactivate: (planId: string) => void;
  onDelete: (planId: string) => void;
};

export function TariffPlansTable({
  plans,
  loading,
  error,
  onEdit,
  onDeactivate,
  onDelete,
}: Props) {
  return (
    <Box sx={{ overflowX: "auto" }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Название</TableCell>
            <TableCell>Код</TableCell>
            <TableCell>Статус</TableCell>
            <TableCell>По умолчанию</TableCell>
            <TableCell>Приоритет</TableCell>
            <TableCell>Стоимость</TableCell>
            <TableCell>Обновлён</TableCell>
            <TableCell>Действия</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={8}>
                <Typography
                  align="center"
                  color="text.secondary"
                  sx={{ py: 3 }}
                >
                  Загрузка тарифов...
                </Typography>
              </TableCell>
            </TableRow>
          )}

          {!loading && error && (
            <TableRow>
              <TableCell colSpan={8}>
                <Typography align="center" color="error" sx={{ py: 3 }}>
                  {error}
                </Typography>
              </TableCell>
            </TableRow>
          )}

          {!loading && !error && plans.length === 0 && (
            <TableRow>
              <TableCell colSpan={8}>
                <Typography
                  align="center"
                  color="text.secondary"
                  sx={{ py: 3 }}
                >
                  Тарифные планы пока не созданы.
                </Typography>
              </TableCell>
            </TableRow>
          )}

          {!loading &&
            !error &&
            plans.map((plan) => (
              <TableRow key={plan.id} hover>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography fontWeight={600}>{plan.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {plan.description || "Описание не указано"}
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell>{plan.code}</TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    label={plan.is_active ? "Активен" : "Отключён"}
                    color={plan.is_active ? "success" : "default"}
                    variant={plan.is_active ? "filled" : "outlined"}
                  />
                </TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    label={plan.is_default ? "Да" : "Нет"}
                    color={plan.is_default ? "primary" : "default"}
                    variant={plan.is_default ? "filled" : "outlined"}
                  />
                </TableCell>

                <TableCell>{plan.priority ?? "—"}</TableCell>
                <TableCell>{formatTariffPrice(plan)}</TableCell>
                <TableCell>{formatTariffDate(plan.updated_at)}</TableCell>

                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Редактировать тариф">
                      <IconButton size="small" onClick={() => onEdit(plan)}>
                        <FiEdit3 />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Отключить тариф">
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => onDeactivate(plan.id)}
                          disabled={!plan.is_active}
                        >
                          <BiBlock />
                        </IconButton>
                      </span>
                    </Tooltip>

                    <Tooltip title="Удалить тариф">
                      <IconButton
                        size="small"
                        onClick={() => onDelete(plan.id)}
                        color="error"
                      >
                        <FiTrash2 />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Box>
  );
}
