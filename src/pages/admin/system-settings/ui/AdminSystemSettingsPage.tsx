import { useEffect, useMemo, useState } from "react";
import {
    Container,
    Paper,
    Stack,
    Typography,
    Tabs,
    Tab,
    Box,
    Button,
    Divider,
    TextField,
    Switch,
    FormControlLabel,
    CircularProgress,
    Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useForm, Controller } from "react-hook-form";
import { FiSettings, FiSave } from "react-icons/fi";
import { toast } from "react-toastify";

import { useInitStore } from "@/shared/store/initStore";
import { useLocalizedLookup } from "@/shared/utils/lookupUtils";
import { useAdminAccessStore } from "@/entities/adminAccess/model/adminAccess.store";
import { viewCode } from "@/shared/ui/layout/AdminLayout";
import NoAccess from "@/shared/ui/no-access/NoAccess";

import { RHFIdMultiAutocomplete } from "@/shared/ui/lookup/RHFIdMultiAutocomplete";
import { RHFPublicGeoAutocomplete } from "@/shared/ui/lookup/RHFPublicGeoAutocomplete.tsx";

import { useFilterSettingsStore, type FilterSettings, type FilterConfig } from "@/shared/store/filterSettingsStore";

interface DateConfig {
    mode: "empty" | "today" | "today_plus" | "today_minus";
    offset: number;
}

interface FilterConfigForm {
    pickup_geo_location_name?: string;
    pickup_geo_location_type?: string;
    dropoff_geo_location_name?: string;
    dropoff_geo_location_type?: string;
    pickup_date_from: DateConfig;
    pickup_date_to: DateConfig;
    dropoff_date_from: DateConfig;
    dropoff_date_to: DateConfig;
    weight_min?: number;
    weight_max?: number;
    volume_min?: number;
    volume_max?: number;
    vehicle_type: string[];
    favorites_only: boolean;
}

interface FormValues {
    search: {
        default: FilterConfigForm;
        reset: FilterConfigForm;
    };
    my: {
        default: FilterConfigForm;
        reset: FilterConfigForm;
    };
    home: {
        default: FilterConfigForm;
        reset: FilterConfigForm;
    };
}

function dateToForm(value: any): DateConfig {
    if (!value) return { mode: "empty", offset: 0 };
    if (value === "today") return { mode: "today", offset: 0 };
    if (typeof value === "string") {
        if (value.startsWith("today+")) {
            const offset = parseInt(value.slice(6), 10);
            return { mode: "today_plus", offset: isNaN(offset) ? 0 : offset };
        }
        if (value.startsWith("today-")) {
            const offset = parseInt(value.slice(6), 10);
            return { mode: "today_minus", offset: isNaN(offset) ? 0 : offset };
        }
    }
    return { mode: "empty", offset: 0 };
}

function dateFromForm(cfg: DateConfig): string | null {
    if (cfg.mode === "today") return "today";
    if (cfg.mode === "today_plus") return `today+${cfg.offset || 0}`;
    if (cfg.mode === "today_minus") return `today-${cfg.offset || 0}`;
    return null;
}

function configToForm(cfg?: FilterConfig): FilterConfigForm {
    return {
        pickup_geo_location_name: cfg?.pickup_geo_location_name || "",
        pickup_geo_location_type: cfg?.pickup_geo_location_type || undefined,
        dropoff_geo_location_name: cfg?.dropoff_geo_location_name || "",
        dropoff_geo_location_type: cfg?.dropoff_geo_location_type || undefined,
        pickup_date_from: dateToForm(cfg?.pickup_date_from),
        pickup_date_to: dateToForm(cfg?.pickup_date_to),
        dropoff_date_from: dateToForm(cfg?.dropoff_date_from),
        dropoff_date_to: dateToForm(cfg?.dropoff_date_to),
        weight_min: cfg?.weight_min ?? undefined,
        weight_max: cfg?.weight_max ?? undefined,
        volume_min: cfg?.volume_min ?? undefined,
        volume_max: cfg?.volume_max ?? undefined,
        vehicle_type: cfg?.vehicle_type || [],
        favorites_only: !!cfg?.favorites_only,
    };
}

function configFromForm(form: FilterConfigForm): FilterConfig {
    const out: FilterConfig = {};

    if (form.pickup_geo_location_name) {
        out.pickup_geo_location_name = form.pickup_geo_location_name;
        out.pickup_geo_location_type = form.pickup_geo_location_type;
    }
    if (form.dropoff_geo_location_name) {
        out.dropoff_geo_location_name = form.dropoff_geo_location_name;
        out.dropoff_geo_location_type = form.dropoff_geo_location_type;
    }

    const pickup_date_from = dateFromForm(form.pickup_date_from);
    if (pickup_date_from) out.pickup_date_from = pickup_date_from;

    const pickup_date_to = dateFromForm(form.pickup_date_to);
    if (pickup_date_to) out.pickup_date_to = pickup_date_to;

    const dropoff_date_from = dateFromForm(form.dropoff_date_from);
    if (dropoff_date_from) out.dropoff_date_from = dropoff_date_from;

    const dropoff_date_to = dateFromForm(form.dropoff_date_to);
    if (dropoff_date_to) out.dropoff_date_to = dropoff_date_to;

    if (form.weight_min !== undefined && form.weight_min !== null) out.weight_min = form.weight_min;
    if (form.weight_max !== undefined && form.weight_max !== null) out.weight_max = form.weight_max;
    if (form.volume_min !== undefined && form.volume_min !== null) out.volume_min = form.volume_min;
    if (form.volume_max !== undefined && form.volume_max !== null) out.volume_max = form.volume_max;

    if (form.vehicle_type && form.vehicle_type.length > 0) out.vehicle_type = form.vehicle_type;
    if (form.favorites_only) out.favorites_only = form.favorites_only;

    return out;
}

