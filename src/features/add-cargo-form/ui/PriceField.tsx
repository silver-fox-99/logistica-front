import { useEffect, useMemo } from "react";
import { Autocomplete, FormControl, InputAdornment, InputLabel, OutlinedInput, TextField } from "@mui/material";
import type { Control } from "react-hook-form";
import { Controller, useWatch } from "react-hook-form";
import type { LookupOpt } from "@/shared/utils/lookupUtils";
import type { AddCargoFormValues } from "../model/types";
import { onDigitsOnlyKeyDown, onDigitsOnlyPaste, onDigitsOnlyChange } from "@/shared/lib/numericInput";

type Props = {
    control: Control<AddCargoFormValues>;
    label: string;
    currencyOpts: LookupOpt[];
    getLocalizedLabel: (o: LookupOpt) => string;
};

export function PriceField({ control, label, currencyOpts, getLocalizedLabel }: Props) {
    const currency = useWatch({ control, name: "currency" });

    const fallbackCurrency = currencyOpts[0];

    const currentCurrencyOpt: LookupOpt | undefined = useMemo(() => {
        if (!currency) return fallbackCurrency;
        return currencyOpts.find((c) => c.slug === currency) ?? fallbackCurrency;
    }, [currency, currencyOpts, fallbackCurrency]);


    useEffect(() => {
        if (!fallbackCurrency) return;
        if (!currency || !currencyOpts.some((c) => c.slug === currency)) {
        }
    }, [currency, currencyOpts, fallbackCurrency]);

    return (
        <FormControl fullWidth>
            <InputLabel shrink>{label}</InputLabel>

            <Controller
                name="price"
                control={control}
                render={({ field }) => (
                    <OutlinedInput
                        label={label}
                        value={field.value ?? ""}
                        onChange={(e) => {
                            onDigitsOnlyChange(e as any);
                            field.onChange((e.target as HTMLInputElement).value);
                        }}
                        type="text"
                        className="price-input-field"
                        onKeyDown={onDigitsOnlyKeyDown as any}
                        onPaste={onDigitsOnlyPaste as any}
                        startAdornment={
                            <InputAdornment position="start" sx={{ mr: 1 }}>
                                <Controller
                                    name="currency"
                                    control={control}
                                    render={({ field: cur }) => (
                                        <Autocomplete<LookupOpt, false, true, false>
                                            disableClearable
                                            options={currencyOpts}
                                            value={currentCurrencyOpt}
                                            isOptionEqualToValue={(a, b) => a.slug === b.slug}
                                            getOptionLabel={(o) => getLocalizedLabel(o)}
                                            onChange={(_, v) => cur.onChange(v.slug)}
                                            sx={{
                                                minWidth: 80,
                                                "& .MuiFormControl-root": {
                                                    backgroundColor: "transparent !important",
                                                },
                                                "& .MuiInputBase-root": {
                                                    backgroundColor: "transparent !important",
                                                },
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    variant="standard"
                                                    InputProps={{ ...params.InputProps, disableUnderline: true }}
                                                />
                                            )}
                                        />
                                    )}
                                />
                            </InputAdornment>
                        }
                        sx={{ borderRadius: "8px", ".MuiOutlinedInput-input": { py: 1.25 } }}
                    />
                )}
            />
        </FormControl>
    );
}
