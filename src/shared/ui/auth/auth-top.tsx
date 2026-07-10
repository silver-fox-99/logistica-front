import { Box, Typography } from "@mui/material";
import authIcon from "./icon.svg";

interface AuthTopProps {
  icon?: boolean;
  title: string;
  subtitle: string;
}

export default function AuthTop({ icon, title, subtitle }: AuthTopProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        mb: 4,
      }}
    >
      {icon && (
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            bgcolor: "rgba(15, 95, 194, 0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
          }}
        >
          <Box
            component="img"
            src={authIcon}
            alt="auth icon"
            sx={{ width: 24, height: 24 }}
          />
        </Box>
      )}
      <Typography
        variant="h3"
        sx={{ fontWeight: 800, mb: 1.5, color: "text.primary" }}
      >
        {title}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: "text.secondary",
          maxWidth: 400,
          fontSize: "0.95rem",
          lineHeight: 1.5,
        }}
      >
        {subtitle}
      </Typography>
    </Box>
  );
}
