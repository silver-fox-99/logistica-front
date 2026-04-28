import { useEffect, useMemo, useState } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";

import { mapsApi } from "@/shared/api/mapsApi";
import type { MapsLocationSuggestion } from "@/entities/maps/model/types";

type Props<T extends FieldValues> = {
    control: Control<T>;
    name: Path<T>;
    label: string;
    placeholder?: string;
    disabled?: boolean;
    helperText?: string;
    country?: string;
    region?: string;
    onLocationSelect?: (location: MapsLocationSuggestion | null, label: string) => void;
    icon?: React.ReactNode;
};

function getLocationLabel(option: MapsLocationSuggestion | string | null) {
    if (!option) return "";

    if (typeof option === "string") {
        return option;
    }

    return (
        option.display_name ||
        [option.city, option.region, option.country].filter(Boolean).join(", ") ||
        option.address ||
        ""
    );
}

export function RHFLocationAutocomplete<T extends FieldValues>({
                                                                   control,
                                                                   name,
                                                                   label,
                                                                   placeholder,
                                                                   disabled,
                                                                   helperText,
                                                                   country,
                                                                   region,
                                                                   onLocationSelect,
                                                                    icon
                                                               }: Props<T>) {
    const [inputValue, setInputValue] = useState("");
    const [options, setOptions] = useState<MapsLocationSuggestion[]>([]);
    const [loading, setLoading] = useState(false);

    const normalizedQuery = useMemo(() => inputValue.trim(), [inputValue]);

    useEffect(() => {
        if (disabled || normalizedQuery.length < 2) {
            setOptions([]);
            return;
        }

        const timer = window.setTimeout(() => {
            setLoading(true);

            mapsApi
                .searchLocations({
                    q: normalizedQuery,
                    country,
                    region,
                    limit: 10,
                } as any)
                .then((data) => {
                    setOptions(Array.isArray(data) ? data : []);
                })
                .catch(() => {
                    setOptions([]);
                })
                .finally(() => {
                    setLoading(false);
                });
        }, 350);

        return () => {
            window.clearTimeout(timer);
        };
    }, [normalizedQuery, disabled, country, region]);

    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => (
                <Autocomplete<MapsLocationSuggestion, false, false, true>
                    freeSolo
                    disabled={disabled}
                    options={options}
                    loading={loading}
                    inputValue={inputValue || field.value || ""}
                    value={field.value || ""}
                    filterOptions={(items) => items}
                    getOptionLabel={getLocationLabel}
                    isOptionEqualToValue={(option, value) => {
                        if (typeof value === "string") {
                            return getLocationLabel(option) === value;
                        }

                        return getLocationLabel(option) === getLocationLabel(value);
                    }}
                    onInputChange={(_, value, reason) => {
                        setInputValue(value);

                        if (reason === "input") {
                            field.onChange(value || undefined);
                            onLocationSelect?.(null, value);
                        }

                        if (!value) {
                            field.onChange(undefined);
                            onLocationSelect?.(null, "");
                        }
                    }}
                    onChange={(_, value) => {
                        if (!value) {
                            field.onChange(undefined);
                            setInputValue("");
                            onLocationSelect?.(null, "");
                            return;
                        }

                        if (typeof value === "string") {
                            field.onChange(value || undefined);
                            setInputValue(value);
                            onLocationSelect?.(null, value);
                            return;
                        }

                        const nextLabel = getLocationLabel(value);

                        field.onChange(nextLabel || undefined);
                        setInputValue(nextLabel);
                        onLocationSelect?.(value, nextLabel);
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            size="small"
                            label={label}
                            placeholder={placeholder}
                            helperText={helperText}
                            slotProps={{
                                input: {
                                    ...params.InputProps,

                                    startAdornment: icon ? (
                                        <>
                        <span style={{ display: "flex", alignItems: "center", marginRight: 6 }}>
                            {icon}
                        </span>
                                            {params.InputProps.startAdornment}
                                        </>
                                    ) : params.InputProps.startAdornment,

                                    endAdornment: (
                                        <>
                                            {loading ? <CircularProgress size={18} /> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                },
                            }}
                        />
                    )}
                />
            )}
        />
    );
}