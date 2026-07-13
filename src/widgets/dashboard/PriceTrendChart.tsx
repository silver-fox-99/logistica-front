import { Card, CardContent, CardHeader, useTheme } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import type { CreationTrendPoint } from "@/shared/api/dashboardApi";

export default function PriceTrendChart({
  data,
}: {
  data: CreationTrendPoint[];
}) {
  const theme = useTheme();

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4,
        height: 385,
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.03)",
        },
      }}
    >
      <CardHeader
        title="Динамика создания объявлений"
        subheader="Ежедневное количество созданных объявлений о грузах и транспорте"
        titleTypographyProps={{ fontWeight: 600, fontSize: "1.1rem" }}
        subheaderTypographyProps={{
          fontSize: "0.85rem",
          color: "text.secondary",
        }}
      />
      <CardContent sx={{ height: 300, pt: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={theme.palette.divider}
            />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
              dy={10}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
              dx={-5}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                borderRadius: "12px",
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                fontSize: "12px",
              }}
            />
            <Legend
              verticalAlign="top"
              height={40}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "12px", paddingBottom: "15px" }}
            />
            <Line
              type="monotone"
              dataKey="cargo_cnt"
              name="Создано грузов"
              stroke="#6366F1"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="transport_cnt"
              name="Создано транспорта"
              stroke="#10B981"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
