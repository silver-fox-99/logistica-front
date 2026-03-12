import { useCallback, useEffect, useMemo } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { transportApi, type CreateTransportDto } from "@/shared/api/transportApi";
import { useInitStore } from "@/shared/store/initStore";
import { useGeoCascade } from "@/shared/lib/useGeoCascade";
import { useLocalizedLookup } from "@/shared/utils/lookupUtils";

import type { AddTransportFormValues, Place } from "./types";
import { getTodayDate, PHONE_RE, toIntOrZero } from "@/features/add-cargo-form/model/useAddCargoForm";

const EMPTY_PLACE: Place = {
    countryId: null,
    regionId: null,
    cityId: null,
    address: "",
};

function toNullableNum(v: string) {
    const s = (v ?? "").trim();
    if (!s) return undefined;

    const normalized = s.replace(",", ".");
    const n = Number(normalized);

    return Number.isFinite(n) ? n : undefined;
}

export function useAddTransportForm() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const { getLocalizedLabel } = useLocalizedLookup();
    const { lookups, loadInit, loading: loadingInit } = useInitStore();
    const geo = useGeoCascade();

    useEffect(() => {
        loadInit();
    }, [loadInit]);

    useEffect(() => {
        void geo.loadCountries();
    }, [geo]);

    const vehicleOpts = useMemo(() => lookups?.vehicleType ?? [], [lookups]);
    const payMethodOpts = useMemo(() => lookups?.paymentMethods ?? [], [lookups]);
    const payTermOpts = useMemo(() => lookups?.paymentTerms ?? [], [lookups]);
    const currencyOpts = useMemo(() => lookups?.currency ?? [], [lookups]);

    const form = useForm<AddTransportFormValues>({
        mode: "onSubmit",
        shouldUnregister: false,
        defaultValues: {
            dateFrom: getTodayDate(),
            dateFromEnd: "",
            dateTo: "",

            loadPlaces: [EMPTY_PLACE],
            unloadPlaces: [EMPTY_PLACE],

            vehicleType: "",
            vehiclesCount: "1",

            capacityTons: "",
            volumeM3: "",

            dims: { length: "", width: "", height: "" },

            currency: "",
            price: "",

            paymentMethod: "",
            paymentTerm: "",
            bargaining: "possible",

            contactSecondary: "",
            email: "",
            note: "",
            extraPhoneAsMain: false,
        },
    });

    const { setValue, getValues, setError, clearErrors, handleSubmit, formState } = form;

    useEffect(() => {
        if (!lookups || loadingInit) return;

        const cur = getValues("currency");
        const veh = getValues("vehicleType");

        if (!cur) setValue("currency", lookups.currency?.[0]?.slug ?? "USD", { shouldDirty: false });
        if (!veh) setValue("vehicleType", lookups.vehicleType?.[0]?.slug ?? "", { shouldDirty: false });
    }, [getValues, lookups, loadingInit, setValue]);

    const validatePlaces = useCallback(
        (
            places: Place[],
            fieldName: "loadPlaces" | "unloadPlaces",
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
        (v: AddTransportFormValues) => {
            clearErrors();

            let ok = true;

            if (!v.dateFrom) {
                setError("dateFrom", {
                    type: "required",
                    message: t("addTransport.errors.required"),
                });
                ok = false;
            }

            if (v.dateFrom && v.dateTo && v.dateTo < v.dateFrom) {
                setError("dateTo", {
                    type: "validate",
                    message: t("addTransport.errors.dateOrder"),
                });
                ok = false;
            }

            if (
                !validatePlaces(
                    v.loadPlaces,
                    "loadPlaces",
                    t("addTransport.errors.selectCountryLoad")
                )
            ) {
                ok = false;
            }

            if (
                !validatePlaces(
                    v.unloadPlaces,
                    "unloadPlaces",
                    t("addTransport.errors.selectCountryUnload")
                )
            ) {
                ok = false;
            }

            if (!v.vehicleType) {
                setError("vehicleType", {
                    type: "required",
                    message: t("addTransport.errors.selectVehicleType"),
                });
                ok = false;
            }

            if (v.contactSecondary && !PHONE_RE.test(v.contactSecondary)) {
                setError("contactSecondary", {
                    type: "pattern",
                    message: t("addTransport.errors.invalidPhone"),
                });
                ok = false;
            }

            return ok;
        },
        [clearErrors, setError, t, validatePlaces]
    );

    const toDto = useCallback((v: AddTransportFormValues): CreateTransportDto => {
        const bargain = v.bargaining === "possible" ? "ALLOWED" : "NOT_ALLOWED";

        const normalizedLoadPlaces = (v.loadPlaces ?? []).filter((item) => !!item.countryId);
        const normalizedUnloadPlaces = (v.unloadPlaces ?? []).filter((item) => !!item.countryId);

        const anyDim =
            (toNullableNum(v.dims.length) ?? 0) > 0 ||
            (toNullableNum(v.dims.width) ?? 0) > 0 ||
            (toNullableNum(v.dims.height) ?? 0) > 0;

        const departurePoints = normalizedLoadPlaces.map((point, index) => ({
            type: "DEPARTURE" as const,
            country: point.countryId || "",
            region: point.regionId || "",
            city: point.cityId || "",
            address: point.address || "",
            order: index,
        }));

        const arrivalPoints = normalizedUnloadPlaces.map((point, index) => ({
            type: "ARRIVAL" as const,
            country: point.countryId || "",
            region: point.regionId || "",
            city: point.cityId || "",
            address: point.address || "",
            order: index,
        }));

        return {
            images: undefined,

            date_from: v.dateFrom,
            date_to: v.dateTo || "",

            vehicle_type: (v.vehicleType as CreateTransportDto["vehicle_type"]) || "ANY",

            cars_count: Math.max(1, toIntOrZero(v.vehiclesCount)),
            weight_t: toIntOrZero(v.capacityTons),
            volume_m3: toIntOrZero(v.volumeM3),

            has_dimensions: anyDim,
            ...(anyDim
                ? {
                    length_m: toNullableNum(v.dims.length),
                    width_m: toNullableNum(v.dims.width),
                    height_m: toNullableNum(v.dims.height),
                }
                : {}),

            price_currency: v.currency || "USD",
            price_amount: toIntOrZero(v.price),

            payment_method: v.paymentMethod || "",
            payment_term: v.paymentTerm || "",

            bargain,

            contact_extra_phone: v.contactSecondary || undefined,
            extra_phone_as_main: v.extraPhoneAsMain,
            note: v.note || undefined,

            points: [...departurePoints, ...arrivalPoints],
        };
    }, []);

    const getErrorMessage = useCallback(
        (error: any) => {
            const code = error?.response?.data?.code;
            const serverMessage = error?.response?.data?.message;

            if (code) {
                const translated = t(`apiErrors.${code}`, serverMessage);
                if (translated) return translated;
            }

            return serverMessage || t("addTransport.errorMessage");
        },
        [t]
    );

    const onValid = useCallback(
        async (values: AddTransportFormValues) => {
            if (!validateBusiness(values)) {
                toast.warning(t("addTransport.validationWarning"));
                return;
            }

            try {
                const payload = toDto(values);
                await transportApi.create(payload);
                toast.success(t("addTransport.successMessage"));
                navigate("/dashboard/requests");
            } catch (error: any) {
                toast.error(getErrorMessage(error));
            }
        },
        [getErrorMessage, navigate, t, toDto, validateBusiness]
    );

    const onInvalid = useCallback(
        (_errors: FieldErrors<AddTransportFormValues>) => {
            toast.warning(t("addTransport.validationWarning"));
        },
        [t]
    );

    const onSubmit = handleSubmit(onValid, onInvalid);

    const loadCountryErrors =
        ((formState.errors.loadPlaces ?? []) as any[]).map(
            (item) => item?.countryId?.message as string | undefined
        ) ?? [];

    const unloadCountryErrors =
        ((formState.errors.unloadPlaces ?? []) as any[]).map(
            (item) => item?.countryId?.message as string | undefined
        ) ?? [];

    return {
        t,
        i18nLang: i18n.language,
        getLocalizedLabel,
        loadingInit,

        currencyOpts,
        vehicleOpts,
        payMethodOpts,
        payTermOpts,

        geo,

        form,

        loadCountryErrors,
        unloadCountryErrors,

        onSubmit,
    };
}