import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { FiArrowDown, FiArrowUp, FiPlus, FiTrash2 } from "react-icons/fi";

import type { AddTransportFormValues, Place } from "../model/types";
import { PlaceRowField } from "./PlaceRowField";

const EMPTY_PLACE: Place = {
    location: null,
    address: "",
};

type Props = {
    t: (key: string) => string;
    kind: "load" | "unload";
    name: "loadPlaces" | "unloadPlaces";
    form: UseFormReturn<AddTransportFormValues>;
    errorMessages?: Array<string | undefined>;
};

export function TransportPointsFieldArray({
                                              t,
                                              kind,
                                              name,
                                              form,
                                              errorMessages = [],
                                          }: Props) {
    const { control, setValue } = form;

    const { fields, append, remove, move } = useFieldArray({
        control,
        name,
    });

    const title =
        kind === "load"
            ? t("addTransport.fields.pickupPoints")
            : t("addTransport.fields.dropoffPoints");

    const itemTitle =
        kind === "load"
            ? t("addTransport.fields.pickupPoint")
            : t("addTransport.fields.dropoffPoint");

    const addLabel =
        kind === "load"
            ? t("addTransport.buttons.addPickupPoint")
            : t("addTransport.buttons.addDropoffPoint");

    return (
        <Stack spacing={1.5}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {title}
            </Typography>

            {fields.map((field, index) => (
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
                                    {t("addTransport.buttons.moveUp")}
                                </Button>

                                <Button
                                    size="small"
                                    variant="text"
                                    startIcon={<FiArrowDown />}
                                    onClick={() => move(index, index + 1)}
                                    disabled={index === fields.length - 1}
                                >
                                    {t("addTransport.buttons.moveDown")}
                                </Button>

                                <Button
                                    size="small"
                                    color="error"
                                    variant="text"
                                    startIcon={<FiTrash2 />}
                                    onClick={() => remove(index)}
                                    disabled={fields.length === 1}
                                >
                                    {t("addTransport.buttons.removePoint")}
                                </Button>
                            </Stack>
                        </Stack>

                        <PlaceRowField
                            kind={kind}
                            index={index}
                            control={control}
                            setValue={setValue}
                            errorText={errorMessages[index]}
                        />
                    </Stack>
                </Paper>
            ))}

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