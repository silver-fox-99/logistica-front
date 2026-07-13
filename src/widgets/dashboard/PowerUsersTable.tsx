import {
  Card,
  CardHeader,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Stack,
  Typography,
} from "@mui/material";
import type { PowerUser } from "@/shared/api/dashboardApi";

export default function PowerUsersTable({ rows }: { rows: PowerUser[] }) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4,
        transition: "all 0.3s ease",
        height: "100%",
        "&:hover": {
          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.03)",
        },
      }}
    >
      <CardHeader
        title="Активные пользователи"
        subheader="Рейтинг пользователей по количеству размещенных объявлений"
        titleTypographyProps={{ fontWeight: 600, fontSize: "1.1rem" }}
        subheaderTypographyProps={{
          fontSize: "0.85rem",
          color: "text.secondary",
        }}
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
              <TableCell>Пользователь</TableCell>
              <TableCell align="right">Объявления</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((u) => {
              const name =
                [u.first_name, u.last_name].filter(Boolean).join(" ") ||
                u.user_id;
              const initials = (u.first_name?.[0] || "").toUpperCase() || "?";
              return (
                <TableRow
                  key={u.user_id}
                  sx={{ "&:hover": { bgcolor: "action.hover" } }}
                >
                  <TableCell sx={{ py: 1.5 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: "primary.light",
                          color: "primary.contrastText",
                          fontWeight: 600,
                          fontSize: "14px",
                        }}
                      >
                        {initials}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>
                        {name}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {u.ads}
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={2}
                  align="center"
                  sx={{ py: 3, color: "text.secondary" }}
                >
                  Нет данных
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
