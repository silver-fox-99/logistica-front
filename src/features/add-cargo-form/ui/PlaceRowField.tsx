import { useCallback, useMemo, useState } from "react";
import { Autocomplete, Stack, TextField } from "@mui/material";
import { Controller, type Control, type UseFormSetValue } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { publicGeoApi, type PublicGeoLocationItem } from "@/shared/api/publicGeoApi";
import type { AddCargoFormValues, PlaceLocation } from "../model/types";

type Props = {
    kind: "pickup" | "dropoff";
    index: number;
    control: Control<AddCargoFormValues>;
    setValue: UseFormSetValue<AddCargoFormValues>;
    errorText?: string;
};

function getLocalizedName(
    item: Pick<PublicGeoLocationItem, "name" | "name_ru" | "name_uz"> | null | undefined,
    lang: string,
) {
    if (!item) return "";

    if (lang.startsWith("ru")) return item.name_ru || item.name;
    if (lang.startsWith("uz")) return item.name_uz || item.name;

    return item.name;
}

export function mapGeoToPlaceLocation(
    item: PublicGeoLocationItem,
    lang: string,
): PlaceLocation {
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

export function PlaceRowField({
                                  kind,
                                  index,
                                  control,
                                  setValue,
                                  errorText,
                              }: Props) {
    const { t, i18n } = useTranslation();

    const fieldName = `${kind === "pickup" ? "pickups" : "dropoffs"}.${index}` as const;

    const [options, setOptions] = useState<PublicGeoLocationItem[]>([]);
    const [loading, setLoading] = useState(false);

    const noOptionsText = useMemo(
        () => t("common.noOptions", "No options"),
        [t],
    );

    const handleSearch = useCallback(async (value: string) => {
        const q = value.trim();

        if (q.length < 2) {
            setOptions([]);
            return;
        }

        try {
            setLoading(true);
            const data = await publicGeoApi.search(q);
            setOptions(data);
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <Stack spacing={1.25}>
            <Controller
                control={control}
                name={`${fieldName}.location`}
                render={({ field }) => (
                    <Autocomplete
                        value={field.value}
                        options={options}
                        loading={loading}
                        filterOptions={(items) => items}
                        noOptionsText={noOptionsText}
                        getOptionLabel={(option: any) => {
                            if (!option) return "";

                            if (option.source === "internal_geo") {
                                return option.display_name || "";
                            }

                            const location = mapGeoToPlaceLocation(option, i18n.language);
                            return location.display_name;
                        }}
                        isOptionEqualToValue={(option: any, value: any) => {
                            return option?.id === value?.id;
                        }}
                        onInputChange={(_, value, reason) => {
                            if (reason === "input") {
                                handleSearch(value);
                            }
                        }}
                        onChange={(_, value: any) => {
                            const location = value
                                ? mapGeoToPlaceLocation(value, i18n.language)
                                : null;

                            field.onChange(location);

                            setValue(`${fieldName}.address`, "", {
                                shouldDirty: true,
                                shouldValidate: false,
                            });
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={
                                    kind === "pickup"
                                        ? t("addCargo.fields.pickupLocation")
                                        : t("addCargo.fields.dropoffLocation")
                                }
                                placeholder={t("addCargo.fields.startTypingLocation")}
                                error={!!errorText}
                                helperText={errorText}
                            />
                        )}
                    />
                )}
            />

            <Controller
                control={control}
                name={`${fieldName}.address`}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label={t("addCargo.fields.addressLoad")}
                        placeholder={t("addCargo.fields.addressLoad")}
                        fullWidth
                    />
                )}
            />
        </Stack>
    );
}