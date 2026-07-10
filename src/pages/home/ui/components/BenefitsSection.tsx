import { Box, Typography, Stack } from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  FiUserPlus,
  FiSearch,
  FiMessageSquare,
  FiUser,
  FiBriefcase,
  FiLock,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
import featuresTruckImg from "../features-truck.jpg";
import featuresOperatorImg from "../features-operator.jpg";
import featuresPortImg from "../features-port.jpg";

export default function BenefitsSection() {
  const { t } = useTranslation();

  return (
    <Box
      id="benefits"
      sx={{ maxWidth: 1200, mx: "auto", px: 3, mb: 12, pt: 4 }}
    >
      <Stack
        spacing={1.5}
        sx={{ textAlign: "center", mb: 8, alignItems: "center" }}
      >
        <Typography
          variant="h2"
          sx={{ color: "text.primary", fontWeight: 800 }}
        >
          Создаем современную платформу для логистики и грузоперевозок
        </Typography>

        <Box sx={{ maxWidth: 750 }}>
          <Typography
            variant="body1"
            sx={{
              fontSize: "1.1rem",
              textAlign: "center",
              color: "text.secondary",
            }}
          >
            Наша компания — это современная онлайн-платформа в сфере логистики и
            грузоперевозок, созданная для удобного и безопасного взаимодействия
            между грузоотправителями, перевозчиками и водителями
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={6} alignItems="stretch">
        {/* Левая колонка: Список преимуществ */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Grid container spacing={4}>
            {[
              {
                title: t(
                  "homePage.userRegistration",
                  "Регистрация пользователей",
                ),
                desc: t(
                  "homePage.userRegistrationDesc",
                  "Для начала работы достаточно зарегистрироваться по номеру телефона и подтвердить его с помощью SMS-кода. После регистрации открывается личный кабинет с полным доступом ко всем возможностям платформы",
                ),
                icon: <FiUserPlus size={22} />,
                color: "#0F5FC2",
              },
              {
                title: t("homePage.cargoSearch", "Размещение и поиск грузов"),
                desc: t(
                  "homePage.cargoSearchDesc",
                  "Размещайте грузы или транспорт, указывайте маршрут, параметры перевозки и быстро находите подходящие предложения без лишних посредников",
                ),
                icon: <FiSearch size={22} />,
                color: "#0F5FC2",
              },
              {
                title: t(
                  "homePage.userInteraction",
                  "Взаимодействие между пользователями",
                ),
                desc: t(
                  "homePage.userInteractionDesc",
                  "Платформа обеспечивает прямую связь между заказчиками и перевозчиками, позволяя быстрее договариваться об условиях перевозки и сокращать время поиска партнёров",
                ),
                icon: <FiMessageSquare size={22} />,
                color: "#0F5FC2",
              },
              {
                title: t("homePage.personalAccount", "Личный кабинет"),
                desc: t(
                  "homePage.personalAccountDesc",
                  "Управляйте своими заявками, редактируйте профиль, отслеживайте статусы перевозок, получайте уведомления и контролируйте все процессы в одном месте.",
                ),
                icon: <FiUser size={22} />,
                color: "#0F5FC2",
              },
              {
                title: t(
                  "homePage.legalSupport",
                  "Юридическая и информационная поддержка",
                ),
                desc: t(
                  "homePage.legalSupportDesc",
                  "Зарегистрированные пользователи могут обратиться в службу поддержки и получить бесплатную консультацию по вопросам, связанным с грузоперевозками и работой платформы",
                ),
                icon: <FiBriefcase size={22} />,
                color: "#0F5FC2",
              },
              {
                title: t(
                  "homePage.securityConfidentiality",
                  "Безопасность и конфиденциальность",
                ),
                desc: t(
                  "homePage.securityConfidentialityDesc",
                  "Мы защищаем персональные данные пользователей и обеспечиваем безопасную работу сервиса. Все данные обрабатываются в соответствии с действующим законодательством",
                ),
                icon: <FiLock size={22} />,
                color: "#0F5FC2",
              },
            ].map((item, index) => (
              <Grid size={{ xs: 12, sm: 12 }} key={index}>
                <Stack
                  sx={{
                    backgroundColor: "brand.secondary",
                    p: 2,
                    borderRadius: 1,
                  }}
                  direction="row"
                  spacing={2}
                  alignItems="flex-start"
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 44,
                      height: 44,
                      borderRadius: "10px",
                      bgcolor: "rgba(15, 95, 194, 0.06)",
                      color: item.color,
                      flexShrink: 0,
                      mt: 0.5,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Stack spacing={0.5}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        fontSize: "1.05rem",
                        color: "text.primary",
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.55 }}
                    >
                      {item.desc}
                    </Typography>
                  </Stack>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Правая колонка: Сетка изображений и плашка "Наша цель" */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2.5} sx={{ height: "100%", justifyContent: "space-between" }}>
            {/* Верхняя большая картинка */}
            <Box
              component="img"
              src={featuresTruckImg}
              alt="White truck on road"
              sx={{
                width: "100%",
                flex: "1.2 1 200px",
                minHeight: 180,
                objectFit: "cover",
                borderRadius: "20px",
              }}
            />

            {/* Второй ряд: Блок "Наша цель" + Картинка с водителем */}
            <Grid container spacing={2.5} sx={{ flex: "1 1 180px", minHeight: 160 }}>
              <Grid size={6}>
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    bgcolor: "#031A30", // Глубокий темно-синий цвет из дизайна
                    borderRadius: "20px",
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    color: "#FFFFFF",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 900, letterSpacing: 1, mb: 1 }}
                  >
                    {t("homePage.ourGoal", "НАША ЦЕЛЬ -")}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      lineHeight: 1.4,
                      color: "rgba(255,255,255,0.8)",
                      fontSize: "0.8rem",
                    }}
                  >
                    {t(
                      "homePage.ourGoalDesc",
                      "создать надёжную логистическую экосистему, где каждый участник рынка сможет быстро находить партнёров, безопасно работать и развивать свой бизнес",
                    )}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={6}>
                <Box
                  component="img"
                  src={featuresOperatorImg}
                  alt="Driver with tablet"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "20px",
                  }}
                />
              </Grid>
            </Grid>

            {/* Третья нижняя картинка */}
            <Box
              component="img"
              src={featuresPortImg}
              alt="Industrial seaport cargo"
              sx={{
                width: "100%",
                flex: "1 1 180px",
                minHeight: 160,
                objectFit: "cover",
                borderRadius: "20px",
              }}
            />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
