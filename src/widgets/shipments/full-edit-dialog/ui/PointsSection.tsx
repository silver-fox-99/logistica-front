import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
    Autocomplete,
    Button,
    CircularProgress,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import type { MapsLocationSuggestion } from "@/entities/maps/model/types";
import { mapsApi } from "@/shared/api/mapsApi";
import type { EditPoint } from "../model/types";
import {useTranslation} from "react-i18next";

type PointRowProps = {
    title: string;
    point: EditPoint;
    index: number;
    pointsLength: number;
    t: (key: string, options?: any) => string;
    onChange: (patch: Partial<EditPoint>) => void;
    onRemove: () => void;
};

const getLocationLabel = (option: MapsLocationSuggestion | string) => {
    if (typeof option === "string") return option;

    return (
        (option as any)?.display_name ||
        [(option as any)?.city, (option as any)?.region, (option as any)?.country]
            .filter(Boolean)
            .join(", ")
    );
};

const PointRow = memo(function PointRow({
                                            title,
                                            point,
                                            index,
                                            pointsLength,
                                            t,
                                            onChange,
                                            onRemove,
                                        }: PointRowProps) {
    const [query, setQuery] = useState("");
    const [options, setOptions] = useState<MapsLocationSuggestion[]>([]);
    const [loading, setLoading] = useState(false);

    const normalizedQuery = useMemo(() => query.trim(), [query]);

    const { i18n } = useTranslation();

    const lang = useMemo(() => {
        if (i18n.language.startsWith("ru")) return "ru";
        if (i18n.language.startsWith("uz")) return "uz";
        return "en";
    }, [i18n.language]);

    const loadOptions = useCallback(async (search: string) => {
        if (search.length < 2) {
            setOptions([]);
            return;
        }

        setLoading(true);

        try {
            const data = await mapsApi.searchLocations({
                q: search,
                lang,
                limit: 10,
            } as any);

            setOptions(data ?? []);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void loadOptions(normalizedQuery);
        }, 350);

        return () => window.clearTimeout(timer);
    }, [loadOptions, normalizedQuery]);

    const handleLocationChange = useCallback(
        (_event: unknown, value: MapsLocationSuggestion | null) => {
            onChange({
                location: value,

                country: (value as any)?.country ?? "",
                region: (value as any)?.region ?? null,
                city: (value as any)?.city ?? null,

                address: (value as any)?.address ?? point.address ?? "",
                display_name: (value as any)?.display_name ?? null,
                latitude: (value as any)?.latitude ?? null,
                longitude: (value as any)?.longitude ?? null,
                geocode_source: (value as any)?.geocode_source ?? null,
            });
        },
        [onChange, point.address]
    );

    return (
        <>
            <Grid size={{ xs: 12 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {title} #{index + 1}
                    </Typography>

                    {pointsLength > 1 && (
                        <Button size="small" color="error" onClick={onRemove}>
                            {t("shipments.editDialog.removePoint")}
                        </Button>
                    )}
                </Stack>
            </Grid>

            <Grid size={{ xs: 12 }}>
                <Autocomplete
                    value={point.location}
                    options={options}
                    loading={loading}
                    filterOptions={(x) => x}
                    getOptionLabel={getLocationLabel}
                    isOptionEqualToValue={(option, value) => {
                        const optionName = getLocationLabel(option);
                        const valueName = getLocationLabel(value);

                        return optionName === valueName;
                    }}
                    onInputChange={(_, value) => setQuery(value)}
                    onChange={handleLocationChange}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={t("shipments.editDialog.location", {
                                defaultValue: "Location",
                            })}
                            placeholder={t("shipments.editDialog.locationPlaceholder", {
                                defaultValue: "Search city, region or address",
                            })}
                            fullWidth
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        {loading ? <CircularProgress size={18} /> : null}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                />
            </Grid>

            <Grid size={{ xs: 12 }}>
                <TextField
                    label={t("shipments.editDialog.address")}
                    value={point.address}
                    onChange={(e) => onChange({ address: e.target.value })}
                    fullWidth
                />
            </Grid>
        </>
    );
});

type PointsSectionProps = {
    side: "from" | "to";
    title: string;
    points: EditPoint[];
    t: (key: string, options?: any) => string;
    onAdd: (side: "from" | "to") => void;
    onUpdate: (side: "from" | "to", index: number, patch: Partial<EditPoint>) => void;
    onRemove: (side: "from" | "to", index: number) => void;
};

export function PointsSection({
                                  side,
                                  title,
                                  points,
                                  t,
                                  onAdd,
                                  onUpdate,
                                  onRemove,
                              }: PointsSectionProps) {
    return (
        <>
            <Grid size={{ xs: 12 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography sx={{ fontWeight: 800 }}>{title}</Typography>

                    <Button size="small" onClick={() => onAdd(side)}>
                        {t("shipments.editDialog.addPoint")}
                    </Button>
                </Stack>
            </Grid>

            {points.map((point, index) => (
                <PointRow
                    key={point.clientKey}
                    title={title}
                    point={point}
                    index={index}
                    pointsLength={points.length}
                    t={t}
                    onChange={(patch) => onUpdate(side, index, patch)}
                    onRemove={() => onRemove(side, index)}
                />
            ))}
        </>
    );
}