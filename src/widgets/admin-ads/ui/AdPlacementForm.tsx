import React from "react";
import {
    Alert,
    Box,
    Button,
    Divider,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import type {
    AdPlacement,
    CreateAdPlacementPayload,
} from "@/entities/ads/model/types";
import {
    findPlacementOption,
    getPlacementsByPage,
    getUniquePages,
} from "@/entities/ads/model/placementOptions.helpers";

type Props = {
    initialValues?: AdPlacement | null;
    loading: boolean;
    submitLabel?: string;
    onSubmit: (payload: CreateAdPlacementPayload) => void | Promise<void>;
};

type FormState = {
    page: string;
    placement_key: string;
    title: string;
    is_active: boolean;
    rotation_enabled: boolean;
    rotation_interval_sec: number;
};

function getInitialState(initialValues?: AdPlacement | null): FormState {
    return {
        page: initialValues?.page ?? "/dashboard/search",
        placement_key: initialValues?.placement_key ?? "top-list",
        title: initialValues?.title ?? "",
        is_active: initialValues?.is_active ?? true,
        rotation_enabled: initialValues?.rotation_enabled ?? false,
        rotation_interval_sec: initialValues?.rotation_interval_sec ?? 5,
    };
}

export function AdPlacementForm(props: Props) {
    const {
        initialValues,
        loading,
        submitLabel = "Сохранить",
        onSubmit,
    } = props;

    const [form, setForm] = React.useState<FormState>(() => getInitialState(initialValues));

    React.useEffect(() => {
        setForm(getInitialState(initialValues));
    }, [initialValues]);

    const pageOptions = React.useMemo(() => getUniquePages(), []);
    const placementOptions = React.useMemo(
        () => getPlacementsByPage(form.page),
        [form.page],
    );

    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handlePageChange = (page: string) => {
        const nextPlacements = getPlacementsByPage(page);
        const firstPlacement = nextPlacements[0];

        setForm((prev) => ({
            ...prev,
            page,
            placement_key: firstPlacement?.placementKey ?? "",
            title: firstPlacement?.defaultTitle ?? "",
            rotation_enabled: firstPlacement?.defaultRotationEnabled ?? false,
            rotation_interval_sec: firstPlacement?.defaultRotationIntervalSec ?? 5,
        }));
    };

    const handlePlacementChange = (placementKey: string) => {
        const selected = findPlacementOption(form.page, placementKey);

        setForm((prev) => ({
            ...prev,
            placement_key: placementKey,
            title: prev.title || selected?.defaultTitle || "",
            rotation_enabled: selected?.defaultRotationEnabled ?? prev.rotation_enabled,
            rotation_interval_sec:
                selected?.defaultRotationIntervalSec ?? prev.rotation_interval_sec,
        }));
    };

    const selectedPlacement = React.useMemo(
        () => findPlacementOption(form.page, form.placement_key),
        [form.page, form.placement_key],
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        onSubmit({
            page: form.page.trim(),
            placement_key: form.placement_key.trim(),
            title: form.title.trim() || null,
            is_active: form.is_active,
            rotation_enabled: form.rotation_enabled,
            rotation_interval_sec: form.rotation_interval_sec,
        });
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
                <Alert severity="info">
                    Placement — это рекламная зона на определённой странице сайта.
                    Сейчас доступны только заранее настроенные места размещения.
                </Alert>

                <Divider />

                <FormControl fullWidth required>
                    <InputLabel>Страница</InputLabel>
                    <Select
                        label="Страница"
                        value={form.page}
                        onChange={(e) => handlePageChange(e.target.value)}
                    >
                        {pageOptions.map((item) => (
                            <MenuItem key={item.value} value={item.value}>
                                {item.label} ({item.value})
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Typography variant="caption" color="text.secondary">
                    Выберите страницу, на которой будет показываться рекламный блок.
                </Typography>

                <FormControl fullWidth required>
                    <InputLabel>Место размещения</InputLabel>
                    <Select
                        label="Место размещения"
                        value={form.placement_key}
                        onChange={(e) => handlePlacementChange(e.target.value)}
                    >
                        {placementOptions.map((item) => (
                            <MenuItem key={item.placementKey} value={item.placementKey}>
                                {item.placementLabel} ({item.placementKey})
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Typography variant="caption" color="text.secondary">
                    Это конкретная зона на странице, куда будет добавлен баннер.
                </Typography>

                {selectedPlacement ? (
                    <Alert severity="success">
                        Выбрано место: <strong>{selectedPlacement.pageLabel}</strong> →{" "}
                        <strong>{selectedPlacement.placementLabel}</strong>
                    </Alert>
                ) : null}

                <TextField
                    label="Название"
                    value={form.title}
                    onChange={(e) => setField("title", e.target.value)}
                    fullWidth
                    placeholder="Баннер над результатами поиска"
                    helperText="Необязательное поле. Используется для удобства в админке."
                />

                <Divider />

                <Typography variant="subtitle2">
                    Настройки активности
                </Typography>

                <FormControlLabel
                    control={
                        <Switch
                            checked={form.is_active}
                            onChange={(e) => setField("is_active", e.target.checked)}
                        />
                    }
                    label="Placement активен"
                />

                <Typography variant="caption" color="text.secondary">
                    Если выключить placement, баннеры в этой зоне не будут показываться.
                </Typography>

                <FormControlLabel
                    control={
                        <Switch
                            checked={form.rotation_enabled}
                            onChange={(e) =>
                                setField("rotation_enabled", e.target.checked)
                            }
                        />
                    }
                    label="Включить ротацию баннеров"
                />

                <Typography variant="caption" color="text.secondary">
                    Ротация нужна, если в одном месте будет несколько баннеров и их нужно показывать по очереди.
                </Typography>

                <TextField
                    label="Интервал ротации (секунды)"
                    type="number"
                    value={form.rotation_interval_sec}
                    onChange={(e) =>
                        setField("rotation_interval_sec", Number(e.target.value) || 0)
                    }
                    inputProps={{ min: 1 }}
                    fullWidth
                    helperText="Через сколько секунд переключать баннер при включённой ротации."
                />

                <Button type="submit" variant="contained" disabled={loading}>
                    {submitLabel}
                </Button>
            </Stack>
        </Box>
    );
}