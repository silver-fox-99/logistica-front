import { useCallback, useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiCopy,
  FiEdit2,
  FiEye,
  FiMapPin,
  FiRepeat,
  FiTrash2,
  FiMoreVertical,
  FiEyeOff,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";

import { SvgIcon } from "@/shared/ui/SvgIcon/SvgIcon";
import CalendarIcon from "@/widgets/shipments/icons/calendar.svg";

import type {
  GeoPoint,
  ShipmentRowData,
  ShipmentsKind,
} from "@/entities/shipment/model/type";
import { useLocalizedLookup } from "@/shared/utils/lookupUtils";
import { useInitStore } from "@/shared/store/initStore";
import { formatDate } from "@/shared/utils/formatDate";
import { formatShipmentRoute } from "@/entities/shipment/lib/format-shipment-route.ts";

type Props = {
  data: ShipmentRowData;
  kind: ShipmentsKind;
  selected: boolean;
  onSelect: () => void;
  onUp: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCopy: (id: string) => void;
  onAutoBump: (id: string) => void;
  onDeactivate: (id: string) => void;
};

function getUpdatedValue(data: ShipmentRowData) {
  return (
    (data as any)?.sort_updated_at ??
    (data as any)?.updated_at ??
    (data as any)?.updatedAt ??
    (data as any)?.updated ??
    null
  );
}

function getViewsValue(data: ShipmentRowData) {
  const raw =
    (data as any)?.viewCount ??
    (data as any)?.view_count ??
    (data as any)?.viewsCount;
  return raw ? +raw : 0;
}

function getUpCountValue(data: ShipmentRowData) {
  const raw = (data as any)?.up_count ?? (data as any)?.upCount;
  return raw ? +raw : 0;
}

export function MyShipmentManageCard(props: Props) {
  const {
    data,
    selected,
    onSelect,
    onUp,
    onEdit,
    onDelete,
    onCopy,
    onAutoBump,
    onDeactivate,
  } = props;
  const { t, i18n } = useTranslation();
  const { findLocalizedLabel } = useLocalizedLookup();
  const { lookups, loadInit } = useInitStore();

  const [expanded, setExpanded] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const handleMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    loadInit();
  }, [loadInit]);

  const formatRoute = useCallback(
    (point?: GeoPoint, withAddress = false) =>
      formatShipmentRoute(
        point,
        i18n.resolvedLanguage || i18n.language || "uz",
        withAddress,
      ),
    [i18n.language, i18n.resolvedLanguage],
  );

  const sortedPoints = useMemo(
    () =>
      [...(data.points ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [data.points],
  );

  const loadPoints = useMemo(
    () =>
      sortedPoints.filter(
        (item) => item.type === "PICKUP" || item.type === "DEPARTURE",
      ),
    [sortedPoints],
  );

  const unloadPoints = useMemo(
    () =>
      sortedPoints.filter(
        (item) => item.type === "DROPOFF" || item.type === "ARRIVAL",
      ),
    [sortedPoints],
  );

  const primaryLoadPoint = loadPoints[0] ?? sortedPoints[0];
  const primaryUnloadPoint =
    unloadPoints[0] ?? sortedPoints[sortedPoints.length - 1];

  const routeFrom = useMemo(() => {
    if (primaryLoadPoint) return formatRoute(primaryLoadPoint);
    return "—";
  }, [formatRoute, primaryLoadPoint]);

  const routeTo = useMemo(() => {
    if (primaryUnloadPoint) return formatRoute(primaryUnloadPoint);
    return "—";
  }, [formatRoute, primaryUnloadPoint]);

  const updatedAt = getUpdatedValue(data);
  const views = getViewsValue(data);
  const upCount = getUpCountValue(data);

  const loadFrom = data.loadWindow?.from ?? data.dates.from;
  const loadTo =
    data.loadWindow?.to ?? data.loadWindow?.from ?? data.dates.from;
  const unloadDate = data.dates?.to ?? null;
  const canEdit = data.display_type !== "inactive";

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        borderRadius: "16px",
        borderColor: selected ? "primary.main" : "divider",
        borderWidth: selected ? "2px" : "1px",
        boxShadow: selected
          ? "0 4px 12px rgba(15, 95, 194, 0.08)"
          : "0 4px 12px rgba(0,0,0,0.02)",
        opacity: !canEdit ? 0.6 : 1,
        bgcolor: "background.paper",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Checkbox checked={selected} onChange={onSelect} sx={{ ml: -1 }} />

          {canEdit && (
            <>
              <IconButton onClick={handleMenuOpen}>
                <FiMoreVertical />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                sx={{
                  "& .MuiPaper-root": {
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    border: "1px solid",
                    borderColor: "divider",
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    onUp(data.id);
                  }}
                >
                  <ListItemIcon>
                    <FiRepeat size={16} />
                  </ListItemIcon>
                  <ListItemText>
                    {t("shipments.shipmentCard.raiseUp", "Поднять")}
                  </ListItemText>
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    onEdit(data.id);
                  }}
                >
                  <ListItemIcon>
                    <FiEdit2 size={16} />
                  </ListItemIcon>
                  <ListItemText>
                    {t("shipments.shipmentCard.edit", "Редактировать")}
                  </ListItemText>
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    onCopy(data.id);
                  }}
                >
                  <ListItemIcon>
                    <FiCopy size={16} />
                  </ListItemIcon>
                  <ListItemText>
                    {t("shipments.shipmentCard.copy", "Копировать")}
                  </ListItemText>
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    onAutoBump(data.id);
                  }}
                >
                  <ListItemIcon>
                    <FiCalendar size={16} />
                  </ListItemIcon>
                  <ListItemText>
                    {t("listingAutoBump.actions.open", {
                      defaultValue: "Автоподнятие",
                    })}
                  </ListItemText>
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    onDeactivate(data.id);
                  }}
                >
                  <ListItemIcon>
                    <FiEyeOff size={16} />
                  </ListItemIcon>
                  <ListItemText>
                    {t("shipments.shipmentCard.deactivate", {
                      defaultValue: "Деактивировать",
                    })}
                  </ListItemText>
                </MenuItem>

                <Divider sx={{ my: 0.5 }} />

                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    onDelete(data.id);
                  }}
                  sx={{ color: "error.main" }}
                >
                  <ListItemIcon sx={{ color: "error.main" }}>
                    <FiTrash2 size={16} />
                  </ListItemIcon>
                  <ListItemText>
                    {t("shipments.shipmentCard.delete", "Удалить")}
                  </ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}
        </Stack>

        <Stack spacing={1.5}>
          {/* Route line */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ color: "black", display: "flex", flexShrink: 0 }}>
              <FiMapPin size={18} />
            </Box>
            <Typography
              variant="body1"
              fontWeight={750}
              sx={{ color: "text.primary" }}
            >
              {routeFrom} → {routeTo}
            </Typography>
          </Stack>

          {/* Date rows */}
          <Stack spacing={0.75}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ color: "text.secondary", display: "flex" }}>
                <SvgIcon src={CalendarIcon} size={16} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {t("shipments.shipmentCard.load")}: {formatDate(loadFrom)}
                {loadFrom !== loadTo ? ` – ${formatDate(loadTo)}` : ""}
              </Typography>
            </Stack>
            {unloadDate && (
              <Stack direction="row" spacing={1} alignItems="center">
                <FiClock size={16} color="text.secondary" />
                <Typography variant="body2" color="text.secondary">
                  {t("shipments.shipmentCard.unload")}: {formatDate(unloadDate)}
                </Typography>
              </Stack>
            )}
          </Stack>

          {/* Stats chips */}
          <Stack direction="row" spacing={1.25} flexWrap="wrap">
            <Chip
              size="small"
              variant="outlined"
              icon={<FiEye size={14} />}
              label={t("shipments.manage.viewsCount", {
                count: views,
                defaultValue: `Просмотры: ${views}`,
              })}
              sx={{
                borderRadius: "8px",
                bgcolor: "rgba(15, 95, 194, 0.04)",
                color: "primary.main",
                borderColor: "rgba(15, 95, 194, 0.2)",
                "& .MuiChip-icon": { color: "primary.main" },
                fontWeight: 600,
              }}
            />
            <Chip
              size="small"
              variant="outlined"
              icon={<FiRepeat size={14} />}
              label={t("shipments.manage.upCount", {
                count: upCount,
                defaultValue: `Поднятий: ${upCount}`,
              })}
              sx={{
                borderRadius: "8px",
                bgcolor: "rgba(15, 95, 194, 0.04)",
                color: "primary.main",
                borderColor: "rgba(15, 95, 194, 0.2)",
                "& .MuiChip-icon": { color: "primary.main" },
                fontWeight: 600,
              }}
            />
            <Chip
              size="small"
              variant="outlined"
              icon={<FiClock size={14} />}
              label={t("shipments.manage.updatedAt", {
                value: updatedAt ? formatDate(updatedAt) : t("common.dash"),
                defaultValue: `Обновлено: ${updatedAt ? formatDate(updatedAt) : "—"}`,
              })}
              sx={{
                borderRadius: "8px",
                bgcolor: "rgba(15, 95, 194, 0.04)",
                color: "primary.main",
                borderColor: "rgba(15, 95, 194, 0.2)",
                "& .MuiChip-icon": { color: "primary.main" },
                fontWeight: 600,
              }}
            />
          </Stack>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mt: 1 }}
        >
          <Typography
            variant="h5"
            fontWeight={600}
            sx={{ color: "text.primary" }}
          >
            {data.price || "—"}
          </Typography>

          <Button
            variant="contained"
            size="small"
            endIcon={expanded ? <FiChevronUp /> : <FiChevronDown />}
            onClick={() => setExpanded((prev) => !prev)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              height: 38,
              minWidth: 120,
            }}
          >
            {expanded
              ? t("shipments.shipmentCard.collapse", "Свернуть")
              : t("shipments.shipmentCard.more", "Подробнее")}
          </Button>
        </Stack>

        {expanded && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography
                  variant="subtitle2"
                  fontWeight={800}
                  mb={1}
                  color="text.primary"
                >
                  {t("shipments.shipmentCard.orderDetails", "Детали заявки")}
                </Typography>

                <Stack spacing={0.75} color="text.secondary">
                  {data.vehicleType && (
                    <Typography variant="body2">
                      <strong>{t("shipments.shipmentCard.vehicleType")}</strong>{" "}
                      {findLocalizedLabel(
                        lookups?.vehicleType ?? [],
                        data.vehicleType,
                      ) || data.vehicleType}
                    </Typography>
                  )}

                  {data.cargoType && (
                    <Typography variant="body2">
                      <strong>{t("shipments.shipmentCard.cargoType")}</strong>{" "}
                      {findLocalizedLabel(
                        lookups?.cargoTypes ?? [],
                        data.cargoType,
                      ) || data.cargoType}
                    </Typography>
                  )}

                  {data.loadType && data.loadType.length > 0 && (
                    <Typography variant="body2">
                      <strong>{t("shipments.shipmentCard.loadType")}</strong>{" "}
                      {(Array.isArray(data.loadType)
                        ? data.loadType
                        : [data.loadType]
                      )
                        .map((lt) => {
                          const lookupLabel = findLocalizedLabel(
                            lookups?.loadType ?? [],
                            lt,
                          );
                          const loadTypeMap: Record<string, string> = {
                            ANY: t("shipments.editDialog.loadTypeAny", "Any"),
                            FULL: t(
                              "shipments.editDialog.loadTypeFull",
                              "Full",
                            ),
                            PARTIAL: t(
                              "shipments.editDialog.loadTypePartial",
                              "Partial",
                            ),
                            CONSOLIDATED: t(
                              "shipments.editDialog.loadTypeConsolidated",
                              "Consolidated",
                            ),
                          };
                          return lookupLabel !== lt
                            ? lookupLabel
                            : loadTypeMap[lt] || lt;
                        })
                        .join(", ")}
                    </Typography>
                  )}

                  {data.weightT != null && data.weightT > 0 && (
                    <Typography variant="body2">
                      <strong>{t("shipments.shipmentCard.weight")}</strong>{" "}
                      {data.weightT} t
                    </Typography>
                  )}

                  {data.volumeM3 != null && data.volumeM3 > 0 && (
                    <Typography variant="body2">
                      <strong>{t("shipments.shipmentCard.volume")}</strong>{" "}
                      {data.volumeM3} m³
                    </Typography>
                  )}

                  {data.allowPartialLoad != null && (
                    <Typography variant="body2">
                      <strong>{t("shipments.shipmentCard.partialLoad")}</strong>{" "}
                      {data.allowPartialLoad
                        ? t("shipments.shipmentCard.partialLoadYes")
                        : t("shipments.shipmentCard.partialLoadNo")}
                    </Typography>
                  )}
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography
                  variant="subtitle2"
                  fontWeight={800}
                  mb={1}
                  color="text.primary"
                >
                  {t("userReviews.form.routeTitle", "Маршрут")}
                </Typography>

                <Stack spacing={1.25}>
                  <Box>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      mb={0.5}
                      color="text.primary"
                    >
                      {t("shipments.shipmentCard.load", "Загрузка")}
                    </Typography>

                    <Stack spacing={0.5}>
                      {loadPoints.length > 0 ? (
                        loadPoints.map((point, index) => (
                          <Typography
                            key={`load-${point.id ?? index}`}
                            variant="body2"
                            color="text.secondary"
                          >
                            {index + 1}. {formatRoute(point, true)}
                          </Typography>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </Stack>
                  </Box>

                  <Box>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      mb={0.5}
                      color="text.primary"
                    >
                      {t("shipments.shipmentCard.unload", "Разгрузка")}
                    </Typography>

                    <Stack spacing={0.5}>
                      {unloadPoints.length > 0 ? (
                        unloadPoints.map((point, index) => (
                          <Typography
                            key={`unload-${point.id ?? index}`}
                            variant="body2"
                            color="text.secondary"
                          >
                            {index + 1}. {formatRoute(point, true)}
                          </Typography>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                </Stack>
              </Grid>

              {data.note && (
                <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={800}
                    mb={0.5}
                    color="text.primary"
                  >
                    {t(
                      "shipments.shipmentCard.additionalInfo",
                      "Дополнительная информация",
                    )}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {data.note}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </>
        )}
      </Stack>
    </Paper>
  );
}
