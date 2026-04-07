import React from "react";
import {
    Alert,
    Autocomplete,
    Button,
    Card,
    CardContent,
    CardHeader,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import { getIntegrationOwnerLabel } from "@/entities/integration/lib/formatters";
import type { IntegrationFiltersState } from "../model/types";
import type { IntegrationStatus } from "@/entities/integration/model/types";
import type { AdminUser } from "@/shared/api/adminUsersApi";

type Props = {
    filters: IntegrationFiltersState;
    userOptions: AdminUser[];
    usersLoading: boolean;
    ownerInputValue: string;
    onOwnerInputChange: (value: string) => void;
    onFilterChange: <K extends keyof IntegrationFiltersState>(
        key: K,
        value: IntegrationFiltersState[K],
    ) => void;
    onApply: () => void;
    onReset: () => void;
};

export const IntegrationTokensFilters = React.memo(function IntegrationTokensFilters({
                                                                                         filters,
                                                                                         userOptions,
                                                                                         usersLoading,
                                                                                         ownerInputValue,
                                                                                         onOwnerInputChange,
                                                                                         onFilterChange,
                                                                                         onApply,
                                                                                         onReset,
                                                                                     }: Props) {
    return (
        <Card sx={{ borderRadius: 3, mb: 3 }}>
            <CardHeader
                title="Фильтры"
                subheader="Используйте фильтры, если токенов много и нужно быстро найти нужную интеграцию."
            />
            <CardContent>
                <Stack spacing={2.5}>
                    <Alert severity="info">
                        Здесь можно отфильтровать токены по названию, компании, владельцу, статусу и активности.
                    </Alert>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField
                                fullWidth
                                label="Поиск"
                                value={filters.search}
                                onChange={(e) => onFilterChange("search", e.target.value)}
                                placeholder="Название, компания, префикс токена"
                                helperText="Например: ERP, Logistics, api_ab12"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 3 }}>
                            <Autocomplete
                                options={userOptions}
                                value={filters.owner}
                                loading={usersLoading}
                                inputValue={ownerInputValue}
                                onInputChange={(_, value) => onOwnerInputChange(value)}
                                onChange={(_, value) => onFilterChange("owner", value)}
                                getOptionLabel={(option) => getIntegrationOwnerLabel(option)}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Владелец"
                                        placeholder="Найдите пользователя"
                                        helperText="Выберите сотрудника или пользователя, на кого оформлен токен."
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel>Статус</InputLabel>
                                <Select
                                    label="Статус"
                                    value={filters.status}
                                    onChange={(e) =>
                                        onFilterChange(
                                            "status",
                                            e.target.value as "" | IntegrationStatus,
                                        )
                                    }
                                >
                                    <MenuItem value="">Все</MenuItem>
                                    <MenuItem value="ACTIVE">Активные</MenuItem>
                                    <MenuItem value="REVOKED">Отозванные</MenuItem>
                                </Select>
                            </FormControl>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: "block", mt: 1 }}
                            >
                                Статус показывает общее состояние токена в системе.
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, md: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel>Активность</InputLabel>
                                <Select
                                    label="Активность"
                                    value={filters.is_active}
                                    onChange={(e) =>
                                        onFilterChange(
                                            "is_active",
                                            e.target.value as "" | "true" | "false",
                                        )
                                    }
                                >
                                    <MenuItem value="">Все</MenuItem>
                                    <MenuItem value="true">Только включённые</MenuItem>
                                    <MenuItem value="false">Только выключенные</MenuItem>
                                </Select>
                            </FormControl>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: "block", mt: 1 }}
                            >
                                Активность показывает, разрешено ли сейчас использовать токен.
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, md: 2 }}>
                            <Stack direction="row" spacing={1}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={onApply}
                                    sx={{ height: 56, textTransform: "none", borderRadius: 2 }}
                                >
                                    Применить
                                </Button>

                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={onReset}
                                    sx={{ height: 56, textTransform: "none", borderRadius: 2 }}
                                >
                                    Сбросить
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </Stack>
            </CardContent>
        </Card>
    );
});