const DateConfigField = ({
                             control,
                             setValue,
                             name,
                             label,
                         }: {
    control: any;
    setValue: any;
    name: string;
    label: string;
}) => {
    return (
        <Stack spacing={1} sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
            <Typography variant="body2" fontWeight={600}>
                {label}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
                <Controller
                    control={control}
                    name={`${name}.mode`}
                    render={({ field }) => (
                        <TextField
                            select
                            size="small"
                            value={field.value || "empty"}
                            onChange={(e) => {
                                field.onChange(e.target.value);
                                if (e.target.value === "empty" || e.target.value === "today") {
                                    setValue(`${name}.offset`, 0);
                                }
                            }}
                            slotProps={{ select: { native: true } }}
                            sx={{ minWidth: 150 }}
                        >
                            <option value="empty">Пусто (нет фильтра)</option>
                            <option value="today">Сегодня</option>
                            <option value="today_plus">Сегодня + N дней</option>
                            <option value="today_minus">Сегодня - N дней</option>
                        </TextField>
                    )}
                />

                <Controller
                    control={control}
                    name={`${name}.mode`}
                    render={({ field: modeField }) =>
                        modeField.value === "today_plus" || modeField.value === "today_minus" ? (
                            <Controller
                                control={control}
                                name={`${name}.offset`}
                                render={({ field }) => (
                                    <TextField
                                        size="small"
                                        type="number"
                                        label="N дней"
                                        value={field.value ?? 0}
                                        onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                                        sx={{ width: 90 }}
                                    />
                                )}
                            />
                        ) : <></>
                    }
                />
            </Stack>
        </Stack>
    );
};

