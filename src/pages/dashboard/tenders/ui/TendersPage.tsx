import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Pagination,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import { Add } from "@mui/icons-material";
import { FiList, FiMapPin } from "react-icons/fi";
import { useTranslation } from "react-i18next";

import {
  TenderStatus,
  type Tender,
  type TenderListParams,
} from "@/entities/tender/model/types";
import { tendersApi } from "@/shared/api/tendersApi.ts";
import {
  forgetPendingOwnerTender,
  getPendingOwnerTenderIds,
} from "@/entities/tender/model/pendingOwnerTenders";
import { useUserStore } from "@/entities/user/model/user.store";
import { getTenderStatusMeta } from "@/entities/tender/lib/getTenderStatusMeta.ts";
import { useInitStore } from "@/shared/store/initStore.ts";
import { useLocalizedLookup } from "@/shared/utils/lookupUtils.ts";
import type { TenderFiltersValue } from "@/features/tender-search/model/types.ts";
import { TenderSearchBar } from "@/features/tender-search/ui/TenderSearchBar.tsx";
import { TenderFiltersDrawer } from "@/features/tender-search/ui/TenderFiltersDrawer.tsx";

type Props = {
  scope?: "search" | "my";
};

type MyTenderTab = "active" | "archive" | "wins" | "bids";

const pointLabel = (point?: Tender["points"][number]) =>
  point?.city || point?.region || point?.country || "-";

function routeLabel(tender: Tender) {
  const pickups =
    tender.points?.filter((point) => point.type === "PICKUP") ?? [];
  const dropoffs =
    tender.points?.filter((point) => point.type === "DROPOFF") ?? [];
  const from = pickups[0] ?? tender.points?.[0];
  const to =
    dropoffs[dropoffs.length - 1] ?? tender.points?.[tender.points.length - 1];

  return `${pointLabel(from)} -> ${pointLabel(to)}`;
}

function TenderCard({ tender }: { tender: Tender }) {
  const { t, i18n } = useTranslation();
  const bidsCount = tender.bids?.length ?? 0;
  const statusMeta = getTenderStatusMeta(tender.status, t);
  const fmtDate = (value?: string | null) =>
    value
      ? new Date(value).toLocaleString(i18n.language, {
          dateStyle: "short",
          timeStyle: "short",
          hour12: false,
        })
      : t("tenders.common.empty");

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: "16px",
        borderColor: "divider",
        transition: "border-color 0.15s",
        "&:hover": { borderColor: "primary.light" },
      }}
      component={NavLink}
      to={`/dashboard/tenders/${tender.id}/overview`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <Stack spacing={1.25}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          gap={1}
        >
          <Stack spacing={0.5}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
            >
              <Typography fontWeight={800}>{tender.title}</Typography>
              <Chip
                size="small"
                label={statusMeta.label}
                color={statusMeta.color}
                variant="outlined"
              />
              {tender.buyout_price && (
                <Chip
                  size="small"
                  color="success"
                  variant="outlined"
                  label={t("tenders.list.card.buyout")}
                />
              )}
            </Stack>

            <Stack
              direction="row"
              spacing={0.75}
              alignItems="center"
              color="text.secondary"
            >
              <FiMapPin />
              <Typography variant="body2">{routeLabel(tender)}</Typography>
            </Stack>
          </Stack>

          <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
            <Typography fontWeight={800}>
              {tender.start_price} {tender.currency}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("tenders.list.card.startPrice")}
            </Typography>
          </Box>
        </Stack>

        <Divider />

        <Grid container spacing={1.5}>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">
              {t("tenders.list.card.endsAt")}
            </Typography>
            <Typography variant="body2">{fmtDate(tender.ends_at)}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">
              {t("tenders.list.card.vehicleType")}
            </Typography>
            <Typography variant="body2">
              {tender.vehicle_type || t("tenders.list.card.anyVehicle")}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">
              {t("tenders.list.card.cargo")}
            </Typography>
            <Typography variant="body2">
              {tender.weight_t || t("tenders.common.empty")} t /{" "}
              {tender.volume_m3 || t("tenders.common.empty")} m3
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">
              {t("tenders.list.card.bids")}
            </Typography>
            <Typography variant="body2">
              {bidsCount ||
                (tender.has_bids
                  ? t("tenders.list.card.hasBids")
                  : t("tenders.list.card.noBids"))}
            </Typography>
          </Grid>
        </Grid>
      </Stack>
    </Paper>
  );
}

