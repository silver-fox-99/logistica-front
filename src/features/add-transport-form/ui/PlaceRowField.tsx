import React, { useCallback, useMemo, useState } from "react";
import {
    Autocomplete,
    CircularProgress,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { Control, UseFormSetValue } from "react-hook-form";
import { Controller } from "react-hook-form";

import {
    publicGeoApi,
    type PublicGeoLocationItem,
} from "@/shared/api/publicGeoApi";

import type {
    AddTransportFormValues,
    TransportPlaceLocation,
} from "../model/types";
import {mapGeoToPlaceLocation} from "@/features/add-cargo-form/ui/PlaceRowField.tsx";

type Props = {
    kind: "load" | "unload";
    index: number;
    control: Control<AddTransportFormValues>;
    setValue: UseFormSetValue<AddTransportFormValues>;
    errorText?: string;
};

function getLocalizedName(
    item:
        | Pick<PublicGeoLocationItem, "name" | "name_ru" | "name_uz">
        | null
        | undefined,
    lang: string,
) {
    if (!item) return "";

    if (lang.startsWith("ru")) return item.name_ru || item.name;
    if (lang.startsWith("uz")) return item.name_uz || item.name;

    return item.name;
}

function mapGeoToTransportLocation(
    item: PublicGeoLocationItem,
    lang: string,
): TransportPlaceLocation {
    const countryName = item.country
        ? getLocalizedName(item.country, lang)
        : item.type === "COUNTRY"
            ? getLocalizedName(item, lang)
            : "";

    const regionName = item.region
        ? getLocalizedName(item.region, lang)
        : item.type === "REGION"
            ? getLocalizedName(item, lang)
            : null;

    const cityName = item.type === "CITY" ? getLocalizedName(item, lang) : null;

    const parts = [cityName, regionName, countryName].filter(Boolean);

    return {
        id: item.id,
        type: item.type,

        country: countryName || getLocalizedName(item, lang),
        country_ru: item.country?.name_ru ?? (item.type === "COUNTRY" ? item.name_ru : null),
        country_uz: item.country?.name_uz ?? (item.type === "COUNTRY" ? item.name_uz : null),

        region: regionName,
        region_ru: item.region?.name_ru ?? (item.type === "REGION" ? item.name_ru : null),
        region_uz: item.region?.name_uz ?? (item.type === "REGION" ? item.name_uz : null),

        city: cityName,
        city_ru: item.type === "CITY" ? item.name_ru : null,
        city_uz: item.type === "CITY" ? item.name_uz : null,

        address: null,
        display_name: parts.length ? parts.join(", ") : getLocalizedName(item, lang),

        latitude: item.latitude ?? null,
        longitude: item.longitude ?? null,

        source: "internal_geo",
    };
}

export const PlaceRowField = React.memo(function PlaceRowField({
                                                                   kind,
                                                                   index,
                                                                   control,
                                                                   setValue,
                                                                   errorText,
                                                               }: Props) {
    const { t, i18n } = useTranslation();

    const base = kind === "load" ? `loadPlaces.${index}` : `unloadPlaces.${index}`;
    const locationName = `${base}.location` as const;
    const addressName = `${base}.address` as const;

    const [inputValue, setInputValue] = useState("");
    const [options, setOptions] = useState<PublicGeoLocationItem[]>([]);
    const [loading, setLoading] = useState(false);

    const locationLabel =
        kind === "load"
            ? t("addCargo.fields.pickupLocation")
            : t("addCargo.fields.dropoffLocation");

    const addressLabel =
        kind === "load"
            ? t("addCargo.fields.addressLoad")
            : t("addCargo.fields.addressUnload");

    const noOptionsText = useMemo(() => {
        return inputValue.trim().length < 2
            ? t("addCargo.fields.startTypingLocation")
            : t("addCargo.fields.noOptions");
    }, [inputValue, t]);

    const handleSearch = useCallback(async (value: string) => {
        const q = value.trim();

        if (q.length < 2) {
            setOptions([]);
            return;
        }

        try {
            setLoading(true);
            const result = await publicGeoApi.search(q);
            setOptions(result);
        } catch {
            setOptions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleInputChange = useCallback(
        (_: unknown, value: string, reason: string) => {
            setInputValue(value);

            if (reason !== "input") return;

            window.clearTimeout((handleInputChange as any).timer);
            (handleInputChange as any).timer = window.setTimeout(() => {
                handleSearch(value);
            }, 450);
        },
        [handleSearch],
    );

    return (
        <Stack spacing={1.25}>
            <Controller
                name={locationName as any}
                control={control}
                render={({ field, fieldState }) => (
                    <Autocomplete
                        options={options}
                        value={field.value ?? null}
                        inputValue={inputValue}
                        loading={loading}
                        filterOptions={(items) => items}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        getOptionLabel={(option: any) => {
                            if (!option) return "";

                            if (option.source === "internal_geo") {
                                return option.display_name || "";
                            }

                            const location = mapGeoToPlaceLocation(option, i18n.language);
                            return location.display_name;
                        }}
                        onInputChange={handleInputChange}
                        onChange={(_, value) => {
                            const location = value
                                ? mapGeoToTransportLocation(value, i18n.language)
                                : null;

                            field.onChange(location);

                            setValue(addressName as any, "", {
                                shouldDirty: true,
                                shouldValidate: false,
                            });
                        }}
                        noOptionsText={noOptionsText}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                fullWidth
                                label={locationLabel}
                                placeholder={t("addCargo.fields.searchLocationPlaceholder")}
                                error={!!fieldState.error || !!errorText}
                                helperText={
                                    (fieldState.error?.message as string | undefined) ||
                                    errorText ||
                                    ""
                                }
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
                        renderOption={(props, option) => {
                            const location = mapGeoToTransportLocation(
                                option,
                                i18n.language,
                            );

                            return (
                                <li {...props} key={option.id}>
                                    <Stack spacing={0.25}>
                                        <Typography variant="body2">
                                            {location.display_name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {option.type}
                                        </Typography>
                                    </Stack>
                                </li>
                            );
                        }}
                    />
                )}
            />

            <Controller
                name={addressName as any}
                control={control}
                render={({ field }) => (
                    <TextField
                        fullWidth
                        label={addressLabel}
                        placeholder={t("addCargo.fields.addressDetailsPlaceholder")}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        inputRef={field.ref}
                    />
                )}
            />
        </Stack>
    );
});