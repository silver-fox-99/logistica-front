import React, { useMemo, useState } from "react";
import { Box, Button, Checkbox, FormControlLabel, Grid, TextField, Typography } from "@mui/material";
import { Controller, type UseFormReturn } from "react-hook-form";

import type { LookupOpt } from "@/shared/utils/lookupUtils";
import { RHFLookupAutocomplete } from "@/shared/ui/lookup/RHFLookupAutocomplete";
import { LookupAutocomplete } from "@/shared/ui/lookup/LookupAutocomplete";
import { onDigitsOnlyKeyDown, onDigitsOnlyPaste } from "@/shared/lib/numericInput";

import type { AddTransportFormValues } from "../model/types";

import { PriceField } from "./PriceField";
import { TransportPointsFieldArray } from "./TransportPointsFieldArray";

type Props = {
    t: (k: string) => string;
    i18nLang: string;

    form: UseFormReturn<AddTransportFormValues>;
    onSubmit: (e?: React.BaseSyntheticEvent) => void;

    loadingInit: boolean;

    vehicleOpts: LookupOpt[];
    payMethodOpts: LookupOpt[];
    payTermOpts: LookupOpt[];
    currencyOpts: LookupOpt[];

    getLocalizedLabel: (o: LookupOpt) => string;

    geo: any;
    loadCountryErrors?: Array<string | undefined>;
    unloadCountryErrors?: Array<string | undefined>;
    loading: boolean
};

