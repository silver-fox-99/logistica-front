import {useCallback, useEffect, useMemo, useState} from "react";
import { useForm, type FieldErrors, type UseFormRegisterReturn } from "react-hook-form";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { cargoApi, type CreateCargoDto } from "@/shared/api/cargoApi";
import { useInitStore } from "@/shared/store/initStore";
import { useGeoCascade } from "@/shared/lib/useGeoCascade";
import { useLocalizedLookup } from "@/shared/utils/lookupUtils";
import { onDigitsOnlyChange } from "@/shared/lib/numericInput";

import type { AddCargoFormValues, Place } from "./types";

export const PHONE_RE = /^\+?[1-9]\d{9,19}$/;

const EMPTY_PLACE: Place = {
    countryId: null,
    regionId: null,
    cityId: null,
    address: "",
};

export function getTodayDate() {
    const today = new Date();
    return today.toISOString().split("T")[0];
}

export function toIntOrZero(v: string) {
    const s = (v ?? "").trim();
    if (!s) return 0;

    const normalized = s.replace(",", ".");
    const n = Number(normalized);

    if (!Number.isFinite(n)) return 0;

    return Math.round(n * 100) / 100;
}

export function toNullableNum(v: string) {
    const s = (v ?? "").trim();
    if (!s) return undefined;

    const normalized = s.replace(",", ".");
    const n = Number(normalized);

    if (!Number.isFinite(n)) return undefined;

    return Math.round(n * 100) / 100;
}

