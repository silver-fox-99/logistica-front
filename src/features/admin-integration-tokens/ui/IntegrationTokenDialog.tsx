import React from "react";
import {
    Alert,
    Autocomplete,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import { AVAILABLE_INTEGRATION_SCOPES } from "@/entities/integration/model/constants";
import { getIntegrationOwnerLabel } from "@/entities/integration/lib/formatters";
import type { IntegrationScope } from "@/entities/integration/model/types";
import type { IntegrationTokenFormState } from "../model/types";
import type { AdminUser } from "@/shared/api/adminUsersApi";

type Props = {
    open: boolean;
    title: string;
    form: IntegrationTokenFormState;
    loading: boolean;
    submitLabel: string;
    userOptions: AdminUser[];
    usersLoading: boolean;
    ownerInputValue: string;
    onOwnerInputChange: (value: string) => void;
    onFormChange: <K extends keyof IntegrationTokenFormState>(
        key: K,
        value: IntegrationTokenFormState[K],
    ) => void;
    onClose: () => void;
    onSubmit: () => void;
};

export const IntegrationTokenDialog = React.memo(function IntegrationTokenDialog({
                                                                                     open,
                                                                                     title,
                                                                                     form,
                                                                                     loading,
                                                                                     submitLabel,
                                                                                     userOptions,
                                                                                     usersLoading,
                                                                                     ownerInputValue,
                                                                                     onOwnerInputChange,
                                                                                     onFormChange,
                                                                                     onClose,
                                                                                     onSubmit,
                                                                                 }: Props) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{title}</DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2.5}>
                    <Alert severity="info">
                        Токен интеграции нужен для безопасного доступа внешней системы к вашему API.
                        Заполняйте поля внимательно: после создания токен может быть показан только один раз.
                    </Alert>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <Autocomplete
                                options={userOptions}
                                value={form.owner}
                                loading={usersLoading}
                                inputValue={ownerInputValue}
                                onInputChange={(_, value) => onOwnerInputChange(value)}
                                onChange={(_, value) => {
                                    onFormChange("owner", value);
                                    onFormChange("user_id", value?.id ?? "");
                                }}
                                getOptionLabel={(option) => getIntegrationOwnerLabel(option)}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Владелец токена"
                                        placeholder="Найдите пользователя"
                                        helperText="Укажите, кому принадлежит токен. Это помогает понять, кто отвечает за интеграцию."
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Название"
                                value={form.name}
                                onChange={(e) => onFormChange("name", e.target.value)}
                                placeholder="Например, ERP integration"
                                helperText="Внутреннее название токена. Пример: ERP integration, CRM sync, Warehouse API."
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Компания"
                                value={form.company_name}
                                onChange={(e) => onFormChange("company_name", e.target.value)}
                                placeholder="Например, Acme Logistics"
                                helperText="Название компании или внешней системы, которая использует токен."
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Лимит использования"
                                type="number"
                                value={form.usage_limit}
                                onChange={(e) => onFormChange("usage_limit", e.target.value)}
                                placeholder="Оставьте пустым для безлимита"
                                helperText="Сколько раз токен можно использовать. Если оставить пустым, лимита не будет."
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                type="datetime-local"
                                label="Дата истечения"
                                value={form.expires_at}
                                onChange={(e) => onFormChange("expires_at", e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                helperText="После этой даты токен перестанет работать. Можно оставить пустым, если срок не ограничен."
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <FormControl fullWidth>
                                <InputLabel>Scopes</InputLabel>
                                <Select
                                    multiple
                                    label="Scopes"
                                    value={form.scopes}
                                    onChange={(e) =>
                                        onFormChange("scopes", e.target.value as IntegrationScope[])
                                    }
                                    renderValue={(selected) => (
                                        <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                                            {(selected as string[]).map((value) => (
                                                <Chip key={value} size="small" label={value} />
                                            ))}
                                        </Stack>
                                    )}
                                >
                                    {AVAILABLE_INTEGRATION_SCOPES.map((scope) => (
                                        <MenuItem key={scope} value={scope}>
                                            {scope}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: "block", mt: 1 }}
                            >
                                Scopes определяют, к каким разделам API будет доступ у токена. Выдавайте только необходимые права.
                            </Typography>
                        </Grid>

                        {form.scopes.includes("user:create") && (
                            <>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="subtitle2" sx={{ mt: 1, color: "primary.main" }}>
                                        Настройки скидки для новых пользователей (Необязательно)
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Скидка (%)"
                                        type="number"
                                        value={form.discount_percent ?? ""}
                                        onChange={(e) => onFormChange("discount_percent", e.target.value)}
                                        placeholder="Например, 10"
                                        helperText="Процент скидки на тарифные планы для пользователей, зарегистрированных через данный токен."
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Срок действия скидки (дней)"
                                        type="number"
                                        value={form.discount_expires_days ?? ""}
                                        onChange={(e) => onFormChange("discount_expires_days", e.target.value)}
                                        placeholder="Например, 30"
                                        helperText="Количество дней, в течение которых действует скидка с момента регистрации пользователя."
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Отмена
                </Button>
                <Button variant="contained" onClick={onSubmit} disabled={loading}>
                    {loading ? "Сохранение..." : submitLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
});