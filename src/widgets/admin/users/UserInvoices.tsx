import { useEffect, useState } from "react";
import {
  Paper,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Box,
  Tooltip,
} from "@mui/material";
import { FiTrash2, FiExternalLink } from "react-icons/fi";
import { tariffsApi } from "@/shared/api/tariffsApi";
import { toast } from "react-toastify";
import type { TariffInvoice } from "@/entities/tariff-plan/model/types.ts";

const fmt = (d?: string | null) =>
  d
    ? new Date(d).toLocaleString("ru-RU", {
        dateStyle: "medium",
        timeStyle: "short",
        hour12: false,
      })
    : "—";

type Props = {
  userId: string;
};

export default function UserInvoices({ userId }: Props) {
  const [items, setItems] = useState<TariffInvoice[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await tariffsApi.adminListInvoices(userId);
      setItems(res.items);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Не удалось загрузить инвойсы";
      toast.error(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [userId]);

  const handleDelete = async (id: string) => {
    try {
      await tariffsApi.adminDeleteInvoice(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Инвойс удален");
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Не удалось удалить инвойс";
      toast.error(msg);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1 }}
      >
        <Typography variant="h6" fontWeight={600}>
          Инвойсы
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {items.length} шт.
        </Typography>
      </Stack>
      <Box sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>План</TableCell>
              <TableCell>Сумма</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Провайдер</TableCell>
              <TableCell>Создан</TableCell>
              <TableCell>Квитанция</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography
                    align="center"
                    color="text.secondary"
                    sx={{ py: 2 }}
                  >
                    Загрузка...
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {!loading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography
                    align="center"
                    color="text.secondary"
                    sx={{ py: 2 }}
                  >
                    Нет инвойсов
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              items.map((inv) => (
                <TableRow key={inv.id} hover>
                  <TableCell>
                    <Stack spacing={0.25}>
                      <Typography variant="body2" fontWeight={600}>
                        {inv.plan_name ?? inv.plan_code ?? "—"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        #{inv.subscription_id ?? "—"}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {inv.amount ?? "—"} {inv.currency}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={inv.status ?? "—"}
                      color={
                        inv.status === "PAID"
                          ? "success"
                          : inv.status === "PENDING"
                            ? "warning"
                            : "default"
                      }
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{inv.provider ?? "—"}</TableCell>
                  <TableCell>{fmt(inv.created_at)}</TableCell>
                  <TableCell>
                    {inv.short_link || inv.checkout_url ? (
                      <Tooltip title="Открыть квитанцию">
                        <IconButton
                          size="small"
                          component="a"
                          href={(inv.short_link || inv.checkout_url) ?? "#"}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <FiExternalLink />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(inv.id)}
                    >
                      <FiTrash2 />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}
