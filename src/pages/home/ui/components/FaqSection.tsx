import { Box, Stack, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { FiChevronDown } from "react-icons/fi";
import { useTranslation } from "react-i18next";

export default function FaqSection() {
    const { t } = useTranslation();

    return (
        <Box id="faq" sx={{ maxWidth: 800, mx: "auto", px: 3, mt: 10 }}>
            <Stack spacing={1.5} sx={{ textAlign: "center", mb: 6 }}>
                <Typography variant="h2">
                    {t("homePage.faqTitle", "Часто задаваемые вопросы")}
                </Typography>
                <Typography variant="body1" sx={{ fontSize: "1.1rem" }}>
                    {t("homePage.faqSubtitle", "Ответы на популярные вопросы о работе нашей логистической платформы")}
                </Typography>
            </Stack>

            <Box sx={{ mt: 4 }}>
                {[
                    {
                        q: t("homePage.faqQ1", "Как начать пользоваться платформой?"),
                        a: t("homePage.faqA1", "Для начала работы зарегистрируйтесь на платформе в качестве заказчика или перевозчика, подтвердите свои контактные данные и заполните информацию о компании в профиле.")
                    },
                    {
                        q: t("homePage.faqQ2", "Сколько стоят услуги платформы?"),
                        a: t("homePage.faqA2", "У нас есть полностью бесплатный тариф с базовыми лимитами на размещение объявлений и просмотр контактов. Для более активной работы вы можете выбрать профессиональный тариф.")
                    },
                    {
                        q: t("homePage.faqQ3", "Нужна ли верификация аккаунта?"),
                        a: t("homePage.faqA3", "Да, все компании проходят обязательную ручную проверку документов модератором для обеспечения безопасности сделок на платформе.")
                    },
                    {
                        q: t("homePage.faqQ4", "Как работает поиск транспорта?"),
                        a: t("homePage.faqA4", "Вы можете воспользоваться фильтрами в списке объявлений, указав точки отправления и прибытия, тип кузова и другие параметры для поиска подходящего транспорта.")
                    },
                    {
                        q: t("homePage.faqQ5", "Что делать если возникли вопросы?"),
                        a: t("homePage.faqA5", "Вы можете обратиться к разделу поддержки на платформе или связаться с нашей технической поддержкой по телефону или электронной почте.")
                    }
                ].map((item, index) => (
                    <Accordion key={index} variant="outlined">
                        <AccordionSummary
                            expandIcon={<FiChevronDown size={20} />}
                            aria-controls={`panel${index}-content`}
                            id={`panel${index}-header`}
                        >
                            <Typography sx={{ fontWeight: 700, fontSize: "1.05rem" }}>{item.q}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography sx={{ fontSize: "1rem", lineHeight: 1.6 }}>{item.a}</Typography>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Box>
        </Box>
    );
}
