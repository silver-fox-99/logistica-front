import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiFileText, FiUsers } from "react-icons/fi";

import { useShipmentDetailsPage } from "@/entities/shipment/model/useShipmentDetailsPage";
import type { ShipmentsKind } from "@/entities/shipment/model/type";
import { ShipmentDetailsView } from "@/widgets/shipment-details/shipment-details-view/ui/ShipmentDetailsView";
import { OrderDetailsLimitReached } from "@/widgets/shipment-details/order-details-limit/ui/OrderDetailsLimitReached";
import { isOrderDetailsLimitError } from "@/entities/shipment/lib/isOrderDetailsLimitError";

export default function ShipmentDetailsPage() {
  const { kind, id } = useParams();
  const { t } = useTranslation();

  const resolvedKind = useMemo<ShipmentsKind | null>(() => {
    if (kind === "cargo" || kind === "transport") return kind;
    return null;
  }, [kind]);

  const {
    data,
    loading,
    error,
    contactsLoading,
    contactsError,
    contactsErrorCode,
    contactsRevealed,
    showContacts,
  } = useShipmentDetailsPage(resolvedKind, id ?? null);

  const showLimitReached = contactsErrorCode
    ? isOrderDetailsLimitError(contactsErrorCode)
    : isOrderDetailsLimitError(contactsError);

  if (!resolvedKind || !id) {
    return <Alert severity="error">Invalid shipment details route</Alert>;
  }

  return (
    <Box sx={{ minHeight: "calc(100dvh - 120px)", pb: 3, pt: 16 }}>
      <Container maxWidth="lg">
        <Stack spacing={2.5} sx={{ width: "100%" }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2.25,
              borderRadius: "16px",
              mb: 0.5,
              display: "flex",
              alignItems: "center",
              gap: 2,
              bgcolor: "background.paper",
              borderColor: "divider",
              width: "100%",
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                bgcolor: "rgba(15, 95, 194, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "primary.main",
              }}
            >
              {resolvedKind === "cargo" ? (
                <FiFileText size={24} />
              ) : (
                <FiUsers size={24} />
              )}
            </Box>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 850,
                  color: "text.primary",
                  letterSpacing: "-0.02em",
                  mb: 0.25,
                }}
              >
                {t("shipments.shipmentCard.orderDetails", "Детали заявки")}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", fontWeight: 500 }}
              >
                {resolvedKind === "cargo"
                  ? t(
                      "shipments.shipmentCard.cargoSub",
                      "Детальная информация о выбранном грузе",
                    )
                  : t(
                      "shipments.shipmentCard.transportSub",
                      "Детальная информация о выбранном транспорте",
                    )}
              </Typography>
            </Box>
          </Paper>

          {loading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
              <CircularProgress />
            </Stack>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : data ? (
            <>
              {data.display_type === "inactive" && (
                <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                  {t("shipments.messages.inactiveAlert")}
                </Alert>
              )}

              {showLimitReached ? (
                <OrderDetailsLimitReached onReload={showContacts} />
              ) : contactsError ? (
                <Alert severity="error">{contactsError}</Alert>
              ) : null}

              <Box
                sx={{ opacity: data.display_type === "inactive" ? 0.75 : 1 }}
              >
                <ShipmentDetailsView
                  data={data}
                  kind={resolvedKind}
                  contactsRevealed={
                    contactsRevealed && data.display_type !== "inactive"
                  }
                  onShowContacts={showContacts}
                  contactsLoading={contactsLoading}
                />
              </Box>
            </>
          ) : (
            <Alert severity="info">
              {t("shipments.messages.orderDetailsEmpty", "No data to display")}
            </Alert>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
