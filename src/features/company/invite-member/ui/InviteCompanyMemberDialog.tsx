import { useEffect, useState } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { CompanyMemberRole } from "@/entities/company/model/types";

type Props = {
    open: boolean;
    isSubmitting?: boolean;
    onClose: () => void;
    onSubmit: (payload: {
        email?: string;
        phone?: string;
        role: CompanyMemberRole;
        message?: string;
    }) => Promise<void> | void;
};

const roleOptions: CompanyMemberRole[] = ["ADMIN", "MANAGER", "LOGIST", "VIEWER"];

export function InviteCompanyMemberDialog({
                                              open,
                                              isSubmitting = false,
                                              onClose,
                                              onSubmit,
                                          }: Props) {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState<CompanyMemberRole>("VIEWER");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!open) {
            setEmail("");
            setPhone("");
            setRole("VIEWER");
            setMessage("");
        }
    }, [open]);

    const handleSubmit = async () => {
        await onSubmit({
            email: email.trim() || undefined,
            phone: phone.trim() || undefined,
            role,
            message: message.trim() || undefined,
        });
    };

    return (
        <Dialog open={open} onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth="sm">
            <DialogTitle>{t("companyTeam.inviteDialog.title")}</DialogTitle>

            <DialogContent>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    <TextField
                        label={t("companyTeam.inviteDialog.email")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label={t("companyTeam.inviteDialog.phone")}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label={t("companyTeam.inviteDialog.role")}
                        select
                        value={role}
                        onChange={(e) => setRole(e.target.value as CompanyMemberRole)}
                        fullWidth
                    >
                        {roleOptions.map((item) => (
                            <MenuItem key={item} value={item}>
                                {t(`companyRoles.${item}`)}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label={t("companyTeam.inviteDialog.message")}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        fullWidth
                        multiline
                        minRows={3}
                    />
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={isSubmitting}>
                    {t("companyTeam.inviteDialog.cancel")}
                </Button>
                <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}>
                    {t("companyTeam.inviteDialog.sendInvitation")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}