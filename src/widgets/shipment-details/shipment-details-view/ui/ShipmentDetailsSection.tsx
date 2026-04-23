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
                borderRadius: 2,
                borderColor: "divider",
                boxShadow: "none",
            }}
        >
            <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
                <Stack spacing={title ? 1.5 : 0}>
                    {title && (
                        <Stack spacing={0.25}>
                            <Typography variant="subtitle1" fontWeight={700}>
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