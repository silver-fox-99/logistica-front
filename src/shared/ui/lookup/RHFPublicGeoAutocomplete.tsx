import React, { useEffect, useState } from "react";
import {
    Autocomplete,
    Box,
    CircularProgress,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import type {
    Control,
    FieldValues,
    Path,
    UseFormSetValue,
} from "react-hook-form";
import { Controller } from "react-hook-form";

import { useLocalizedGeo } from "@/shared/utils/lookupUtils";
import {
    publicGeoApi,
    type PublicGeoLocationItem,
    type PublicGeoLocationType,
} from "@/shared/api/publicGeoApi.ts";

type Props<T extends FieldValues> = {
    control: Control<T>;
    setValue: UseFormSetValue<T>;
    name: Path<T>;
    typeName: Path<T>;
    label: string;
    placeholder?: string;
    icon?: React.ReactNode;
};

function getGeoTypeLabel(type: PublicGeoLocationType) {
    if (type === "COUNTRY") return "Country";
    if (type === "REGION") return "Region";
    return "City";
}

export function RHFPublicGeoAutocomplete<T extends FieldValues>({
                                                                    control,
                                                                    setValue,
                                                                    name,
                                                                    typeName,
                                                                    label,
                                                                    placeholder,
                                                                    icon,
                                                                }: Props<T>) {
    const { getLocalizedGeoName } = useLocalizedGeo();

    const [inputValue, setInputValue] = useState("");
    const [selectedOption, setSelectedOption] = useState<PublicGeoLocationItem | null>(null);
    const [options, setOptions] = useState<PublicGeoLocationItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const query = inputValue.trim();

        if (query.length < 2) {
            setOptions([]);
            return;
        }

        let active = true;

        const timer = window.setTimeout(async () => {
            try {
                setLoading(true);

                const data = await publicGeoApi.search(query);

                if (active) {
                    setOptions(Array.isArray(data) ? data : []);
                }
            } catch {
                if (active) {
                    setOptions([]);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }, 350);

        return () => {
            active = false;
            window.clearTimeout(timer);
        };
    }, [inputValue]);

    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => {
                useEffect(() => {
                    setInputValue(field.value ?? "");

                    if (!field.value) {
                        setSelectedOption(null);
                    }
                }, [field.value]);

                return (
                    <Autocomplete<PublicGeoLocationItem, false, false, false>
                        size="small"
                        options={options}
                        value={selectedOption}
                        inputValue={inputValue}
                        loading={loading}
                        filterOptions={(items) => items}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        getOptionLabel={(option) => {
                            const title = getLocalizedGeoName(option);

                            const meta = [
                                option.region ? getLocalizedGeoName(option.region) : null,
                                option.country ? getLocalizedGeoName(option.country) : null,
                            ].filter(Boolean);

                            return meta.length ? `${title}, ${meta.join(", ")}` : title;
                        }}
                        onInputChange={(_, value, reason) => {
                            if (reason === "input") {
                                setInputValue(value);

                                if (!value.trim()) {
                                    setOptions([]);
                                    setSelectedOption(null);
                                    field.onChange(undefined);
                                    setValue(typeName, undefined as any, { shouldDirty: true });
                                }
                            }

                            if (reason === "clear") {
                                setInputValue("");
                                setOptions([]);
                                setSelectedOption(null);
                                field.onChange(undefined);
                                setValue(typeName, undefined as any, { shouldDirty: true });
                            }
                        }}
                        onChange={(_, value) => {
                            setSelectedOption(value);

                            if (!value) {
                                setInputValue("");
                                setOptions([]);
                                field.onChange(undefined);
                                setValue(typeName, undefined as any, { shouldDirty: true });
                                return;
                            }

                            const labelValue = getLocalizedGeoName(value);

                            field.onChange(value.name);
                            setInputValue(labelValue);
                            setValue(typeName, value.type as any, { shouldDirty: true });
                        }}
                        renderOption={(props, option) => (
                            <Box component="li" {...props} key={option.id}>
                                <Stack spacing={0.25}>
                                    <Typography variant="body2">
                                        {getLocalizedGeoName(option)}
                                    </Typography>

                                    <Typography variant="caption" color="text.secondary">
                                        {getGeoTypeLabel(option.type)}
                                        {option.region ? ` · ${getLocalizedGeoName(option.region)}` : ""}
                                        {option.country ? ` · ${getLocalizedGeoName(option.country)}` : ""}
                                    </Typography>
                                </Stack>
                            </Box>
                        )}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={label}
                                placeholder={placeholder}
                                slotProps={{
                                    input: {
                                        ...params.InputProps,
                                        startAdornment: icon ? (
                                            <>
                                                <Box
                                                    component="span"
                                                    sx={{
                                                        display: "inline-flex",
                                                        mr: 0.75,
                                                        color: "text.secondary",
                                                    }}
                                                >
                                                    {icon}
                                                </Box>
                                                {params.InputProps.startAdornment}
                                            </>
                                        ) : (
                                            params.InputProps.startAdornment
                                        ),
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
                );
            }}
        />
    );
}