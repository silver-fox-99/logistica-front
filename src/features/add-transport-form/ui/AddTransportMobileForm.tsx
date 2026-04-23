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
import { Controller, type UseFormReturn } from "react-hook-form";
import type { IconType } from "react-icons";
import {
    FiChevronDown,
    FiCreditCard,
    FiMapPin,
    FiPhone,
    FiTruck,
    FiSliders,
} from "react-icons/fi";

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

    geo: any;
    loadCountryErrors?: Array<string | undefined>;
    unloadCountryErrors?: Array<string | undefined>;
    loading: boolean;
    imagePreviews: string[];
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
                                           loading,
                                           imagePreviews,
                                       }: Props) {
    const { register, control, setValue, formState, watch } = form;
    const images = watch("images");

    const [openedSections, setOpenedSections] = useState<number[]>([0]);

    const sections = useMemo(
        () => [
            {
                key: "datesRoutes",
                title: t("addTransport.steps.datesRoutes"),
                icon: FiMapPin,
            },
            {
                key: "transportInfo",
                title: t("addTransport.steps.transportInfo"),
                icon: FiTruck,
            },
            {
                key: "characteristics",
                title: t("addTransport.steps.characteristics"),
                icon: FiSliders,
            },
            {
                key: "payment",
                title: t("addTransport.steps.payment"),
                icon: FiCreditCard,
            },
            {
                key: "contacts",
                title: t("addTransport.steps.contacts"),
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
                                    label={t("addTransport.fields.dateFromEnd")}
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
                                    label={t("addTransport.fields.price")}
                                    currencyOpts={currencyOpts}
                                    getLocalizedLabel={getLocalizedLabel}
                                />
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
                                                {
                                                    slug: "possible",
                                                    label: t("addTransport.fields.bargainingPossible"),
                                                } as any,
                                                {
                                                    slug: "none",
                                                    label: t("addTransport.fields.bargainingNone"),
                                                } as any,
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
                                    helperText={
                                        (formState.errors.contactSecondary?.message as any) || ""
                                    }
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
                                            label={t("addTransport.fields.extraPhoneAsMainLabel")}
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
                                        setValue("contactSecondary", "", { shouldDirty: true })
                                    }
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
                    {t("addTransport.buttonSubmit")}
                </Button>
            </Box>
        </Box>
    );
}