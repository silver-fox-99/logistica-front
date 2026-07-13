import { useCallback, useMemo, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { FiSliders, FiPackage, FiTruck } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/shared/ui/PageHeader";

import type { ShipmentsKind } from "@/entities/shipment/model/type";
import {
  ShipmentsFilterDrawer,
  type PublicFilters,
} from "@/widgets/shipments/ShipmentsFilterDrawer.tsx";
import { ShipmentsListBody } from "@/widgets/shipments/ShipmentsListBody";
import { PublicPlacementBanner } from "@/widgets/public-ads/ui/PublicPlacementBanner";
import { useFilterSettingsStore } from "@/shared/store/filterSettingsStore";
import { resolveFilters } from "@/shared/utils/filterSettings";
import { useEffect } from "react";

type Props = { scope: "public" | "my" };

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getStoredFilters = (): PublicFilters => {
  if (typeof window === "undefined")
    return { pickup_date_from: getTodayDateString() };
  try {
    const raw = localStorage.getItem("shipments:filters:drawer-form");
    if (raw) {
      const parsed = JSON.parse(raw);
      const { kind, ...filters } = parsed;
      return filters;
    }
  } catch {}
  return { pickup_date_from: getTodayDateString() };
};

const getStoredKind = (): ShipmentsKind => {
  if (typeof window === "undefined") return "cargo";
  try {
    const raw = localStorage.getItem("shipments:filters:drawer-form");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.kind) return parsed.kind;
    }
  } catch {}
  return "cargo";
};

export default function ShipmentsListPage({ scope }: Props) {
  const { t } = useTranslation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const [appliedKind, setAppliedKind] = useState<ShipmentsKind>(() =>
    getStoredKind(),
  );
  const [appliedFilters, setAppliedFilters] = useState<PublicFilters>(() => {
    const stored = getStoredFilters();
    if (!localStorage.getItem("shipments:filters:drawer-form")) {
      const settings = useFilterSettingsStore.getState().settings;
      const defaults = settings?.search.default || {
        pickup_date_from: "today",
      };
      return resolveFilters(defaults);
    }
    return stored;
  });

  useEffect(() => {
    const syncSettings = async () => {
      const settings = await useFilterSettingsStore.getState().loadSettings();
      if (!localStorage.getItem("shipments:filters:drawer-form")) {
        const defaults = settings.search.default;
        setAppliedFilters(resolveFilters(defaults));
      }
    };
    syncSettings();
  }, []);

  const [reloadKey, setReloadKey] = useState(0);
  const requestReload = useCallback(() => setReloadKey((k) => k + 1), []);

  const handleToggleKind = useCallback((kind: ShipmentsKind) => {
    setAppliedKind(kind);
    try {
      const stored = localStorage.getItem("shipments:filters:drawer-form");
      const parsed = stored ? JSON.parse(stored) : {};
      parsed.kind = kind;
      localStorage.setItem(
        "shipments:filters:drawer-form",
        JSON.stringify(parsed),
      );
    } catch {}
    setReloadKey((k) => k + 1);
  }, []);

  const listKey = useMemo(() => {
    return `${appliedKind}-${JSON.stringify(appliedFilters)}`;
  }, [appliedKind, appliedFilters]);

  return (
    <>
      {/* 1. Headline Card */}
      <PageHeader
        title={
          scope === "my"
            ? t("shipments.myShipments.title")
            : t("shipments.myShipments.searchTitle", "Поиск заявок")
        }
        subtitle={
          scope === "my"
            ? t("shipments.myShipments.description")
            : t(
                "shipments.myShipments.searchDescription",
                "Найдите подходящие заказы от других пользователей",
              )
        }
        icon={
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        }
      />

      {/* 2. Banner */}
      <PublicPlacementBanner page="/dashboard/search" placementKey="top-list" />

      {/* 3. Controls / Filters */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mt: 2.5,
          mb: 2,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Left Side: Cargo / Transport Toggle Buttons */}
        <Box
          sx={{
            display: "inline-flex",
            bgcolor: "#f1f3f5", // Light grey background for the container
            p: 0.5,
            borderRadius: "12px",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Button
            onClick={() => handleToggleKind("cargo")}
            startIcon={<FiPackage size={16} />}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1,
              bgcolor:
                appliedKind === "cargo" ? "background.paper" : "transparent",
              color:
                appliedKind === "cargo" ? "primary.main" : "text.secondary",
              boxShadow:
                appliedKind === "cargo" ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
              border:
                appliedKind === "cargo" ? "1px solid" : "1px solid transparent",
              borderColor: appliedKind === "cargo" ? "divider" : "transparent",
              "&:hover": {
                bgcolor:
                  appliedKind === "cargo"
                    ? "background.paper"
                    : "rgba(0,0,0,0.03)",
              },
            }}
          >
            {t("shipments.shipmentCard.cargo", "Груз")}
          </Button>
          <Button
            onClick={() => handleToggleKind("transport")}
            startIcon={<FiTruck size={16} />}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1,
              bgcolor:
                appliedKind === "transport"
                  ? "background.paper"
                  : "transparent",
              color:
                appliedKind === "transport" ? "primary.main" : "text.secondary",
              boxShadow:
                appliedKind === "transport"
                  ? "0 2px 8px rgba(0,0,0,0.05)"
                  : "none",
              border:
                appliedKind === "transport"
                  ? "1px solid"
                  : "1px solid transparent",
              borderColor:
                appliedKind === "transport" ? "divider" : "transparent",
              "&:hover": {
                bgcolor:
                  appliedKind === "transport"
                    ? "background.paper"
                    : "rgba(0,0,0,0.03)",
              },
            }}
          >
            {t("shipments.shipmentCard.transport", "Транспорт")}
          </Button>
        </Box>

        {/* Right Side: Filter button and Total Count */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{ ml: "auto" }}
        >
          <Button
            variant="outlined"
            onClick={() => setDrawerOpen(true)}
            startIcon={<FiSliders size={16} />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              px: 2.5,
              py: 1,
              borderRadius: "8px",
              borderColor: "primary.main",
              color: "primary.main",
              "&:hover": {
                borderColor: "primary.dark",
                bgcolor: "rgba(25, 118, 210, 0.04)",
              },
            }}
          >
            {t("shipments.filter.button", "Фильтр")}
          </Button>

          <Typography
            variant="body1"
            sx={{
              fontWeight: 750,
              color: "text.primary",
              whiteSpace: "nowrap",
            }}
          >
            {t("shipments.total", { count: totalCount })}
          </Typography>
        </Stack>
      </Box>

      <div key={listKey}>
        <ShipmentsListBody
          scope={scope}
          kind={appliedKind}
          filters={appliedFilters}
          onRequestReload={requestReload}
          onTotalChange={setTotalCount}
          reloadKey={reloadKey}
        />
      </div>

      <ShipmentsFilterDrawer
        open={drawerOpen}
        pageKey="search"
        initialKind={appliedKind}
        initialFilters={appliedFilters}
        onClose={() => setDrawerOpen(false)}
        onApply={(kind, filters) => {
          setDrawerOpen(false);
          setAppliedKind(kind);
          setAppliedFilters(Object.keys(filters).length === 0 ? {} : filters);
          setReloadKey((k) => k + 1);
        }}
      />
    </>
  );
}
