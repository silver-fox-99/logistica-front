import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Collapse,
  Link as MuiLink,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  FiMapPin,
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocalizedLookup } from "@/shared/utils/lookupUtils";
import { useInitStore } from "@/shared/store/initStore";

interface PublicShipmentRowProps {
  item: any;
  kind: "cargo" | "transport";
  isAuthenticated: boolean;
}

export default function PublicShipmentRow({
  item,
  kind,
  isAuthenticated,
}: PublicShipmentRowProps) {
  const { t, i18n } = useTranslation();
  const { findLocalizedLabel } = useLocalizedLookup();
  const { lookups, loadInit } = useInitStore();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    loadInit();
  }, [loadInit]);

  // 1. Format Route Starting and Ending Locations
  const sortedPoints = [...(item.points ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  const startPoint =
    sortedPoints.find((p) => p.type === "PICKUP" || p.type === "DEPARTURE") ||
    sortedPoints[0];
  const endPoint =
    [...sortedPoints]
      .reverse()
      .find((p) => p.type === "DROPOFF" || p.type === "ARRIVAL") ||
      sortedPoints[sortedPoints.length - 1];

  const formatLocation = useCallback(
    (p?: any) => {
      if (!p) return "";
      if (p.display_name) return p.display_name;

      const lang = i18n.resolvedLanguage || i18n.language || "ru";
      let country = "";
      let region = "";
      let city = "";

      if (lang === "ru") {
        country = p.country_ru || p.country || "";
        region = p.region_ru || p.region || "";
        city = p.city_ru || p.city || "";
      } else if (lang === "uz") {
        country = p.country_uz || p.country || "";
        region = p.region_uz || p.region || "";
        city = p.city_uz || p.city || "";
      } else {
        country = p.country || "";
        region = p.region || "";
        city = p.city || "";
      }

      const parts = [country, region, city].filter(Boolean);
      return parts.join(", ") || "—";
    },
    [i18n.resolvedLanguage, i18n.language],
  );

  const routeLabel =
    startPoint || endPoint
      ? `${formatLocation(startPoint)} → ${formatLocation(endPoint)}`
      : t("shipments.shipmentCard.noRoute", "Маршрут не указан");

  // 2. Format Dates (DD.MM.YY format)
  const formatDate = (dateStr?: string | string[]) => {
    if (!dateStr) return "";
    const rawDate = Array.isArray(dateStr) ? dateStr[0] : dateStr;
    if (!rawDate) return "";
    const date = new Date(rawDate);
    if (isNaN(date.getTime())) return rawDate;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    return `${day}.${month}.${year}`;
  };

  const loadDateFrom = item.date_from;
  const loadDateTo = item.date_to;
  const dateRangeLabel = loadDateFrom
    ? loadDateTo
      ? `${formatDate(loadDateFrom)} - ${formatDate(loadDateTo)}`
      : formatDate(loadDateFrom)
    : t("shipments.shipmentCard.anyDate", "Любая дата");

  // 3. Resolve Lookups
  const vehicleTypeLabel = findLocalizedLabel(
    lookups?.vehicleType ?? [],
    item.vehicle_type,
  );
  const cargoTypeLabel = findLocalizedLabel(
    lookups?.cargoTypes ?? [],
    item.cargo_type,
  );

  const loadTypeLabel = (() => {
    if (!item.load_type || (Array.isArray(item.load_type) && item.load_type.length === 0)) {
      return "";
    }
    const loadTypeArray = Array.isArray(item.load_type) ? item.load_type : [item.load_type];
    const loadTypeMap: Record<string, string> = {
      ANY: t("shipments.editDialog.loadTypeAny", "Any"),
      FULL: t("shipments.editDialog.loadTypeFull", "Full"),
      PARTIAL: t("shipments.editDialog.loadTypePartial", "Partial"),
      CONSOLIDATED: t("shipments.editDialog.loadTypeConsolidated", "Consolidated"),
    };
    return loadTypeArray
      .map((lt: string) => {
        const lookupLabel = findLocalizedLabel(lookups?.loadType ?? [], lt);
        return lookupLabel !== lt ? lookupLabel : (loadTypeMap[lt] || lt);
      })
      .join(", ");
  })();

  const paymentTermLabel = findLocalizedLabel(lookups?.paymentTerms ?? [], item.payment_term);

  const bargainLabel = (() => {
    if (!item.bargain) return "";
    return item.bargain === "ALLOWED"
      ? t("shipments.shipmentCard.bargainAllowed", "Возможен")
      : t("shipments.shipmentCard.bargainNotAllowed", "Невозможен");
  })();

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
      label: kind === "cargo"
        ? t("shipments.shipmentCard.weight", "Вес")
        : t("shipments.shipmentCard.carryingCapacity", "Грузоподъемность"),
      value: item.weight_t ? `${Number(item.weight_t)} ${t("shipments.shipmentCard.weightUnitShort", "т")}` : "",
      show: true,
    },
    {
      label: t("shipments.shipmentCard.loadType", "Тип загрузки"),
      value: loadTypeLabel,
      show: expanded && loadTypeLabel,
    },
    {
      label: t("addCargo.fields.vehiclesCount", "Количество автомобилей"),
      value: item.cars_count,
      show: expanded && item.cars_count,
    },
    {
      label: t("addCargo.fields.palletsCount", "Количество паллет"),
      value: item.pallets_count,
      show: expanded && item.pallets_count,
    },
    {
      label: t("shipments.shipmentCard.volume", "Объем"),
      value: item.volume_m3 ? `${Number(item.volume_m3)} ${t("shipments.shipmentCard.volumeUnitShort", "м³")}` : "",
      show: expanded ? true : !!item.volume_m3,
    },
    {
      label: t("shipments.shipmentCard.partialLoad", "Дозагрузка"),
      value:
        item.allow_partial_load != null
          ? item.allow_partial_load
            ? t("common.yes", "Да")
            : t("common.no", "Нет")
          : "",
      show: expanded && item.allow_partial_load != null,
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
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: "16px",
        borderColor: "divider",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0px 8px 24px rgba(15, 23, 42, 0.04)",
          borderColor: "primary.light",
        },
      }}
    >
      <Grid container spacing={2} alignItems="center">
        {/* Left Details Block */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>
            {/* Route label with map pin */}
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ color: "primary.main", display: "flex", mt: 0.5 }}>
                <FiMapPin size={20} />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  color: "text.primary",
                }}
              >
                {routeLabel}
              </Typography>
            </Stack>

            {/* Calendar date row */}
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ color: "text.secondary", display: "flex" }}>
                <FiCalendar size={18} />
              </Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                {t("shipments.shipmentCard.load", "Загрузка")}: {dateRangeLabel}
              </Typography>
            </Stack>

            {/* Attributes details grid */}
            <Stack spacing={1.25} sx={{ pt: 1, pb: 1 }}>
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
                    sx={{ fontWeight: 600, color: "text.primary" }}
                  >
                    {spec.value}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            {/* Toggle expand link */}
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
          </Stack>
        </Grid>

        {/* Right Action Block */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "flex-start", md: "flex-end" },
              justifyContent: "center",
              height: "100%",
              gap: 1,
            }}
          >
            <Button
              component={Link}
              to={isAuthenticated ? "/dashboard/search" : "/auth/register"}
              variant="contained"
              color="primary"
              sx={{
                px: 4,
                py: 1.2,
                fontSize: "0.95rem",
                fontWeight: 600,
                borderRadius: "8px",
              }}
            >
              {t("homePage.showContacts", "Показать контакты")}
            </Button>

            {!isAuthenticated && (
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  pr: { xs: 0, md: 1 },
                }}
              >
                {t(
                  "homePage.availableAfterRegister",
                  "Доступно после регистрации",
                )}
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Collapse area for Note */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box
          sx={{ mt: 3, pt: 2, borderTop: "1px solid", borderColor: "divider" }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "text.primary", mb: 0.5 }}
          >
            {t("shipments.shipmentCard.additionalNote", "Примечание/Описание")}:
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: item.note ? "normal" : "italic" }}
          >
            {item.note ||
              t("shipments.shipmentCard.noNote", "Примечание отсутствует")}
          </Typography>
        </Box>
      </Collapse>
    </Paper>
  );
}
