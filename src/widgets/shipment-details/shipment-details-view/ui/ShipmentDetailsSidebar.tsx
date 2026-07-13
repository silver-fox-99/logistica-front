import {
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { ShipmentRowData } from "@/entities/shipment/model/type";

type Props = {
  data: ShipmentRowData;
};

export function ShipmentDetailsSidebar({ data }: Props) {
  const { t } = useTranslation();

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        position: { lg: "sticky" },
        top: { lg: 88 },
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Typography variant="h4" fontWeight={800} color="success.main">
            {data.price || "—"}
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            {typeof data.views === "number" && (
              <Chip
                size="small"
                label={`${t("shipments.shipmentCard.views", "Views")}: ${data.views}`}
              />
            )}

            {typeof data.repeats === "number" && (
              <Chip
                size="small"
                label={`${t("shipments.shipmentCard.repeats", "Repeats")}: ${data.repeats}`}
              />
            )}
          </Stack>

          <Button
            variant="contained"
            fullWidth
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {t("shipments.shipmentCard.contacts", "Contacts")}
          </Button>

          <Button
            variant="outlined"
            fullWidth
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Save to favorites
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
