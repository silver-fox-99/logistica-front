
import { FormControl, InputAdornment, InputLabel, MenuItem, OutlinedInput, Select } from "@mui/material";
import { useController } from "react-hook-form";
import type { Control } from "react-hook-form";

import type { LookupOpt } from "@/shared/utils/lookupUtils";
import { onDigitsOnlyKeyDown, onDigitsOnlyPaste } from "@/shared/lib/numericInput";

import type { AddTransportFormValues } from "../model/types";

type Props = {
    control: Control<AddTransportFormValues>;
    label: string;

    currencyOpts: LookupOpt[];
    getLocalizedLabel: (o: LookupOpt) => string;
};

export function PriceField({ control, label, currencyOpts, getLocalizedLabel }: Props) {
    const currency = useController({ control, name: "currency" });
    const price = useController({ control, name: "price" });

    const currentCurrency = (currency.field.value as string) || currencyOpts?.[0]?.slug || "USD";

    return (
        <FormControl fullWidth>
            <InputLabel shrink>{label}</InputLabel>
            <OutlinedInput
                label={label}
                value={(price.field.value as any) ?? ""}
                onChange={price.field.onChange}
                onKeyDown={onDigitsOnlyKeyDown as any}
                onPaste={onDigitsOnlyPaste as any}
                type="text"
                startAdornment={
                    <InputAdornment position="start" sx={{ mr: 1 }}>
                        <Select
                            value={currentCurrency}
                            onChange={(e) => currency.field.onChange(e.target.value)}
                            variant="standard"
                            disableUnderline
                            displayEmpty
                            sx={{
                                minWidth: 80,
                                fontWeight: 500,
                                ".MuiSelect-select": { py: 0.5, pl: 0, pr: "24px !important" },
                            }}
                            disabled={currencyOpts.length === 0}
                        >
                            {currencyOpts.length ? (
                                currencyOpts.map((o) => (
                                    <MenuItem key={o.slug} value={o.slug}>
                                        {getLocalizedLabel(o)}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem value="USD">USD</MenuItem>
                            )}
                        </Select>
                    </InputAdornment>
                }
                sx={{ borderRadius: 2, ".MuiOutlinedInput-input": { py: 1.25 } }}
            />
        </FormControl>
    );
}
