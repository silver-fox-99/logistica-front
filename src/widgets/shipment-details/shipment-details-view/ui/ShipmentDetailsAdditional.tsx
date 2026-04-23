import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ShipmentDetailsSection } from "./ShipmentDetailsSection";

type Props = {
    note?: string | null;
};

export function ShipmentDetailsAdditional({ note }: Props) {
    const { t } = useTranslation();

    if (!note) return null;

    return (
        <ShipmentDetailsSection title={t("shipments.details.additionalInformation", "Additional information")}>
            <Typography variant="body2" color="text.secondary">
                {note}
            </Typography>
        </ShipmentDetailsSection>
    );
}