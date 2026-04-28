import { Box } from "@mui/material";
import { useMemo } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type MapPoint = {
    lat?: number;
    lon?: number;
    label?: string;
};

type Props = {
    pickup?: MapPoint;
    dropoff?: MapPoint;
};

const defaultCenter: [number, number] = [52.2297, 21.0122];

const markerIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

function FitMap({ points }: { points: [number, number][] }) {
    const map = useMap();

    if (points.length === 1) {
        map.setView(points[0], 8);
    }

    if (points.length > 1) {
        map.fitBounds(points, { padding: [24, 24] });
    }

    return null;
}

export function ShipmentFilterMapPreview({ pickup, dropoff }: Props) {
    const points = useMemo(() => {
        return [pickup, dropoff]
            .filter((point): point is Required<MapPoint> => {
                return typeof point?.lat === "number" && typeof point?.lon === "number";
            })
            .map((point) => ({
                ...point,
                position: [point.lat, point.lon] as [number, number],
            }));
    }, [pickup, dropoff]);

    const center = points[0]?.position ?? defaultCenter;

    if (!points.length) return null;

    return (
        <Box
            sx={{
                height: 240,
                overflow: "hidden",
                borderRadius: 2,
                mt: 1,
                "& .leaflet-container": {
                    width: "100%",
                    height: "100%",
                },
            }}
        >
            <MapContainer center={center} zoom={6} scrollWheelZoom={false} style={{ width: "100%", height: "100%" }}>
                <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <FitMap points={points.map((point) => point.position)} />

                {points.map((point, index) => (
                    <Marker key={`${point.lat}-${point.lon}-${index}`} position={point.position} icon={markerIcon} />
                ))}
            </MapContainer>
        </Box>
    );
}