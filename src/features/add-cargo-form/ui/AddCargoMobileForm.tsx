import React, { useMemo, useState } from "react";
import { Box, Button, Checkbox, FormControlLabel, Grid, TextField, Typography } from "@mui/material";
import type { LookupOpt } from "@/shared/utils/lookupUtils";
import type { AddCargoFormValues } from "../model/types";
import {type UseFormReturn} from "react-hook-form";
import { Controller } from "react-hook-form";


import { PriceField } from "./PriceField";
import { onDigitsOnlyKeyDown, onDigitsOnlyPaste } from "@/shared/lib/numericInput";

import { RHFLookupAutocomplete } from "@/shared/ui/lookup/RHFLookupAutocomplete";
import { RHFLookupMultiAutocomplete } from "@/shared/ui/lookup/RHFLookupMultiAutocomplete";
import { LookupAutocomplete } from "@/shared/ui/lookup/LookupAutocomplete";
import {CargoPointsFieldArray} from "@/features/add-cargo-form/ui/CargoPointsFieldArray.tsx";
import {FiArrowLeft, FiArrowRight} from "react-icons/fi";

type Props = {
    t: (k: string) => string;
    i18nLang: string;

    form: UseFormReturn<AddCargoFormValues>;
    onSubmit: (e?: React.BaseSyntheticEvent) => void;

    loadingInit: boolean;

    cargoOpts: LookupOpt[];
    vehicleOpts: LookupOpt[];
    loadOpts: LookupOpt[];
    payMethodOpts: LookupOpt[];
    payTermOpts: LookupOpt[];
    currencyOpts: LookupOpt[];

    getLocalizedLabel: (o: LookupOpt) => string;

    geo: any;
    pickupCountryErrors?: Array<string | undefined>;
    dropoffCountryErrors?: Array<string | undefined>;
    loading: boolean;
};

