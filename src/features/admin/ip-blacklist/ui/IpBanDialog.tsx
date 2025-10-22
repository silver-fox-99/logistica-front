import { useEffect, useMemo, useState } from "react";
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
    Stack, TextField, FormControlLabel, Switch, Alert
} from "@mui/material";
import { z } from "zod";

// Схема принимает строки из инпутов, а пустые строки конвертим в undefined.
const submitSchema = z.object({
    network: z.string().trim().min(1, "Сетевой адрес обязателен").max(100, "Слишком долго"),
    reason: z.string().trim().optional().transform(v => (v === "" ? undefined : v)),
    is_active: z.boolean(),
    expiresAt: z.string().trim().optional()
        .transform(v => (v === "" ? undefined : v))
        .refine((v) => !v || !Number.isNaN(Date.parse(v)), { message: "Невалидная дата ISO" }),
});

export type IpBanFormValues = z.infer<typeof submitSchema>;

type Props = {
    open: boolean;
    title: string;
    defaultValues?: Partial<IpBanFormValues>;
    onClose: () => void;
    onSubmit: (v: IpBanFormValues) => Promise<void> | void;
    submitting?: boolean;
};

export default function IpBanDialog({
                                        open, title, defaultValues, onClose, onSubmit, submitting
                                    }: Props) {
    // локальные поля формы
    const [network, setNetwork]     = useState("");
    const [reason, setReason]       = useState<string | undefined>("");
    const [expiresAt, setExpiresAt] = useState<string | undefined>("");
    const [isActive, setIsActive]   = useState(true);

    // ошибки по полям
    const [errors, setErrors] = useState<Partial<Record<keyof IpBanFormValues, string>>>({});
    const hasErrors = useMemo(() => Object.values(errors).some(Boolean), [errors]);

    // инициализация значений при открытии/редактировании
    useEffect(() => {
        setNetwork(defaultValues?.network ?? "");
        setReason((defaultValues?.reason as any) ?? "");
        setExpiresAt((defaultValues?.expiresAt as any) ?? "");
        setIsActive(defaultValues?.is_active ?? true);
        setErrors({});
    }, [defaultValues, open]);

    const handleSave = async () => {
        const candidate = {
            network,
            reason: reason ?? "",
            is_active: !!isActive,
            expiresAt: expiresAt ?? "",
        };

        const parsed = submitSchema.safeParse(candidate);
        if (!parsed.success) {
            // раскладываем ошибки по полям
            const fieldErrors: Partial<Record<keyof IpBanFormValues, string>> = {};
            for (const issue of parsed.error.issues) {
                const path = issue.path[0] as keyof IpBanFormValues;
                if (!fieldErrors[path]) fieldErrors[path] = issue.message;
            }
            setErrors(fieldErrors);
            return;
        }

        // нормализованные данные ("" уже убраны как undefined)
        const value = parsed.data;
        await onSubmit(value);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        label="Сетевой адрес (IP или CIDR)"
                        placeholder="203.0.113.7 or 203.0.113.0/24"
                        value={network}
                        onChange={(e) => setNetwork(e.target.value)}
                        error={!!errors.network}
                        helperText={errors.network}
                        autoFocus
                    />

                    <TextField
                        label="Причина"
                        multiline
                        minRows={2}
                        value={reason ?? ""}
                        onChange={(e) => setReason(e.target.value)}
                        error={!!errors.reason}
                        helperText={errors.reason}
                    />

                    <TextField
                        label="Истекает (ISO, опционально)"
                        placeholder="2025-12-31T23:59:59.000Z"
                        value={expiresAt ?? ""}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        error={!!errors.expiresAt}
                        helperText={errors.expiresAt}
                    />

                    <FormControlLabel
                        control={
                            <Switch checked={isActive} onChange={(_, v) => setIsActive(v)} />
                        }
                        label="Активен"
                    />

                    {hasErrors && (
                        <Alert severity="warning" variant="outlined">
                            Пожалуйста, исправьте ошибки выше и попробуйте снова.
                        </Alert>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Отмена</Button>
                <Button variant="contained" onClick={handleSave} disabled={submitting}>
                    {submitting ? "Сохранение…" : "Сохранить"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