export function useAddCargoForm() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const { getLocalizedLabel } = useLocalizedLookup();
    const [loading, setLoading] = useState(false)
    const { lookups, loadInit, loading: loadingInit } = useInitStore();

    const geo = useGeoCascade();

    useEffect(() => {
        loadInit();
    }, [loadInit]);

    useEffect(() => {
        void geo.loadCountries();
    }, [geo]);

    const currencyOpts = useMemo(() => lookups?.currency ?? [], [lookups]);
    const vehicleOpts = useMemo(() => lookups?.vehicleType ?? [], [lookups]);
    const loadOpts = useMemo(() => lookups?.loadType ?? [], [lookups]);
    const cargoOpts = useMemo(() => lookups?.cargoTypes ?? [], [lookups]);
    const payMethodOpts = useMemo(() => lookups?.paymentMethods ?? [], [lookups]);
    const payTermOpts = useMemo(() => lookups?.paymentTerms ?? [], [lookups]);

    const form = useForm<AddCargoFormValues>({
        mode: "onSubmit",
        shouldUnregister: false,
        defaultValues: {
            dateFrom: getTodayDate(),
            dateFromEnd: getTodayDate(),
            dateTo: "",

            pickups: [EMPTY_PLACE],
            dropoffs: [EMPTY_PLACE],

            cargoType: "",
            vehicleType: "",
            loadType: [],
            allowPartial: false,

            vehiclesCount: "1",
            palletsCount: "",
            weightTons: "",
            volumeM3: "",

            dims: { length: "", width: "", height: "" },

            currency: "",
            price: "",

            paymentMethod: "",
            paymentTerm: "",
            bargaining: "possible",

            contactSecondary: "",
            note: "",
            extraPhoneAsMain: false,
        },
    });

    const { register, setValue, getValues, setError, clearErrors, handleSubmit, control, formState } = form;

    useEffect(() => {
        if (!lookups || loadingInit) return;

        const cur = getValues("currency");
        const veh = getValues("vehicleType");
        const car = getValues("cargoType");

        if (!cur) setValue("currency", lookups.currency?.[0]?.slug ?? "", { shouldDirty: false });
        if (!veh) setValue("vehicleType", lookups.vehicleType?.[0]?.slug ?? "", { shouldDirty: false });
        if (!car) setValue("cargoType", lookups.cargoTypes?.[0]?.slug ?? "", { shouldDirty: false });
    }, [getValues, lookups, loadingInit, setValue]);

    const registerDigits = useCallback(
        (name: keyof AddCargoFormValues | `dims.${"length" | "width" | "height"}`) => {
            const r: any = register(name as any);
            return {
                ...r,
                onChange: (e: any) => {
                    onDigitsOnlyChange(e);
                    r.onChange(e);
                },
            } satisfies UseFormRegisterReturn;
        },
        [register]
    );

    const validatePlaces = useCallback(
        (
            places: Place[],
            fieldName: "pickups" | "dropoffs",
            emptyMessage: string
        ) => {
            let ok = true;

            if (!places?.length) {
                setError(`${fieldName}.0.countryId` as any, {
                    type: "required",
                    message: emptyMessage,
                });
                return false;
            }

            places.forEach((place, index) => {
                if (!place.countryId) {
                    setError(`${fieldName}.${index}.countryId` as any, {
                        type: "required",
                        message: emptyMessage,
                    });
                    ok = false;
                }
            });

            return ok;
        },
        [setError]
    );

    const validateBusiness = useCallback(
        (v: AddCargoFormValues) => {
            clearErrors();

            let ok = true;

            if (!v.dateFrom) {
                setError("dateFrom", { type: "required", message: t("addCargo.errors.required") });
                ok = false;
            }

            if (!v.dateFromEnd) {
                setError("dateFromEnd", { type: "required", message: t("addCargo.errors.required") });
                ok = false;
            }

            if (v.dateFrom && v.dateFromEnd && v.dateFromEnd < v.dateFrom) {
                setError("dateFromEnd", {
                    type: "validate",
                    message: t("addCargo.errors.dateRangeOrder"),
                });
                ok = false;
            }

            if (v.dateFromEnd && v.dateTo && v.dateTo < v.dateFromEnd) {
                setError("dateTo", {
                    type: "validate",
                    message: t("addCargo.errors.dateOrder"),
                });
                ok = false;
            }

            if (
                !validatePlaces(
                    v.pickups,
                    "pickups",
                    t("addCargo.errors.selectCountryLoad")
                )
            ) {
                ok = false;
            }

            if (
                !validatePlaces(
                    v.dropoffs,
                    "dropoffs",
                    t("addCargo.errors.selectCountryUnload")
                )
            ) {
                ok = false;
            }

            if (!v.cargoType) {
                setError("cargoType", {
                    type: "required",
                    message: t("addCargo.errors.selectCargoType"),
                });
                ok = false;
            }

            if (!v.vehicleType) {
                setError("vehicleType", {
                    type: "required",
                    message: t("addCargo.errors.selectVehicleType"),
                });
                ok = false;
            }

            if (v.contactSecondary && !PHONE_RE.test(v.contactSecondary)) {
                setError("contactSecondary", {
                    type: "pattern",
                    message: t("addCargo.errors.invalidPhone"),
                });
                ok = false;
            }

            return ok;
        },
        [clearErrors, setError, t, validatePlaces]
    );

    const getGeoName = useCallback(
        (id?: string | null) => {
            if (!id) return "";
            return geo.findById(id)?.name ?? "";
        },
        [geo]
    );

    const toDto = useCallback(
        (v: AddCargoFormValues): CreateCargoDto => {
            const bargain = v.bargaining === "possible" ? "ALLOWED" : "NOT_ALLOWED";

            const normalizedPickups = (v.pickups ?? []).filter((item) => !!item.countryId);
            const normalizedDropoffs = (v.dropoffs ?? []).filter((item) => !!item.countryId);

            const anyDim =
                (toNullableNum(v.dims.length) ?? 0) > 0 ||
                (toNullableNum(v.dims.width) ?? 0) > 0 ||
                (toNullableNum(v.dims.height) ?? 0) > 0;

            const firstPickup = normalizedPickups[0] ?? EMPTY_PLACE;
            const countryFromName = getGeoName(firstPickup.countryId) || "Unknown";

            const dateFromPayload =
                v.dateFrom && v.dateFromEnd
                    ? v.dateFrom === v.dateFromEnd
                        ? [v.dateFrom]
                        : [v.dateFrom, v.dateFromEnd]
                    : v.dateFrom
                        ? [v.dateFrom]
                        : [];

            const pickupPoints = normalizedPickups.map((point, index) => ({
                type: "PICKUP" as const,
                country: point.countryId || "",
                region: point.regionId || "",
                city: point.cityId || "",
                address: point.address || "",
                order: index,
            }));

            const dropoffPoints = normalizedDropoffs.map((point, index) => ({
                type: "DROPOFF" as const,
                country: point.countryId || "",
                region: point.regionId || "",
                city: point.cityId || "",
                address: point.address || "",
                order: index,
            }));

            return {
                date_from: dateFromPayload,
                date_to: v.dateTo || "",

                country_from: countryFromName,

                vehicle_type: v.vehicleType || "ANY",
                load_type: v.loadType,
                cargo_type: v.cargoType || "GENERAL",
                allow_partial_load: !!v.allowPartial,

                weight_t: toIntOrZero(v.weightTons),
                volume_m3: toIntOrZero(v.volumeM3),
                cars_count: toIntOrZero(v.vehiclesCount),
                pallets_count: toIntOrZero(v.palletsCount),

                has_dimensions: anyDim,
                ...(anyDim
                    ? {
                        length_m: toNullableNum(v.dims.length),
                        width_m: toNullableNum(v.dims.width),
                        height_m: toNullableNum(v.dims.height),
                    }
                    : {}),

                price_currency: v.currency || "",
                price_amount: toIntOrZero(v.price),

                payment_method: v.paymentMethod || "",
                payment_term: v.paymentTerm || "",

                bargain,

                contact_extra_phone: v.contactSecondary || undefined,
                note: v.note || undefined,
                extra_phone_as_main: v.extraPhoneAsMain,

                points: [...pickupPoints, ...dropoffPoints],
            };
        },
        [getGeoName]
    );

    const getErrorMessage = useCallback(
        (error: any) => {
            const code = error?.response?.data?.code;
            const serverMessage = error?.response?.data?.message;

            if (code) {
                const translated = t(`apiErrors.${code}`, serverMessage);
                if (translated) return translated;
            }

            return serverMessage || t("addCargo.errorMessage");
        },
        [t]
    );

    const onValid = useCallback(
        async (values: AddCargoFormValues) => {
            if (!validateBusiness(values)) {
                toast.warning(t("addCargo.validationWarning"));
                return;
            }

            try {
                setLoading(true)
                const payload = toDto(values);
                await cargoApi.create(payload);
                toast.success(t("addCargo.successMessage"));
                navigate("/dashboard/requests");
            } catch (error: any) {
                toast.error(getErrorMessage(error));
            } finally {
                setLoading(false)
            }
        },
        [getErrorMessage, navigate, t, toDto, validateBusiness]
    );

    const onInvalid = useCallback(
        (_errors: FieldErrors<AddCargoFormValues>) => {
            toast.warning(t("addCargo.validationWarning"));
        },
        [t]
    );

    const onSubmit = handleSubmit(onValid, onInvalid);

    const pickupCountryErrors =
        ((formState.errors.pickups ?? []) as any[]).map(
            (item) => item?.countryId?.message as string | undefined
        ) ?? [];

    const dropoffCountryErrors =
        ((formState.errors.dropoffs ?? []) as any[]).map(
            (item) => item?.countryId?.message as string | undefined
        ) ?? [];

    return {
        t,
        i18nLang: i18n.language,
        getLocalizedLabel,
        lookups,
        loadingInit,

        currencyOpts,
        vehicleOpts,
        loadOpts,
        cargoOpts,
        payMethodOpts,
        payTermOpts,

        geo,

        form,
        register,
        registerDigits,
        control,
        setValue,
        getValues,
        formState,

        pickupCountryErrors,
        dropoffCountryErrors,

        onSubmit,
        loading
    };
}