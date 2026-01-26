import React, { useMemo } from "react";
import { Autocomplete, TextField } from "@mui/material";
import type { LookupOpt } from "@/shared/utils/lookupUtils";

type Props = {
    label: string;
    placeholder?: string;
    options: LookupOpt[];
    valueSlugs: string[];
    onChangeSlugs: (slugs: string[]) => void;
    loading?: boolean;
    errorText?: string;
    disabled?: boolean;

    getOptionLabel?: (o: LookupOpt) => string;
};

export const LookupMultiAutocomplete = React.memo(function LookupMultiAutocomplete({
                                                                                       label,
                                                                                       placeholder,
                                                                                       options,
                                                                                       valueSlugs,
                                                                                       onChangeSlugs,
                                                                                       loading,
                                                                                       errorText,
                                                                                       disabled,
                                                                                       getOptionLabel,
                                                                                   }: Props) {
    const bySlug = useMemo(() => new Map(options.map((o) => [o.slug, o])), [options]);
    const value = useMemo(() => valueSlugs.map((s) => bySlug.get(s)).filter(Boolean) as LookupOpt[], [valueSlugs, bySlug]);

    return (
        <Autocomplete
            multiple
            options={options}
            value={value}
            loading={!!loading}
            disabled={!!disabled}
            isOptionEqualToValue={(a, b) => a.slug === b.slug}
            getOptionLabel={(o) => (getOptionLabel ? getOptionLabel(o) : (o.label ?? o.slug))}
            onChange={(_, v) => onChangeSlugs(v.map((x) => x.slug))}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    placeholder={placeholder}
                    error={!!errorText}
                    helperText={errorText}
                    fullWidth
                />
            )}
        />
    );
});
