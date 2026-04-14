import React, { useMemo, useState } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    Grid,
    TextField,
    Typography,
} from "@mui/material";
import type { LookupOpt } from "@/shared/utils/lookupUtils";
import type { AddCargoFormValues } from "../model/types";
import { type UseFormReturn, Controller } from "react-hook-form";

import { PriceField } from "./PriceField";
import { onDigitsOnlyKeyDown, onDigitsOnlyPaste } from "@/shared/lib/numericInput";

import { RHFLookupAutocomplete } from "@/shared/ui/lookup/RHFLookupAutocomplete";
import { RHFLookupMultiAutocomplete } from "@/shared/ui/lookup/RHFLookupMultiAutocomplete";
import { LookupAutocomplete } from "@/shared/ui/lookup/LookupAutocomplete";
import { CargoPointsFieldArray } from "@/features/add-cargo-form/ui/CargoPointsFieldArray";
import {FiBox, FiChevronDown, FiCreditCard, FiPackage, FiPhone} from "react-icons/fi";
import type {IconType} from "react-icons";

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
                                       loading,
                                   }: Props) {
    const { register, control, setValue, formState } = form;

    const [openedSections, setOpenedSections] = useState<number[]>([0]);

    const sections = useMemo(
        () => [
            {
                key: "datesRoutes",
                title: t("addCargo.steps.datesRoutes"),
                icon: FiPackage,
            },
            {
                key: "cargoInfo",
                title: t("addCargo.steps.cargoInfo"),
                icon: FiBox,
            },
            {
                key: "dimensions",
                title: t("addCargo.steps.dimensions"),
                icon: FiBox,
            },
            {
                key: "payment",
                title: t("addCargo.steps.payment"),
                icon: FiCreditCard,
            },
            {
                key: "contacts",
                title: t("addCargo.steps.contacts"),
                icon: FiPhone,
            },
        ],
        [t]
    );

    const isSectionOpen = (index: number) => openedSections.includes(index);

    const toggleSection = (index: number) => {
        if (index === 0) return;

        setOpenedSections((prev) =>
            prev.includes(index)
                ? prev.filter((item) => item !== index)
                : [...prev, index]
        );
    };

    const renderSectionHeader = (
        index: number,
        title: string,
        Icon: IconType
    ) => (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                pr: 1,
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                <Box
                    sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "#EAF1FB",
                        color: "primary.main",
                        flexShrink: 0,
                    }}
                >
                    <Icon size={18} />
                </Box>

                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
                    {title}
                </Typography>
            </Box>

            {index !== 0 && (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        color: "text.secondary",
                        transition: "transform 0.2s ease",
                        transform: isSectionOpen(index)
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                    }}
                >
                    <FiChevronDown size={18} />
                </Box>
            )}
        </Box>
    );

    return (
        <Box component="form" noValidate onSubmit={onSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Accordion
                    expanded
                    disableGutters
                    elevation={0}
                    sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: "16px !important",
                        overflow: "hidden",
                        "&:before": { display: "none" },
                    }}
                >
                    <AccordionSummary
                        sx={{
                            px: 2,
                            py: 0.5,
                            minHeight: 64,
                            "& .MuiAccordionSummary-content": { my: 1 },
                        }}
                    >
                        {renderSectionHeader(0, sections[0].title, sections[0].icon)}
                    </AccordionSummary>

                    <AccordionDetails sx={{ px: 2, pb: 2 }}>
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
                    </AccordionDetails>
                </Accordion>

                <Accordion
                    expanded={isSectionOpen(1)}
                    onChange={() => toggleSection(1)}
                    disableGutters
                    elevation={0}
                    sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: "16px !important",
                        overflow: "hidden",
                        "&:before": { display: "none" },
                    }}
                >
                    <AccordionSummary
                        expandIcon={null}
                        sx={{
                            px: 2,
                            py: 0.5,
                            minHeight: 64,
                            "& .MuiAccordionSummary-content": { my: 1 },
                        }}
                    >
                        {renderSectionHeader(1, sections[1].title, sections[1].icon)}
                    </AccordionSummary>

                    <AccordionDetails sx={{ px: 2, pb: 2 }}>
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
                                            control={
                                                <Checkbox
                                                    checked={!!field.value}
                                                    onChange={(e) => field.onChange(e.target.checked)}
                                                />
                                            }
                                            label={t("addCargo.fields.allowPartialLabel")}
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>

                <Accordion
                    expanded={isSectionOpen(2)}
                    onChange={() => toggleSection(2)}
                    disableGutters
                    elevation={0}
                    sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: "16px !important",
                        overflow: "hidden",
                        "&:before": { display: "none" },
                    }}
                >
                    <AccordionSummary
                        expandIcon={null}
                        sx={{
                            px: 2,
                            py: 0.5,
                            minHeight: 64,
                            "& .MuiAccordionSummary-content": { my: 1 },
                        }}
                    >
                        {renderSectionHeader(2, sections[2].title, sections[2].icon)}
                    </AccordionSummary>

                    <AccordionDetails sx={{ px: 2, pb: 2 }}>
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
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <TextField
                                            type="text"
                                            placeholder={t("addCargo.fields.length")}
                                            fullWidth
                                            {...register("dims.length")}
                                            onKeyDown={onDigitsOnlyKeyDown as any}
                                            onPaste={onDigitsOnlyPaste as any}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <TextField
                                            type="text"
                                            placeholder={t("addCargo.fields.width")}
                                            fullWidth
                                            {...register("dims.width")}
                                            onKeyDown={onDigitsOnlyKeyDown as any}
                                            onPaste={onDigitsOnlyPaste as any}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 4 }}>
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
                    </AccordionDetails>
                </Accordion>

                <Accordion
                    expanded={isSectionOpen(3)}
                    onChange={() => toggleSection(3)}
                    disableGutters
                    elevation={0}
                    sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: "16px !important",
                        overflow: "hidden",
                        "&:before": { display: "none" },
                    }}
                >
                    <AccordionSummary
                        expandIcon={null}
                        sx={{
                            px: 2,
                            py: 0.5,
                            minHeight: 64,
                            "& .MuiAccordionSummary-content": { my: 1 },
                        }}
                    >
                        {renderSectionHeader(3, sections[3].title, sections[3].icon)}
                    </AccordionSummary>

                    <AccordionDetails sx={{ px: 2, pb: 2 }}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12 }}>
                                <PriceField
                                    control={control}
                                    label={t("addCargo.fields.price")}
                                    currencyOpts={currencyOpts}
                                    getLocalizedLabel={getLocalizedLabel}
                                />
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
                    </AccordionDetails>
                </Accordion>

                <Accordion
                    expanded={isSectionOpen(4)}
                    onChange={() => toggleSection(4)}
                    disableGutters
                    elevation={0}
                    sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: "16px !important",
                        overflow: "hidden",
                        "&:before": { display: "none" },
                    }}
                >
                    <AccordionSummary
                        expandIcon={null}
                        sx={{
                            px: 2,
                            py: 0.5,
                            minHeight: 64,
                            "& .MuiAccordionSummary-content": { my: 1 },
                        }}
                    >
                        {renderSectionHeader(4, sections[4].title, sections[4].icon)}
                    </AccordionSummary>

                    <AccordionDetails sx={{ px: 2, pb: 2 }}>
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
                                            control={
                                                <Checkbox
                                                    checked={!!field.value}
                                                    onChange={(e) => field.onChange(e.target.checked)}
                                                    size="small"
                                                />
                                            }
                                            label={t("addCargo.fields.extraPhoneAsMainLabel")}
                                            sx={{
                                                mt: 1.5,
                                                ml: 0,
                                                backgroundColor: "transparent",
                                                "& .MuiFormControlLabel-label": {
                                                    fontSize: "0.875rem",
                                                },
                                            }}
                                        />
                                    )}
                                />

                                <Button
                                    variant="text"
                                    sx={{ mt: 0.5, alignSelf: "flex-start", textTransform: "none" }}
                                    onClick={() =>
                                        setValue("contactSecondary", "", {
                                            shouldDirty: true,
                                        })
                                    }
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
                    </AccordionDetails>
                </Accordion>
            </Box>

            <Box
                sx={{
                    position: "sticky",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    pt: 2,
                    mt: 2,
                    pb: "calc(env(safe-area-inset-bottom, 0px) + 8px)",
                    backgroundColor: "background.paper",
                    borderTop: "1px solid",
                    borderColor: "divider",
                    zIndex: 2,
                }}
            >
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loadingInit || loading}
                    sx={{
                        height: 48,
                        textTransform: "none",
                        borderRadius: 3,
                        fontWeight: 700,
                        boxShadow: "none",
                    }}
                >
                    {t("addCargo.buttons.submit")}
                </Button>
            </Box>
        </Box>
    );
}