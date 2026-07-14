import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import Lottie from "lottie-react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
  InputAdornment,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  FiLifeBuoy,
  FiMail,
  FiHome,
  FiSearch,
  FiMessageSquare,
  FiPhone,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
import animation from "./HelpCenter.json";

export default function HelpSupportPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = useMemo(() => [
    { q: t("helpSupport.faq.q1"), a: t("helpSupport.faq.a1") },
    { q: t("helpSupport.faq.q2"), a: t("helpSupport.faq.a2") },
    { q: t("helpSupport.faq.q3"), a: t("helpSupport.faq.a3") },
    { q: t("helpSupport.faq.q4"), a: t("helpSupport.faq.a4") },
    { q: t("helpSupport.faq.q5"), a: t("helpSupport.faq.a5") },
    { q: t("helpSupport.faq.q6"), a: t("helpSupport.faq.a6") },
  ], [t]);

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const query = searchQuery.toLowerCase();
    return faqs.filter(
      (item) =>
        item.q.toLowerCase().includes(query) ||
        item.a.toLowerCase().includes(query)
    );
  }, [searchQuery, faqs]);

  return (
    <Box
      sx={{
        minHeight: "calc(100dvh - 120px)",
        py: 3,
        bgcolor: "transparent",
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Stack spacing={3}>
          {/* Header Hero Card */}
          <Card
            variant="outlined"
            sx={{
              borderRadius: "16px",
              borderColor: "divider",
              bgcolor: "background.paper",
              boxShadow: "0px 10px 30px rgba(15, 23, 42, 0.04)",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Grid container spacing={4} alignItems="center">
                <Grid size={{ xs: 12, md: 5 }} sx={{ display: "flex", justifyContent: "center" }}>
                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: 380,
                      aspectRatio: "1",
                    }}
                  >
                    <Lottie
                      animationData={animation}
                      loop
                      style={{ width: "100%", height: "100%" }}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 7 }}>
                  <Stack spacing={2.5}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "primary.main",
                          bgcolor: "rgba(37, 99, 235, 0.08)",
                          p: 1,
                          borderRadius: "10px",
                        }}
                      >
                        <FiLifeBuoy size={22} />
                      </Box>
                      <Typography variant="h5" fontWeight={750} sx={{ color: "#0F172A" }}>
                        {t("helpSupport.title")}
                      </Typography>
                    </Stack>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {t("helpSupport.description")}
                    </Typography>

                    <Stack
                      direction="column"
                      spacing={1.5}
                      sx={{ pt: 1, width: "100%" }}
                    >
                      <Button
                        variant="contained"
                        onClick={() => navigate("/dashboard/help/contact")}
                        startIcon={<FiMail size={18} />}
                        sx={{
                          height: 44,
                          borderRadius: "8px",
                          textTransform: "none",
                          fontWeight: 600,
                          boxShadow: "none",
                          "&:hover": {
                            bgcolor: "primary.dark",
                            boxShadow: "none",
                          },
                        }}
                      >
                        {t("helpSupport.contactSupport")}
                      </Button>

                      <Button
                        variant="outlined"
                        onClick={() => navigate("/dashboard")}
                        startIcon={<FiHome size={18} />}
                        sx={{
                          height: 44,
                          borderRadius: "8px",
                          textTransform: "none",
                          fontWeight: 600,
                          borderColor: "#E2E8F0",
                          color: "text.primary",
                          "&:hover": {
                            borderColor: "primary.main",
                            bgcolor: "rgba(0, 0, 0, 0.02)",
                          },
                        }}
                      >
                        {t("helpSupport.backToDashboard")}
                      </Button>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Main Content Card (Quick links, FAQ & Support contacts) */}
          <Card
            variant="outlined"
            sx={{
              borderRadius: "16px",
              borderColor: "divider",
              bgcolor: "background.paper",
              boxShadow: "0px 10px 30px rgba(15, 23, 42, 0.04)",
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Stack spacing={4}>
                {/* Search Bar */}
                <TextField
                  placeholder={t("helpSupport.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start" sx={{ color: "text.secondary" }}>
                          <FiSearch size={18} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      bgcolor: "#F8FAFC",
                      "& fieldset": {
                        borderColor: "#E2E8F0",
                      },
                      "&:hover fieldset": {
                        borderColor: "#CBD5E1",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "primary.main",
                        bgcolor: "background.paper",
                      },
                    },
                  }}
                />

                <Divider />

                {/* Quick Links Section */}
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#0F172A", mb: 2 }}>
                    {t("helpSupport.quickLinks")}
                  </Typography>

                  <Stack spacing={1.5}>
                    <Box
                      component="a"
                      href="/introduction.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={linkBoxSx}
                    >
                      <Box sx={{ ...iconWrapperSx, bgcolor: "#EFF6FF", color: "#2563EB" }}>
                        <FiMessageSquare size={18} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ color: "#0F172A" }}>
                          {t("helpSupport.gettingStarted.title")}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t("helpSupport.gettingStarted.description")}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      component="a"
                      href="/account-security.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={linkBoxSx}
                    >
                      <Box sx={{ ...iconWrapperSx, bgcolor: "#F0FDF4", color: "#16A34A" }}>
                        <FiMessageSquare size={18} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ color: "#0F172A" }}>
                          {t("helpSupport.accountSecurity.title")}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t("helpSupport.accountSecurity.description")}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      component="a"
                      href="/payments-billing.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={linkBoxSx}
                    >
                      <Box sx={{ ...iconWrapperSx, bgcolor: "#FEF3C7", color: "#D97706" }}>
                        <FiMessageSquare size={18} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ color: "#0F172A" }}>
                          {t("helpSupport.billingPayments.title")}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t("helpSupport.billingPayments.description")}
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Box>

                <Divider />

                {/* FAQ Section */}
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#0F172A", mb: 2 }}>
                    {t("helpSupport.faq.title")}
                  </Typography>

                  {filteredFaqs.length > 0 ? (
                    <Grid container spacing={2}>
                      {filteredFaqs.map((item, idx) => (
                        <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: "10px",
                              bgcolor: "#F8FAFC",
                              border: "1px solid",
                              borderColor: "#F1F5F9",
                              height: "100%",
                              boxSizing: "border-box",
                            }}
                          >
                            <Typography variant="subtitle2" fontWeight={600} sx={{ color: "#0F172A", mb: 0.75 }}>
                              {item.q}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                              {item.a}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                      {t("common.noResults", "Ничего не найдено")}
                    </Typography>
                  )}
                </Box>

                <Divider />

                {/* Support Contacts Section */}
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#0F172A", mb: 2 }}>
                    {t("helpSupport.support.title")}
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box sx={contactBoxSx}>
                        <FiMail size={18} style={{ color: "#2563EB" }} />
                        <Typography variant="body2" sx={{ fontWeight: 500, color: "text.primary" }}>
                          {t("helpSupport.support.email")}{" "}
                          <a href="mailto:info@yologistic.uz" style={{ textDecoration: "none", color: "#2563EB", fontWeight: 600 }}>
                            info@yologistic.uz
                          </a>
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box sx={contactBoxSx}>
                        <FiPhone size={18} style={{ color: "#16A34A" }} />
                        <Typography variant="body2" sx={{ fontWeight: 500, color: "text.primary" }}>
                          {t("helpSupport.support.phone")}{" "}
                          <a href="tel:+998949866886" style={{ textDecoration: "none", color: "#16A34A", fontWeight: 600 }}>
                            +998 94 986 68 86
                          </a>
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box sx={contactBoxSx}>
                        <FiMessageSquare size={18} style={{ color: "#D97706" }} />
                        <Typography variant="body2" sx={{ fontWeight: 500, color: "text.primary" }}>
                          {t("helpSupport.support.chat")}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}

const linkBoxSx = {
  p: 2,
  borderRadius: "12px",
  border: "1px solid",
  borderColor: "#E2E8F0",
  bgcolor: "background.paper",
  display: "flex",
  gap: 2,
  alignItems: "flex-start",
  cursor: "pointer",
  transition: "all 0.25s ease-in-out",
  textDecoration: "none",
  color: "inherit",
  height: "100%",
  boxSizing: "border-box",
  "&:hover": {
    borderColor: "primary.main",
    boxShadow: "0px 8px 24px rgba(15, 23, 42, 0.05)",
  },
};

const iconWrapperSx = {
  p: 1.25,
  borderRadius: "50%",
  display: "inline-flex",
  flexShrink: 0,
};

const contactBoxSx = {
  p: 2,
  borderRadius: "10px",
  border: "1px solid",
  borderColor: "#E2E8F0",
  bgcolor: "#F8FAFC",
  display: "flex",
  gap: 1.5,
  alignItems: "center",
  height: "100%",
  boxSizing: "border-box",
};
