import type { ReactNode } from "react";
import { Box, Paper, Typography } from "@mui/material";

export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  icon: ReactNode;
}

export default function PageHeader({ title, subtitle, icon }: PageHeaderProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.25,
        borderRadius: "16px",
        mb: 2,
        display: "flex",
        alignItems: "center",
        gap: 2,
        bgcolor: "background.paper",
        borderColor: "divider",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: "12px",
          bgcolor: "rgba(15, 95, 194, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "primary.main",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: "text.primary",
            letterSpacing: "-0.02em",
            mb: 0.25,
            fontSize: { xs: "1.15rem", sm: "1.25rem" },
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontWeight: 500,
              fontSize: { xs: "0.85rem", sm: "0.9rem" },
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
