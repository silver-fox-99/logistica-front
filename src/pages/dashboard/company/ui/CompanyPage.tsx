import React, { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  FiArrowRight,
  FiBriefcase,
  FiMapPin,
  FiPhone,
  FiPlus,
  FiSearch,
} from "react-icons/fi";
import { GoArrowRight } from "react-icons/go";

import { Trans, useTranslation } from "react-i18next";
import { useMyCompanies } from "@/pages/dashboard/company/model/useMyCompanies";
import { usePublicCompanies } from "@/pages/dashboard/company/model/usePublicCompanies";

const statusColorMap: Record<
  string,
  "default" | "success" | "warning" | "error"
> = {
  UNVERIFIED: "default",
  PENDING_REVIEW: "warning",
  VERIFIED: "success",
  REJECTED: "error",
  BLOCKED: "error",
};

type CompanyCardItem = {
  id: string;
  name: string;
  legalName: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  email: string | null;
  phone: string | null;
  status: string | null;
};

export default function CompanyPage() {
  const [tab, setTab] = useState<"my" | "public">("public");
  const { t } = useTranslation();

  const myCompanies = useMyCompanies();
  const publicCompanies = usePublicCompanies();

  const current = tab === "my" ? myCompanies : publicCompanies;

  const items = useMemo<CompanyCardItem[]>(() => {
    return current.items.map((company) => ({
      id: company.id,
      name: company.name ?? t("companyPage.card.unnamedCompany"),
      legalName: company.legal_name ?? null,
      country: company.country ?? null,
      region: company.region ?? null,
      city: company.city ?? null,
      email: company.email ?? null,
      phone: company.phone ?? null,
      status: company.status ?? null,
    }));
  }, [current.items, t]);

  const hasItems = items.length > 0;

  const headerTitle =
    tab === "my"
      ? t("companyPage.section.myTitle")
      : t("companyPage.section.publicTitle");

  const headerSubtitle =
    tab === "my"
      ? t("companyPage.section.mySubtitle")
      : t("companyPage.section.publicSubtitle");

  return (
    <Stack spacing={3}>
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.5, md: 4 },
          borderRadius: "16px",
          borderColor: "divider",
          boxShadow: "0px 10px 30px rgba(15, 23, 42, 0.04)",
        }}
      >
        <Stack spacing={3}>
          {/* 1. Search Bar */}
          <TextField
            fullWidth
            value={current.query}
            onChange={(e) => current.setQuery(e.target.value)}
            placeholder={
              tab === "my"
                ? t("companyPage.search.myPlaceholder")
                : t("companyPage.search.publicPlaceholder")
            }
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start" sx={{ color: "text.secondary" }}>
                    <FiSearch size={18} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                bgcolor: "background.paper",
                "& fieldset": {
                  borderColor: "#E2E8F0",
                },
                "&:hover fieldset": {
                  borderColor: "#CBD5E1",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "primary.main",
                },
              },
            }}
          />

          {/* 2. Headline and Total Count */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={2}
          >
            <Stack spacing={0.5}>
              <Typography variant="h6" fontWeight={700} sx={{ color: "#0F172A" }}>
                {headerTitle}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {headerSubtitle}
              </Typography>
            </Stack>

            <Typography
              variant="body1"
              sx={{
                fontWeight: 400,
                color: "text.primary",
                whiteSpace: "nowrap",
                alignSelf: "center",
              }}
            >
              <Trans
                i18nKey="shipments.total"
                values={{ count: current.total }}
                components={{ bold: <strong style={{ fontWeight: 700 }} /> }}
              />
            </Typography>
          </Stack>

          {/* 3. Toggle Buttons and Create Button */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            gap={2.5}
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
                onClick={() => setTab("public")}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  bgcolor:
                    tab === "public" ? "background.paper" : "transparent",
                  color:
                    tab === "public" ? "primary.main" : "text.secondary",
                  boxShadow:
                    tab === "public" ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
                  border:
                    tab === "public" ? "1px solid" : "1px solid transparent",
                  borderColor: tab === "public" ? "divider" : "transparent",
                  "&:hover": {
                    bgcolor:
                      tab === "public"
                        ? "background.paper"
                        : "rgba(0,0,0,0.03)",
                  },
                }}
              >
                {t("companyPage.segments.public")}
              </Button>
              <Button
                onClick={() => setTab("my")}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  bgcolor:
                    tab === "my" ? "background.paper" : "transparent",
                  color:
                    tab === "my" ? "primary.main" : "text.secondary",
                  boxShadow:
                    tab === "my" ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
                  border:
                    tab === "my" ? "1px solid" : "1px solid transparent",
                  borderColor: tab === "my" ? "divider" : "transparent",
                  "&:hover": {
                    bgcolor:
                      tab === "my"
                        ? "background.paper"
                        : "rgba(0,0,0,0.03)",
                  },
                }}
              >
                {t("companyPage.segments.my")}
              </Button>
            </Box>

            <Button
              component={NavLink}
              to="/dashboard/new/company"
              variant="contained"
              startIcon={<FiPlus />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.95rem",
                borderRadius: "8px",
                px: 3,
                py: 1,
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "none",
                },
                alignSelf: { xs: "stretch", sm: "center" },
              }}
            >
              {t("companyPage.createCompany")}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {current.error ? <Alert severity="error">{current.error}</Alert> : null}

      {current.isLoading ? (
        <Paper
          variant="outlined"
          sx={{
            py: 8,
            borderRadius: "16px",
            borderColor: "divider",
          }}
        >
          <Stack spacing={1.5} alignItems="center">
            <CircularProgress size={30} />
            <Typography variant="body2" color="text.secondary">
              {t("companyPage.loading")}
            </Typography>
          </Stack>
        </Paper>
      ) : !hasItems ? (
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: "16px",
            borderColor: "divider",
          }}
        >
          <Stack spacing={1}>
            <Typography variant="h6" fontWeight={600}>
              {t("companyPage.empty.title")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tab === "my"
                ? t("companyPage.empty.myDescription")
                : t("companyPage.empty.publicDescription")}
            </Typography>

            {tab === "my" && (
              <Box pt={1}>
                <Button
                  component={NavLink}
                  to="/dashboard/new/company"
                  variant="contained"
                  startIcon={<FiPlus />}
                >
                  {t("companyPage.createCompany")}
                </Button>
              </Box>
            )}
          </Stack>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {items.map((company) => {
            const statusKey = company.status || "UNKNOWN";
            const statusColor = statusColorMap[statusKey] ?? "default";
            const statusLabel = t(`companyPage.status.${statusKey}`, {
              defaultValue: t("companyPage.status.UNKNOWN"),
            });

            const location =
              [company.country, company.region, company.city]
                .filter(Boolean)
                .join(", ") || t("companyPage.card.noLocation");

            const contacts =
              [company.email, company.phone].filter(Boolean).join(" · ") ||
              t("companyPage.card.noContacts");

            return (
              <Paper
                key={company.id}
                variant="outlined"
                sx={{
                  borderRadius: "16px",
                  borderColor: "divider",
                }}
              >
                <Stack
                  direction={{ xs: "column", lg: "row" }}
                  justifyContent="space-between"
                  spacing={2}
                  sx={{ p: { xs: 2, md: 2.5 } }}
                >
                  <Stack spacing={1.25} sx={{ flex: 1, minWidth: 0 }}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      justifyContent="space-between"
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        flexWrap="wrap"
                      >
                        <Typography variant="h6" fontWeight={600}>
                          {company.name}
                        </Typography>

                        <Chip
                          label={statusLabel}
                          color={statusColor}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                    </Stack>

                    <Stack spacing={1}>
                      <InfoRow
                        icon={<FiBriefcase />}
                        label={t("companyPage.card.legalName")}
                        value={
                          company.legalName ||
                          t("companyPage.card.notSpecified")
                        }
                      />
                      <InfoRow
                        icon={<FiMapPin />}
                        label={t("companyPage.card.location")}
                        value={location}
                      />
                      <InfoRow
                        icon={<FiPhone />}
                        label={t("companyPage.card.contacts")}
                        value={contacts}
                      />
                    </Stack>
                  </Stack>

                  <Stack
                    direction={{ xs: "column", sm: "row", lg: "column" }}
                    spacing={1}
                    sx={{ width: { xs: "100%", lg: 230 } }}
                  >
                    {tab === "public" ? (
                      <Button
                        component={NavLink}
                        to={`/dashboard/companies/${company.id}`}
                        variant="outlined"
                        sx={{ whiteSpace: "nowrap" }}
                        endIcon={<GoArrowRight />}
                        fullWidth
                      >
                        {t("companyPage.actions.publicPage")}
                      </Button>
                    ) : (
                      <>
                        <Button
                          component={NavLink}
                          to={`/dashboard/company/${company.id}/overview`}
                          variant="contained"
                          endIcon={<FiArrowRight />}
                          fullWidth
                        >
                          {t("companyPage.actions.openWorkspace")}
                        </Button>

                        <Button
                          component={NavLink}
                          to={`/dashboard/companies/${company.id}`}
                          variant="text"
                          fullWidth
                        >
                          {t("companyPage.actions.viewPublicPage")}
                        </Button>
                      </>
                    )}
                  </Stack>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}



function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box
        sx={{
          mt: "2px",
          color: "text.secondary",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 18,
        }}
      >
        {icon}
      </Box>

      <Stack spacing={0.25} minWidth={0}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography
          variant="body2"
          color="text.primary"
          sx={{ wordBreak: "break-word" }}
        >
          {value}
        </Typography>
      </Stack>
    </Stack>
  );
}
