import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Divider,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { FiLifeBuoy, FiMail, FiHome, FiSearch, FiMessageSquare, FiPhone } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import animation from "./HelpCenter.json";

export default function HelpSupportPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const faqs = [
        { q: t("helpSupport.faq.q1"), a: t("helpSupport.faq.a1") },
        { q: t("helpSupport.faq.q2"), a: t("helpSupport.faq.a2") },
        { q: t("helpSupport.faq.q3"), a: t("helpSupport.faq.a3") },
        { q: t("helpSupport.faq.q4"), a: t("helpSupport.faq.a4") },
        { q: t("helpSupport.faq.q5"), a: t("helpSupport.faq.a5") },
        { q: t("helpSupport.faq.q6"), a: t("helpSupport.faq.a6") },
    ];

    return (
        <Box sx={{ minHeight: "calc(100dvh - 120px)", display: "grid", alignItems: "start", py: 3 }}>
            <Container maxWidth="lg">
                <Stack spacing={3}>
                    <Card variant="outlined" sx={{ borderRadius: 4, borderColor: "divider", bgcolor: "background.paper" }}>
                        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                            <Stack spacing={3} direction={{ xs: "column", md: "row" }} alignItems="center">
                                <Box sx={{ width: { xs: "100%", md: "45%" }, maxWidth: 520, mx: "auto" }}>
                                    <Lottie animationData={animation} loop style={{ width: "100%", height: "auto" }} />
                                </Box>

                                <Stack spacing={1.5} sx={{ flex: 1, width: "100%" }}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <FiLifeBuoy size={18} />
                                        <Typography variant="h6" fontWeight={700}>{t("helpSupport.title")}</Typography>
                                    </Stack>
                                    <Typography variant="body2" color="text.secondary">
                                        {t("helpSupport.description")}
                                    </Typography>

                                    <Stack direction="column" spacing={1.25} sx={{ mt: 1, width: "100%" }}>
                                        <Button
                                            onClick={() => navigate("/dashboard/help/contact")}
                                            sx={{
                                                height: 48,
                                                borderRadius: 2,
                                                textTransform: "none",
                                                fontWeight: 700,
                                                px: 2.75,
                                                gap: 1,
                                                display: "inline-flex",
                                                alignItems: "center",
                                                justifyContent: "flex-start",
                                                color: "#fff",
                                                bgcolor: "primary.main",
                                                boxShadow: "none",
                                                "&:hover": { bgcolor: "primary.dark", boxShadow: "none" },
                                                width: "100%",
                                            }}
                                        >
                                            <FiMail size={18} />
                                            {t("helpSupport.contactSupport")}
                                        </Button>

                                        <Button
                                            onClick={() => navigate("/dashboard")}
                                            sx={{
                                                height: 48,
                                                borderRadius: 2,
                                                textTransform: "none",
                                                fontWeight: 700,
                                                px: 2.75,
                                                gap: 1,
                                                display: "inline-flex",
                                                alignItems: "center",
                                                justifyContent: "flex-start",
                                                color: "text.primary",
                                                bgcolor: "background.default",
                                                border: "1px solid",
                                                borderColor: "divider",
                                                boxShadow: "none",
                                                "&:hover": { bgcolor: "action.hover", borderColor: "primary.main" },
                                                width: "100%",
                                            }}
                                        >
                                            <FiHome size={18} color="#4472B8" />
                                            {t("helpSupport.backToDashboard")}
                                        </Button>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Card variant="outlined" sx={{ borderRadius: 4, borderColor: "divider", bgcolor: "background.paper" }}>
                        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                            <Stack spacing={2.5}>
                                <TextField
                                    placeholder={t("helpSupport.searchPlaceholder")}
                                    InputProps={{ startAdornment: <FiSearch style={{ marginRight: 8 }} /> as any }}
                                    fullWidth
                                />

                                <Divider />

                                <Typography variant="subtitle1" fontWeight={700}>
                                    {t("helpSupport.quickLinks")}
                                </Typography>
                                <Stack spacing={1.25}>
                                    <Box
                                        component="a"
                                        href="/introduction.pdf"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            border: "1px solid",
                                            borderColor: "divider",
                                            bgcolor: "background.default",
                                            display: "flex",
                                            gap: 1.5,
                                            alignItems: "flex-start",
                                            cursor: "pointer",
                                            transition: "all 0.2s ease",
                                            textDecoration: "none",
                                            color: "inherit",
                                            "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
                                        }}
                                    >
                                        <Box sx={{ p: 1, borderRadius: "50%", bgcolor: "primary.light", color: "primary.dark", display: "inline-flex" }}>
                                            <FiMessageSquare size={18} />
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={700}>{t("helpSupport.gettingStarted.title")}</Typography>
                                            <Typography variant="body2" color="text.secondary">{t("helpSupport.gettingStarted.description")}</Typography>
                                        </Box>
                                    </Box>

                                    <Box
                                        component="a"
                                        href="/account-security.pdf"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            border: "1px solid",
                                            borderColor: "divider",
                                            bgcolor: "background.default",
                                            display: "flex",
                                            gap: 1.5,
                                            alignItems: "flex-start",
                                            cursor: "pointer",
                                            transition: "all 0.2s ease",
                                            textDecoration: "none",
                                            color: "inherit",
                                            "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
                                        }}
                                    >
                                        <Box sx={{ p: 1, borderRadius: "50%", bgcolor: "success.light", color: "success.dark", display: "inline-flex" }}>
                                            <FiMessageSquare size={18} />
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={700}>{t("helpSupport.accountSecurity.title")}</Typography>
                                            <Typography variant="body2" color="text.secondary">{t("helpSupport.accountSecurity.description")}</Typography>
                                        </Box>
                                    </Box>

                                    <Box
                                        component="a"
                                        href="/payments-billing.pdf"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            border: "1px solid",
                                            borderColor: "divider",
                                            bgcolor: "background.default",
                                            display: "flex",
                                            gap: 1.5,
                                            alignItems: "flex-start",
                                            cursor: "pointer",
                                            transition: "all 0.2s ease",
                                            textDecoration: "none",
                                            color: "inherit",
                                            "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
                                        }}
                                    >
                                        <Box sx={{ p: 1, borderRadius: "50%", bgcolor: "warning.light", color: "warning.dark", display: "inline-flex" }}>
                                            <FiMessageSquare size={18} />
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={700}>{t("helpSupport.billingPayments.title")}</Typography>
                                            <Typography variant="body2" color="text.secondary">{t("helpSupport.billingPayments.description")}</Typography>
                                        </Box>
                                    </Box>
                                </Stack>

                                <Divider />

                                <Typography variant="subtitle1" fontWeight={700}>
                                    {t("helpSupport.faq.title")}
                                </Typography>
                                <Stack spacing={1.25}>
                                    {faqs.map((item, idx) => (
                                        <Box key={idx} sx={{ p: 1.5, borderRadius: 2, bgcolor: "background.default", border: "1px solid", borderColor: "divider" }}>
                                            <Typography variant="subtitle2" fontWeight={600}>{item.q}</Typography>
                                            <Typography variant="body2" color="text.secondary">{item.a}</Typography>
                                        </Box>
                                    ))}
                                </Stack>

                                <Divider />

                                <Typography variant="subtitle1" fontWeight={700}>
                                    {t("helpSupport.support.title")}
                                </Typography>
                                <Stack spacing={1.25}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <FiMail size={18} />
                                        <Typography variant="body2" color="text.secondary">{t("helpSupport.support.email")} info@yologistic.uz</Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <FiPhone size={18} />
                                        <Typography variant="body2" color="text.secondary">{t("helpSupport.support.phone")} +998 94 986 68 86</Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <FiMessageSquare size={18} />
                                        <Typography variant="body2" color="text.secondary">{t("helpSupport.support.chat")}</Typography>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                </Stack>
            </Container>
        </Box>
    );
}
