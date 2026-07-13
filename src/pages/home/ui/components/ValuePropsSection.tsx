import { Box, Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { FiStar, FiPhoneCall, FiShield } from "react-icons/fi";
import { useTranslation } from "react-i18next";

export default function ValuePropsSection() {
  const { t } = useTranslation();

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: 3, mb: 12 }}>
      <Grid container spacing={4}>
        {[
          {
            title: t("homePage.ratingsTitle", "Отзывы и рейтинги"),
            desc: t(
              "homePage.ratingsDesc",
              "Оценивайте надежность партнеров и оставляйте честные отзывы по результатам выполненных перевозок.",
            ),
            icon: <FiStar size={26} />,
            color: "warning.main",
          },
          {
            title: t("homePage.driverDirectTitle", "Прямая связь с водителем"),
            desc: t(
              "homePage.driverDirectDesc",
              "Связывайтесь напрямую с исполнителем заказа без посредников, переплат и дополнительных комиссионных сборов.",
            ),
            icon: <FiPhoneCall size={26} />,
            color: "primary.main",
          },
          {
            title: t(
              "homePage.securityTitle",
              "Безопасность и конфиденциальность",
            ),
            desc: t(
              "homePage.securityDesc",
              "Ваши персональные данные и транспортные документы надежно защищены современными алгоритмами шифрования.",
            ),
            icon: <FiShield size={26} />,
            color: "success.main",
          },
        ].map((item, i) => (
          <Grid size={{ xs: 12, md: 4 }} key={i}>
            <Paper
              variant="outlined"
              sx={{
                p: 4,
                borderRadius: "16px",
                height: "100%",
                bgcolor: "#F8FAFC",
                borderColor: "transparent",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "background.paper",
                  borderColor: "divider",
                  boxShadow: "0 10px 25px -10px rgba(0,0,0,0.05)",
                  transform: "translateY(-4px)",
                },
              }}
            >
              <Box sx={{ color: item.color, mb: 2 }}>{item.icon}</Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {item.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.6 }}
              >
                {item.desc}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
