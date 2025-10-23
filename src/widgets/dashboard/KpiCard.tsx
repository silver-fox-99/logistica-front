import { Card, CardContent, Stack, Typography } from "@mui/material";
import type {ReactNode} from "react";

export default function KpiCard({
                                    title,
                                    value,
                                    icon,
                                    note,
                                }: {
    title: string;
    value: string | number;
    icon?: ReactNode;
    note?: string;
}) {
    return (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                    {icon}
                    <Stack>
                        <Typography variant="body2" color="text.secondary">
                            {title}
                        </Typography>
                        <Typography variant="h5" fontWeight={700}>
                            {value}
                        </Typography>
                        {note && (
                            <Typography variant="caption" color="text.secondary">
                                {note}
                            </Typography>
                        )}
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}
