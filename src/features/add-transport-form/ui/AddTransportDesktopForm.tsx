import React from "react";
import { Box, Button, Checkbox, Divider, FormControlLabel, Grid, Stack, TextField, Typography } from "@mui/material";
import { Controller, type UseFormReturn } from "react-hook-form";

import type { LookupOpt } from "@/shared/utils/lookupUtils";
import { RHFLookupAutocomplete } from "@/shared/ui/lookup/RHFLookupAutocomplete";
import { LookupAutocomplete } from "@/shared/ui/lookup/LookupAutocomplete";
import { ImageUploadField } from "@/shared/ui/image-upload/ImageUploadField";
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


    loadCountryErrors?: Array<string | undefined>;
    unloadCountryErrors?: Array<string | undefined>;
    loading: boolean;
    imagePreviews: string[];
};

export function AddTransportDesktopForm({
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

                                            loadCountryErrors,
                                            unloadCountryErrors,
                                            loading,
                                            imagePreviews,
                                        }: Props) {
    const { register, control, setValue, formState, watch } = form;
    const images = watch("images");

    return (
        <Box component="form" noValidate onSubmit={onSubmit}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
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

                <Grid size={{ xs: 12, sm: 4 }}>
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

                <Grid size={{ xs: 12, sm: 4 }}>
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

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TransportPointsFieldArray
                        t={t}
                        kind="load"
                        name="loadPlaces"
                        form={form}

                        errorMessages={loadCountryErrors}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TransportPointsFieldArray
                        t={t}
                        kind="unload"
                        name="unloadPlaces"
                        form={form}

                        errorMessages={unloadCountryErrors}
                    />
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 4 }} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <RHFLookupAutocomplete<AddTransportFormValues>
                        key={`vehicleType-transport-desktop-${i18nLang}`}
                        control={control}
                        name="vehicleType"
                        label={t("addTransport.fields.vehicleType")}
                        placeholder={t("addTransport.fields.selectVehicleType")}
                        options={vehicleOpts}
                        getOptionLabel={getLocalizedLabel}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
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

                <Grid size={{ xs: 12, sm: 6 }}>
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

                <Grid size={{ xs: 12, sm: 6 }}>
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

                <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" sx={{ mt: 1 }}>
                        {t("addTransport.fields.bodyDimensions")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {t("addTransport.fields.bodyDimensionsSubtitle")}
                    </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
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

                <Grid size={{ xs: 12, sm: 4 }}>
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

                <Grid size={{ xs: 12, sm: 4 }}>
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

                <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 4 }} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <PriceField
                        control={control}
                        label={t("addTransport.fields.price")}
                        currencyOpts={currencyOpts}
                        getLocalizedLabel={getLocalizedLabel}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <RHFLookupAutocomplete<AddTransportFormValues>
                        key={`paymentMethod-transport-desktop-${i18nLang}`}
                        control={control}
                        name="paymentMethod"
                        label={t("addTransport.fields.paymentMethod")}
                        placeholder={t("addTransport.fields.selectPaymentMethod")}
                        options={payMethodOpts}
                        getOptionLabel={getLocalizedLabel}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <RHFLookupAutocomplete<AddTransportFormValues>
                        key={`paymentTerm-transport-desktop-${i18nLang}`}
                        control={control}
                        name="paymentTerm"
                        label={t("addTransport.fields.paymentTerm")}
                        placeholder={t("addTransport.fields.selectPaymentTerm")}
                        options={payTermOpts}
                        getOptionLabel={getLocalizedLabel}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
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

                <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 4 }} />
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <ImageUploadField
                        label={t("addTransport.fields.images")}
                        helperText={t("addTransport.fields.imagesHelper")}
                        uploadButtonText={t("addTransport.fields.uploadImages")}
                        files={images ?? []}
                        previews={imagePreviews}
                        disabled={loadingInit || loading}
                        maxFiles={5}
                        onChange={(files) =>
                            setValue("images", files, {
                                shouldDirty: true,
                                shouldValidate: false,
                            })
                        }
                    />
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 4 }} />
                    <Typography variant="h6" mt={1} sx={{ fontWeight: "bold", mb: "10px" }}>
                        {t("addTransport.fields.contactsTitle")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        {t("addTransport.fields.contactsSubtitle")}
                    </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
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
                                control={<Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} size="small" />}
                                label={t("addTransport.fields.extraPhoneAsMainLabel")}
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
                        {t("addTransport.fields.clearPhone")}
                    </Button>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
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
                        className="additional-info-field"
                        fullWidth
                        multiline
                        minRows={3}
                        {...register("note")}
                    />
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Stack direction="row" justifyContent="center" mt={1.5}>
                        <Button type="submit" variant="contained" sx={{ minWidth: 280 }} disabled={loadingInit || loading}>
                            {t("addTransport.buttonSubmit")}
                        </Button>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
}