import React from "react";
import {
    Alert,
    Box,
    Button,
    Divider,
    FormControlLabel,
    Stack,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import type {
    AdPlacement,
    CreateAdPlacementPayload,
} from "@/entities/ads/model/types";

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
        page: initialValues?.page ?? "",
        placement_key: initialValues?.placement_key ?? "",
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

    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const fillHomeExample = () => {
        setForm((prev) => ({
            ...prev,
            page: "/",
            placement_key: "home_hero",
            title: "Главный баннер на главной",
            is_active: true,
            rotation_enabled: true,
            rotation_interval_sec: 5,
        }));
    };

    const fillCatalogExample = () => {
        setForm((prev) => ({
            ...prev,
            page: "/catalog",
            placement_key: "catalog_top",
            title: "Баннер над каталогом",
            is_active: true,
            rotation_enabled: false,
            rotation_interval_sec: 5,
        }));
    };

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
                    После создания вы сможете добавлять внутрь него баннеры.
                </Alert>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Button
                        type="button"
                        variant="outlined"
                        size="small"
                        onClick={fillHomeExample}
                    >
                        Пример для главной
                    </Button>
                    <Button
                        type="button"
                        variant="outlined"
                        size="small"
                        onClick={fillCatalogExample}
                    >
                        Пример для каталога
                    </Button>
                </Stack>

                <Divider />

                <TextField
                    label="Страница"
                    value={form.page}
                    onChange={(e) => setField("page", e.target.value)}
                    fullWidth
                    required
                    placeholder="/"
                    helperText='Укажите путь страницы, где будет размещаться рекламный блок. Примеры: "/", "/catalog", "/profile".'
                />

                <TextField
                    label="Ключ placement"
                    value={form.placement_key}
                    onChange={(e) => setField("placement_key", e.target.value)}
                    fullWidth
                    required
                    placeholder="home_hero"
                    helperText='Уникальный технический ключ. Лучше использовать латиницу, snake_case. Пример: "home_hero", "catalog_top", "profile_sidebar".'
                />

                <TextField
                    label="Название"
                    value={form.title}
                    onChange={(e) => setField("title", e.target.value)}
                    fullWidth
                    placeholder="Главный баннер на главной"
                    helperText="Необязательное поле. Нужно для удобства менеджеров и администраторов в панели."
                />

                <Divider />

                <Typography variant="subtitle2">
                    Настройки активности
                </Typography>

                <FormControlLabel
                    control={
                        <Switch
                            checked={form.is_active}
                            onChange={(e) =>
                                setField("is_active", e.target.checked)
                            }
                        />
                    }
                    label="Placement активен"
                />

                <Typography variant="caption" color="text.secondary">
                    Если выключить placement, баннеры в этой зоне не будут показываться на сайте.
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
                    Ротация нужна, если в одном placement несколько баннеров и их нужно показывать по очереди.
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
                    helperText="Через сколько секунд переключать баннер при включённой ротации. Обычно используют 5–10 секунд."
                />

                <Button type="submit" variant="contained" disabled={loading}>
                    {submitLabel}
                </Button>
            </Stack>
        </Box>
    );
}