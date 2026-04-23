import { Paper, Typography } from "@mui/material";
import type { ReactNode } from "react";

type Props = {
    title: string;
    children: ReactNode;
};

export function DetailSection({ title, children }: Props) {
    return (
        <Paper
            variant="outlined"
            sx={{
                p: 2,
                borderRadius: 2,
                borderColor: "divider",
                bgcolor: "background.default",
            }}
        >
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                {title}
            </Typography>
            {children}
        </Paper>
    );
}