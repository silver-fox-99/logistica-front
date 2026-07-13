import { useMemo, useState, useEffect } from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";

import { usePublicShipments } from "@/entities/public-shipment/model/usePublicShipmets";
import { ShipmentsFilterDrawer } from "@/widgets/shipments/ShipmentsFilterDrawer";
import type { PublicFilters } from "@/widgets/shipments/ShipmentsFilterDrawer";
import { useInitStore } from "@/shared/store/initStore";
import { useUserStore } from "@/entities/user/model/user.store";
import { useFilterSettingsStore } from "@/shared/store/filterSettingsStore";
import { resolveFilters } from "@/shared/utils/filterSettings";
import { tariffsApi } from "@/shared/api/tariffsApi";
import type { TariffPlan } from "@/entities/tariff-plan/model/types";

// Import modular subcomponents
import HeroSection from "./components/HeroSection";
import BenefitsSection from "./components/BenefitsSection";
import ListingsSection from "./components/ListingsSection";
import ValuePropsSection from "./components/ValuePropsSection";
import TariffsSection from "./components/TariffsSection";
import FaqSection from "./components/FaqSection";

type TabKind = "cargo" | "transport";

export default function HomePage() {
  const { t } = useTranslation();
  const { loadInit } = useInitStore();
  const user = useUserStore((s) => s.user);

  const isAuthenticated = !!user;

  const [tab, setTab] = useState<TabKind>("cargo");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<PublicFilters>(() => {
    const storedKey = `shipments:public-filters:cargo`;
    try {
      const raw = localStorage.getItem(storedKey);
      if (raw) return JSON.parse(raw);
    } catch {}
    const settings = useFilterSettingsStore.getState().settings;
    const defaults = settings?.home.default || { pickup_date_from: "today" };
    return resolveFilters(defaults);
  });

  // Public tariffs state
  const [plans, setPlans] = useState<TariffPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [billingPeriodToggle, setBillingPeriodToggle] = useState<
    "monthly" | "yearly"
  >("monthly");

  useEffect(() => {
    const syncSettings = async () => {
      const settings = await useFilterSettingsStore.getState().loadSettings();
      const storedKey = `shipments:public-filters:${tab}`;
      const raw = localStorage.getItem(storedKey);
      if (!raw) {
        const defaults = settings.home.default;
        setFilters(resolveFilters(defaults));
      }
    };
    syncSettings();
  }, [tab]);

  useEffect(() => {
    loadInit();

    setLoadingPlans(true);
    tariffsApi
      .listPublicPlans()
      .then((res) => {
        const activePlans = (res.items || []).filter((p) => p.is_active);
        activePlans.sort((a, b) => (a.priority || 0) - (b.priority || 0));
        setPlans(activePlans);
      })
      .catch((err) => console.error("Failed to load public tariffs", err))
      .finally(() => setLoadingPlans(false));
  }, [loadInit]);

  const limit = 5;
  const { items, pages, total, loading } = usePublicShipments(
    tab,
    page,
    limit,
    filters,
  );
  const list = useMemo(() => items, [items]);

  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(
      (value) => value !== undefined && value !== "",
    ).length;
  }, [filters]);

  const handleClearFilters = () => {
    const settings = useFilterSettingsStore.getState().settings;
    const defaults = settings?.home.default || { pickup_date_from: "today" };
    setFilters(resolveFilters(defaults));
    setPage(1);
  };

  const handleTabChange = (value: TabKind) => {
    setTab(value);
    setPage(1);
    const storedKey = `shipments:public-filters:${value}`;
    try {
      const raw = localStorage.getItem(storedKey);
      if (raw) {
        setFilters(JSON.parse(raw));
        return;
      }
    } catch {}
    const settings = useFilterSettingsStore.getState().settings;
    const defaults = settings?.home.default || { pickup_date_from: "today" };
    setFilters(resolveFilters(defaults));
  };

  const filteredPlansForDisplay = useMemo(() => {
    return plans.filter((plan) => {
      const period = plan.billing_period?.toLowerCase();
      const isFree =
        plan.price === "0" || !plan.price || Number(plan.price) === 0;

      if (isFree) return true;

      if (billingPeriodToggle === "yearly") {
        return period === "yearly" || period === "year" || plan.days >= 365;
      } else {
        return (
          period === "monthly" ||
          period === "month" ||
          period === "daily" ||
          period === "day" ||
          plan.days < 365
        );
      }
    });
  }, [plans, billingPeriodToggle]);

  const renderBillingPeriod = (plan: TariffPlan) => {
    const isFree =
      plan.price === "0" || !plan.price || Number(plan.price) === 0;
    if (isFree) return t("homePage.tariffsPeriodMonth", "мес.");
    const period = plan.billing_period?.toLowerCase();
    if (plan.days > 0) {
      if (plan.days === 1) return t("homePage.tariffsPeriodDay", "день");
      if (plan.days === 30) return t("homePage.tariffsPeriodMonth", "мес.");
      if (plan.days === 365) return t("homePage.tariffsPeriodYear", "год");
      return t("homePage.tariffsPeriodCustomDays", {
        count: plan.days,
        defaultValue: `${plan.days} дн.`,
      });
    }
    if (period === "yearly" || period === "year")
      return t("homePage.tariffsPeriodYear", "год");
    if (period === "monthly" || period === "month")
      return t("homePage.tariffsPeriodMonth", "мес.");
    if (period === "daily" || period === "day")
      return t("homePage.tariffsPeriodDay", "день");
    return plan.billing_period || "";
  };

  return (
    <Box sx={{ pb: { xs: 8, md: 12 }, overflow: "hidden" }}>
      {/* 1. Hero banner section */}
      <HeroSection isAuthenticated={isAuthenticated} />

      {/* 2. Benefits list section */}
      <BenefitsSection />

      {/* 3. Interactive shipment search section */}
      <ListingsSection
        tab={tab}
        setTab={setTab}
        setPage={setPage}
        total={total}
        pages={pages}
        page={page}
        list={list}
        loading={loading}
        activeFiltersCount={activeFiltersCount}
        isAuthenticated={isAuthenticated}
        setDrawerOpen={setDrawerOpen}
        onClearFilters={handleClearFilters}
        onTabChange={handleTabChange}
      />

      {/* 4. Three column value propositions */}
      <ValuePropsSection />

      {/* 5. Tariffs section */}
      {plans.length > 0 && (
        <TariffsSection
          plans={filteredPlansForDisplay}
          loadingPlans={loadingPlans}
          billingPeriodToggle={billingPeriodToggle}
          onBillingPeriodChange={setBillingPeriodToggle}
          renderBillingPeriod={renderBillingPeriod}
          isAuthenticated={isAuthenticated}
        />
      )}

      {/* 6. FAQ Section */}
      <FaqSection />

      <ShipmentsFilterDrawer
        open={drawerOpen}
        pageKey="home"
        initialKind={tab}
        initialFilters={filters}
        showKindSelect={false}
        onClose={() => setDrawerOpen(false)}
        onApply={(_, nextFilters) => {
          setFilters(nextFilters);
          setPage(1);
          setDrawerOpen(false);
        }}
      />
    </Box>
  );
}
