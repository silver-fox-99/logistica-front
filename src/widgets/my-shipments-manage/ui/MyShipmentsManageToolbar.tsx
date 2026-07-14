import { useState } from "react";
import type { MouseEvent } from "react";
import {
  Button,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Checkbox,
  FormControlLabel,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";
import {
  FiChevronDown,
  FiLayers,
  FiTrash2,
  FiPackage,
  FiTruck,
} from "react-icons/fi";
import { Trans, useTranslation } from "react-i18next";

import { SvgIcon } from "@/shared/ui/SvgIcon/SvgIcon";
import SettingsIcon from "@/pages/dashboard/requests/icons/settings.svg";

import type { ShipmentsKind } from "@/entities/shipment/model/type";

type Props = {
  kind: ShipmentsKind;
  selectedCount: number;
  allPageSelected: boolean;
  hasAnyPageSelected: boolean;
  totalCount: number;
  onKindChange: (kind: ShipmentsKind) => void;
  onSelectAllPage: () => void;
  onDeselectAllPage: () => void;
  onClearSelection: () => void;
  onOpenBulkActions: () => void;
  onFilterClick: () => void;
};

export function MyShipmentsManageToolbar({
  kind,
  selectedCount,
  allPageSelected,
  hasAnyPageSelected,
  totalCount,
  onKindChange,
  onSelectAllPage,
  onDeselectAllPage,
  onClearSelection,
  onOpenBulkActions,
  onFilterClick,
}: Props) {
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Stack spacing={2} sx={{ width: "100%", mb: 2 }}>
      {/* ROW 1: Tabs, Filter button, Total Count */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 1.5,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Row 1: Cargo / Transport Toggle (left) & Mobile Filter Button (right) */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1.5}
          sx={{ width: "100%", flex: 1 }}
        >
          <ToggleButtonGroup
            exclusive
            value={kind}
            size="small"
            onChange={(_, value) => {
              if (!value) return;
              onKindChange(value);
            }}
            sx={{
              bgcolor: "#f0f2f5",
              borderRadius: "10px",
              p: 0.5,
              border: "none",
              "& .MuiToggleButtonGroup-grouped": {
                border: "none",
                borderRadius: "8px !important",
                mx: 0.25,
              },
              "& .MuiToggleButton-root": {
                px: { xs: 2, sm: 2.25 },
                py: 0.75,
                textTransform: "none",
                fontWeight: 600,
                color: "text.secondary",
                fontSize: "0.9rem",
                "&.Mui-selected": {
                  bgcolor: "background.paper",
                  color: "primary.main",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                },
              },
            }}
          >
            <ToggleButton value="cargo">
              <FiPackage size={16} style={{ marginRight: 8 }} />
              {t("shipments.filters.cargo", "Груз")}
            </ToggleButton>
            <ToggleButton value="transport">
              <FiTruck size={16} style={{ marginRight: 8 }} />
              {t("shipments.filters.transport", "Транспорт")}
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Mobile-only Filter Button */}
          <Box sx={{ display: { xs: "block", sm: "none" } }}>
            <Button
              variant="outlined"
              onClick={onFilterClick}
              startIcon={<SvgIcon src={SettingsIcon} />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                px: 2,
                py: 1,
                borderRadius: "8px",
                borderColor: "primary.main",
                color: "primary.main",
                minWidth: "auto",
                height: 38,
                "& .MuiButton-startIcon": { margin: 0 },
              }}
            />
          </Box>
        </Stack>

        {/* Desktop Filter Button & Total Count Stack */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{
            justifyContent: { xs: "flex-start", sm: "flex-end" },
            mt: { xs: 0.5, sm: 0 },
          }}
        >
          {/* Desktop-only Filter Button */}
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Button
              variant="outlined"
              startIcon={<SvgIcon src={SettingsIcon} />}
              onClick={onFilterClick}
              sx={{
                height: 38,
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 600,
                px: 2,
                borderColor: "primary.main",
                color: "primary.main",
                "&:hover": {
                  borderColor: "primary.dark",
                  bgcolor: "rgba(15, 95, 194, 0.04)",
                },
              }}
            >
              {t("shipments.filter.button", "Фильтр")}
            </Button>
          </Box>

          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            <Trans
              i18nKey="shipments.total"
              values={{ count: totalCount }}
              components={{ bold: <strong style={{ fontWeight: 700 }} /> }}
            />
          </Typography>
        </Stack>
      </Box>

      {/* ROW 2: Selection controls & Actions dropdown menu */}
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{ minHeight: 40 }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={allPageSelected}
              indeterminate={hasAnyPageSelected && !allPageSelected}
              onChange={() => {
                if (allPageSelected) {
                  onDeselectAllPage();
                } else {
                  onSelectAllPage();
                }
              }}
            />
          }
          label={
            <Typography variant="body2" fontWeight={600} color="text.secondary">
              {t("shipments.manage.selectAll", "Все заявки")}
            </Typography>
          }
        />

        {selectedCount > 0 && (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "text.secondary" }}
            >
              {t("shipments.manage.selectedCount", {
                count: selectedCount,
                defaultValue: `Выбрано: ${selectedCount}`,
              })}
            </Typography>

            <Button
              variant="outlined"
              size="small"
              onClick={handleMenuOpen}
              endIcon={<FiChevronDown />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                height: 32,
                px: 1.5,
              }}
            >
              {t("shipments.manage.actionsDropdown", "Действия")}
            </Button>

            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: "left", vertical: "top" }}
              anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
            >
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  onOpenBulkActions();
                }}
              >
                <ListItemIcon>
                  <FiLayers size={16} />
                </ListItemIcon>
                <ListItemText>
                  {t(
                    "shipments.manage.bulkActionsShort",
                    "Применить массовые действия",
                  )}
                </ListItemText>
              </MenuItem>

              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  onClearSelection();
                }}
                sx={{ color: "error.main" }}
              >
                <ListItemIcon sx={{ color: "error.main" }}>
                  <FiTrash2 size={16} />
                </ListItemIcon>
                <ListItemText>
                  {t(
                    "shipments.manage.clearSelectionShort",
                    "Сбросить выделение",
                  )}
                </ListItemText>
              </MenuItem>
            </Menu>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