export function AddCargoMobileForm({
                                       t,
                                       i18nLang,

                                       form,
                                       onSubmit,
                                       loadingInit,

                                       cargoOpts,
                                       vehicleOpts,
                                       loadOpts,
                                       payMethodOpts,
                                       payTermOpts,
                                       currencyOpts,

                                       getLocalizedLabel,

                                       geo,
                                       pickupCountryErrors,
                                       dropoffCountryErrors,
                                        loading
                                   }: Props) {
    const [activeStep, setActiveStep] = useState(0);

    const { register, control, setValue, formState } = form;

    const steps = useMemo(
        () => [
            t("addCargo.steps.datesRoutes"),
            t("addCargo.steps.cargoInfo"),
            t("addCargo.steps.dimensions"),
            t("addCargo.steps.payment"),
            t("addCargo.steps.contacts"),
        ],
        [t]
    );

    const handleNext = () => setActiveStep((p) => p + 1);
    const handleBack = () => setActiveStep((p) => p - 1);

    return (
        <Box component="form" noValidate onSubmit={onSubmit}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {t("addCargo.step")} {activeStep + 1} {t("addCargo.of")} {steps.length}: {steps[activeStep]}
                </Typography>

                <Box sx={{ width: "100%", bgcolor: "#E0E0E0", borderRadius: 1, height: 8 }}>
                    <Box
                        sx={{
                            bgcolor: "#4472B8",
                            height: "100%",
                            borderRadius: 1,
                            width: `${((activeStep + 1) / steps.length) * 100}%`,
                            transition: "width 0.3s ease",
                        }}
                    />
                </Box>
            </Box>

            <Box sx={{ minHeight: "400px", mb: 3 }}>
                {activeStep === 0 && (
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label={t("addCargo.fields.dateFromStart")}
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                {...register("dateFrom")}
                                error={!!formState.errors.dateFrom}
                                helperText={formState.errors.dateFrom?.message as any}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label={t("addCargo.fields.dateFromEnd")}
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                {...register("dateFromEnd")}
                                error={!!formState.errors.dateFromEnd}
                                helperText={formState.errors.dateFromEnd?.message as any}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label={t("addCargo.fields.dateTo")}
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                {...register("dateTo")}
                                error={!!formState.errors.dateTo}
                                helperText={formState.errors.dateTo?.message as any}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <CargoPointsFieldArray
                                t={t}
                                kind="pickup"
                                name="pickups"
                                form={form}
                                geo={geo}
                                errorMessages={pickupCountryErrors}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <CargoPointsFieldArray
                                t={t}
                                kind="dropoff"
                                name="dropoffs"
                                form={form}
                                geo={geo}
                                errorMessages={dropoffCountryErrors}
                            />
                        </Grid>
                    </Grid>
                )}

                {activeStep === 1 && (
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <RHFLookupAutocomplete<AddCargoFormValues>
                                key={`cargoType-${i18nLang}`}
                                control={control}
                                name="cargoType"
                                label={t("addCargo.fields.cargoType")}
                                placeholder={t("addCargo.fields.selectCargoType")}
                                options={cargoOpts}
                                getOptionLabel={getLocalizedLabel}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <RHFLookupAutocomplete<AddCargoFormValues>
                                key={`vehicleType-${i18nLang}`}
                                control={control}
                                name="vehicleType"
                                label={t("addCargo.fields.vehicleType")}
                                placeholder={t("addCargo.fields.selectVehicleType")}
                                options={vehicleOpts}
                                getOptionLabel={getLocalizedLabel}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <RHFLookupMultiAutocomplete<AddCargoFormValues>
                                key={`loadType-${i18nLang}`}
                                control={control}
                                name="loadType"
                                label={t("addCargo.fields.loadType")}
                                placeholder={t("addCargo.fields.selectLoadType")}
                                options={loadOpts}
                                getOptionLabel={getLocalizedLabel}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name="allowPartial"
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={<Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                                        label={t("addCargo.fields.allowPartialLabel")}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                )}

                {activeStep === 2 && (
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                                {t("addCargo.fields.weightTons")}
                            </Typography>
                            <TextField
                                type="text"
                                fullWidth
                                placeholder={t("addCargo.fields.weightPlaceholder")}
                                {...register("weightTons")}
                                onKeyDown={onDigitsOnlyKeyDown as any}
                                onPaste={onDigitsOnlyPaste as any}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label={t("addCargo.fields.volume")}
                                type="text"
                                fullWidth
                                placeholder={t("addCargo.fields.volumePlaceholder")}
                                {...register("volumeM3")}
                                onKeyDown={onDigitsOnlyKeyDown as any}
                                onPaste={onDigitsOnlyPaste as any}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label={t("addCargo.fields.vehiclesCount")}
                                type="text"
                                fullWidth
                                placeholder={t("addCargo.fields.vehiclesCountPlaceholder")}
                                {...register("vehiclesCount")}
                                onKeyDown={onDigitsOnlyKeyDown as any}
                                onPaste={onDigitsOnlyPaste as any}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                                {t("addCargo.fields.palletsCount")}
                            </Typography>
                            <TextField
                                type="text"
                                fullWidth
                                placeholder={t("addCargo.fields.palletsCountPlaceholder")}
                                {...register("palletsCount")}
                                onKeyDown={onDigitsOnlyKeyDown as any}
                                onPaste={onDigitsOnlyPaste as any}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                                {t("addCargo.fields.dimensions")}
                            </Typography>

                            <Grid container spacing={1}>
                                <Grid size={{ xs: 12, lg: 4 }}>
                                    <TextField
                                        type="text"
                                        placeholder={t("addCargo.fields.length")}
                                        fullWidth
                                        {...register("dims.length")}
                                        onKeyDown={onDigitsOnlyKeyDown as any}
                                        onPaste={onDigitsOnlyPaste as any}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, lg: 4 }}>
                                    <TextField
                                        type="text"
                                        placeholder={t("addCargo.fields.width")}
                                        fullWidth
                                        {...register("dims.width")}
                                        onKeyDown={onDigitsOnlyKeyDown as any}
                                        onPaste={onDigitsOnlyPaste as any}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, lg: 4 }}>
                                    <TextField
                                        type="text"
                                        placeholder={t("addCargo.fields.height")}
                                        fullWidth
                                        {...register("dims.height")}
                                        onKeyDown={onDigitsOnlyKeyDown as any}
                                        onPaste={onDigitsOnlyPaste as any}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                )}

                {activeStep === 3 && (
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <PriceField control={control} label={t("addCargo.fields.price")} currencyOpts={currencyOpts} getLocalizedLabel={getLocalizedLabel} />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <RHFLookupAutocomplete<AddCargoFormValues>
                                key={`paymentMethod-${i18nLang}`}
                                control={control}
                                name="paymentMethod"
                                label={t("addCargo.fields.paymentMethod")}
                                placeholder={t("addCargo.fields.selectPaymentMethod")}
                                options={payMethodOpts}
                                getOptionLabel={getLocalizedLabel}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <RHFLookupAutocomplete<AddCargoFormValues>
                                key={`paymentTerm-${i18nLang}`}
                                control={control}
                                name="paymentTerm"
                                label={t("addCargo.fields.paymentTerm")}
                                placeholder={t("addCargo.fields.selectPaymentTerm")}
                                options={payTermOpts}
                                getOptionLabel={getLocalizedLabel}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name="bargaining"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <LookupAutocomplete
                                        label={t("addCargo.fields.bargaining")}
                                        placeholder={t("addCargo.fields.selectBargaining")}
                                        options={[
                                            { slug: "possible", label: t("addCargo.fields.bargainingPossible") } as any,
                                            { slug: "none", label: t("addCargo.fields.bargainingNone") } as any,
                                        ]}
                                        valueSlug={(field.value as any) ?? ""}
                                        onChangeSlug={(slug) => field.onChange(slug)}
                                        getOptionLabel={(o: any) => o.label}
                                        errorText={(fieldState.error?.message as any) ?? undefined}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                )}

                {activeStep === 4 && (
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="h6" mt={1} sx={{ fontWeight: "bold", mb: "10px" }}>
                                {t("addCargo.fields.contactsTitle")}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                {t("addCargo.fields.contactsSubtitle")}
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                                {t("addCargo.fields.additionalPhone")}
                            </Typography>

                            <TextField
                                placeholder="+380971234567"
                                fullWidth
                                {...register("contactSecondary")}
                                error={!!formState.errors.contactSecondary}
                                helperText={(formState.errors.contactSecondary?.message as any) || ""}
                            />

                            <Controller
                                name="extraPhoneAsMain"
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={<Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} size="small" />}
                                        label={t("addCargo.fields.extraPhoneAsMainLabel")}
                                        sx={{
                                            mt: 1.5,
                                            ml: 0,
                                            backgroundColor: "transparent",
                                            "& .MuiFormControlLabel-label": { fontSize: "0.875rem" },
                                        }}
                                    />
                                )}
                            />

                            <Button
                                variant="text"
                                sx={{ mt: 0.5, alignSelf: "flex-start", textTransform: "none" }}
                                onClick={() => setValue("contactSecondary", "", { shouldDirty: true })}
                            >
                                {t("addCargo.fields.clearPhone")}
                            </Button>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label={t("addCargo.fields.additionalInfo")}
                                placeholder={t("addCargo.fields.additionalInfoPlaceholder")}
                                fullWidth
                                multiline
                                minRows={3}
                                {...register("note")}
                            />
                        </Grid>
                    </Grid>
                )}
            </Box>

            <Box
                sx={{
                    pt: 2,
                    mt: 1,
                    borderTop: "1px solid",
                    borderColor: "divider",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                    }}
                >
                    <Button
                        onClick={handleBack}
                        disabled={activeStep === 0}
                        variant="outlined"
                        sx={{
                            minWidth: 44,
                            width: 44,
                            height: 44,
                            p: 0,
                            borderRadius: 2,
                            flexShrink: 0,
                        }}
                    >
                        <FiArrowLeft size={18} />
                    </Button>

                    {activeStep < steps.length - 1 && (
                        <Button
                            variant="outlined"
                            onClick={handleNext}
                            sx={{
                                minWidth: 44,
                                width: 44,
                                height: 44,
                                p: 0,
                                borderRadius: 2,
                                flexShrink: 0,
                            }}
                        >
                            <FiArrowRight size={18} />
                        </Button>
                    )}

                    {activeStep > 0 && (
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loadingInit || loading}
                            sx={{
                                height: 44,
                                px: 2,
                                ml: "auto",
                                minWidth: 140,
                                textTransform: "none",
                                borderRadius: 2,
                                fontWeight: 700,
                                boxShadow: "none",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {t("addCargo.buttons.submit")}
                        </Button>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
