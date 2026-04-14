import { useEffect } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    MenuItem,
    Stack,
    Switch,
    TextField,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { FiX, FiCheck } from "react-icons/fi";

import type { TariffPlan } from "@/entities/tariff-plan/model/types";

type FormValues = {
    plan_id: string;
    starts_at: string;
    ends_at: string;
    lifetime: boolean;
    note: string;
    source: string;
    cancel_previous: boolean;
};

type Props = {
    open: boolean;
    onClose: () => void;
    plans: TariffPlan[];
    loading?: boolean;
    onSubmit: (payload: {
        plan_id: string;
        starts_at?: string | null;
        ends_at?: string | null;
        lifetime?: boolean;
        note?: string | null;
        source?: string | null;
        cancel_previous?: boolean;
    }) => Promise<void> | void;
};

export function IssueSubscriptionDialog({
                                            open,
                                            onClose,
                                            plans,
                                            loading = false,
                                            onSubmit,
                                        }: Props) {
    const { register, watch, handleSubmit, reset, setValue } = useForm<FormValues>({
        defaultValues: {
            plan_id: "",
            starts_at: "",
            ends_at: "",
            lifetime: false,
            note: "",
            source: "ADMIN",
            cancel_previous: true,
        },
    });

    const lifetime = watch("lifetime");

    useEffect(() => {
        if (!open) return;

        reset({
            plan_id: plans[0]?.id ?? "",
            starts_at: "",
            ends_at: "",
            lifetime: false,
            note: "",
            source: "ADMIN",
            cancel_previous: true,
        });
    }, [open, plans, reset]);

    const submitHandler = handleSubmit(async (values) => {
        await onSubmit({
            plan_id: values.plan_id,
            starts_at: values.starts_at || null,
            ends_at: values.lifetime ? null : values.ends_at || null,
            lifetime: values.lifetime,
            note: values.note.trim() || null,
            source: values.source.trim() || null,
            cancel_previous: values.cancel_previous,
        });
    });

    return (
        <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
            <DialogTitle>Назначить тариф</DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    <TextField
                        select
                        label="Tariff plan"
                        fullWidth
                        {...register("plan_id", { required: true })}
                    >
                        {plans.map((plan) => (
                            <MenuItem key={plan.id} value={plan.id}>
                                {plan.name} ({plan.code})
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="Start date"
                        type="datetime-local"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        {...register("starts_at")}
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={lifetime}
                                onChange={(_, checked) => setValue("lifetime", checked)}
                            />
                        }
                        label="Lifetime subscription"
                    />

                    {!lifetime && (
                        <TextField
                            label="End date"
                            type="datetime-local"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            {...register("ends_at")}
                        />
                    )}

                    <TextField
                        label="Source"
                        fullWidth
                        {...register("source")}
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                defaultChecked
                                onChange={(_, checked) => setValue("cancel_previous", checked)}
                            />
                        }
                        label="Cancel previous active subscription"
                    />

                    <TextField
                        label="Note"
                        fullWidth
                        multiline
                        minRows={3}
                        {...register("note")}
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
                    Assign
                </Button>
            </DialogActions>
        </Dialog>
    );
}