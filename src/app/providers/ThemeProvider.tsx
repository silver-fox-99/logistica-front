import type { PropsWithChildren } from "react";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import "@mui/material/styles";

declare module "@mui/material/styles" {
  interface BrandColors {
    // main: string;
    // light?: string;
    // dark?: string;
    secondary?: string;
  }

  interface Palette {
    brand: BrandColors;
  }

  interface PaletteOptions {
    brand?: BrandColors;
  }
}
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0F5FC2", // Premium vibrant blue
      light: "#3B82F6",
      dark: "#0C4B9B",
      contrastText: "#FFFFFF",
    },
    brand: {
      secondary: "#F2F4F7",
    },
    background: {
      default: "#ffffff", // Light slate background
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0F172A", // Slate-900
      secondary: "#475569", // Slate-600
    },
    divider: "#E2E8F0", // Slate-200
  },
  typography: {
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 16,
    htmlFontSize: 16,
    h1: {
      fontWeight: 800,
      fontSize: "2.5rem", // 40px
      lineHeight: 1.2,
      color: "#0F172A",
    },
    h2: {
      fontWeight: 800,
      fontSize: "2rem", // 32px
      lineHeight: 1.3,
      color: "#0F172A",
    },
    h3: {
      fontWeight: 800,
      fontSize: "1.75rem", // 28px
      lineHeight: 1.3,
      color: "#0F172A",
    },
    h4: {
      fontWeight: 800,
      fontSize: "1.5rem", // 24px
      lineHeight: 1.35,
      color: "#0F172A",
    },
    h5: {
      fontWeight: 700,
      fontSize: "1.25rem", // 20px
      lineHeight: 1.4,
      color: "#0F172A",
    },
    h6: {
      fontWeight: 700,
      fontSize: "1rem", // 16px
      lineHeight: 1.4,
      color: "#0F172A",
    },
    body1: {
      fontSize: "1rem", // 16px
      lineHeight: 1.5,
      color: "#475569",
    },
    body2: {
      fontSize: "0.875rem", // 14px
      lineHeight: 1.57,
      color: "#475569",
    },
    button: {
      textTransform: "none",
      fontWeight: 700,
      fontSize: "1rem",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "10px",
          padding: "10px 20px",
          boxShadow: "none",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: "none",
          },
        },
        containedPrimary: {
          backgroundColor: "#0F5FC2",
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: "#0B4B9B",
          },
        },
        outlinedPrimary: {
          borderColor: "#E2E8F0",
          color: "#0F5FC2",
          "&:hover": {
            borderColor: "#0F5FC2",
            backgroundColor: "rgba(15, 95, 194, 0.04)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow:
            "0px 1px 3px rgba(0, 0, 0, 0.05), 0px 1px 2px rgba(0, 0, 0, 0.02)",
        },
        outlined: {
          borderColor: "#E2E8F0",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: "48px",
          fontWeight: 600,
          textTransform: "none",
          fontSize: "0.95rem",
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          border: "1px solid #E2E8F0",
          borderRadius: "12px",
          transition: "all 0.2s ease-in-out",
          "&::before": {
            display: "none",
          },
          "&.Mui-expanded": {
            margin: 0,
            borderColor: "#0F5FC2",
            boxShadow: "0px 4px 20px rgba(15, 95, 194, 0.05)",
          },
          "&:not(:last-of-type)": {
            marginBottom: "12px",
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          padding: "8px 24px",
          fontWeight: 600,
          fontSize: "1rem",
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: "8px 24px 24px 24px",
          color: "#475569",
          fontSize: "1rem",
          lineHeight: 1.6,
        },
      },
    },
  },
});

export default function AppThemeProvider({ children }: PropsWithChildren) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
