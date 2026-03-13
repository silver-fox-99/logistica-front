import { memo } from "react";
import {
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

import type { GeoImportItem } from "@/shared/api/geoImportApi";
import type { EditPoint } from "../model/types";

type PointRowProps = {
    title: string;
    point: EditPoint;
    index: number;
    pointsLength: number;
    countries: GeoImportItem[];
    regions: GeoImportItem[];
    cities: GeoImportItem[];
    t: (key: string, options?: any) => string;
    getLocalizedGeoName: (item: GeoImportItem) => string;
    onChange: (patch: Partial<EditPoint>) => void;
    onRemove: () => void;
};

const PointRow = memo(function PointRow({
                                            title,
                                            point,
                                            index,
                                            pointsLength,
                                            countries,
                                            regions,
                                            cities,
                                            t,
                                            getLocalizedGeoName,
                                            onChange,
                                            onRemove,
                                        }: PointRowProps) {
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

            <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth>
                    <InputLabel>{t("shipments.editDialog.country")}</InputLabel>
                    <Select
                        label={t("shipments.editDialog.country")}
                        value={point.countryId}
                        onChange={(e) =>
                            onChange({
                                countryId: String(e.target.value),
                                regionId: "",
                                cityId: "",
                                rawRegionName: null,
                                rawCityName: null,
                            })
                        }
                    >
                        {countries.map((c) => (
                            <MenuItem key={c.id} value={c.id}>
                                {getLocalizedGeoName(c)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth disabled={!point.countryId}>
                    <InputLabel>{t("shipments.editDialog.region")}</InputLabel>
                    <Select
                        label={t("shipments.editDialog.region")}
                        value={point.regionId}
                        onChange={(e) =>
                            onChange({
                                regionId: String(e.target.value),
                                cityId: "",
                                rawCityName: null,
                            })
                        }
                    >
                        <MenuItem value="">—</MenuItem>
                        {regions.map((r) => (
                            <MenuItem key={r.id} value={r.id}>
                                {getLocalizedGeoName(r)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth disabled={!point.countryId || !point.regionId}>
                    <InputLabel>{t("shipments.editDialog.city")}</InputLabel>
                    <Select
                        label={t("shipments.editDialog.city")}
                        value={point.cityId}
                        onChange={(e) => onChange({ cityId: String(e.target.value) })}
                    >
                        <MenuItem value="">—</MenuItem>
                        {cities.map((c) => (
                            <MenuItem key={c.id} value={c.id}>
                                {getLocalizedGeoName(c)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
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
    countries: GeoImportItem[];
    getRegions: (countryId: string) => GeoImportItem[];
    getCities: (countryId: string, regionId: string) => GeoImportItem[];
    t: (key: string, options?: any) => string;
    getLocalizedGeoName: (item: GeoImportItem) => string;
    onAdd: (side: "from" | "to") => void;
    onUpdate: (side: "from" | "to", index: number, patch: Partial<EditPoint>) => void;
    onRemove: (side: "from" | "to", index: number) => void;
};

export function PointsSection({
                                  side,
                                  title,
                                  points,
                                  countries,
                                  getRegions,
                                  getCities,
                                  t,
                                  getLocalizedGeoName,
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

            {points.map((point, index) => {
                const regions = getRegions(point.countryId);
                const cities = getCities(point.countryId, point.regionId);

                return (
                    <PointRow
                        key={point.clientKey}
                        title={title}
                        point={point}
                        index={index}
                        pointsLength={points.length}
                        countries={countries}
                        regions={regions}
                        cities={cities}
                        t={t}
                        getLocalizedGeoName={getLocalizedGeoName}
                        onChange={(patch) => onUpdate(side, index, patch)}
                        onRemove={() => onRemove(side, index)}
                    />
                );
            })}
        </>
    );
}