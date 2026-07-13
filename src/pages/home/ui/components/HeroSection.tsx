import { Box, Typography, Button, Stack } from "@mui/material";
import Grid from "@mui/material/Grid";
import { FiCheck } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import heroDriverImg from "../hero-image.jpg";
import { FaArrowRight } from "react-icons/fa";

interface HeroSectionProps {
  isAuthenticated: boolean;
}

export default function HeroSection({ isAuthenticated }: HeroSectionProps) {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        backgroundImage: `url(${heroDriverImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        pt: { xs: 12, md: 20 },
        pb: { xs: 8, md: 12 },
        mb: 10,
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 3 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={4}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "2.25rem", sm: "3rem", md: "3.5rem" },
                  fontWeight: 600,
                  lineHeight: 1.15,
                  color: "primary.contrastText",
                }}
              >
                {t("homePage.heroTitle", "Найдите груз и транспорт за несколько минут")}
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: "1.1rem", md: "1.25rem" },
                  color: "primary.contrastText",
                  lineHeight: 1.6,
                  maxWidth: 600,
                }}
              >
                {t(
                  "homePage.heroSubtitle",
                  "Логистическая платформа для быстрого поиска и размещения грузов и транспорта",
                )}
              </Typography>

              <Box sx={{ pt: 1 }}>
                <Button
                  component={Link}
                  to={isAuthenticated ? "/dashboard/search" : "/auth/register"}
                  variant="contained"
                  color="primary"
                  size="large"
                  endIcon={<FaArrowRight />}
                  sx={{
                    px: 5,
                    py: 2,
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    borderRadius: "10px",
                    boxShadow: "0 10px 25px -5px rgba(15, 95, 194, 0.3)",
                  }}
                >
                  {t("homePage.registerNow", "Зарегистрироваться сейчас")}
                </Button>
              </Box>

              <Grid container direction="column" spacing={2} sx={{ pt: 3 }}>
                {[
                  t("homePage.noMiddlemen", "Без посредников"),
                  t("homePage.directContact", "Прямой контакт"),
                  t("homePage.noCommission", "Без комиссии"),
                  t("homePage.alwaysFree", "Всегда бесплатно"),
                ].map((text, i) => (
                  <Grid size={{ xs: 6, sm: 3 }} key={i}>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                          flexShrink: 0,
                        }}
                      >
                        <FiCheck size={14} strokeWidth={3} />
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: "primary.contrastText",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {text}
                      </Typography>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                position: "relative",
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: -30,
                  right: -30,
                  width: "110%",
                  height: "110%",
                  borderRadius: "24px",
                  background:
                    "radial-gradient(circle, rgba(15,95,194,0.06) 0%, rgba(15,95,194,0) 70%)",
                  zIndex: 0,
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