const FilterConfigPanel = ({
                               control,
                               setValue,
                               prefix,
                           }: {
    control: any;
    setValue: any;
    prefix: string;
}) => {
    const { lookups } = useInitStore();
    const { getLocalizedLabel } = useLocalizedLookup();

    const vehicleOptions = useMemo(() => {
        return (lookups?.vehicleType || []).map((item: any) => ({
            id: item.slug,
            label: getLocalizedLabel(item),
        }));
    }, [lookups?.vehicleType, getLocalizedLabel]);

    return (
        <Stack spacing={2.5}>
            <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                    Маршрут
                </Typography>
                <Stack spacing={1.5}>
                    <RHFPublicGeoAutocomplete
                        control={control}
                        setValue={setValue}
                        name={`${prefix}.pickup_geo_location_name`}
                        typeName={`${prefix}.pickup_geo_location_type`}
                        label="Место отправления"
                        placeholder="Страна, регион или город"
                    />

                    <RHFPublicGeoAutocomplete
                        control={control}
                        setValue={setValue}
                        name={`${prefix}.dropoff_geo_location_name`}
                        typeName={`${prefix}.dropoff_geo_location_type`}
                        label="Место доставки"
                        placeholder="Страна, регион или город"
                    />
                </Stack>
            </Box>

            <Divider />

            <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                    Даты погрузки
                </Typography>
                <Stack spacing={1.5}>
                    <DateConfigField
                        control={control}
                        setValue={setValue}
                        name={`${prefix}.pickup_date_from`}
                        label="Дата погрузки ОТ"
                    />
                    <DateConfigField
                        control={control}
                        setValue={setValue}
                        name={`${prefix}.pickup_date_to`}
                        label="Дата погрузки ДО"
                    />
                </Stack>
            </Box>

            <Divider />

            <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                    Даты выгрузки
                </Typography>
                <Stack spacing={1.5}>
                    <DateConfigField
                        control={control}
                        setValue={setValue}
                        name={`${prefix}.dropoff_date_from`}
                        label="Дата выгрузки ОТ"
                    />
                    <DateConfigField
                        control={control}
                        setValue={setValue}
                        name={`${prefix}.dropoff_date_to`}
                        label="Дата выгрузки ДО"
                    />
                </Stack>
            </Box>

            <Divider />

            <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                    Транспорт и Параметры
                </Typography>
                <Stack spacing={2}>
                    <RHFIdMultiAutocomplete
                        control={control}
                        name={`${prefix}.vehicle_type`}
                        label="Типы транспорта (до 5)"
                        options={vehicleOptions}
                        maxSelected={5}
                    />

                    <Stack direction="row" spacing={1.5}>
                        <Controller
                            control={control}
                            name={`${prefix}.weight_min`}
                            render={({ field }) => (
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    label="Мин. вес (т)"
                                    value={field.value ?? ""}
                                    onChange={(e) =>
                                        field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                                    }
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name={`${prefix}.weight_max`}
                            render={({ field }) => (
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    label="Макс. вес (т)"
                                    value={field.value ?? ""}
                                    onChange={(e) =>
                                        field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                                    }
                                />
                            )}
                        />
                    </Stack>

                    <Stack direction="row" spacing={1.5}>
                        <Controller
                            control={control}
                            name={`${prefix}.volume_min`}
                            render={({ field }) => (
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    label="Мин. объем (м³)"
                                    value={field.value ?? ""}
                                    onChange={(e) =>
                                        field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                                    }
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name={`${prefix}.volume_max`}
                            render={({ field }) => (
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    label="Макс. объем (м³)"
                                    value={field.value ?? ""}
                                    onChange={(e) =>
                                        field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                                    }
                                />
                            )}
                        />
                    </Stack>

                    <Controller
                        control={control}
                        name={`${prefix}.favorites_only`}
                        render={({ field }) => (
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={!!field.value}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                    />
                                }
                                label="Только избранные"
                            />
                        )}
                    />
                </Stack>
            </Box>
        </Stack>
    );
};

export default function AdminSystemSettingsPage() {
    const { loadInit } = useInitStore();
    const { settings, loading, error, loadSettings, saveSettings } = useFilterSettingsStore();

    const [activeTab, setActiveTab] = useState<"search" | "my" | "home">("search");
    const canViewSettings = useAdminAccessStore((s) => s.hasPermission(viewCode("SYSTEM_SETTINGS" as any)));

    const { control, handleSubmit, reset, setValue } = useForm<FormValues>();

    useEffect(() => {
        void loadInit();
        void loadSettings();
    }, [loadInit, loadSettings]);

    useEffect(() => {
        if (settings) {
            reset({
                search: {
                    default: configToForm(settings.search.default),
                    reset: configToForm(settings.search.reset),
                },
                my: {
                    default: configToForm(settings.my.default),
                    reset: configToForm(settings.my.reset),
                },
                home: {
                    default: configToForm(settings.home.default),
                    reset: configToForm(settings.home.reset),
                },
            });
        }
    }, [settings, reset]);

    const handleSave = handleSubmit(async (values) => {
        const payload: FilterSettings = {
            search: {
                default: configFromForm(values.search.default),
                reset: configFromForm(values.search.reset),
            },
            my: {
                default: configFromForm(values.my.default),
                reset: configFromForm(values.my.reset),
            },
            home: {
                default: configFromForm(values.home.default),
                reset: configFromForm(values.home.reset),
            },
        };

        try {
            await saveSettings(payload);
            toast.success("Настройки фильтров успешно сохранены!");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Ошибка при сохранении настроек");
        }
    });

    if (!canViewSettings) return <NoAccess />;
    if (loading && !settings) {
        return (
            <Container>
                <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }} color="text.secondary">
                        Загрузка настроек...
                    </Typography>
                </Stack>
            </Container>
        );
    }

    return (
        <Container disableGutters>
            <Stack spacing={2.5}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <FiSettings size={24} />
                        <Typography variant="h5" fontWeight={700}>
                            Настройки системных фильтров
                        </Typography>
                    </Stack>
                    <Button
                        variant="contained"
                        startIcon={<FiSave />}
                        onClick={handleSave}
                        disabled={loading}
                    >
                        Сохранить все
                    </Button>
                </Stack>

                {error && <Alert severity="error">{error}</Alert>}

                <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                    <Tabs
                        value={activeTab}
                        onChange={(_, val: "search" | "my" | "home") => setActiveTab(val)}
                        sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
                    >
                        <Tab value="search" label="Страница поиска" />
                        <Tab value="my" label="Мои заявки" />
                        <Tab value="home" label="Главная страница" />
                    </Tabs>

                    <Box sx={{ p: 3 }}>
                        <Grid container spacing={4}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Paper
                                    variant="outlined"
                                    sx={{ p: 2.5, borderRadius: 2, bgcolor: "#FAFAFA" }}
                                >
                                    <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: "primary.main" }}>
                                        Значения по умолчанию
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                        Применяются автоматически при первом открытии страницы пользователем.
                                    </Typography>
                                    <FilterConfigPanel
                                        control={control}
                                        setValue={setValue}
                                        prefix={`${activeTab}.default`}
                                    />
                                </Paper>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <Paper
                                    variant="outlined"
                                    sx={{ p: 2.5, borderRadius: 2, bgcolor: "#FAFAFA" }}
                                >
                                    <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: "secondary.main" }}>
                                        Значения при сбросе
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                        Применяются, когда пользователь нажимает кнопку «Сбросить» в панели фильтров.
                                    </Typography>
                                    <FilterConfigPanel
                                        control={control}
                                        setValue={setValue}
                                        prefix={`${activeTab}.reset`}
                                    />
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            </Stack>
        </Container>
    );
}
