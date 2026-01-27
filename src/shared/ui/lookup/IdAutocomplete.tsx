import React from "react";
import { Autocomplete, TextField } from "@mui/material";

export type IdOption = { id: string; label: string };

type Props = {
    label: string;
    placeholder?: string;

    options: IdOption[];
    value: IdOption | null;
    onChange: (v: IdOption | null) => void;

    loading?: boolean;
    disabled?: boolean;

    helperText?: string;
    errorText?: string;
};

export const IdAutocomplete = React.memo(function IdAutocomplete({
                                                                     label,
                                                                     placeholder,
                                                                     options,
                                                                     value,
                                                                     onChange,
                                                                     loading,
                                                                     disabled,
                                                                     helperText,
                                                                     errorText,
                                                                 }: Props) {
    return (
        <Autocomplete
            options={options}
            value={value}
            onChange={(_, opt) => onChange(opt)}
            isOptionEqualToValue={(o, v) => o.id === v.id}
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
