import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Alert,
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

import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import type { AutoBumpTargetType } from "@/entities/listing-auto-bump/model/types";
import {
    deleteListingAutoBump,
    getListingAutoBump,
    toggleListingAutoBump,
    upsertListingAutoBump,
} from "@/shared/api/listingAutoBumpApi";

type Props = {
    open: boolean;
    targetType: AutoBumpTargetType;
    targetId: string | null;
    onClose: () => void;
    onSaved?: () => void;
};

const DEFAULT_INTERVAL = 30;
const DEFAULT_DURATION = 1;

const toDateTimeLocalValue = (value?: string | null) => {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const offsetMs = date.getTimezoneOffset() * 60 * 1000;
    const localDate = new Date(date.getTime() - offsetMs);

    return localDate.toISOString().slice(0, 16);
};

export function ListingAutoBumpDialog({
                                          open,
                                          targetType,
                                          targetId,
                                          onClose,
                                          onSaved,
                                      }: Props) {
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [removing, setRemoving] = useState(false);
    const [toggling, setToggling] = useState(false);

    const [intervalMinutes, setIntervalMinutes] = useState<number>(DEFAULT_INTERVAL);
    const [durationDays, setDurationDays] = useState<number>(DEFAULT_DURATION);
    const [startsAt, setStartsAt] = useState<string>("");
    const [enabled, setEnabled] = useState(true);
    const [exists, setExists] = useState(false);
    const [lastError, setLastError] = useState<string | null>(null);

    const canSubmit = useMemo(() => {
        return (
            !!targetId &&
            Number.isFinite(intervalMinutes) &&
            intervalMinutes >= 30 &&
            Number.isFinite(durationDays) &&
            durationDays >= 1 &&
            durationDays <= 3
        );
    }, [durationDays, intervalMinutes, targetId]);

    const loadData = useCallback(async () => {
        if (!open || !targetId) {
            return;
        }

        setLoading(true);
        setLastError(null);

        try {
            const response = await getListingAutoBump(targetType, targetId);
            const entity = response.data;

            if (!entity) {
                setExists(false);
                setEnabled(true);
                setIntervalMinutes(DEFAULT_INTERVAL);
                setDurationDays(DEFAULT_DURATION);
                setStartsAt("");
                setLastError(null);
                return;
            }

            setExists(true);
            setEnabled(entity.is_enabled);
            setIntervalMinutes(entity.interval_minutes);
            setDurationDays(entity.duration_days);
            setStartsAt(toDateTimeLocalValue(entity.starts_at));
            setLastError(entity.last_error);
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                t("listingAutoBump.messages.loadError", {
                    defaultValue: "Failed to load auto bump settings.",
                })
            );
        } finally {
            setLoading(false);
        }
    }, [open, targetId, targetType, t]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSave = useCallback(async () => {
        if (!targetId || !canSubmit) {
            return;
        }

        setSubmitting(true);

        try {
            await upsertListingAutoBump({
                targetType,
                targetId,
                intervalMinutes,
                durationDays,
                startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
            });

            toast.success(
                t("listingAutoBump.messages.saved", {
                    defaultValue: "Auto bump settings saved.",
                })
            );

            onSaved?.();
            onClose();
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                t("listingAutoBump.messages.saveError", {
                    defaultValue: "Failed to save auto bump settings.",
                })
            );
        } finally {
            setSubmitting(false);
        }
    }, [
        canSubmit,
        durationDays,
        intervalMinutes,
        onClose,
        onSaved,
        startsAt,
        targetId,
        targetType,
        t,
    ]);

    const handleDelete = useCallback(async () => {
        if (!targetId) {
            return;
        }

        setRemoving(true);

        try {
            await deleteListingAutoBump(targetType, targetId);

            toast.success(
                t("listingAutoBump.messages.deleted", {
                    defaultValue: "Auto bump removed.",
                })
            );

            onSaved?.();
            onClose();
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                t("listingAutoBump.messages.deleteError", {
                    defaultValue: "Failed to remove auto bump.",
                })
            );
        } finally {
            setRemoving(false);
        }
    }, [onClose, onSaved, targetId, targetType, t]);

    const handleToggle = useCallback(async () => {
        if (!targetId || !exists) {
            return;
        }

        setToggling(true);

        try {
            const response = await toggleListingAutoBump(targetType, targetId);
            setEnabled(response.data.is_enabled);

            toast.success(
                response.data.is_enabled
                    ? t("listingAutoBump.messages.enabled", {
                        defaultValue: "Auto bump enabled.",
                    })
                    : t("listingAutoBump.messages.disabled", {
                        defaultValue: "Auto bump disabled.",
                    })
            );

            onSaved?.();
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                t("listingAutoBump.messages.toggleError", {
                    defaultValue: "Failed to change auto bump status.",
                })
            );
        } finally {
            setToggling(false);
        }
    }, [exists, onSaved, targetId, targetType, t]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {t("listingAutoBump.title", {
                    defaultValue: "Auto bump settings",
                })}
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        {t("listingAutoBump.description", {
                            defaultValue:
                                "Configure automatic bumping for this listing. Minimum interval is 5 minutes and maximum duration is 3 days.",
                        })}
                    </Typography>

                    {lastError && <Alert severity="warning">{lastError}</Alert>}

                    <TextField
                        label={t("listingAutoBump.fields.intervalMinutes", {
                            defaultValue: "Interval in minutes",
                        })}
                        type="number"
                        value={intervalMinutes}
                        onChange={(event) => setIntervalMinutes(Number(event.target.value))}
                        inputProps={{ min: 30, step: 5 }}
                        disabled={loading || submitting}
                        fullWidth
                    />

                    <TextField
                        label={t("listingAutoBump.fields.durationDays", {
                            defaultValue: "Duration in days",
                        })}
                        type="number"
                        value={durationDays}
                        onChange={(event) => setDurationDays(Number(event.target.value))}
                        inputProps={{ min: 1, max: 3, step: 1 }}
                        disabled={loading || submitting}
                        fullWidth
                    />

                    <TextField
                        label={t("listingAutoBump.fields.startsAt", {
                            defaultValue: "Start time",
                        })}
                        type="datetime-local"
                        value={startsAt}
                        onChange={(event) => setStartsAt(event.target.value)}
                        disabled={loading || submitting}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                    />

                    {exists && (
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={enabled}
                                    onChange={handleToggle}
                                    disabled={toggling || loading}
                                />
                            }
                            label={t("listingAutoBump.fields.enabled", {
                                defaultValue: "Enabled",
                            })}
                        />
                    )}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                {exists && (
                    <Button
                        color="error"
                        onClick={handleDelete}
                        disabled={removing || submitting || loading}
                    >
                        {t("listingAutoBump.actions.remove", {
                            defaultValue: "Remove",
                        })}
                    </Button>
                )}

                <Button onClick={onClose}>
                    {t("common.cancel", { defaultValue: "Cancel" })}
                </Button>

                <Button
                    variant="contained"
                    onClick={handleSave}
                    loading={submitting}
                    disabled={!canSubmit || loading}
                >
                    {t("common.save", { defaultValue: "Save" })}
                </Button>
            </DialogActions>
        </Dialog>
    );
}