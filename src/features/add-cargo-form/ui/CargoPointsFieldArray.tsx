import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useFieldArray, useWatch, type UseFormReturn } from "react-hook-form";
import { FiArrowDown, FiArrowUp, FiPlus, FiTrash2 } from "react-icons/fi";

import type { AddCargoFormValues, Place } from "../model/types";
import { PlaceRowField } from "./PlaceRowField";

const EMPTY_PLACE: Place = {
    countryId: null,
    regionId: null,
    cityId: null,
    address: "",
};

type Props = {
    t: (key: string) => string;
    kind: "pickup" | "dropoff";
    name: "pickups" | "dropoffs";
    form: UseFormReturn<AddCargoFormValues>;
    geo: any;
    errorMessages?: Array<string | undefined>;
};

export function CargoPointsFieldArray({
                                          t,
                                          kind,
                                          name,
                                          form,
                                          geo,
                                          errorMessages = [],
                                      }: Props) {
    const { control, setValue } = form;

    const { fields, append, remove, move } = useFieldArray({
        control,
        name,
    });

    const points = useWatch({
        control,
        name,
    }) ?? [];

    const title =
        kind === "pickup"
            ? t("addCargo.fields.pickupPoints")
            : t("addCargo.fields.dropoffPoints");

    const itemTitle =
        kind === "pickup"
            ? t("addCargo.fields.pickupPoint")
            : t("addCargo.fields.dropoffPoint");

    const addLabel =
        kind === "pickup"
            ? t("addCargo.buttons.addPickupPoint")
            : t("addCargo.buttons.addDropoffPoint");

    return (
        <Stack spacing={1.5}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {title}
            </Typography>

            {fields.map((field, index) => {
                const countryId = points[index]?.countryId ?? null;
                const regionId = points[index]?.regionId ?? null;

                return (
                    <Paper key={field.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                        <Stack spacing={1.25}>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                flexWrap="wrap"
                                gap={1}
                            >
                                <Typography variant="subtitle2">
                                    {itemTitle} #{index + 1}
                                </Typography>

                                <Stack direction="row" flexWrap="wrap" gap={1}>
                                    <Button
                                        size="small"
                                        variant="text"
                                        startIcon={<FiArrowUp />}
                                        onClick={() => move(index, index - 1)}
                                        disabled={index === 0}
                                    >
                                        {t("addCargo.buttons.moveUp")}
                                    </Button>

                                    <Button
                                        size="small"
                                        variant="text"
                                        startIcon={<FiArrowDown />}
                                        onClick={() => move(index, index + 1)}
                                        disabled={index === fields.length - 1}
                                    >
                                        {t("addCargo.buttons.moveDown")}
                                    </Button>

                                    <Button
                                        size="small"
                                        color="error"
                                        variant="text"
                                        startIcon={<FiTrash2 />}
                                        onClick={() => remove(index)}
                                        disabled={fields.length === 1}
                                    >
                                        {t("addCargo.buttons.removePoint")}
                                    </Button>
                                </Stack>
                            </Stack>

                            <PlaceRowField
                                kind={kind}
                                index={index}
                                control={control}
                                setValue={setValue}
                                countries={geo.countries}
                                regions={geo.getRegions(countryId)}
                                cities={geo.getCities(countryId, regionId)}
                                loadingCountries={geo.loading.countries}
                                loadingRegions={geo.loading.regionsFor === (countryId || "")}
                                loadingCities={geo.loading.citiesFor === `${countryId || ""}/${regionId || ""}`}
                                errorText={errorMessages[index]}
                                onCountryLoad={(id) => geo.ensureRegions(id)}
                                onRegionLoad={(countryIdValue, regionIdValue) =>
                                    geo.ensureCities(countryIdValue, regionIdValue)
                                }
                            />
                        </Stack>
                    </Paper>
                );
            })}

            <Box>
                <Button
                    variant="outlined"
                    startIcon={<FiPlus />}
                    onClick={() => append(EMPTY_PLACE)}
                >
                    {addLabel}
                </Button>
            </Box>
        </Stack>
    );
}