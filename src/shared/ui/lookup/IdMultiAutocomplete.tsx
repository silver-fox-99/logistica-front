import React from "react";
import { Autocomplete, TextField } from "@mui/material";
import type { IdOption } from "./IdAutocomplete";

type Props = {
    label: string;
    placeholder?: string;

    options: IdOption[];
    value: IdOption[];
    onChange: (v: IdOption[]) => void;

    maxSelected?: number;

    loading?: boolean;
    disabled?: boolean;

    helperText?: string;
    errorText?: string;
};

export const IdMultiAutocomplete = React.memo(function IdMultiAutocomplete({
                                                                               label,
                                                                               placeholder,
                                                                               options,
                                                                               value,
                                                                               onChange,
                                                                               maxSelected,
                                                                               loading,
                                                                               disabled,
                                                                               helperText,
                                                                               errorText,
                                                                           }: Props) {
    return (
        <Autocomplete
            multiple
            disableCloseOnSelect
            options={options}
            value={value}
            onChange={(_, opts) => {
                const next = maxSelected ? opts.slice(0, maxSelected) : opts;
                onChange(next);
            }}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            getOptionDisabled={(opt) =>
                !!maxSelected && value.length >= maxSelected && !value.some((v) => v.id === opt.id)
            }
            loading={loading}
            disabled={disabled}
            renderInput={(params) => (
                <TextField
                    {...params}
                    size="small"
                    label={label}
                    placeholder={placeholder}
                    helperText={errorText ?? helperText}
                    error={!!errorText}
                />
            )}
        />
    );
});
