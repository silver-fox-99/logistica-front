import { useMemo } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";

import type { IdOption } from "./IdAutocomplete";
import { IdAutocomplete } from "./IdAutocomplete";

type Props<TFV extends FieldValues> = {
    control: Control<TFV>;
    name: Path<TFV>;

    label: string;
    placeholder?: string;

    options: IdOption[];
    loading?: boolean;
    disabled?: boolean;

    helperText?: string;
};

export function RHFIdAutocomplete<TFV extends FieldValues>({
                                                               control,
                                                               name,
                                                               label,
                                                               placeholder,
                                                               options,
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
                const valueId = (field.value as string | undefined) ?? undefined;
                const valueOpt = valueId ? map.get(valueId) ?? null : null;

                return (
                    <IdAutocomplete
                        label={label}
                        placeholder={placeholder}
                        options={options}
                        value={valueOpt}
                        onChange={(opt) => field.onChange(opt?.id)}
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