export default function TendersPage({ scope = "search" }: Props) {
  const { t } = useTranslation();
  const currentUserId = useUserStore((state) => state.user?.id ?? null);
  const [items, setItems] = useState<Tender[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [archivePending, setArchivePending] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [myTab, setMyTab] = useState<MyTenderTab>("active");

  const { lookups, loadInit } = useInitStore();
  const { getLocalizedLabel } = useLocalizedLookup();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<TenderFiltersValue>({});

  const limit = 12;
  const pages = Math.max(1, Math.ceil(total / limit));

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    setArchivePending(false);

    const params: TenderListParams = {
      page,
      limit,
      ...mapTenderFiltersToParams(filters),
      search: search.trim() || undefined,
    };

    try {
      const res =
        scope === "my"
          ? myTab === "active"
            ? await tendersApi.myActive(params)
            : myTab === "archive"
              ? await tendersApi.myArchive(params)
              : myTab === "wins"
                ? await tendersApi.myWins(params)
                : await tendersApi.myBids(params)
          : await tendersApi.list(params);

      if (scope === "my" && myTab === "active") {
        const [wins, incomplete, cachedOwnerTenders] = await Promise.all([
          tendersApi
            .myWins(params)
            .catch(() => ({ data: [], total: 0, page, limit })),
          tendersApi
            .myIncomplete(params)
            .catch(() => ({ data: [], total: 0, page, limit })),
          Promise.all(
            getPendingOwnerTenderIds().map(async (id) => {
              try {
                return await tendersApi.getById(id);
              } catch {
                forgetPendingOwnerTender(id);
                return null;
              }
            }),
          ),
        ]);
        const waitingConfirmation = [
          ...wins.data,
          ...incomplete.data,
          ...cachedOwnerTenders.filter((tender): tender is Tender =>
            Boolean(tender),
          ),
        ].filter((tender) => {
          const belongsToCurrentOwner =
            currentUserId && tender.owner_id === currentUserId;
          const belongsToCurrentWinner =
            currentUserId && tender.current_winner_id === currentUserId;
          const isWaiting = tender.status === TenderStatus.WAITING_CONFIRMATION;

          if (!isWaiting) {
            if (belongsToCurrentOwner) forgetPendingOwnerTender(tender.id);
            return false;
          }

          return belongsToCurrentOwner || belongsToCurrentWinner;
        });
        const merged = [...res.data];
        for (const tender of waitingConfirmation) {
          if (!merged.some((item) => item.id === tender.id))
            merged.push(tender);
        }
        setItems(merged);
        setTotal(Math.max(res.total ?? res.data.length, merged.length));
        return;
      }

      setItems(res.data);
      setTotal(res.total ?? res.data.length);
    } catch (e: any) {
      if (
        scope === "my" &&
        myTab === "archive" &&
        e?.response?.status === 404
      ) {
        setItems([]);
        setTotal(0);
        setArchivePending(true);
      } else {
        setError(e?.response?.data?.message || t("tenders.list.loadError"));
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, filters, limit, myTab, page, scope, search, t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    loadInit();
  }, [loadInit]);

  useEffect(() => {
    setPage(1);
  }, [filters, myTab, scope]);

  const cargoOpts = useMemo(() => lookups?.cargoTypes ?? [], [lookups]);
  const vehicleOpts = useMemo(() => lookups?.vehicleType ?? [], [lookups]);
  const loadingTypeOpts = useMemo(() => lookups?.loadType ?? [], [lookups]);

  const activeFiltersCount = useMemo(() => {
    return Object.entries(filters).filter(([, value]) => {
      if (typeof value === "boolean") return value;
      return (
        value !== undefined && value !== null && String(value).trim() !== ""
      );
    }).length;
  }, [filters]);

  function mapTenderFiltersToParams(
    filters: TenderFiltersValue,
  ): TenderListParams {
    const pickup = filters.pickup_location;
    const dropoff = filters.dropoff_location;

    return {
      ...filters,

      pickup_location:
        pickup?.display_name ||
        pickup?.city ||
        pickup?.region ||
        pickup?.country ||
        undefined,
      dropoff_location:
        dropoff?.display_name ||
        dropoff?.city ||
        dropoff?.region ||
        dropoff?.country ||
        undefined,
    } as TenderListParams;
  }

  const title =
    scope === "my" ? t("tenders.list.myTitle") : t("tenders.list.searchTitle");
  const subtitle =
    scope === "my"
      ? t("tenders.list.mySubtitle")
      : t("tenders.list.searchSubtitle");

  const emptyText = useMemo(() => {
    if (archivePending) return t("tenders.list.archivePending");
    if (scope !== "my") return t("tenders.list.empty.search");
    return t(`tenders.list.empty.${myTab}`);
  }, [archivePending, myTab, scope, t]);

  return (
    <Box sx={{ py: 3 }}>
      <Stack spacing={2}>
        <Paper
          variant="outlined"
          sx={{ p: 2.5, borderRadius: "16px", borderColor: "divider" }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ md: "center" }}
            gap={1.5}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  bgcolor: "#EEF4F7",
                  color: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {scope === "my" ? (
                  <FiList size={22} />
                ) : (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                )}
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              </Box>
            </Stack>

            <Button
              component={NavLink}
              to="/dashboard/tenders/create"
              variant="contained"
              startIcon={<Add />}
              sx={{
                alignSelf: { xs: "stretch", md: "center" },
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {t("tenders.list.create")}
            </Button>
          </Stack>
        </Paper>

        {scope === "my" && (
          <Paper
            variant="outlined"
            sx={{ borderRadius: "16px", borderColor: "divider" }}
          >
            <Tabs
              value={myTab}
              onChange={(_, value) => setMyTab(value)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab value="active" label={t("tenders.list.tabs.active")} />
              <Tab value="archive" label={t("tenders.list.tabs.archive")} />
              <Tab value="wins" label={t("tenders.list.tabs.wins")} />
              <Tab value="bids" label={t("tenders.list.tabs.bids")} />
            </Tabs>
          </Paper>
        )}

        <Paper
          variant="outlined"
          sx={{ p: 2, borderRadius: "16px", borderColor: "divider" }}
        >
          <TenderSearchBar
            value={search}
            activeFiltersCount={activeFiltersCount}
            onChange={setSearch}
            onSearch={() => {
              setPage(1);
              void load();
            }}
            onOpenFilters={() => setFiltersOpen(true)}
          />
        </Paper>

        <TenderFiltersDrawer
          open={filtersOpen}
          value={filters}
          cargoOpts={cargoOpts}
          vehicleOpts={vehicleOpts}
          loadingTypeOpts={loadingTypeOpts}
          getLocalizedLabel={getLocalizedLabel}
          onClose={() => setFiltersOpen(false)}
          onApply={(nextFilters) => {
            setFilters(nextFilters);
            setPage(1);
          }}
          onReset={() => {
            setFilters({});
            setPage(1);
            setFiltersOpen(false);
          }}
        />

        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {!isLoading && !error && (
          <Stack spacing={1.5}>
            {items.map((tender) => (
              <TenderCard key={tender.id} tender={tender} />
            ))}

            {!items.length && (
              <Paper
                variant="outlined"
                sx={{
                  p: 4,
                  borderRadius: "16px",
                  borderColor: "divider",
                  textAlign: "center",
                }}
              >
                <Typography color="text.secondary">{emptyText}</Typography>
              </Paper>
            )}
          </Stack>
        )}

        {!isLoading && !error && pages > 1 && (
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="caption" color="text.secondary">
              {t("tenders.common.total", { count: total })}
            </Typography>
            <Pagination
              count={pages}
              page={page}
              onChange={(_, value) => setPage(value)}
            />
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
