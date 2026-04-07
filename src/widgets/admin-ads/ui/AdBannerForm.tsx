import React from "react";
import {
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
    AdBanner,
    CreateAdBannerPayload,
    UpdateAdBannerPayload,
} from "@/entities/ads/model/types";

type CommonProps = {
    initialValues?: AdBanner | null;
    loading: boolean;
    submitLabel?: string;
};

type CreateProps = CommonProps & {
    mode: "create";
    onSubmit: (payload: CreateAdBannerPayload) => void | Promise<void>;
};

type EditProps = CommonProps & {
    mode: "edit";
    onSubmit: (payload: UpdateAdBannerPayload) => void | Promise<void>;
};

type Props = CreateProps | EditProps;

type FormState = {
    title: string;
    image_url: string;
    mobile_image_url: string;
    target_url: string;
    open_in_new_tab: boolean;
    is_active: boolean;
    sort_order: number;
    start_at: string;
    end_at: string;
    alt: string;
    button_label: string;
};

function getInitialState(initialValues?: AdBanner | null): FormState {
    return {
        title: initialValues?.title ?? "",
        image_url: initialValues?.image_url ?? "",
        mobile_image_url: initialValues?.mobile_image_url ?? "",
        target_url: initialValues?.target_url ?? "",
        open_in_new_tab: initialValues?.open_in_new_tab ?? true,
        is_active: initialValues?.is_active ?? true,
        sort_order: initialValues?.sort_order ?? 0,
        start_at: initialValues?.start_at ?? "",
        end_at: initialValues?.end_at ?? "",
        alt: initialValues?.alt ?? "",
        button_label: initialValues?.button_label ?? "",
    };
}

function toNullableString(value: string): string | null {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
}

export function AdBannerForm(props: Props) {
    const {
        initialValues,
        loading,
        submitLabel = "Сохранить",
    } = props;

    const [form, setForm] = React.useState<FormState>(() => getInitialState(initialValues));

    React.useEffect(() => {
        setForm(getInitialState(initialValues));
    }, [initialValues]);

    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const fillNow = () => {
        setField("start_at", new Date().toISOString());
    };

    const fillWeekLater = () => {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        setField("end_at", date.toISOString());
    };

    const fillExampleImage = () => {
        setField("image_url", "https://example.com/banner-main.jpg");
    };

    const fillExampleMobileImage = () => {
        setField("mobile_image_url", "https://example.com/banner-mobile.jpg");
    };

    const fillExampleTarget = () => {
        setField("target_url", "https://example.com/promo/spring-sale");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const basePayload = {
            title: form.title.trim(),
            image_url: form.image_url.trim(),
            mobile_image_url: toNullableString(form.mobile_image_url),
            target_url: toNullableString(form.target_url),
            open_in_new_tab: form.open_in_new_tab,
            is_active: form.is_active,
            sort_order: Number.isFinite(form.sort_order) ? form.sort_order : 0,
            start_at: toNullableString(form.start_at),
            end_at: toNullableString(form.end_at),
            alt: toNullableString(form.alt),
            button_label: toNullableString(form.button_label),
        };

        if (props.mode === "create") {
            await props.onSubmit(basePayload satisfies CreateAdBannerPayload);
            return;
        }

        await props.onSubmit(basePayload satisfies UpdateAdBannerPayload);
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
                <Typography variant="body2" color="text.secondary">
                    Заполните основные данные баннера. Обязательные поля: заголовок и URL изображения.
                </Typography>

                <TextField
                    label="Название баннера"
                    value={form.title}
                    onChange={(e) => setField("title", e.target.value)}
                    fullWidth
                    required
                    helperText='Внутреннее название для админки. Пример: "Весенняя акция на главной".'
                />

                <TextField
                    label="URL основного изображения"
                    value={form.image_url}
                    onChange={(e) => setField("image_url", e.target.value)}
                    fullWidth
                    required
                    helperText='Ссылка на основную картинку. Пример: https://example.com/banner-main.jpg'
                />

                <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Button type="button" size="small" variant="outlined" onClick={fillExampleImage}>
                        Подставить пример
                    </Button>
                </Stack>

                <TextField
                    label="URL мобильного изображения"
                    value={form.mobile_image_url}
                    onChange={(e) => setField("mobile_image_url", e.target.value)}
                    fullWidth
                    helperText="Необязательно. Используется для мобильной версии, если нужен отдельный баннер."
                />

                <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Button
                        type="button"
                        size="small"
                        variant="outlined"
                        onClick={fillExampleMobileImage}
                    >
                        Пример mobile URL
                    </Button>
                </Stack>

                <TextField
                    label="Ссылка перехода"
                    value={form.target_url}
                    onChange={(e) => setField("target_url", e.target.value)}
                    fullWidth
                    helperText="Куда попадёт пользователь после клика по баннеру. Можно оставить пустым, если баннер не кликабельный."
                />

                <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Button type="button" size="small" variant="outlined" onClick={fillExampleTarget}>
                        Пример ссылки
                    </Button>
                </Stack>

                <TextField
                    label="Порядок сортировки"
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setField("sort_order", Number(e.target.value) || 0)}
                    fullWidth
                    helperText="Чем меньше число, тем выше баннер будет в списке."
                />

                <Divider />

                <Typography variant="subtitle2">
                    Период показа
                </Typography>

                <TextField
                    label="Дата начала"
                    value={form.start_at}
                    onChange={(e) => setField("start_at", e.target.value)}
                    fullWidth
                    placeholder="2026-04-07T10:00:00.000Z"
                    helperText="Когда баннер должен начать показываться. Формат ISO. Можно оставить пустым."
                />

                <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Button type="button" size="small" variant="outlined" onClick={fillNow}>
                        Подставить текущее время
                    </Button>
                </Stack>

                <TextField
                    label="Дата окончания"
                    value={form.end_at}
                    onChange={(e) => setField("end_at", e.target.value)}
                    fullWidth
                    placeholder="2026-05-01T00:00:00.000Z"
                    helperText="После этой даты баннер перестанет показываться. Можно оставить пустым."
                />

                <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Button type="button" size="small" variant="outlined" onClick={fillWeekLater}>
                        +7 дней от текущей даты
                    </Button>
                </Stack>

                <Divider />

                <Typography variant="subtitle2">
                    Дополнительно
                </Typography>

                <TextField
                    label="Alt текст"
                    value={form.alt}
                    onChange={(e) => setField("alt", e.target.value)}
                    fullWidth
                    helperText='Текст для SEO и доступности. Пример: "Скидка 20% на новые товары".'
                />

                <TextField
                    label="Текст кнопки"
                    value={form.button_label}
                    onChange={(e) => setField("button_label", e.target.value)}
                    fullWidth
                    helperText='Необязательно. Пример: "Подробнее", "Купить сейчас", "Перейти".'
                />

                <FormControlLabel
                    control={
                        <Switch
                            checked={form.open_in_new_tab}
                            onChange={(e) => setField("open_in_new_tab", e.target.checked)}
                        />
                    }
                    label="Открывать ссылку в новой вкладке"
                />

                <FormControlLabel
                    control={
                        <Switch
                            checked={form.is_active}
                            onChange={(e) => setField("is_active", e.target.checked)}
                        />
                    }
                    label="Баннер активен"
                />

                <Button type="submit" variant="contained" disabled={loading}>
                    {submitLabel}
                </Button>
            </Stack>
        </Box>
    );
}