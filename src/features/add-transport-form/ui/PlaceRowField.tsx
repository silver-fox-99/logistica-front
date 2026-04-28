import React, { useEffect, useMemo, useState } from "react";
import { Autocomplete, CircularProgress, Stack, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { Control, UseFormSetValue } from "react-hook-form";
import { Controller } from "react-hook-form";

import { mapsApi } from "@/shared/api/mapsApi";

import type { AddTransportFormValues } from "../model/types";
import type {MapsLocationSuggestion} from "@/entities/maps/model/types.ts";

type Props = {
    kind: "load" | "unload";
    index: number;
    control: Control<AddTransportFormValues>;
    setValue: UseFormSetValue<AddTransportFormValues>;
    errorText?: string;
};

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
    const [options, setOptions] = useState<MapsLocationSuggestion[]>([]);
    const [loading, setLoading] = useState(false);

    const lang = useMemo(() => {
        if (i18n.language.startsWith("ru")) return "ru";
        if (i18n.language.startsWith("uz")) return "uz";
        return "en";
    }, [i18n.language]);

    const locationLabel =
        kind === "load"
            ? t("addCargo.fields.pickupLocation")
            : t("addCargo.fields.dropoffLocation");

    const addressLabel =
        kind === "load"
            ? t("addCargo.fields.addressLoad")
            : t("addCargo.fields.addressUnload");

    useEffect(() => {
        const q = inputValue.trim();

        if (q.length < 2) {
            setOptions([]);
            return;
        }

        const timeoutId = window.setTimeout(async () => {
            try {
                setLoading(true);

                const result = await mapsApi.searchLocations({
                    q,
                    lang,
                    limit: 7,
                });

                setOptions(result);
            } catch {
                setOptions([]);
            } finally {
                setLoading(false);
            }
        }, 450);

        return () => window.clearTimeout(timeoutId);
    }, [inputValue, lang]);

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
                        isOptionEqualToValue={(option, value) =>
                            option.place_id === value.place_id
                        }
                        getOptionLabel={(option) => option.display_name || ""}
                        onInputChange={(_, value) => {
                            setInputValue(value);
                        }}
                        onChange={(_, value) => {
                            field.onChange(value);

                            setValue(addressName as any, value?.address ?? "", {
                                shouldDirty: true,
                                shouldValidate: false,
                            });
                        }}
                        noOptionsText={
                            inputValue.trim().length < 2
                                ? t("addCargo.fields.startTypingLocation")
                                : t("addCargo.fields.noOptions")
                        }
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
                        renderOption={(props, option) => (
                            <li {...props} key={option.place_id}>
                                <Stack spacing={0.25}>
                                    <Typography variant="body2">
                                        {option.display_name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {[option.city, option.region, option.country]
                                            .filter(Boolean)
                                            .join(", ")}
                                    </Typography>
                                </Stack>
                            </li>
                        )}
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