import { Card, Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

export type KpiColor = "primary" | "success" | "secondary" | "warning";

interface KpiCardProps {
    title: string;
    value: string | number;
    icon?: ReactNode;
    note?: string;
    color?: KpiColor;
}

const COLOR_MAP = {
    primary: {
        bg: "rgba(14, 165, 233, 0.1)",
        icon: "rgb(14, 165, 233)",
        border: "rgba(14, 165, 233, 0.2)",
    },
    success: {
        bg: "rgba(16, 185, 129, 0.1)",
        icon: "rgb(16, 185, 129)",
        border: "rgba(16, 185, 129, 0.2)",
    },
    secondary: {
        bg: "rgba(139, 92, 246, 0.1)",
        icon: "rgb(139, 92, 246)",
        border: "rgba(139, 92, 246, 0.2)",
    },
    warning: {
        bg: "rgba(245, 158, 11, 0.1)",
        icon: "rgb(245, 158, 11)",
        border: "rgba(245, 158, 11, 0.2)",
    },
};

export default function KpiCard({
    title,
    value,
    icon,
    note,
    color = "primary",
}: KpiCardProps) {
    const palette = COLOR_MAP[color];

    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 4,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                bgcolor: "background.paper",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.04)",
                    borderColor: palette.border,
                },
            }}
        >
            <Stack direction="row" alignItems="center" spacing={2.5} sx={{ p: 3 }}>
                {icon && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 56,
                            height: 56,
                            borderRadius: 3,
                            bgcolor: palette.bg,
                            color: palette.icon,
                            transition: "all 0.3s ease",
                            "& svg": {
                                fontSize: 26,
                            },
                        }}
                    >
                        {icon}
                    </Box>
                )}
                <Stack spacing={0.5}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        {title}
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: "-0.5px" }}>
                        {value}
                    </Typography>
                    {note && (
                        <Typography variant="caption" color="text.secondary">
                            {note}
                        </Typography>
                    )}
                </Stack>
            </Stack>
        </Card>
    );
}
