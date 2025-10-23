import { Card, CardContent, CardHeader } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { PriceTrendPoint } from "@/shared/api/dashboardApi";

export default function PriceTrendChart({ data }: { data: PriceTrendPoint[] }) {
    return (
        <Card variant="outlined" sx={{ borderRadius: 3, height: 360 }}>
            <CardHeader title="Price trend (daily)" subheader="Average & median, cargo/transport" />
            <CardContent sx={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="cargo_avg" name="Cargo avg" dot={false} />
                        <Line type="monotone" dataKey="cargo_median" name="Cargo median" dot={false} />
                        <Line type="monotone" dataKey="transport_avg" name="Transport avg" dot={false} />
                        <Line type="monotone" dataKey="transport_median" name="Transport median" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
