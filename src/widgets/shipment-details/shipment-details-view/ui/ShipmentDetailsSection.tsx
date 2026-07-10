import { Card, CardContent, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

type Props = {
    title?: string;
    subtitle?: string;
    children: ReactNode;
};

export function ShipmentDetailsSection({ title, subtitle, children }: Props) {
    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: "16px",
                borderColor: "divider",
                boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
            }}
        >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Stack spacing={title ? 2 : 0}>
                    {title && (
                        <Stack spacing={0.5}>
                            <Typography variant="subtitle1" fontWeight={800}>
                                {title}
                            </Typography>

                            {subtitle && (
                                <Typography variant="body2" color="text.secondary">
                                    {subtitle}
                                </Typography>
                            )}
                        </Stack>
                    )}

                    {children}
                </Stack>
            </CardContent>
        </Card>
    );
}