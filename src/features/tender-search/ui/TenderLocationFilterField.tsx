import { useCallback, useMemo, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { Controller, type Control } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { publicGeoApi, type PublicGeoLocationItem } from "@/shared/api/publicGeoApi";
import type { PlaceLocation } from "@/features/add-cargo-form/model/types";
import type { TenderFiltersValue } from "../model/types";

type Props = {
    control: Control<TenderFiltersValue>;
    name: "pickup_location" | "dropoff_location";
    label: string;
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

function mapGeoToPlaceLocation(item: PublicGeoLocationItem, lang: string): PlaceLocation {
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

export function TenderLocationFilterField({ control, name, label }: Props) {
    const { t, i18n } = useTranslation();
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
        <Controller
            control={control}
            name={name}
            render={({ field }) => (
                <Autocomplete
                    value={field.value ?? null}
                    options={options}
                    loading={loading}
                    filterOptions={(items) => items}
                    noOptionsText={noOptionsText}
                    getOptionLabel={(option: any) => {
                        if (!option) return "";
                        if (option.source === "internal_geo") return option.display_name || "";

                        return mapGeoToPlaceLocation(option, i18n.language).display_name;
                    }}
                    isOptionEqualToValue={(option: any, value: any) => {
                        return option?.id === value?.id;
                    }}
                    onInputChange={(_, value, reason) => {
                        if (reason === "input") void handleSearch(value);
                    }}
                    onChange={(_, value: any) => {
                        field.onChange(value ? mapGeoToPlaceLocation(value, i18n.language) : null);
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={label}
                            placeholder={t("tenders.filters.locationPlaceholder", "Start typing location")}
                            fullWidth
                        />
                    )}
                />
            )}
        />
    );
}