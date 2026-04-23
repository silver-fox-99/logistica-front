import { Box, Divider, Stack } from "@mui/material";
import Grid from "@mui/material/Grid";
import type { ShipmentRowData, ShipmentsKind } from "@/entities/shipment/model/type";

import { useShipmentFavorite } from "@/features/shipment/favorite-toggle/model/useShipmentFavorite";
import { useShipmentDetails } from "@/features/shipment/shipment-details-modal/model/useShipmentDetails";
import { ShipmentCardHeader } from "@/entities/shipment/ui/shipment-card/ShipmentCardHeader";
import { ShipmentCardMeta } from "@/entities/shipment/ui/shipment-card/ShipmentCardMeta";
import { ShipmentCardSummary } from "@/entities/shipment/ui/shipment-card/ShipmentCardSummary";
import { ShipmentCardActions } from "@/entities/shipment/ui/shipment-card/ShipmentCardActions";
import { ShipmentDetailsContent } from "@/entities/shipment/ui/shipment-details/ShipmentDetailsContent";
import { ShipmentDetailsModal } from "@/entities/shipment/ui/shipment-details/ShipmentDetailsModal";
import {useShipmentRow} from "@/widgets/shipments/shipment-row/model/useShipmentRow.ts";
import {buildShipmentDetailsPath} from "@/features/shipment/open-shipment-details/lib/buildShipmentDetailsPath.ts";
import {useNavigate} from "react-router-dom";

type Props = {
    data: ShipmentRowData;
    scope: "public" | "my";
    onMoreOpen?: (id: string) => void;
    kind: ShipmentsKind;
    favoriteIds?: Set<string>;
    onFavoriteChange?: (id: string, isFavorite: boolean) => void;
    onUp?: (id: string) => void;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    onCopy?: (id: string) => void;
};

export default function ShipmentRow({
                                        data,
                                        kind,
                                        scope,
                                        onMoreOpen,
                                        favoriteIds,
                                        onFavoriteChange,
                                        onUp,
                                        onEdit,
                                        onDelete,
                                        onCopy,
                                    }: Props) {
    const {
        t,
        lookups,
        findLocalizedLabel,
        expanded,
        formatRoute,
        loadPoints,
        unloadPoints,
        routeFrom,
        routeTo,
        shipmentTypeLabel,
        loadDateLabel,
        unloadDateLabel,
        summaryItems,
        openMore,
    } = useShipmentRow({ data, kind });

    const navigate = useNavigate();

    const {
        isFavorite,
        favoriteLoading,
        toggleFavorite,
    } = useShipmentFavorite({
        data,
        scope,
        kind,
        favoriteIds,
        t,
        onFavoriteChange,
    });

    const {
        detailsOpen,
        detailsLoading,
        detailsData,
        openDetails,
        closeDetails,
    } = useShipmentDetails({
        id: data.id,
        kind,
        t,
        onMoreOpen,
    });

    const handleMore = () => {
        if (scope === "public") {
            void openDetails();
            return;
        }

        openMore(scope, onMoreOpen);
    };

    const handleOpenOrderPage = () => {
        navigate(buildShipmentDetailsPath(kind, data.id));
    };

    return (
        <>
            <Box
                sx={{
                    px: { xs: 1.25, sm: 1.5, md: 2 },
                    py: { xs: 1.25, sm: 1.5, md: 1.75 },
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    width: "100%",
                    boxSizing: "border-box",
                }}
            >
                <Grid container spacing={{ xs: 1.25, md: 1.5 }} alignItems="stretch">
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Stack spacing={1.25} sx={{ height: "100%", minWidth: 0 }}>
                            <ShipmentCardHeader
                                routeFrom={routeFrom}
                                routeTo={routeTo}
                                price={data.price}
                                loadPointsCount={loadPoints.length}
                                unloadPointsCount={unloadPoints.length}
                                pickupPointsTitle={t("addTransport.fields.pickupPoints", "Pickup points")}
                                dropoffPointsTitle={t("addTransport.fields.dropoffPoints", "Dropoff points")}
                            />

                            <ShipmentCardMeta
                                kind={kind}
                                shipmentTypeLabel={shipmentTypeLabel}
                                loadDateLabel={loadDateLabel}
                                unloadDateLabel={unloadDateLabel}
                            />

                            <Divider />

                            <ShipmentCardSummary items={summaryItems} />
                        </Stack>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <ShipmentCardActions
                            scope={scope}
                            isFavorite={isFavorite}
                            favoriteLoading={favoriteLoading}
                            detailsLoading={detailsLoading}
                            expanded={expanded}
                            repeats={data.repeats}
                            views={data.views}
                            timeAgo={data.timeAgo}
                            price={data.price}
                            labels={{
                                addFavorite: t("shipments.favorites.add", "Add to favorites"),
                                removeFavorite: t("shipments.favorites.remove", "Remove from favorites"),
                                contacts: t("addCargo.steps.contacts", "Contacts"),
                                orderInfo: t("shipments.shipmentCard.orderDetails", "Order details"),
                                more: t("shipments.shipmentCard.more", "More"),
                                collapse: t("shipments.shipmentCard.collapse", "Collapse"),
                                repeats: t("shipments.shipmentCard.repeats", "Repeats"),
                                views: t("shipments.shipmentCard.views", "Views"),
                            }}
                            onToggleFavorite={toggleFavorite}
                            onContacts={() => void openDetails()}
                            onOrderInfo={() => void handleOpenOrderPage()}
                            onMore={handleMore}
                        />
                    </Grid>
                </Grid>

                {expanded && (
                    <>
                        <Divider sx={{ my: 2 }} />
                        <ShipmentDetailsContent
                            data={data}
                            scope={scope}
                            lookups={lookups}
                            findLocalizedLabel={findLocalizedLabel}
                            t={t}
                            onUp={onUp}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onCopy={onCopy}
                            formatRoute={formatRoute}
                        />
                    </>
                )}
            </Box>

            <ShipmentDetailsModal
                open={detailsOpen}
                onClose={closeDetails}
                data={detailsData}
                kind={kind}
                lookups={lookups}
                findLocalizedLabel={findLocalizedLabel}
                t={t}
                formatRoute={formatRoute}
                loading={detailsLoading}
            />
        </>
    );
}