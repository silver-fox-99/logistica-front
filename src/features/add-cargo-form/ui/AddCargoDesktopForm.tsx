import React from "react";
import { Box, Button, Checkbox, Divider, FormControlLabel, Grid, Stack, TextField, Typography } from "@mui/material";
import type { LookupOpt } from "@/shared/utils/lookupUtils";
import type { AddCargoFormValues } from "../model/types";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";

import { PlaceRowField } from "./PlaceRowField";
import { PriceField } from "./PriceField";
import { onDigitsOnlyKeyDown, onDigitsOnlyPaste } from "@/shared/lib/numericInput";

import { RHFLookupAutocomplete } from "@/shared/ui/lookup/RHFLookupAutocomplete";
import { RHFLookupMultiAutocomplete } from "@/shared/ui/lookup/RHFLookupMultiAutocomplete";
import { LookupAutocomplete } from "@/shared/ui/lookup/LookupAutocomplete";

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
    pickupCountryError?: string;
    dropoffCountryError?: string;
};

export function AddCargoDesktopForm({
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
                                        pickupCountryError,
                                        dropoffCountryError,
                                    }: Props) {
    const { register, control, setValue, formState } = form;

    return (
        <Box component="form" noValidate onSubmit={onSubmit}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
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
                        label={t("addCargo.fields.dateTo")}
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        {...register("dateTo")}
                        error={!!formState.errors.dateTo}
                        helperText={formState.errors.dateTo?.message as any}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack spacing={1}>
                        <PlaceRowField
                            kind="pickup"
                            index={0}
                            control={control}
                            setValue={setValue}
                            countries={geo.countries}
                            regions={geo.getRegions(form.getValues("pickups.0.countryId"))}
                            cities={geo.getCities(form.getValues("pickups.0.countryId"), form.getValues("pickups.0.regionId"))}
                            loadingCountries={geo.loading.countries}
                            loadingRegions={geo.loading.regionsFor === (form.getValues("pickups.0.countryId") || "")}
                            loadingCities={
                                geo.loading.citiesFor === `${form.getValues("pickups.0.countryId")}/${form.getValues("pickups.0.regionId")}`
                            }
                            errorText={pickupCountryError}
                            onCountryLoad={(id) => geo.ensureRegions(id)}
                            onRegionLoad={(countryId, regionId) => geo.ensureCities(countryId, regionId)}
                        />
                    </Stack>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack spacing={1}>
                        <PlaceRowField
                            kind="dropoff"
                            index={0}
                            control={control}
                            setValue={setValue}
                            countries={geo.countries}
                            regions={geo.getRegions(form.getValues("dropoffs.0.countryId"))}
                            cities={geo.getCities(form.getValues("dropoffs.0.countryId"), form.getValues("dropoffs.0.regionId"))}
                            loadingCountries={geo.loading.countries}
                            loadingRegions={geo.loading.regionsFor === (form.getValues("dropoffs.0.countryId") || "")}
                            loadingCities={
                                geo.loading.citiesFor === `${form.getValues("dropoffs.0.countryId")}/${form.getValues("dropoffs.0.regionId")}`
                            }
                            errorText={dropoffCountryError}
                            onCountryLoad={(id) => geo.ensureRegions(id)}
                            onRegionLoad={(countryId, regionId) => geo.ensureCities(countryId, regionId)}
                        />
                    </Stack>
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 4 }} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <RHFLookupAutocomplete<AddCargoFormValues>
                        key={`cargoType-desktop-${i18nLang}`}
                        control={control}
                        name="cargoType"
                        label={t("addCargo.fields.cargoType")}
                        placeholder={t("addCargo.fields.selectCargoType")}
                        options={cargoOpts}
                        getOptionLabel={getLocalizedLabel}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <RHFLookupAutocomplete<AddCargoFormValues>
                        key={`vehicleType-desktop-${i18nLang}`}
                        control={control}
                        name="vehicleType"
                        label={t("addCargo.fields.vehicleType")}
                        placeholder={t("addCargo.fields.selectVehicleType")}
                        options={vehicleOpts}
                        getOptionLabel={getLocalizedLabel}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <RHFLookupMultiAutocomplete<AddCargoFormValues>
                        key={`loadType-desktop-${i18nLang}`}
                        control={control}
                        name="loadType"
                        label={t("addCargo.fields.loadType")}
                        placeholder={t("addCargo.fields.selectLoadType")}
                        options={loadOpts}
                        getOptionLabel={getLocalizedLabel}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                        name="allowPartial"
                        control={control}
                        render={({ field }) => (
                            <FormControlLabel
                                sx={{ marginLeft: 0, marginRight: 0, marginTop: 3 }}
                                control={<Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                                label={t("addCargo.fields.allowPartialLabel")}
                            />
                        )}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
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

                <Grid size={{ xs: 12, sm: 6 }}>
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

                <Grid size={{ xs: 12, sm: 6 }}>
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

                <Grid size={{ xs: 12, sm: 6 }}>
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

                <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        {t("addCargo.fields.length")}
                    </Typography>
                    <TextField
                        type="text"
                        placeholder={t("addCargo.fields.length")}
                        fullWidth
                        {...register("dims.length")}
                        onKeyDown={onDigitsOnlyKeyDown as any}
                        onPaste={onDigitsOnlyPaste as any}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        {t("addCargo.fields.width")}
                    </Typography>
                    <TextField
                        type="text"
                        placeholder={t("addCargo.fields.width")}
                        fullWidth
                        {...register("dims.width")}
                        onKeyDown={onDigitsOnlyKeyDown as any}
                        onPaste={onDigitsOnlyPaste as any}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        {t("addCargo.fields.height")}
                    </Typography>
                    <TextField
                        type="text"
                        placeholder={t("addCargo.fields.height")}
                        fullWidth
                        {...register("dims.height")}
                        onKeyDown={onDigitsOnlyKeyDown as any}
                        onPaste={onDigitsOnlyPaste as any}
                    />
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 4 }} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <PriceField control={control} label={t("addCargo.fields.price")} currencyOpts={currencyOpts} getLocalizedLabel={getLocalizedLabel} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <RHFLookupAutocomplete<AddCargoFormValues>
                        key={`paymentMethod-desktop-${i18nLang}`}
                        control={control}
                        name="paymentMethod"
                        label={t("addCargo.fields.paymentMethod")}
                        placeholder={t("addCargo.fields.selectPaymentMethod")}
                        options={payMethodOpts}
                        getOptionLabel={getLocalizedLabel}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <RHFLookupAutocomplete<AddCargoFormValues>
                        key={`paymentTerm-desktop-${i18nLang}`}
                        control={control}
                        name="paymentTerm"
                        label={t("addCargo.fields.paymentTerm")}
                        placeholder={t("addCargo.fields.selectPaymentTerm")}
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

                <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 4 }} />
                    <Typography variant="h6" mt={1} sx={{ fontWeight: "bold", mb: "10px" }}>
                        {t("addCargo.fields.contactsTitle")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        {t("addCargo.fields.contactsSubtitle")}
                    </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
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
                        className="additional-info-field"
                        fullWidth
                        multiline
                        minRows={3}
                        {...register("note")}
                    />
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Stack direction="row" justifyContent="center" mt={1.5}>
                        <Button type="submit" variant="contained" sx={{ minWidth: 280 }} disabled={loadingInit}>
                            {t("addCargo.buttonSubmit")}
                        </Button>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
}
