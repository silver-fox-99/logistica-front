import { Chip, Stack } from "@mui/material";
import { FiClock, FiPackage, FiTruck } from "react-icons/fi";

type Props = {
    kind: "cargo" | "transport";
    shipmentTypeLabel: string;
    loadDateLabel: string;
    unloadDateLabel: string;
};

export function ShipmentCardMeta({
                                     kind,
                                     shipmentTypeLabel,
                                     loadDateLabel,
                                     unloadDateLabel,
                                 }: Props) {
    return (
        <Stack direction="row" spacing={0.75} flexWrap="wrap" alignItems="center">
            <Chip
                size="small"
                icon={kind === "cargo" ? <FiPackage size={14} /> : <FiTruck size={14} />}
                label={shipmentTypeLabel}
                sx={{
                    borderRadius: 999,
                    height: 30,
                    bgcolor: kind === "cargo" ? "warning.50" : "info.50",
                    color: kind === "cargo" ? "warning.dark" : "info.dark",
                    "& .MuiChip-label": {
                        px: 0.75,
                        fontWeight: 600,
                        fontSize: 13,
                    },
                }}
            />

            {!!loadDateLabel && (
                <Chip
                    size="small"
                    icon={<FiClock size={14} />}
                    label={loadDateLabel}
                    sx={{
                        borderRadius: 999,
                        height: 30,
                        bgcolor: "grey.100",
                        "& .MuiChip-label": {
                            px: 0.75,
                            fontWeight: 500,
                            fontSize: 13,
                        },
                    }}
                />
            )}

            {!!unloadDateLabel && (
                <Chip
                    size="small"
                    icon={<FiClock size={14} />}
                    label={unloadDateLabel}
                    sx={{
                        borderRadius: 999,
                        height: 30,
                        bgcolor: "grey.100",
                        "& .MuiChip-label": {
                            px: 0.75,
                            fontWeight: 500,
                            fontSize: 13,
                        },
                    }}
                />
            )}
        </Stack>
    );
}