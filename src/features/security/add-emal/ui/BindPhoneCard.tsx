import { useState } from "react";
import { Paper, Box, Button, Stack, Typography, Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { FiPhone, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { useUserStore } from "@/entities/user/model/user.store";
import { authApi } from "@/shared/api/authApi";
import { MuiTelInput } from "mui-tel-input";
import VerifyPhoneModal from "@/features/profile/ui/VerifyPhoneModal";

export function BindPhoneCard() {
    const { t } = useTranslation();
    const user = useUserStore((s) => s.user);
    const setUser = useUserStore((s) => s.setUser);
    const [modalOpen, setModalOpen] = useState(false);

    const phoneVerified = !!user?.phone_verified_at;
    const phone = user?.phone || "";

    const handleSuccess = async () => {
        try {
            const res = await authApi.getMe();
            setUser(res.data);
        } catch (err) {
            console.error("Failed to refresh user profile:", err);
        }
    };

    return (
        <Paper variant="outlined" sx={{ borderRadius: "16px", borderColor: "divider" }}>
            <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', bgcolor: '#EEF4F7', color: 'primary.main', flexShrink: 0 }}>
                        <FiPhone />
                    </Box>
                    <Typography variant="h6">{t('security.bindPhone.title')}</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" mb={2}>
                    {t('security.bindPhone.description')}
                </Typography>

                <Stack spacing={2} sx={{ mt: 1 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        {phone ? (
                            <MuiTelInput
                                value={phone}
                                disabled
                                defaultCountry="UZ"
                                forceCallingCode
                                sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: "action.disabledBackground" } }}
                            />
                        ) : (
                            <Typography variant="body1" color="text.secondary" sx={{ py: 1 }}>
                                {t('security.bindPhone.notSet')}
                            </Typography>
                        )}

                        {phone && (
                            <Chip
                                icon={phoneVerified ? <FiCheckCircle /> : <FiAlertCircle />}
                                label={phoneVerified ? t('security.bindPhone.verified') : t('security.bindPhone.unverified')}
                                color={phoneVerified ? "success" : "warning"}
                                variant="outlined"
                                sx={{ height: 40, px: 1 }}
                            />
                        )}
                    </Stack>

                    {!phoneVerified ? (
                        <Box sx={{ mt: 1 }}>
                            <Button
                                variant="contained"
                                onClick={() => setModalOpen(true)}
                                sx={{ textTransform: "none", borderRadius: "8px", px: 2.5 }}
                            >
                                {phone ? t('security.bindPhone.verifyButton') : t('security.bindPhone.bindButton')}
                            </Button>
                        </Box>
                    ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                            {t('security.bindPhone.supportChangeHint')}
                        </Typography>
                    )}
                </Stack>
            </Box>

            {modalOpen && (
                <VerifyPhoneModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSuccess={handleSuccess}
                    initialPhone={phone}
                />
            )}
        </Paper>
    );
}
