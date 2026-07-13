import React, { memo, useMemo, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  Chip,
  Button,
  Paper,
  Tooltip as MuiTooltip,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  FiCalendar,
  FiMapPin,
  FiTag,
  FiLock,
  FiPackage,
  FiTruck,
  FiArrowRight,
} from "react-icons/fi";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import type { PublicShipmentBase } from "@/entities/public-shipment/model/types";
import { formatDate } from "@/shared/utils/formatDate";
import { useLocalizedLookup } from "@/shared/utils/lookupUtils";
import { useInitStore } from "@/shared/store/initStore";
import { formatShipmentRoute } from "@/entities/shipment/lib/format-shipment-route";

type Props = {
  data: PublicShipmentBase;
  kind: "cargo" | "transport";
  cta: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  };
};

export const PublicShipmentCard = memo(function PublicShipmentCard({
  data,
  kind,
  cta,
}: Props) {
  const { t, i18n } = useTranslation();
  const { lookups, loadInit } = useInitStore();
  const { findLocalizedLabel } = useLocalizedLookup();

  useEffect(() => {
    loadInit();
  }, [loadInit]);

  const sortedPoints = useMemo(() => {
    return [...(data.points ?? [])].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );
  }, [data.points]);

  const loadPoints = useMemo(() => {
    return sortedPoints.filter(
      (point) => point.type === "PICKUP" || point.type === "DEPARTURE",
    );
  }, [sortedPoints]);

  const unloadPoints = useMemo(() => {
    return sortedPoints.filter(
      (point) => point.type === "DROPOFF" || point.type === "ARRIVAL",
    );
  }, [sortedPoints]);

  const routeFrom = useMemo(() => {
    const point = loadPoints[0] ?? sortedPoints[0];
    return formatShipmentRoute(
      point,
      i18n.resolvedLanguage || i18n.language || "uz",
    );
  }, [i18n.resolvedLanguage, i18n.language, loadPoints, sortedPoints]);

  const routeTo = useMemo(() => {
    const point = unloadPoints[0] ?? sortedPoints[sortedPoints.length - 1];
    return formatShipmentRoute(
      point,
      i18n.resolvedLanguage || i18n.language || "uz",
    );
  }, [i18n.resolvedLanguage, i18n.language, unloadPoints, sortedPoints]);

  const isActive = data.display_type !== "inactive";

  const dateLabel = useMemo(() => {
    const loadFrom = data.loadWindow?.from ?? data.dates?.from;
    const loadTo =
      data.loadWindow?.to ?? data.loadWindow?.from ?? data.dates?.from;
    const unload = data.dates?.to;

    const loadPart = data.loadWindow
      ? `${t("shipments.shipmentCard.load")}: ${formatDate(loadFrom)} – ${formatDate(loadTo)}`
      : `${t("shipments.shipmentCard.load")}: ${formatDate(loadFrom)}`;

    const unloadPart = unload
      ? `${t("shipments.shipmentCard.unload")}: ${formatDate(unload)}`
      : "";

    return unloadPart ? `${loadPart} / ${unloadPart}` : loadPart;
  }, [data.loadWindow, data.dates, t]);

  const localizedTags = useMemo(() => {
    if (!data.tags) return [];

    const vt = lookups?.vehicleType ?? [];
    const lt = lookups?.loadType ?? [];
    const ct = lookups?.cargoTypes ?? [];

    const loadTypeMap: Record<string, string> = {
      ANY: t("shipments.editDialog.loadTypeAny"),
      FULL: t("shipments.editDialog.loadTypeFull"),
      PARTIAL: t("shipments.editDialog.loadTypePartial"),
      CONSOLIDATED: t("shipments.editDialog.loadTypeConsolidated"),
    };

    return data.tags.map((tag) => {
      const vehicleTypeLabel = findLocalizedLabel(vt, tag);
      if (vehicleTypeLabel && vehicleTypeLabel !== tag) return vehicleTypeLabel;

      const loadTypeLabel = findLocalizedLabel(lt, tag);
      if (loadTypeLabel && loadTypeLabel !== tag) return loadTypeLabel;

      const cargoTypeLabel = findLocalizedLabel(ct, tag);
      if (cargoTypeLabel && cargoTypeLabel !== tag) return cargoTypeLabel;

      return loadTypeMap[tag] ?? tag;
    });
  }, [
    data.tags,
    lookups?.vehicleType,
    lookups?.loadType,
    lookups?.cargoTypes,
    findLocalizedLabel,
    t,
  ]);

  const localizedMetrics = useMemo(() => {
    if (!data.metrics) return [];

    return data.metrics.reduce<string[]>((acc, metric) => {
      const carsMatch = metric.match(/^(\d+)\s*cars?$/i);
      if (carsMatch) return acc;

      const weightMatch = metric.match(/^([\d.,]+)\s*t$/i);
      if (weightMatch) {
        acc.push(
          `${weightMatch[1]} ${t("shipments.shipmentCard.weightUnitShort", "т")}`,
        );
        return acc;
      }

      const volumeMatch = metric.match(/^([\d.,]+)\s*m3$/i);
      if (volumeMatch) {
        acc.push(
          `${volumeMatch[1]} ${t("shipments.shipmentCard.volumeUnitShort", "м³")}`,
        );
        return acc;
      }

      const volumeSupMatch = metric.match(/^([\d.,]+)\s*m³$/i);
      if (volumeSupMatch) {
        acc.push(
          `${volumeSupMatch[1]} ${t("shipments.shipmentCard.volumeUnitShort", "м³")}`,
        );
        return acc;
      }

      acc.push(metric);
      return acc;
    }, []);
  }, [data.metrics, t]);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.5, md: 2 },
        borderRadius: 2,
        overflow: "hidden",
        opacity: isActive ? 1 : 0.6,
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          borderColor: "primary.light",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
        },
      }}
    >
      <Grid container spacing={2} alignItems="stretch">
        <Grid size={{ xs: 12, md: 8.5 }}>
          <Stack gap={1.5} sx={{ minWidth: 0 }}>
            <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
              <Chip
                size="small"
                color="primary"
                variant="outlined"
                icon={kind === "cargo" ? <FiPackage /> : <FiTruck />}
                label={
                  kind === "cargo"
                    ? t("shipments.shipmentCard.cargo")
                    : t("shipments.shipmentCard.transport")
                }
              />

              <Chip
                size="small"
                variant="outlined"
                icon={<FiCalendar />}
                label={dateLabel}
                sx={{
                  maxWidth: { xs: "100%", md: 520 },
                  "& .MuiChip-label": {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                }}
              />
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "minmax(0, 1fr) auto minmax(0, 1fr)",
                },
                gap: { xs: 1, md: 1.5 },
                alignItems: "center",
                minWidth: 0,
              }}
            >
              <RoutePoint
                label={t("shipments.shipmentCard.load")}
                value={routeFrom}
                count={loadPoints.length}
              />

              <Box
                sx={{
                  display: { xs: "none", md: "inline-flex" },
                  alignItems: "center",
                  justifyContent: "center",
                  color: "text.secondary",
                }}
              >
                <FiArrowRight />
              </Box>

              <RoutePoint
                label={t("shipments.shipmentCard.unload")}
                value={routeTo}
                count={unloadPoints.length}
              />
            </Box>

            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {localizedMetrics.map((metric) => (
                <Chip
                  key={metric}
                  size="small"
                  variant="outlined"
                  label={metric}
                />
              ))}

              {data.price ? (
                <Chip
                  size="small"
                  color="success"
                  variant="outlined"
                  label={data.price}
                />
              ) : null}
            </Stack>

            {localizedTags.length ? (
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                {localizedTags.slice(0, 5).map((tag, index) => (
                  <Chip
                    key={`${tag}-${index}`}
                    size="small"
                    icon={<FiTag />}
                    variant="outlined"
                    label={tag}
                    sx={{
                      maxWidth: 180,
                      "& .MuiChip-label": {
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      },
                    }}
                  />
                ))}

                {localizedTags.length > 5 ? (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`+${localizedTags.length - 5}`}
                  />
                ) : null}
              </Stack>
            ) : null}

            {data.note ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {data.note}
              </Typography>
            ) : null}
          </Stack>
        </Grid>

        {isActive && (
          <Grid size={{ xs: 12, md: 3.5 }}>
            <Paper
              variant="outlined"
              sx={{
                height: "100%",
                p: 1.5,
                borderRadius: 2,
                bgcolor: "action.hover",
              }}
            >
              <Stack
                spacing={1.25}
                height="100%"
                justifyContent="space-between"
              >
                <Stack spacing={1}>
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <FiLock />
                    <Typography variant="body2" fontWeight={600}>
                      {t("shipments.shipmentCard.signInToView")}
                    </Typography>
                  </Stack>

                  <Typography variant="caption" color="text.secondary">
                    Contacts are hidden and available only after viewing the
                    full order details.
                  </Typography>
                </Stack>

                <Divider />

                <Button
                  component={RouterLink}
                  to={cta.href}
                  variant="contained"
                  size="small"
                  fullWidth
                  sx={{ textTransform: "none" }}
                  endIcon={cta.icon}
                >
                  {cta.label}
                </Button>
              </Stack>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
});

type RoutePointProps = {
  label: string;
  value: string;
  count: number;
};

function RoutePoint({ label, value, count }: RoutePointProps) {
  return (
    <Box
      sx={{
        minWidth: 0,
        p: 1.25,
        borderRadius: 2,
        bgcolor: "action.hover",
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="flex-start"
        sx={{ minWidth: 0 }}
      >
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: 1.5,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.paper",
            color: "primary.main",
            flexShrink: 0,
          }}
        >
          <FiMapPin />
        </Box>

        <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            sx={{ minWidth: 0 }}
          >
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>

            {count > 1 ? (
              <Chip
                size="small"
                label={count > 99 ? "99+" : count}
                sx={{
                  height: 18,
                  minWidth: 18,
                  "& .MuiChip-label": {
                    px: 0.75,
                    fontSize: 11,
                  },
                }}
              />
            ) : null}
          </Stack>

          <MuiTooltip title={value}>
            <Typography
              variant="body2"
              fontWeight={600}
              noWrap
              sx={{
                minWidth: 0,
                maxWidth: "100%",
              }}
            >
              {value}
            </Typography>
          </MuiTooltip>
        </Stack>
      </Stack>
    </Box>
  );
}
