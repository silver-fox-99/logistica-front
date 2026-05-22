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
    ApiEntitlementKey,
    EntitlementKey, SubscriptionEntitlementInput,
    TariffSubscription,
    UpdateEntitlementsPayload,
} from "@/entities/tariff-plan/model/types";

type FormValues = {
    reason: string;
} & Record<string, string | boolean>;

const entitlementApiKeyMap: Record<EntitlementKey, ApiEntitlementKey> = {
    cargo_limit: "CARGO_LIMIT",
    vehicle_limit: "VEHICLE_LIMIT",
    can_auto_bump: "CAN_AUTO_BUMP",
    can_view_order_details: "CAN_VIEW_ORDER_DETAILS",
    order_details_views_per_day_limit: "ORDER_DETAILS_VIEWS_PER_DAY_LIMIT",
    can_create_companies: "CAN_CREATE_COMPANIES",
    company_limit: "COMPANY_LIMIT",
    members_per_company_limit: "MEMBERS_PER_COMPANY_LIMIT",
    active_tenders: "ACTIVE_TENDERS",
    can_view_tenders: "CAN_VIEW_TENDERS"
};

type Props = {
    open: boolean;
    subscription: TariffSubscription | null;
    onClose: () => void;
    onSubmit: (payload: UpdateEntitlementsPayload) => Promise<void> | void;
    loading?: boolean;
};

const getSubscriptionValueMap = (subscription: TariffSubscription | null) => {
    const map = new Map<string, { int_value?: number | null; bool_value?: boolean | null }>();

    subscription?.entitlements_overrides?.forEach((item) => {
        map.set(item.key, {
            int_value: item.int_value ?? null,
            bool_value: item.bool_value ?? null,
        });
    });

    subscription?.entitlements_overrides?.forEach((item) => {
        map.set(item.key, {
            int_value: item.int_value ?? null,
            bool_value: item.bool_value ?? null,
        });
    });

    return map;
};

const entitlementToFormDefaults = (subscription: TariffSubscription | null): FormValues => {
    const result: FormValues = {
        reason: "",
    };

    const overridesMap = getSubscriptionValueMap(subscription);

    ENTITLEMENTS.forEach((item) => {
        const apiKey = entitlementApiKeyMap[item.key];
        const overrideValue = overridesMap.get(apiKey);

        if (item.type === "boolean") {
            result[item.key] = Boolean(overrideValue?.bool_value);
            return;
        }

        if (overrideValue?.int_value === null || overrideValue?.int_value === undefined) {
            result[item.key] = "";
            return;
        }

        result[item.key] = String(overrideValue.int_value);
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

        const entitlements: SubscriptionEntitlementInput[] = ENTITLEMENTS.flatMap<SubscriptionEntitlementInput>((item) => {
            const rawValue = values[item.key];
            const apiKey = entitlementApiKeyMap[item.key];

            if (item.type === "boolean") {
                return [
                    {
                        key: apiKey,
                        bool_value: Boolean(rawValue),
                        reason,
                    },
                ];
            }

            if (rawValue === "" || rawValue === null || rawValue === undefined) {
                return [];
            }

            const parsed = Number(rawValue);

            if (!Number.isFinite(parsed) || parsed < 0) {
                return [];
            }

            return [
                {
                    key: apiKey,
                    int_value: parsed,
                    reason,
                },
            ];
        });

        await onSubmit({
            entitlements,
            replace: true,
        });
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
                                        inputProps={{ min: 0 }}
                                        helperText={item.hint || "Leave empty to remove override"}
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