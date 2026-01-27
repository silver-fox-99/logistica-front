import { useMemo } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";

import type { IdOption } from "./IdAutocomplete";
import { IdMultiAutocomplete } from "./IdMultiAutocomplete";

type Props<TFV extends FieldValues> = {
    control: Control<TFV>;
    name: Path<TFV>;

    label: string;
    placeholder?: string;

    options: IdOption[];
    maxSelected?: number;

    loading?: boolean;
    disabled?: boolean;

    helperText?: string;
};

export function RHFIdMultiAutocomplete<TFV extends FieldValues>({
                                                                    control,
                                                                    name,
                                                                    label,
                                                                    placeholder,
                                                                    options,
                                                                    maxSelected,
                                                                    loading,
                                                                    disabled,
                                                                    helperText,
                                                                }: Props<TFV>) {
    const map = useMemo(() => new Map(options.map((o) => [o.id, o])), [options]);

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => {
                const valueIds = Array.isArray(field.value) ? (field.value as string[]) : [];
                const valueOpts = valueIds.map((id) => map.get(id)).filter(Boolean) as IdOption[];

                return (
                    <IdMultiAutocomplete
                        label={label}
                        placeholder={placeholder}
                        options={options}
                        value={valueOpts}
                        onChange={(opts) => field.onChange(opts.map((o) => o.id))}
                        maxSelected={maxSelected}
                        loading={loading}
                        disabled={disabled}
                        helperText={helperText}
                        errorText={(fieldState.error?.message as any) ?? undefined}
                    />
                );
            }}
        />
    );
}
