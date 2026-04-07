import {
    Alert,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import type { AdPlacementsListQuery } from "@/entities/ads/model/types";

type Props = {
    filters: AdPlacementsListQuery;
    loading: boolean;
    onChange: (value: AdPlacementsListQuery) => void;
    onApply: () => void;
    onReset: () => void;
};

export function AdsFilters(props: Props) {
    const { filters, loading, onChange, onApply, onReset } = props;

    return (
        <Stack spacing={2.5}>
            <Alert severity="info">
                Здесь можно отфильтровать placements по названию, ключу, пути страницы и статусу.
                Это удобно, если рекламных зон станет много.
            </Alert>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                        fullWidth
                        label="Поиск"
                        placeholder="Например: Главный баннер или home_top"
                        value={filters.search ?? ""}
                        onChange={(e) =>
                            onChange({
                                ...filters,
                                search: e.target.value,
                                page: 1,
                            })
                        }
                        helperText="Ищет по названию placement или по его ключу."
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                        fullWidth
                        label="Путь страницы"
                        placeholder="/dashboard/profile"
                        value={filters.page_path ?? ""}
                        onChange={(e) =>
                            onChange({
                                ...filters,
                                page_path: e.target.value,
                                page: 1,
                            })
                        }
                        helperText='Укажите страницу, где используется placement. Пример: "/" или "/catalog".'
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel>Статус</InputLabel>
                        <Select
                            label="Статус"
                            value={
                                filters.is_active === undefined
                                    ? "all"
                                    : filters.is_active
                                        ? "active"
                                        : "inactive"
                            }
                            onChange={(e) => {
                                const value = e.target.value;
                                onChange({
                                    ...filters,
                                    is_active:
                                        value === "all"
                                            ? undefined
                                            : value === "active",
                                    page: 1,
                                });
                            }}
                        >
                            <MenuItem value="all">Все</MenuItem>
                            <MenuItem value="active">Активные</MenuItem>
                            <MenuItem value="inactive">Неактивные</MenuItem>
                        </Select>
                    </FormControl>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mt: 1 }}
                    >
                        Помогает быстро отделить рабочие зоны от выключенных.
                    </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 2 }}>
                    <Stack direction="row" spacing={1}>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={onApply}
                            disabled={loading}
                        >
                            Применить
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={onReset}
                            disabled={loading}
                        >
                            Сбросить
                        </Button>
                    </Stack>
                </Grid>
            </Grid>
        </Stack>
    );
}