import {
  Box,
  Typography,
  Stack,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Pagination,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { FiChevronRight } from "react-icons/fi";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import PublicShipmentRow from "./PublicShipmentRow";
import { SvgIcon } from "@/shared/ui/SvgIcon/SvgIcon";
import CargoIcon from "@/pages/dashboard/requests/icons/cargo.svg";
import TransportIcon from "@/pages/dashboard/requests/icons/truck.svg";
import SettingsIcon from "@/pages/dashboard/requests/icons/settings.svg";

interface ListingsSectionProps {
  tab: "cargo" | "transport";
  setTab: (value: "cargo" | "transport") => void;
  setPage: (value: number) => void;
  total: number;
  pages: number;
  page: number;
  list: any[];
  loading: boolean;
  activeFiltersCount: number;
  isAuthenticated: boolean;
  setDrawerOpen: (value: boolean) => void;
  onClearFilters: () => void;
  onTabChange: (value: "cargo" | "transport") => void;
}

export default function ListingsSection({
  tab,
  setPage,
  total,
  pages,
  page,
  list,
  loading,
  activeFiltersCount,
  isAuthenticated,
  setDrawerOpen,
  onClearFilters,
  onTabChange,
}: ListingsSectionProps) {
  const { t } = useTranslation();

  return (
    <Box
      id="listings"
      sx={{
        bgcolor: "background.paper",
        borderTop: "1px solid",
        borderBottom: "1px solid",
        borderColor: "divider",
        py: 10,
        mb: 10,
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 3 }}>
        <Stack
          spacing={1.5}
          direction="column"
          alignItems="center"
          sx={{ textAlign: "center", mb: 6 }}
        >
          <Typography variant="h2">
            {t(
              "homePage.interactiveSectionTitle",
              "Упрощаем логистику, соединяя заказчиков и перевозчиков",
            )}
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontSize: "1.1rem", maxWidth: 700, mx: "auto" }}
          >
            {t(
              "homePage.interactiveSectionSubtitle",
              "YOL — платформа, которая соединяет заказчиков и перевозчиков, обеспечивая прямое взаимодействие и прозрачность сделок. Мы создаем систему, которая делает перевозку грузов проще и эффективнее для всех участников",
            )}
          </Typography>
        </Stack>

        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2.5, md: 4 },
            borderRadius: "16px",
            bgcolor: "brand.secondary",
            boxShadow: "0px 10px 30px rgba(15, 23, 42, 0.04)",
          }}
        >
          <Stack spacing={3.5}>
            {/* Dashboard Control Bar */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              gap={2.5}
              sx={{
                borderBottom: "1px solid",
                borderColor: "divider",
                pb: 2,
              }}
            >
              <Box
                sx={{
                  display: "inline-flex",
                  bgcolor: "#f1f3f5",
                  p: 0.5,
                  borderRadius: "12px",
                  border: "1px solid",
                  borderColor: "divider",
                  alignSelf: { xs: "flex-start", sm: "auto" },
                }}
              >
                <Button
                  onClick={() => onTabChange("cargo")}
                  startIcon={<SvgIcon src={CargoIcon} />}
                  sx={{
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    bgcolor:
                      tab === "cargo" ? "background.paper" : "transparent",
                    color:
                      tab === "cargo" ? "primary.main" : "text.secondary",
                    boxShadow:
                      tab === "cargo" ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
                    border:
                      tab === "cargo" ? "1px solid" : "1px solid transparent",
                    borderColor: tab === "cargo" ? "divider" : "transparent",
                    "&:hover": {
                      bgcolor:
                        tab === "cargo"
                          ? "background.paper"
                          : "rgba(0,0,0,0.03)",
                    },
                  }}
                >
                  {t("homePage.cargoTab", "Грузы")}
                </Button>
                <Button
                  onClick={() => onTabChange("transport")}
                  startIcon={<SvgIcon src={TransportIcon} />}
                  sx={{
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    bgcolor:
                      tab === "transport" ? "background.paper" : "transparent",
                    color:
                      tab === "transport" ? "primary.main" : "text.secondary",
                    boxShadow:
                      tab === "transport" ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
                    border:
                      tab === "transport" ? "1px solid" : "1px solid transparent",
                    borderColor: tab === "transport" ? "divider" : "transparent",
                    "&:hover": {
                      bgcolor:
                        tab === "transport"
                          ? "background.paper"
                          : "rgba(0,0,0,0.03)",
                    },
                  }}
                >
                  {t("homePage.transportTab", "Транспорт")}
                </Button>
              </Box>

              <Stack
                direction="row"
                gap={1.5}
                alignItems="center"
                flexWrap="wrap"
              >
                <Button
                  variant="outlined"
                  onClick={() => setDrawerOpen(true)}
                  startIcon={<SvgIcon src={SettingsIcon} />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 500,
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
                  {t("homePage.filtersButton", "Фильтры")}
                </Button>

                {activeFiltersCount > 0 ? (
                  <Chip
                    size="medium"
                    color="primary"
                    variant="outlined"
                    label={t("homePage.clearFilters", "Очистить")}
                    onClick={onClearFilters}
                    sx={{ borderRadius: "8px", fontWeight: 600 }}
                  />
                ) : null}

                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 400,
                    color: "text.primary",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Trans
                    i18nKey="shipments.total"
                    values={{ count: total }}
                    components={{ bold: <strong style={{ fontWeight: 700 }} /> }}
                  />
                </Typography>
              </Stack>
            </Stack>

            {/* Card listings */}
            <Grid container spacing={2}>
              {list.map((item) => (
                <Grid size={{ xs: 12 }} key={item.id}>
                  <PublicShipmentRow
                    item={item}
                    kind={tab}
                    isAuthenticated={isAuthenticated}
                  />
                </Grid>
              ))}

              {!loading && list.length === 0 ? (
                <Grid size={{ xs: 12 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 6,
                      borderRadius: "12px",
                      textAlign: "center",
                      borderStyle: "dashed",
                    }}
                  >
                    <Typography fontWeight={600} variant="h6">
                      {t("homePage.noResults", "Нет результатов")}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      {t(
                        "homePage.noResultsHint",
                        "Попробуйте переключить вкладку или изменить фильтры.",
                      )}
                    </Typography>
                  </Paper>
                </Grid>
              ) : null}

              {loading ? (
                <Grid size={{ xs: 12 }}>
                  <Paper
                    variant="outlined"
                    sx={{ p: 6, borderRadius: "12px", textAlign: "center" }}
                  >
                    <CircularProgress size={28} sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      {t("homePage.loading", "Загрузка объявлений...")}
                    </Typography>
                  </Paper>
                </Grid>
              ) : null}
            </Grid>

            {/* Pagination and View All */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
              gap={2}
              sx={{ pt: 2 }}
            >
              <Box>
                {pages > 1 ? (
                  <Pagination
                    count={pages}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    siblingCount={1}
                    color="primary"
                    shape="rounded"
                  />
                ) : (
                  <Box />
                )}
              </Box>

              <Button
                component={Link}
                to="/dashboard/search"
                variant="outlined"
                color="primary"
                endIcon={<FiChevronRight />}
                sx={{
                  px: 3,
                  py: 1.2,
                  borderRadius: "8px",
                  fontWeight: 600,
                }}
              >
                {t("homePage.viewAllShipments", "Посмотреть все объявления")}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
