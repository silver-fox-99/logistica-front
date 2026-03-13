import React, { useMemo } from "react";
import { Autocomplete, Button, Stack, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useLocalizedGeo } from "@/shared/utils/lookupUtils";
import type { GeoImportItem } from "@/shared/api/geoImportApi";
import type { Control, UseFormSetValue } from "react-hook-form";
import { useController } from "react-hook-form";
import type { AddCargoFormValues } from "../model/types";

type Props = {
    kind: "pickup" | "dropoff";
    index: number;

    control: Control<AddCargoFormValues>;
    setValue: UseFormSetValue<AddCargoFormValues>;

    countries: GeoImportItem[];
    regions: GeoImportItem[];
    cities: GeoImportItem[];

    loadingCountries: boolean;
    loadingRegions: boolean;
    loadingCities: boolean;

    errorText?: string;

    showRemove?: boolean;
    onRemove?: () => void;

    onCountryLoad?: (id?: string | null) => void;
    onRegionLoad?: (countryId?: string | null, regionId?: string | null) => void;
};

export const PlaceRowField = React.memo(function PlaceRowField({
                                                                   kind,
                                                                   index,

                                                                   control,
                                                                   setValue,

                                                                   countries,
                                                                   regions,
                                                                   cities,

                                                                   loadingCountries,
                                                                   loadingRegions,
                                                                   loadingCities,

                                                                   errorText,
                                                                   showRemove,
                                                                   onRemove,
                                                                   onCountryLoad,
                                                                   onRegionLoad,
                                                               }: Props) {
    const { t } = useTranslation();
    const { getLocalizedGeoName } = useLocalizedGeo();

    const base = kind === "pickup" ? `pickups.${index}` : `dropoffs.${index}`;

    const country = useController({ control, name: `${base}.countryId` as any });
    const region = useController({ control, name: `${base}.regionId` as any });
    const city = useController({ control, name: `${base}.cityId` as any });
    const address = useController({ control, name: `${base}.address` as any });

    const countryValue = useMemo(
        () => (country.field.value ? countries.find((c) => c.id === country.field.value) ?? null : null),
        [countries, country.field.value]
    );

    const regionValue = useMemo(
        () => (region.field.value ? regions.find((r) => r.id === region.field.value) ?? null : null),
        [regions, region.field.value]
    );

    const cityValue = useMemo(
        () => (city.field.value ? cities.find((c) => c.id === city.field.value) ?? null : null),
        [cities, city.field.value]
    );

    const countryLabel =
        kind === "pickup" ? t("addCargo.fields.countryLoad") : t("addCargo.fields.countryUnload");
    const regionLabel =
        kind === "pickup" ? t("addCargo.fields.regionLoad") : t("addCargo.fields.regionUnload");
    const cityLabel =
        kind === "pickup" ? t("addCargo.fields.cityLoad") : t("addCargo.fields.cityUnload");
    const addressLabel =
        kind === "pickup" ? t("addCargo.fields.addressLoad") : t("addCargo.fields.addressUnload");

    return (
        <Stack spacing={1.25}>
            <Autocomplete
                options={countries}
                getOptionLabel={(o) => getLocalizedGeoName(o) || o.name || ""}
                value={countryValue}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(_, v) => {
                    const id = v?.id ?? null;

                    country.field.onChange(id);

                    setValue(`${base}.regionId` as any, null, { shouldDirty: true });
                    setValue(`${base}.cityId` as any, null, { shouldDirty: true });

                    onCountryLoad?.(id);
                }}
                noOptionsText={loadingCountries ? "Loading..." : t("addCargo.fields.noOptions") || "No options"}
                loading={loadingCountries}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        fullWidth
                        label={countryLabel}
                        placeholder={t("addCargo.fields.startTypingCountry")}
                    />
                )}
            />

            <Autocomplete
                options={regions}
                getOptionLabel={(o) => getLocalizedGeoName(o)}
                value={regionValue}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(_, v) => {
                    const id = v?.id ?? null;
                    region.field.onChange(id);

                    setValue(`${base}.cityId` as any, null, { shouldDirty: true });

                    onRegionLoad?.(country.field.value ?? null, id);
                }}
                disabled={!countryValue || regions.length === 0}
                loading={loadingRegions}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        fullWidth
                        label={regionLabel}
                        placeholder={t("addCargo.fields.startTypingRegion")}
                    />
                )}
            />

            <Autocomplete
                options={cities}
                getOptionLabel={(o) => getLocalizedGeoName(o)}
                value={cityValue}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(_, v) => city.field.onChange(v?.id ?? null)}
                disabled={!countryValue || cities.length === 0}
                loading={loadingCities}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        fullWidth
                        label={cityLabel}
                        placeholder={t("addCargo.fields.startTypingCity")}
                    />
                )}
            />

            <TextField
                fullWidth
                label={addressLabel}
                placeholder={t("addCargo.fields.enterAddress")}
                value={address.field.value ?? ""}
                onChange={address.field.onChange}
                onBlur={address.field.onBlur}
                name={address.field.name}
                inputRef={address.field.ref}
            />

            {showRemove && (
                <Button
                    variant="text"
                    color="error"
                    onClick={onRemove}
                    sx={{ alignSelf: "flex-start", minWidth: 40, mt: 0.5, textTransform: "none" }}
                >
                    {t("addCargo.fields.removePoint")}
                </Button>
            )}

            {!!errorText && (
                <Typography variant="caption" color="error">
                    {errorText}
                </Typography>
            )}
        </Stack>
    );
});