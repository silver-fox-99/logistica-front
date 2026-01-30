import { useCallback, useEffect, useMemo } from "react";
import { useForm, type FieldErrors, type UseFormRegisterReturn } from "react-hook-form";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { cargoApi, type CreateCargoDto } from "@/shared/api/cargoApi";
import { useInitStore } from "@/shared/store/initStore";
import { useGeoCascade } from "@/shared/lib/useGeoCascade";
import { useLocalizedLookup } from "@/shared/utils/lookupUtils";
import { onDigitsOnlyChange } from "@/shared/lib/numericInput";

import type { AddCargoFormValues } from "./types";

export const PHONE_RE = /^\+?[1-9]\d{9,19}$/;

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
    const { t } = useTranslation();
    const navigate = useNavigate();

    const { getLocalizedLabel } = useLocalizedLookup();
    const { lookups, loadInit, loading: loadingInit } = useInitStore();

    const geo = useGeoCascade();

    // init
    useEffect(() => {
        loadInit();
    }, [loadInit]);

    useEffect(() => {
        void geo.loadCountries();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

            pickups: [{ countryId: null, regionId: null, cityId: null, address: "" }],
            dropoffs: [{ countryId: null, regionId: null, cityId: null, address: "" }],

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

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lookups, loadingInit]);

    const registerDigits = useCallback(
        (name: keyof AddCargoFormValues | `dims.${"length" | "width" | "height"}`) => {
            const r:any = register(name as any);
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
                setError("dateFromEnd", { type: "validate", message: t("addCargo.errors.dateRangeOrder") });
                ok = false;
            }

            if (v.dateFromEnd && v.dateTo && v.dateTo < v.dateFromEnd) {
                setError("dateTo", { type: "validate", message: t("addCargo.errors.dateOrder") });
                ok = false;
            }

            if (!v.pickups?.[0]?.countryId) {
                setError("pickups.0.countryId", { type: "required", message: t("addCargo.errors.selectCountryLoad") });
                ok = false;
            }

            if (!v.dropoffs?.[0]?.countryId) {
                setError("dropoffs.0.countryId", { type: "required", message: t("addCargo.errors.selectCountryUnload") });
                ok = false;
            }

            if (!v.cargoType) {
                setError("cargoType", { type: "required", message: t("addCargo.errors.selectCargoType") });
                ok = false;
            }

            if (!v.vehicleType) {
                setError("vehicleType", { type: "required", message: t("addCargo.errors.selectVehicleType") });
                ok = false;
            }

            if (v.contactSecondary && !PHONE_RE.test(v.contactSecondary)) {
                setError("contactSecondary", { type: "pattern", message: t("addCargo.errors.invalidPhone") });
                ok = false;
            }

            return ok;
        },
        [clearErrors, setError, t]
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

            const firstPickup = v.pickups?.[0] ?? { countryId: "", regionId: "", cityId: "", address: "" };
            const firstDrop = v.dropoffs?.[0] ?? { countryId: "", regionId: "", cityId: "", address: "" };

            const anyDim =
                (toNullableNum(v.dims.length) ?? 0) > 0 ||
                (toNullableNum(v.dims.width) ?? 0) > 0 ||
                (toNullableNum(v.dims.height) ?? 0) > 0;

            const countryFromName = getGeoName(firstPickup.countryId) || "Unknown";

            const dateFromPayload =
                v.dateFromEnd && v.dateFromEnd !== v.dateFrom ? [v.dateFrom, v.dateFromEnd].filter(Boolean) : v.dateFrom || "";

            return {
                date_from: dateFromPayload as CreateCargoDto["date_from"],
                date_to: v.dateTo || "",

                country_from: countryFromName,

                vehicle_type: (v.vehicleType as CreateCargoDto["vehicle_type"]) || "ANY",
                load_type: v.loadType as CreateCargoDto["load_type"],
                cargo_type: (v.cargoType as CreateCargoDto["cargo_type"]) || "GENERAL",
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

                points: [
                    {
                        type: "PICKUP",
                        country: firstPickup.countryId || "",
                        region: firstPickup.regionId || "",
                        city: firstPickup.cityId || "",
                        address: firstPickup.address || "",
                    },
                    {
                        type: "DROPOFF",
                        country: firstDrop.countryId || "",
                        region: firstDrop.regionId || "",
                        city: firstDrop.cityId || "",
                        address: firstDrop.address || "",
                    },
                ],
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
                const payload = toDto(values);
                await cargoApi.create(payload);
                toast.success(t("addCargo.successMessage"));
                navigate("/dashboard/requests");
            } catch (error: any) {
                toast.error(getErrorMessage(error));
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

    // helper errors used in UI
    const pickupCountryError = (formState.errors.pickups as any)?.[0]?.countryId?.message as string | undefined;
    const dropoffCountryError = (formState.errors.dropoffs as any)?.[0]?.countryId?.message as string | undefined;

    return {
        t,
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

        pickupCountryError,
        dropoffCountryError,

        onSubmit,
    };
}
