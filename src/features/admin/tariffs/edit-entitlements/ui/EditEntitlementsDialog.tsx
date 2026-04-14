import { useEffect } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Stack,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { FiCheck, FiX } from "react-icons/fi";

import { ENTITLEMENTS } from "@/shared/config/entitlements";
import type {
    Entitlements,
    TariffSubscription,
} from "@/entities/tariff-plan/model/types";

type FormValues = {
    reason: string;
} & Record<string, string | boolean>;

type Props = {
    open: boolean;
    subscription: TariffSubscription | null;
    onClose: () => void;
    onSubmit: (entitlements: Entitlements, reason: string) => Promise<void> | void;
    loading?: boolean;
};

const entitlementToFormDefaults = (subscription: TariffSubscription | null): FormValues => {
    const source = subscription?.entitlements ?? {};

    const result: FormValues = {
        reason: "",
    };

    ENTITLEMENTS.forEach((item) => {
        const value = source[item.key];

        if (item.type === "boolean") {
            result[item.key] = Boolean(value);
            return;
        }

        result[item.key] = value === null || value === undefined ? "" : String(value);
    });

    return result;
};

export function EditEntitlementsDialog({
                                           open,
                                           subscription,
                                           onClose,
                                           onSubmit,
                                           loading = false,
                                       }: Props) {
    const { control, register, handleSubmit, reset } = useForm<FormValues>({
        defaultValues: entitlementToFormDefaults(subscription),
    });

    useEffect(() => {
        if (!open) return;
        reset(entitlementToFormDefaults(subscription));
    }, [open, subscription, reset]);

    const submitHandler = handleSubmit(async (values) => {
        const reason = String(values.reason || "").trim();

        const nextEntitlements: Partial<Record<keyof Entitlements, number | boolean | null>> = {};

        ENTITLEMENTS.forEach((item) => {
            const rawValue = values[item.key];

            if (item.type === "boolean") {
                nextEntitlements[item.key] = Boolean(rawValue);
                return;
            }

            if (rawValue === "" || rawValue === null || rawValue === undefined) {
                nextEntitlements[item.key] = null;
                return;
            }

            const parsed = Number(rawValue);
            nextEntitlements[item.key] = Number.isFinite(parsed) ? parsed : null;
        });

        await onSubmit(nextEntitlements as Entitlements, reason);
    });

    return (
        <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="md">
            <DialogTitle>Edit subscription entitlements</DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Override subscription limits and capabilities.
                    </Typography>

                    {ENTITLEMENTS.map((item) => {
                        if (item.type === "boolean") {
                            return (
                                <Controller
                                    key={item.key}
                                    name={item.key}
                                    control={control}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={Boolean(field.value)}
                                                    onChange={(_, checked) => field.onChange(checked)}
                                                />
                                            }
                                            label={item.label}
                                        />
                                    )}
                                />
                            );
                        }

                        return (
                            <Controller
                                key={item.key}
                                name={item.key}
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        label={item.label}
                                        type="number"
                                        fullWidth
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        );
                    })}

                    <TextField
                        label="Reason"
                        fullWidth
                        multiline
                        minRows={3}
                        {...register("reason")}
                    />
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} variant="outlined" startIcon={<FiX />} disabled={loading}>
                    Close
                </Button>
                <Button
                    onClick={submitHandler}
                    variant="contained"
                    startIcon={<FiCheck />}
                    disabled={loading}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}