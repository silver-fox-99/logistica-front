import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Link as MuiLink,
  IconButton,
} from "@mui/material";
import { FiMapPin, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useShipmentRow } from "./shipment-row/model/useShipmentRow";
import { useShipmentFavorite } from "@/features/shipment/favorite-toggle/model/useShipmentFavorite";
import { useShipmentDetails } from "@/features/shipment/shipment-details-modal/model/useShipmentDetails";
import { ShipmentDetailsModal } from "@/entities/shipment/ui/shipment-details/ShipmentDetailsModal";
import { ShipmentDetailsLimitModal } from "@/entities/shipment/ui/shipment-details/ShipmentDetailsLimitModal.tsx";
import { useNavigate } from "react-router-dom";
import { buildShipmentDetailsPath } from "@/features/shipment/open-shipment-details/lib/buildShipmentDetailsPath.ts";
import { SvgIcon } from "@/shared/ui/SvgIcon/SvgIcon";
import CalendarIcon from "./icons/calendar.svg";
import FavoriteIcon from "./icons/favorite.svg";

type Props = {
  data: any; // Raw CargoApiItem or TransportApiItem
  scope: "public" | "my";
  onMoreOpen?: (id: string) => void;
  kind: "cargo" | "transport";
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
  onUp: _onUp,
  onEdit: _onEdit,
  onDelete: _onDelete,
  onCopy: _onCopy,
}: Props) {
  const {
    t,
    lookups,
    findLocalizedLabel,
    expanded,
    setExpanded,
    formatRoute,
    routeFrom,
    routeTo,
    vehicleTypeLabel,
    cargoTypeLabel,
    loadTypeLabel,
    loadDateLabel,
    paymentTermLabel,
    bargainLabel,
    priceLabel,
    paymentMethodLabel,
    adaptedData,
  } = useShipmentRow({ data, kind });

  const navigate = useNavigate();

  const { isFavorite, favoriteLoading, toggleFavorite } = useShipmentFavorite({
    data: adaptedData,
    scope,
    kind,
    favoriteIds,
    t,
    onFavoriteChange,
  });

  const {
    detailsOpen,
    limitOpen,
    detailsLoading,
    detailsData,
    openDetails,
    closeDetails,
    closeLimit,
  } = useShipmentDetails({
    id: data.id,
    kind,
    t,
    onMoreOpen,
  });

  const handleOpenOrderPage = () => {
    navigate(buildShipmentDetailsPath(kind, data.id));
  };

  const isInactive = data.display_type === "inactive";

  // Build specifications list for display
  const specs = [
    {
      label: t("shipments.shipmentCard.vehicleType", "Тип автомобиля"),
      value: vehicleTypeLabel,
      show: true,
    },
    {
      label: t("shipments.shipmentCard.cargoType", "Тип груза"),
      value: cargoTypeLabel,
      show: kind === "cargo",
    },
    {
      label: t("shipments.shipmentCard.weight", "Вес"),
      value: data.weight_t ? `${Number(data.weight_t)} т` : "",
      show: true,
    },
    {
      label: t("shipments.shipmentCard.loadType", "Тип загрузки"),
      value: loadTypeLabel,
      show: expanded,
    },
    {
      label: t("addCargo.fields.vehiclesCount", "Количество автомобилей"),
      value: data.cars_count,
      show: expanded && data.cars_count,
    },
    {
      label: t("addCargo.fields.palletsCount", "Количество паллет"),
      value: data.pallets_count,
      show: expanded && data.pallets_count,
    },
    {
      label: t("shipments.shipmentCard.volume", "Объем"),
      value: data.volume_m3 ? `${Number(data.volume_m3)} м³` : "",
      show: expanded && data.volume_m3,
    },
    {
      label: t("shipments.shipmentCard.partialLoad", "Дозагрузка"),
      value:
        data.allow_partial_load != null
          ? data.allow_partial_load
            ? t("common.yes", "Да")
            : t("common.no", "Нет")
          : "",
      show: expanded && data.allow_partial_load != null,
    },
    {
      label: t("shipments.shipmentCard.paymentTerm", "Срок оплаты"),
      value: paymentTermLabel,
      show: expanded && paymentTermLabel,
    },
    {
      label: t("shipments.shipmentCard.bargain", "Торг"),
      value: bargainLabel,
      show: expanded && bargainLabel,
    },
  ].filter(
    (s) =>
      s.show && s.value !== undefined && s.value !== null && s.value !== "",
  );

  return (
    <>
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: "16px",
          borderColor: "divider",
          bgcolor: "background.paper",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          opacity: isInactive ? 0.55 : 1,
          width: "100%",
          boxSizing: "border-box",
          "&:hover": {
            boxShadow: "0px 10px 30px rgba(15, 23, 42, 0.06)",
            borderColor: isInactive ? "divider" : "primary.light",
          },
        }}
      >
        <Stack spacing={2}>
          {/* 1. Header: Route and Favorite icon */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ minWidth: 0 }}
            >
              <Box sx={{ color: "black", display: "flex", flexShrink: 0 }}>
                <FiMapPin size={20} />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 500,
                  fontSize: { xs: "1.05rem", sm: "1.15rem" },
                  color: "text.primary",
                  lineHeight: 1.3,
                  wordBreak: "break-word",
                }}
              >
                {routeFrom} → {routeTo}
              </Typography>
            </Stack>

            {scope === "public" && (
              <IconButton
                onClick={toggleFavorite}
                disabled={favoriteLoading || isInactive}
                sx={{
                  borderRadius: "12px",
                  width: 42,
                  height: 42,
                  color: isFavorite ? "#ff9800" : "text.secondary",
                  flexShrink: 0,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: isFavorite ? "#ff9800" : "text.primary",
                    bgcolor: "rgba(0, 0, 0, 0.02)",
                  },
                }}
              >
                <SvgIcon src={FavoriteIcon} size={22} />
              </IconButton>
            )}
          </Stack>

          {/* 2. Loading Date */}
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box sx={{ color: "text.secondary", display: "flex" }}>
              <SvgIcon src={CalendarIcon} size={20} />
            </Box>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "text.primary" }}
            >
              {t("shipments.shipmentCard.load", "Загрузка")}: {loadDateLabel}
            </Typography>
          </Stack>

          {/* 3. Specifications list (single vertical column with aligned labels and values) */}
          <Stack spacing={1.25} sx={{ pt: 0.5, pb: 0.5 }}>
            {specs.map((spec, i) => (
              <Stack key={i} direction="row" spacing={2} alignItems="baseline">
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 500, width: 180, flexShrink: 0 }}
                >
                  {spec.label}:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: "text.primary",
                  }}
                >
                  {spec.value}
                </Typography>
              </Stack>
            ))}
          </Stack>

          {/* 4. Expand/Collapse Toggle */}
          <Box>
            <MuiLink
              component="button"
              variant="body2"
              onClick={() => setExpanded(!expanded)}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                fontWeight: 600,
                color: "primary.main",
                textDecoration: "none",
                outline: "none",
                border: "none",
                p: 0,
                cursor: "pointer",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              {expanded
                ? t("common.hide", "Скрыть")
                : t("common.showAll", "Смотреть все")}
              {expanded ? (
                <FiChevronUp size={16} />
              ) : (
                <FiChevronDown size={16} />
              )}
            </MuiLink>
          </Box>

          {/* 5. Bottom Row: Price, Payment and contacts button */}
          <Box sx={{ pt: 1 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
            >
              {/* Price and Payment method label */}
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                flexWrap="wrap"
                sx={{ minHeight: 44 }}
              >
                {priceLabel ? (
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 900,
                      color: "text.primary",
                      fontSize: "1.45rem",
                    }}
                  >
                    {priceLabel}
                  </Typography>
                ) : (
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      color: "text.secondary",
                      fontSize: "1.15rem",
                    }}
                  >
                    {t(
                      "shipments.shipmentCard.priceNegotiable",
                      "Цена договорная",
                    )}
                  </Typography>
                )}

                {paymentMethodLabel && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    {t("shipments.shipmentCard.paymentMethod", "Метод оплаты")}:{" "}
                    {paymentMethodLabel}
                  </Typography>
                )}
              </Stack>

              {/* Show contacts button */}
              {scope === "public" && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={openDetails}
                  disabled={detailsLoading || isInactive}
                  sx={{
                    px: 4,
                    py: 1.2,
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    borderRadius: "8px",
                    textTransform: "none",
                    width: { xs: "100%", sm: "auto" },
                    height: 44,
                  }}
                >
                  {t("homePage.showContacts", "Показать контакты")}
                </Button>
              )}
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* Shipment details modal and limits modal */}
      <ShipmentDetailsModal
        open={detailsOpen}
        onClose={closeDetails}
        data={detailsData}
        kind={kind}
        lookups={lookups}
        findLocalizedLabel={findLocalizedLabel}
        t={t}
        onOpenPage={handleOpenOrderPage}
        formatRoute={formatRoute}
        loading={detailsLoading}
      />

      <ShipmentDetailsLimitModal open={limitOpen} onClose={closeLimit} />
    </>
  );
}
