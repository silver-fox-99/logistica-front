import { Box } from "@mui/material";
import { ShipmentDetailsSection } from "./ShipmentDetailsSection";

type Props = {
    images: string[];
};

export function ShipmentDetailsGallery({ images }: Props) {
    if (!images.length) return null;

    return (
        <ShipmentDetailsSection title="Images">
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                        lg: "repeat(3, 1fr)",
                    },
                    gap: 1.25,
                }}
            >
                {images.map((image, index) => (
                    <Box
                        key={`${image}-${index}`}
                        component="img"
                        src={image}
                        alt={`Shipment image ${index + 1}`}
                        sx={{
                            width: "100%",
                            height: { xs: 200, md: 220 },
                            objectFit: "cover",
                            borderRadius: "8px",
                            border: "1px solid",
                            borderColor: "divider",
                            display: "block",
                        }}
                    />
                ))}
            </Box>
        </ShipmentDetailsSection>
    );
}