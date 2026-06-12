import { useEffect, useState } from "react";
import {
    Alert,
    Box,
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
    Typography,
} from "@mui/material";
import { FiPlus, FiSave, FiX } from "react-icons/fi";

import { useAdminAccessStore } from "@/entities/adminAccess/model/adminAccess.store";
import NoAccess from "@/shared/ui/no-access/NoAccess";
import { viewCode } from "@/shared/ui/layout/AdminLayout";
import type { BillingPeriodOption, TariffPlanFormValues } from "@/entities/tariff-plan/model/tariff-plan.types";
import {
    TARIFF_FEATURE_FIELDS,
    TARIFF_LIMIT_FIELDS,
} from "@/entities/tariff-plan/model/tariff-plan.fields";
import {
    createEmptyTariffPlanForm,
    sanitizeDigits,
} from "@/entities/tariff-plan/model/tariff-plan.form";

type Props = {
    open: boolean;
    initial: TariffPlanFormValues | null;
    loading: boolean;
    billingPeriods: BillingPeriodOption[];
    onClose: () => void;
    onSubmit: (values: TariffPlanFormValues) => void;
};

export function TariffPlanDialog({
                                     open,
                                     initial,
                                     loading,
                                     billingPeriods,
                                     onClose,
                                     onSubmit,
                                 }: Props) {
    const canViewTariffs = useAdminAccessStore((s) =>
        s.hasPermission(viewCode("TARIFF_PLANS" as never)),
    );

    const [form, setForm] = useState<TariffPlanFormValues>(createEmptyTariffPlanForm());

    useEffect(() => {
        if (!open) return;

        if (initial) {
            setForm(initial);
            return;
        }

        setForm(createEmptyTariffPlanForm(billingPeriods[0]?.value));
    }, [open, initial, billingPeriods]);

    const updateField = <K extends keyof TariffPlanFormValues>(
        key: K,
        value: TariffPlanFormValues[K],
    ) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    if (!canViewTariffs) return <NoAccess />;

    return (
        <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="md">
            <DialogTitle>
                {initial ? "Редактирование тарифного плана" : "Создание тарифного плана"}
            </DialogTitle>

            <DialogContent dividers sx={{ display: "grid", gap: 2, pt: 2 }}>
                <Alert severity="info">
                    Заполните основные параметры тарифа. Все названия и ограничения должны быть понятны
                    администратору, который будет работать с системой дальше.
                </Alert>

                <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                        Основная информация
                    </Typography>

                    <Stack spacing={2}>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                            <TextField
                                label="Код тарифа"
                                value={form.code}
                                onChange={(e) => updateField("code", e.target.value)}
                                fullWidth
                                required
                                helperText="Уникальный внутренний код. Например: START, PRO, BUSINESS"
                            />

                            <TextField
                                label="Название тарифа"
                                value={form.name}
                                onChange={(e) => updateField("name", e.target.value)}
                                fullWidth
                                required
                                helperText="Название, которое будет видно в интерфейсе"
                            />
                        </Stack>

                        <TextField
                            label="Описание"
                            value={form.description}
                            onChange={(e) => updateField("description", e.target.value)}
                            fullWidth
                            multiline
                            minRows={3}
                            helperText="Кратко опишите, для кого подходит этот тариф и что в него входит"
                        />

                        <Stack direction={{ xs: "column", md: "row" }} gap={2} flexWrap="wrap">
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={form.is_active}
                                        onChange={(e) => updateField("is_active", e.target.checked)}
                                    />
                                }
                                label="Тариф активен"
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={form.is_default}
                                        onChange={(e) => updateField("is_default", e.target.checked)}
                                    />
                                }
                                label="Тариф по умолчанию"
                            />

                            <TextField
                                label="Приоритет отображения"
                                type="text"
                                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                                value={form.priority ?? ""}
                                onChange={(e) =>
                                    updateField(
                                        "priority",
                                        e.target.value === "" ? null : Number(sanitizeDigits(e.target.value)),
                                    )
                                }
                                sx={{ width: "100%" }}
                                helperText="Чем меньше число, тем выше тариф будет в списке"
                            />
                        </Stack>
                    </Stack>
                </Box>

                <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                        Стоимость и период оплаты
                    </Typography>

                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                        <TextField
                            label="Стоимость"
                            type="text"
                            inputProps={{ inputMode: "decimal" }}
                            value={form.price_text}
                            onChange={(e) => updateField("price_text", e.target.value)}
                            fullWidth
                            helperText="Например: 19.99"
                        />

                        <TextField
                            label="Валюта"
                            value={form.currency}
                            onChange={(e) => updateField("currency", e.target.value.toUpperCase())}
                            inputProps={{ maxLength: 3 }}
                            sx={{ maxWidth: 160 }}
                            helperText="Например: USD, EUR"
                        />

                        <TextField
                            select
                            label="Период оплаты"
                            value={form.billing_period}
                            onChange={(e) =>
                                updateField("billing_period", e.target.value as TariffPlanFormValues["billing_period"])
                            }
                            sx={{ minWidth: 220 }}
                            helperText="Как часто будет списываться оплата"
                        >
                            {billingPeriods.map((item) => (
                                <MenuItem key={item.value} value={item.value}>
                                    {item.label}
                                </MenuItem>
                            ))}
                        </TextField>

                        {form.billing_period === "CUSTOM" && (
                            <TextField
                                label="Количество дней"
                                type="text"
                                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                                value={form.days ?? ""}
                                onChange={(e) =>
                                    updateField(
                                        "days",
                                        e.target.value === "" ? null : Number(sanitizeDigits(e.target.value)),
                                    )
                                }
                                sx={{ minWidth: 160 }}
                                required
                                helperText="Длительность действия тарифа (мин. 1)"
                            />
                        )}
                    </Stack>
                </Box>

                <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                        Возможности тарифа
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        Включите функции, которые будут доступны пользователям на этом тарифе.
                    </Typography>

                    <Stack spacing={1.5}>
                        {TARIFF_FEATURE_FIELDS.map((field) => (
                            <FormControlLabel
                                key={field.key}
                                control={
                                    <Switch
                                        checked={Boolean(form[field.key])}
                                        onChange={(e) =>
                                            updateField(field.key, e.target.checked as never)
                                        }
                                    />
                                }
                                label={field.label}
                            />
                        ))}
                    </Stack>
                </Box>

                <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                        Ограничения
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        Укажите лимиты для этого тарифа. Если ограничение не нужно, оставьте поле пустым.
                    </Typography>

                    <Stack spacing={2}>
                        {TARIFF_LIMIT_FIELDS.map((field) => (
                            <TextField
                                key={field.key}
                                label={field.label}
                                helperText={field.hint || "Оставьте пустым, если лимит не нужен"}
                                type="text"
                                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                                value={form[field.key] ?? ""}
                                onChange={(e) =>
                                    updateField(
                                        field.key,
                                        e.target.value === ""
                                            ? null
                                            : Number(sanitizeDigits(e.target.value)),
                                    )
                                }
                                fullWidth
                            />
                        ))}
                    </Stack>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} startIcon={<FiX />} variant="outlined" disabled={loading}>
                    Отмена
                </Button>

                <Button
                    onClick={() => onSubmit(form)}
                    variant="contained"
                    disabled={loading}
                    startIcon={initial ? <FiSave /> : <FiPlus />}
                >
                    {initial ? "Сохранить изменения" : "Создать тариф"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}