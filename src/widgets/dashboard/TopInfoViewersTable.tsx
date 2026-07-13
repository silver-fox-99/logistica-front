import { useMemo } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from "@mui/material";
import type { InfoViewer } from "@/shared/api/dashboardApi";

function formatName(v: InfoViewer) {
  const fn = (v.first_name ?? "").trim();
  const ln = (v.last_name ?? "").trim();
  const full = `${fn} ${ln}`.trim();
  return full || "—";
}

function formatIdentity(v: InfoViewer) {
  return v.phone || v.email || (v.user_id ? v.user_id.slice(0, 8) + "…" : "—");
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default function TopInfoViewersTable({
  title = "Топ просмотров контактов",
  rows,
}: {
  title?: string;
  rows: InfoViewer[];
}) {
  const sorted = useMemo(() => rows ?? [], [rows]);

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4,
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.03)",
        },
      }}
    >
      <CardHeader
        title={title}
        subheader="Пользователи, наиболее часто просматривавшие детальную информацию"
        titleTypographyProps={{ fontWeight: 600, fontSize: "1.1rem" }}
        subheaderTypographyProps={{
          fontSize: "0.85rem",
          color: "text.secondary",
        }}
        action={
          <Chip
            size="small"
            label={`Top ${sorted.length}`}
            color="primary"
            sx={{ fontWeight: 600, mt: 1, mr: 1 }}
          />
        }
      />
      <CardContent sx={{ pt: 0, overflowX: "auto" }}>
        <Table size="medium">
          <TableHead>
            <TableRow
              sx={{
                "& th": {
                  fontWeight: 600,
                  color: "text.secondary",
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                },
              }}
            >
              <TableCell sx={{ width: 64 }}>#</TableCell>
              <TableCell>Пользователь</TableCell>
              <TableCell>Контактные данные</TableCell>
              <TableCell align="right">Грузы</TableCell>
              <TableCell align="right">Транспорт</TableCell>
              <TableCell align="right">Всего просмотров</TableCell>
              <TableCell>Последний просмотр</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  align="center"
                  sx={{ py: 3, color: "text.secondary" }}
                >
                  Нет данных за выбранный период
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((r, idx) => (
                <TableRow
                  key={`${r.user_id ?? r.phone ?? r.email ?? idx}`}
                  sx={{ "&:hover": { bgcolor: "action.hover" } }}
                >
                  <TableCell
                    sx={{ py: 1.5, fontWeight: 600, color: "text.secondary" }}
                  >
                    {idx + 1}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {formatName(r)}
                    </Typography>
                    {r.user_id && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontFamily: "monospace" }}
                      >
                        ID: {r.user_id.slice(0, 8)}…
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{formatIdentity(r)}</Typography>
                    {r.email && (
                      <Typography variant="caption" color="text.secondary">
                        {r.email}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 500 }}>
                    {r.cargo_views ?? 0}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 500 }}>
                    {r.transport_views ?? 0}
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      size="small"
                      label={r.total_views ?? 0}
                      sx={{
                        fontWeight: 600,
                        bgcolor: "action.selected",
                        color: "text.primary",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: "13px" }}>
                    {formatDate(r.last_view_at)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
