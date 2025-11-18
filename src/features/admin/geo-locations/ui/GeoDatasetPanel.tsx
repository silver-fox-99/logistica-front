import { useMemo, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { toast } from "react-toastify";
import type { GeoLocation, LocationType } from "@/shared/api/adminGeoApi";
import { adminGeoApi } from "@/shared/api/adminGeoApi";

type ImportType = Extract<LocationType, "COUNTRY" | "REGION" | "CITY">;

type Props = {
    open: boolean;
    onClose: () => void;
    allLocations: GeoLocation[];
    onImported?: () => void; // например, передать reload()
};

export default function GeoImportDialog({
                                            open,
                                            onClose,
                                            allLocations,
                                            onImported,
                                        }: Props) {
    const [type, setType] = useState<ImportType>("COUNTRY");
    const [countryCode, setCountryCode] = useState<string>("UZ");    // по умолчанию Узбекистан
    const [stateCode, setStateCode] = useState<string>("");
    const [parentId, setParentId] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);

    // варианты parent_id из нашей БД
    const countryOptions = useMemo(
        () => allLocations.filter((l) => l.type === "COUNTRY"),
        [allLocations],
    );

    const regionOptions = useMemo(
        () => allLocations.filter((l) => l.type === "REGION"),
        [allLocations],
    );

    const parentOptions =
        type === "REGION"
            ? countryOptions
            : type === "CITY"
                ? regionOptions
                : [];

    const handleTypeChange = (e: SelectChangeEvent<string>) => {
        const next = e.target.value as ImportType;
        setType(next);
        // при смене режима чуть-чуть чистим форму
        if (next === "COUNTRY") {
            setParentId("");
            setStateCode("");
        }
        if (next === "REGION") {
            setStateCode("");
        }
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);

            if (type === "COUNTRY") {
                // импорт всех стран или только UZ — логика будет на бэке
                const res: any = await adminGeoApi.importCountries();
                const count = res?.data?.count ?? res?.count;
                toast.success(
                    count ? `Импортировано стран: ${count}` : "Импорт стран запущен",
                );
            }

            if (type === "REGION") {
                if (!countryCode) {
                    toast.error("Укажите код страны (ISO2)");
                    return;
                }
                const res: any = await adminGeoApi.importStates(
                    countryCode,
                    parentId,
                );
                const count = res?.data?.count ?? res?.count;
                toast.success(
                    count ? `Импортировано регионов: ${count}` : "Импорт регионов запущен",
                );
            }

            if (type === "CITY") {
                if (!countryCode || !stateCode) {
                    toast.error("Укажите код страны и код региона");
                    return;
                }
                const res: any = await adminGeoApi.importCities(
                    countryCode,
                    stateCode,
                    parentId,
                );
                const count = res?.data?.count ?? res?.count;
                toast.success(
                    count ? `Импортировано городов: ${count}` : "Импорт городов запущен",
                );
            }

            onImported?.();
            onClose();
        } catch (e) {
            toast.error("Ошибка при импорте гео-данных");
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    const canSubmit =
        type === "COUNTRY" ||
        (type === "REGION" && !!countryCode) ||
        (type === "CITY" && !!countryCode && !!stateCode);

    return (
        <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Догрузить гео-данные</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} mt={1}>
                    <Typography variant="body2" color="text.secondary">
                        Выберите, что нужно загрузить из внешнего датасета
                        (страны/states/cities). Бэкенд по коду страны/региона
                        подтянет данные и создаст записи в&nbsp;таблице
                        <code> geo_locations </code>. Поле <b>Parent</b> позволяет
                        привязать новые записи к уже существующей стране/региону.
                    </Typography>

                    {/* Тип импортируемых сущностей */}
                    <FormControl size="small" fullWidth>
                        <InputLabel id="geo-import-type-label">Тип</InputLabel>
                        <Select
                            labelId="geo-import-type-label"
                            value={type}
                            label="Тип"
                            onChange={handleTypeChange}
                        >
                            <MenuItem value="COUNTRY">Страны</MenuItem>
                            <MenuItem value="REGION">Регионы (штаты) по стране</MenuItem>
                            <MenuItem value="CITY">Города по региону</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Код страны — нужен для REGION / CITY, для COUNTRY используем как фильтр (например UZ) */}
                    <TextField
                        size="small"
                        label="Код страны (ISO2, напр. UZ)"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                        fullWidth
                        helperText={
                            type === "COUNTRY"
                                ? "Опционально: бекенд может использовать для фильтрации стран"
                                : "Обязательное поле"
                        }
                    />

                    {/* Код региона только для CITY */}
                    {type === "CITY" && (
                        <TextField
                            size="small"
                            label="Код региона / штата (stateCode)"
                            value={stateCode}
                            onChange={(e) => setStateCode(e.target.value)}
                            fullWidth
                            helperText="Например, код области в датасете (будет передан на бекенд)"
                        />
                    )}

                    {/* Parent берём из нашей БД, опционально */}
                    {type !== "COUNTRY" && (
                        <FormControl size="small" fullWidth>
                            <InputLabel id="geo-import-parent-label">
                                Parent (опционально)
                            </InputLabel>
                            <Select
                                labelId="geo-import-parent-label"
                                value={parentId}
                                label="Parent (опционально)"
                                onChange={(e) => setParentId(e.target.value)}
                            >
                                <MenuItem value="">
                                    <em>Без родителя</em>
                                </MenuItem>
                                {parentOptions.map((p) => (
                                    <MenuItem key={p.id} value={p.id}>
                                        {p.name} ({p.type})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={submitting}>
                    Отмена
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={submitting || !canSubmit}
                >
                    Импортировать
                </Button>
            </DialogActions>
        </Dialog>
    );
}
