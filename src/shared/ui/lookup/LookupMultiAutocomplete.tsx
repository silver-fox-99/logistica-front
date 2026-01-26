import React, { useMemo } from "react";
import { Autocomplete, TextField } from "@mui/material";
import type { LookupOpt } from "@/shared/utils/lookupUtils";

type Props = {
    label: string;
    placeholder?: string;
    options: LookupOpt[];
    valueSlugs: string[];
    onChangeSlugs: (slugs: string[]) => void;
    getOptionLabel: (o: LookupOpt) => string;
    loading?: boolean;
    errorText?: string;
    disabled?: boolean;
};

export const LookupMultiAutocomplete = React.memo(function LookupMultiAutocomplete({
                                                                                       label,
                                                                                       placeholder,
                                                                                       options,
                                                                                       valueSlugs,
                                                                                       onChangeSlugs,
                                                                                       getOptionLabel,
                                                                                       loading,
                                                                                       errorText,
                                                                                       disabled,
                                                                                   }: Props) {
    const bySlug = useMemo(() => new Map(options.map((o) => [o.slug, o])), [options]);
    const value = useMemo(() => valueSlugs.map((s) => bySlug.get(s)).filter(Boolean) as LookupOpt[], [valueSlugs, bySlug]);

    return (
        <Autocomplete
            multiple
            options={options}
            value={value}
            sx={{
                "& .MuiAutocomplete-inputRoot": {
                    paddingTop: 0,
                },
            }}
            loading={!!loading}
            disabled={!!disabled}
            isOptionEqualToValue={(a, b) => a.slug === b.slug}
            getOptionLabel={(o) => getOptionLabel(o) || o.slug}
            onChange={(_, v) => onChangeSlugs(v.map((x) => x.slug))}
            renderInput={(params) => (
                <TextField
                    {...params}
                    fullWidth
                    label={label}
                    placeholder={placeholder}
                    error={!!errorText}
                    helperText={errorText}
                />
            )}
        />
    );
});
