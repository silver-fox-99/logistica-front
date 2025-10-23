import { Card, CardContent, CardHeader } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { PriceTrendPoint } from "@/shared/api/dashboardApi";

export default function PriceTrendChart({ data }: { data: PriceTrendPoint[] }) {
    return (
        <Card variant="outlined" sx={{ borderRadius: 3, height: 360 }}>
            <CardHeader title="Тренд цен (ежедневный)" subheader="Среднее медианное значение, груз/транспорт" />
            <CardContent sx={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="cargo_avg" name="Среднее значение груза" dot={false} />
                        <Line type="monotone" dataKey="cargo_median" name="Медианное значение груза" dot={false} />
                        <Line type="monotone" dataKey="transport_avg" name="Среднее значение транспорта" dot={false} />
                        <Line type="monotone" dataKey="transport_median" name="Медианное значение транспорта" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
