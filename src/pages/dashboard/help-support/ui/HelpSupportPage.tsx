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
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { FiLifeBuoy, FiMail, FiHome, FiSearch, FiMessageSquare } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import animation from "./HelpCenter.json";

export default function HelpSupportPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <Box sx={{ minHeight: "calc(100dvh - 120px)", display: "grid", alignItems: "start", py: 3 }}>
            <Container maxWidth="lg">
                <Grid container spacing={3} alignItems="center">
                    {/* Left: Animation + actions */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card variant="outlined" sx={{ borderRadius: 4, borderColor: "divider", bgcolor: "background.paper" }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ maxWidth: 520, mx: "auto" }}>
                                    <Lottie animationData={animation} loop style={{ width: "100%", height: "auto" }} />
                                </Box>

                                <Stack spacing={1.5} sx={{ mt: 2 }}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <FiLifeBuoy />
                                        <Typography variant="h6" fontWeight={700}>{t("helpSupport.title")}</Typography>
                                    </Stack>
                                    <Typography variant="body2" color="text.secondary">
                                        {t("helpSupport.description")}
                                    </Typography>

                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 1 }}>
                                        <Button
                                            variant="contained"
                                            startIcon={<FiMail />}
                                            onClick={() => navigate("/dashboard/help/contact")}
                                        >
                                            {t("helpSupport.contactSupport")}
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            startIcon={<FiHome />}
                                            onClick={() => navigate("/dashboard")}
                                        >
                                            {t("helpSupport.backToDashboard")}
                                        </Button>
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Right: Placeholder search + quick links */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card variant="outlined" sx={{ borderRadius: 4, borderColor: "divider", bgcolor: "background.paper" }}>
                            <CardContent sx={{ p: 3 }}>
                                <Stack spacing={1.5}>
                                    <TextField
                                        placeholder={t("helpSupport.searchPlaceholder")}
                                        InputProps={{ startAdornment: <FiSearch style={{ marginRight: 8 }} /> as any }}
                                    />

                                    <Divider />

                                    <Typography variant="subtitle2" color="text.secondary">
                                        {t("helpSupport.quickLinks")}
                                    </Typography>
                                    <List dense disablePadding>
                                        <ListItemButton onClick={() => navigate("/dashboard/help/getting-started")}>
                                            <ListItemIcon><FiMessageSquare /></ListItemIcon>
                                            <ListItemText 
                                                primary={t("helpSupport.gettingStarted.title")} 
                                                secondary={t("helpSupport.gettingStarted.description")} 
                                            />
                                        </ListItemButton>
                                        <ListItemButton onClick={() => navigate("/dashboard/help/account-security")}>
                                            <ListItemIcon><FiMessageSquare /></ListItemIcon>
                                            <ListItemText 
                                                primary={t("helpSupport.accountSecurity.title")} 
                                                secondary={t("helpSupport.accountSecurity.description")} 
                                            />
                                        </ListItemButton>
                                        <ListItemButton onClick={() => navigate("/dashboard/help/billing")}>
                                            <ListItemIcon><FiMessageSquare /></ListItemIcon>
                                            <ListItemText 
                                                primary={t("helpSupport.billingPayments.title")} 
                                                secondary={t("helpSupport.billingPayments.description")} 
                                            />
                                        </ListItemButton>
                                    </List>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
