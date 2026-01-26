import React, { useMemo } from "react";
import { Autocomplete, TextField } from "@mui/material";
import type { LookupOpt } from "@/shared/utils/lookupUtils";

type Props = {
    label: string;
    placeholder?: string;
    options: LookupOpt[];
    valueSlug: string;
    onChangeSlug: (slug: string) => void;
    getOptionLabel: (o: LookupOpt) => string;
    loading?: boolean;
    errorText?: string;
    disabled?: boolean;
};

export const LookupAutocomplete = React.memo(function LookupAutocomplete({
                                                                             label,
                                                                             placeholder,
                                                                             options,
                                                                             valueSlug,
                                                                             onChangeSlug,
                                                                             getOptionLabel,
                                                                             loading,
                                                                             errorText,
                                                                             disabled,
                                                                         }: Props) {
    const bySlug = useMemo(() => new Map(options.map((o) => [o.slug, o])), [options]);
    const value = valueSlug ? bySlug.get(valueSlug) ?? null : null;

    return (
        <Autocomplete
            options={options}
            value={value}
            loading={!!loading}
            disabled={!!disabled}
            isOptionEqualToValue={(a, b) => a.slug === b.slug}
            getOptionLabel={(o) => getOptionLabel(o) || o.slug}
            onChange={(_, v) => onChangeSlug(v?.slug ?? "")}
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
