import type { Control, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";

import type { LookupOpt } from "@/shared/utils/lookupUtils";
import { LookupMultiAutocomplete } from "./LookupMultiAutocomplete";

type Props<TFV extends FieldValues> = {
    control: Control<TFV>;
    name: Path<TFV>;

    label: string;
    placeholder?: string;

    options: LookupOpt[];
    getOptionLabel: (o: LookupOpt) => string;

    loading?: boolean;
    disabled?: boolean;
};

export function RHFLookupMultiAutocomplete<TFV extends FieldValues>({
                                                                        control,
                                                                        name,
                                                                        label,
                                                                        placeholder,
                                                                        options,
                                                                        getOptionLabel,
                                                                        loading,
                                                                        disabled,
                                                                    }: Props<TFV>) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <LookupMultiAutocomplete
                    label={label}
                    placeholder={placeholder}
                    options={options}
                    valueSlugs={Array.isArray(field.value) ? (field.value as string[]) : []}
                    onChangeSlugs={(slugs) => field.onChange(slugs)}
                    getOptionLabel={getOptionLabel}
                    loading={loading}
                    disabled={disabled}
                    errorText={(fieldState.error?.message as any) ?? undefined}
                />
            )}
        />
    );
}
