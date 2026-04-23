import { Box, Stack, Typography } from "@mui/material";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { ShipmentRoute } from "@/entities/shipment/model/type";
import { ShipmentDetailsSection } from "./ShipmentDetailsSection";

type Props = {
    route?: ShipmentRoute | null;
};

const defaultCenter: [number, number] = [52.2297, 21.0122];

const markerIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

function FitBounds({ bounds }: { bounds?: [[number, number], [number, number]] | null }) {
    const map = useMap();

    if (bounds) {
        map.fitBounds(bounds, { padding: [24, 24] });
    }

    return null;
}

export function ShipmentDetailsMap({ route }: Props) {
    const { t } = useTranslation();

    const center = useMemo<[number, number]>(() => {
        if (route?.center) return route.center;
        if (route?.points?.length) return [route.points[0].lat, route.points[0].lon];
        return defaultCenter;
    }, [route]);

    const hasMapData = Boolean(route?.points?.length);

    return (
        <ShipmentDetailsSection
            title={t("shipments.details.routeMap", "Route map")}
            subtitle={t(
                "shipments.details.routeMapSubtitle",
                "Pickup and drop-off points are shown on the map."
            )}
        >
            {!hasMapData ? (
                <Box
                    sx={{
                        minHeight: { xs: 240, md: 320 },
                        borderRadius: 1.5,
                        bgcolor: "grey.100",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "text.secondary",
                        textAlign: "center",
                        px: 2,
                        fontSize: 14,
                    }}
                >
                    {t("shipments.details.mapUnavailable", "Route map is not available for this shipment.")}
                </Box>
            ) : (
                <Stack spacing={1.5}>
                    <Box
                        sx={{
                            overflow: "hidden",
                            borderRadius: 1.5,
                            height: { xs: 260, md: 360 },
                            "& .leaflet-container": {
                                height: "100%",
                                width: "100%",
                            },
                        }}
                    >
                        <MapContainer center={center} zoom={6} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
                            <TileLayer
                                attribution='&copy; OpenStreetMap contributors'
                                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            <FitBounds bounds={route?.bounds} />

                            {route?.points.map((point, index) => (
                                <Marker
                                    key={point.id ?? `${point.type}-${index}`}
                                    position={[point.lat, point.lon]}
                                    icon={markerIcon}
                                >
                                    <Popup>
                                        <strong>{point.type ?? "POINT"}</strong>
                                        <br />
                                        {point.label ?? "Location"}
                                    </Popup>
                                </Marker>
                            ))}

                            {route?.geometry?.length ? (
                                <Polyline positions={route.geometry} />
                            ) : null}
                        </MapContainer>
                    </Box>

                    {(route?.distance_m || route?.duration_s) ? (
                        <Stack direction="row" spacing={2} flexWrap="wrap">
                            {route.distance_m ? (
                                <Typography variant="body2" color="text.secondary">
                                    {t("shipments.details.routeDistance", "Distance")}: {(route.distance_m / 1000).toFixed(1)} km
                                </Typography>
                            ) : null}

                            {route.duration_s ? (
                                <Typography variant="body2" color="text.secondary">
                                    {t("shipments.details.routeDuration", "Estimated duration")}: {Math.round(route.duration_s / 3600)} h
                                </Typography>
                            ) : null}
                        </Stack>
                    ) : null}
                </Stack>
            )}
        </ShipmentDetailsSection>
    );
}