export function AddTransportMobileForm({
                                           t,
                                           i18nLang,

                                           form,
                                           onSubmit,
                                           loadingInit,

                                           vehicleOpts,
                                           payMethodOpts,
                                           payTermOpts,
                                           currencyOpts,

                                           getLocalizedLabel,

                                           geo,
                                           loadCountryErrors,
                                           unloadCountryErrors,
                                            loading
                                       }: Props) {
    const { register, control, setValue, formState } = form;

    const [activeStep, setActiveStep] = useState(0);

    const steps = useMemo(
        () => [
            t("addTransport.steps.datesRoutes"),
            t("addTransport.steps.transportInfo"),
            t("addTransport.steps.characteristics"),
            t("addTransport.steps.payment"),
            t("addTransport.steps.contacts"),
        ],
        [t]
    );


    const handleNext = () => setActiveStep((s) => Math.min(s + 1, steps.length - 1));
    const handleBack = () => setActiveStep((s) => Math.max(s - 1, 0));

    return (
        <Box component="form" noValidate onSubmit={onSubmit}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {t("addTransport.step")} {activeStep + 1} {t("addTransport.of")} {steps.length}: {steps[activeStep]}
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

            <Box sx={{ minHeight: 420, mb: 3 }}>
                {activeStep === 0 && (
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label={t("addTransport.fields.dateFrom")}
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
                                label={t("addTransport.fields.dateFrom")}
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
                                label={t("addTransport.fields.dateTo")}
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                {...register("dateTo")}
                                error={!!formState.errors.dateTo}
                                helperText={formState.errors.dateTo?.message as any}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TransportPointsFieldArray
                                t={t}
                                kind="load"
                                name="loadPlaces"
                                form={form}
                                geo={geo}
                                errorMessages={loadCountryErrors}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TransportPointsFieldArray
                                t={t}
                                kind="unload"
                                name="unloadPlaces"
                                form={form}
                                geo={geo}
                                errorMessages={unloadCountryErrors}
                            />
                        </Grid>
                    </Grid>
                )}

                {activeStep === 1 && (
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <RHFLookupAutocomplete<AddTransportFormValues>
                                key={`vehicleType-transport-mobile-${i18nLang}`}
                                control={control}
                                name="vehicleType"
                                label={t("addTransport.fields.vehicleType")}
                                placeholder={t("addTransport.fields.selectVehicleType")}
                                options={vehicleOpts}
                                getOptionLabel={getLocalizedLabel}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label={t("addTransport.fields.vehiclesCount")}
                                type="text"
                                fullWidth
                                placeholder={t("addTransport.fields.vehiclesCountPlaceholder")}
                                {...register("vehiclesCount")}
                                onKeyDown={onDigitsOnlyKeyDown as any}
                                onPaste={onDigitsOnlyPaste as any}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label={t("addTransport.fields.capacity")}
                                type="text"
                                fullWidth
                                placeholder={t("addTransport.fields.capacityPlaceholder")}
                                {...register("capacityTons")}
                                onKeyDown={onDigitsOnlyKeyDown as any}
                                onPaste={onDigitsOnlyPaste as any}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label={t("addTransport.fields.volume")}
                                type="text"
                                fullWidth
                                placeholder={t("addTransport.fields.volumePlaceholder")}
                                {...register("volumeM3")}
                                onKeyDown={onDigitsOnlyKeyDown as any}
                                onPaste={onDigitsOnlyPaste as any}
                            />
                        </Grid>
                    </Grid>
                )}

                {activeStep === 2 && (
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                                {t("addTransport.fields.bodyDimensions")}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {t("addTransport.fields.bodyDimensionsSubtitle")}
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label={t("addTransport.fields.length")}
                                type="text"
                                fullWidth
                                placeholder={t("addTransport.fields.lengthPlaceholder")}
                                {...register("dims.length")}
                                onKeyDown={onDigitsOnlyKeyDown as any}
                                onPaste={onDigitsOnlyPaste as any}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label={t("addTransport.fields.width")}
                                type="text"
                                fullWidth
                                placeholder={t("addTransport.fields.widthPlaceholder")}
                                {...register("dims.width")}
                                onKeyDown={onDigitsOnlyKeyDown as any}
                                onPaste={onDigitsOnlyPaste as any}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label={t("addTransport.fields.height")}
                                type="text"
                                fullWidth
                                placeholder={t("addTransport.fields.heightPlaceholder")}
                                {...register("dims.height")}
                                onKeyDown={onDigitsOnlyKeyDown as any}
                                onPaste={onDigitsOnlyPaste as any}
                            />
                        </Grid>
                    </Grid>
                )}

                {activeStep === 3 && (
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <PriceField control={control} label={t("addTransport.fields.price")} currencyOpts={currencyOpts} getLocalizedLabel={getLocalizedLabel} />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <RHFLookupAutocomplete<AddTransportFormValues>
                                key={`paymentMethod-transport-mobile-${i18nLang}`}
                                control={control}
                                name="paymentMethod"
                                label={t("addTransport.fields.paymentMethod")}
                                placeholder={t("addTransport.fields.selectPaymentMethod")}
                                options={payMethodOpts}
                                getOptionLabel={getLocalizedLabel}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <RHFLookupAutocomplete<AddTransportFormValues>
                                key={`paymentTerm-transport-mobile-${i18nLang}`}
                                control={control}
                                name="paymentTerm"
                                label={t("addTransport.fields.paymentTerm")}
                                placeholder={t("addTransport.fields.selectPaymentTerm")}
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
                                        label={t("addTransport.fields.bargaining")}
                                        placeholder={t("addTransport.fields.selectBargaining")}
                                        options={[
                                            { slug: "possible", label: t("addTransport.fields.bargainingPossible") } as any,
                                            { slug: "none", label: t("addTransport.fields.bargainingNone") } as any,
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
                                {t("addTransport.fields.contactsTitle")}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                {t("addTransport.fields.contactsSubtitle")}
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                                {t("addTransport.fields.additionalPhone")}
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
                                        control={<Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                                        label={t("addTransport.fields.extraPhoneAsMainLabel")}
                                        sx={{ mt: 0.5 }}
                                    />
                                )}
                            />

                            <Button
                                variant="text"
                                sx={{ mt: 0.5, alignSelf: "flex-start", textTransform: "none" }}
                                onClick={() => setValue("contactSecondary", "", { shouldDirty: true })}
                            >
                                {t("addTransport.fields.clearPhone")}
                            </Button>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label={t("addTransport.fields.email")}
                                placeholder={t("addTransport.fields.emailPlaceholder")}
                                fullWidth
                                {...register("email")}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label={t("addTransport.fields.additionalInfo")}
                                placeholder={t("addTransport.fields.additionalInfoPlaceholder")}
                                fullWidth
                                multiline
                                minRows={3}
                                className="additional-info-field"
                                {...register("note")}
                            />
                        </Grid>
                    </Grid>
                )}
            </Box>

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    pt: 2,
                    borderTop: "1px solid #E0E0E0",
                }}
            >
                <Button onClick={handleBack} disabled={activeStep === 0} sx={{ minWidth: 100 }}>
                    {t("addTransport.buttons.back")}
                </Button>

                <Typography variant="body2" color="text.secondary">
                    {activeStep + 1} / {steps.length}
                </Typography>

                {activeStep === steps.length - 1 ? (
                    <Button type="submit" variant="contained" sx={{ minWidth: 100 }} disabled={loadingInit || loading}>
                        {t("addTransport.buttons.submit")}
                    </Button>
                ) : (
                    <Button variant="contained" onClick={handleNext} sx={{ minWidth: 100 }}>
                        {t("addTransport.buttons.continue")}
                    </Button>
                )}
            </Box>
        </Box>
    );
}
