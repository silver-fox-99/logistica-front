import { useState } from "react";
import { Paper, Box, Button, Stack, Typography, Chip, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { FiMail, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { useUserStore } from "@/entities/user/model/user.store";
import { authApi } from "@/shared/api/authApi";
import VerifyEmailModal from "./VerifyEmailModal";

export function AddEmailCard() {
    const { t } = useTranslation();
    const user = useUserStore((s) => s.user);
    const setUser = useUserStore((s) => s.setUser);
    const [modalOpen, setModalOpen] = useState(false);

    const emailVerified = !!user?.email_verified_at;
    const email = user?.email || "";

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
                        <FiMail />
                    </Box>
                    <Typography variant="h6">{t('security.addEmail.title')}</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" mb={2}>
                    {t('security.addEmail.description')}
                </Typography>

                <Stack spacing={2} sx={{ mt: 1 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        {email ? (
                            <TextField
                                value={email}
                                disabled
                                fullWidth
                                placeholder="email@example.com"
                                InputProps={{
                                    startAdornment: (
                                        <Typography sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                                            <FiMail />
                                        </Typography>
                                    ),
                                }}
                                sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: "action.disabledBackground" } }}
                            />
                        ) : (
                            <Typography variant="body1" color="text.secondary" sx={{ py: 1 }}>
                                {t('security.addEmail.notSet')}
                            </Typography>
                        )}

                        {email && (
                            <Chip
                                icon={emailVerified ? <FiCheckCircle /> : <FiAlertCircle />}
                                label={emailVerified ? t('security.addEmail.verified') : t('security.addEmail.unverified')}
                                color={emailVerified ? "success" : "warning"}
                                variant="outlined"
                                sx={{ height: 40, px: 1 }}
                            />
                        )}
                    </Stack>

                    {!emailVerified ? (
                        <Box sx={{ mt: 1 }}>
                            <Button
                                variant="contained"
                                onClick={() => setModalOpen(true)}
                                sx={{ textTransform: "none", borderRadius: "8px", px: 2.5 }}
                            >
                                {email ? t('security.addEmail.verifyButton') : t('security.addEmail.bindButton')}
                            </Button>
                        </Box>
                    ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                            {t('security.addEmail.supportChangeHint')}
                        </Typography>
                    )}
                </Stack>
            </Box>

            {modalOpen && (
                <VerifyEmailModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSuccess={handleSuccess}
                    initialEmail={email}
                />
            )}
        </Paper>
    );
}
