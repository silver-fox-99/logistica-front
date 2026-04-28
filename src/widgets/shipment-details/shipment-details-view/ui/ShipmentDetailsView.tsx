import { Stack } from "@mui/material";
import type { ShipmentRowData, ShipmentsKind } from "@/entities/shipment/model/type";

import { ShipmentDetailsHero } from "./ShipmentDetailsHero";
import { ShipmentDetailsGallery } from "./ShipmentDetailsGallery";
import { ShipmentDetailsMap } from "./ShipmentDetailsMap";
import { ShipmentDetailsRouteCard } from "./ShipmentDetailsRouteCard";
import { ShipmentDetailsSpecs } from "./ShipmentDetailsSpecs";
import { ShipmentDetailsAdditional } from "./ShipmentDetailsAdditional";

type Props = {
    data: ShipmentRowData;
    kind: ShipmentsKind;
    contactsRevealed?: boolean;
    contactsLoading?: boolean;
    onShowContacts?: () => void;
};

export function ShipmentDetailsView({
                                        data,
                                        kind,
                                        contactsRevealed = false,
                                        contactsLoading = false,
                                        onShowContacts,
                                    }: Props) {
    return (
        <Stack spacing={2} sx={{ width: "100%" }}>
            <ShipmentDetailsHero
                data={data}
                kind={kind}
                contactsRevealed={contactsRevealed}
                contactsLoading={contactsLoading}
                onShowContacts={onShowContacts}
            />

            <ShipmentDetailsGallery images={data.images ?? []} />
            <ShipmentDetailsMap route={data.route ?? null} />
            <ShipmentDetailsRouteCard data={data} kind={kind} />
            <ShipmentDetailsSpecs data={data} kind={kind} />

            {contactsRevealed && <ShipmentDetailsAdditional note={data.note} />}
        </Stack>
    );
}