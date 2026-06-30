import { AddEmailCard } from "@/features/security/add-emal/ui/AddEmailCard";
import { Button, Card, CardContent, Container, Stack, Typography } from "@mui/material";
import {ChangePasswordCard} from "@/features/security/add-emal/ui/ChangePassword.tsx";
import { BindPhoneCard } from "@/features/security/add-emal/ui/BindPhoneCard";
import TelegramBindingCard from "@/features/profile/ui/TelegramBindingCard.tsx";
import NotificationSettingsCard from "@/features/profile/ui/NotificationSettingsCard.tsx";
import { useTranslation } from "react-i18next";


export default function SecurityPage() {
    const { t } = useTranslation();
    const agreementUrl = "/docs/user-agreement.pdf";

    return (
        <Container maxWidth="md" sx={{ py: 3 }}>
            <Stack spacing={3}>
                <AddEmailCard />
                <BindPhoneCard />
                <ChangePasswordCard />
                <TelegramBindingCard />
                <NotificationSettingsCard />
                <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "divider" }}>
                    <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                        <Stack spacing={1.5}>
                            <Typography variant="h6" fontWeight={700}>
                                {t("security.userAgreementTitle")}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t("security.userAgreementDescription")}
                            </Typography>
                            <Button
                                component="a"
                                href={agreementUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="contained"
                                sx={{ alignSelf: "flex-start", textTransform: "none", borderRadius: 2, px: 2.5, height: 44 }}
                            >
                                {t("security.userAgreementOpen")}
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            </Stack>
        </Container>
    );
}
