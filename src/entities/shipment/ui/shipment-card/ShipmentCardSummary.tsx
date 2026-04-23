import { Box, Stack, Typography } from "@mui/material";
import { FiBookmark, FiBox, FiPackage, FiTruck } from "react-icons/fi";

type SummaryIcon = "weight" | "volume" | "vehicle" | "loadType";

type Item = {
    key: string;
    icon: SummaryIcon;
    label: string;
};

type Props = {
    items: Item[];
};

function renderIcon(icon: SummaryIcon) {
    switch (icon) {
        case "weight":
            return <FiPackage size={15} />;
        case "volume":
            return <FiBox size={15} />;
        case "vehicle":
            return <FiTruck size={15} />;
        case "loadType":
            return <FiBookmark size={15} />;
        default:
            return null;
    }
}

export function ShipmentCardSummary({ items }: Props) {
    return (
        <Stack
            direction="row"
            spacing={{ xs: 1.25, md: 2 }}
            flexWrap="wrap"
            alignItems="center"
        >
            {items.map((item) => (
                <Stack
                    key={item.key}
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                    color="text.secondary"
                    sx={{ minHeight: 22 }}
                >
                    <Box
                        sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {renderIcon(item.icon)}
                    </Box>

                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 500,
                            color: "text.secondary",
                            fontSize: 13,
                        }}
                    >
                        {item.label}
                    </Typography>
                </Stack>
            ))}
        </Stack>
    );
}