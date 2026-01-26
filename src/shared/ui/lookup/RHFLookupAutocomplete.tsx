import type { Control, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";

import type { LookupOpt } from "@/shared/utils/lookupUtils";
import { LookupAutocomplete } from "./LookupAutocomplete";

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

export function RHFLookupAutocomplete<TFV extends FieldValues>({
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
                <LookupAutocomplete
                    label={label}
                    placeholder={placeholder}
                    options={options}
                    valueSlug={(field.value as string | undefined) ?? ""}
                    onChangeSlug={(slug) => field.onChange(slug)}
                    getOptionLabel={getOptionLabel}
                    loading={loading}
                    disabled={disabled}
                    errorText={(fieldState.error?.message as any) ?? undefined}
                />
            )}
        />
    );
}
