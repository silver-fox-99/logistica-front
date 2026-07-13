import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  TextField,
  Rating,
  Pagination,
  Avatar,
  Alert,
  CircularProgress,
  Container,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { FiMessageSquare, FiSend } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import { useUserStore } from "@/entities/user/model/user.store";
import { siteReviewsApi, type SiteReview } from "@/shared/api/siteReviewsApi";

export default function ReviewsPage() {
  const { t } = useTranslation();
  const user = useUserStore((s) => s.user);
  const isAuthenticated = !!user;

  const [reviews, setReviews] = useState<SiteReview[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter and stats state
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [stats, setStats] = useState<{
    average: number;
    total: number;
    distribution: Record<number, number>;
  } | null>(null);

  // Form state
  const [rating, setRating] = useState<number | null>(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(
    async (nextPage = 1, filterRating: number | null = null) => {
      setLoading(true);
      try {
        const res = await siteReviewsApi.list({
          page: nextPage,
          limit: 10,
          rating: filterRating !== null ? filterRating : undefined,
        });
        setReviews(res.items);
        setPages(res.pages);
        setTotal(res.total);
        setPage(res.page);
      } catch (e: any) {
        toast.error(
          e?.response?.data?.message ||
            t("reviews.errorLoad", "Не удалось загрузить отзывы о сайте"),
        );
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  const fetchStats = useCallback(async () => {
    try {
      const data = await siteReviewsApi.getStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load review stats:", err);
    }
  }, []);

  useEffect(() => {
    void fetchReviews(1, selectedRating);
    void fetchStats();
  }, [fetchReviews, fetchStats, selectedRating]);

  const handleRatingFilterChange = (ratingVal: number | null) => {
    setSelectedRating(ratingVal);
    setPage(1);
    void fetchReviews(1, ratingVal);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      toast.error(
        t("reviews.errorRatingRequired", "Пожалуйста, выберите оценку"),
      );
      return;
    }

    setSubmitting(true);
    try {
      await siteReviewsApi.create({
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success(
        t("reviews.successSubmit", "Отзыв успешно отправлен на модерацию!"),
      );
      setComment("");
      setRating(5);
      void fetchReviews(1, selectedRating);
      void fetchStats();
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        t("reviews.errorSubmit", "Не удалось отправить отзыв");
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const getRandomColor = (name: string) => {
    const colors = [
      "#f44336",
      "#e91e63",
      "#9c27b0",
      "#673ab7",
      "#3f51b5",
      "#2196f3",
      "#03a9f4",
      "#00bcd4",
      "#009688",
      "#4caf50",
      "#ff9800",
      "#ff5722",
      "#795548",
      "#607d8b",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % colors.length);
    return colors[index];
  };

  const getInitials = (item: SiteReview) => {
    if (item.user) {
      const f = item.user.first_name || "";
      const l = item.user.last_name || "";
      if (f || l) return `${f[0] || ""}${l[0] || ""}`.toUpperCase();
    }
    return "U";
  };

  const getAuthorName = (item: SiteReview) => {
    if (item.user) {
      const f = item.user.first_name || "";
      const l = item.user.last_name || "";
      if (f || l) return `${f} ${l}`.trim();
    }
    return t("reviews.anonymousUser", "Пользователь");
  };

  return (
    <Box sx={{ pb: { xs: 1.5, md: 3 }, pt: 16 }}>
      <Container maxWidth="lg">
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, md: 3 },
            mb: 3,
            borderRadius: 1,
            bgcolor: "background.paper",
          }}
        >
          <Stack spacing={1}>
            <Typography
              variant="h4"
              fontWeight={800}
              display="flex"
              alignItems="center"
              gap={1.5}
            >
              <FiMessageSquare style={{ color: "#1976d2" }} />
              {t("reviews.title", "Отзывы о сайте")}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t(
                "reviews.subtitle",
                "Мнения наших пользователей о качестве логистического сервиса Logistica. Мы ценим каждый отзыв и постоянно улучшаем нашу платформу.",
              )}
            </Typography>
          </Stack>
        </Paper>

        <Grid container spacing={3}>
          {/* Left Column: Stats & Reviews List */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={2.5}>
              {/* Rating Stats Summary */}
              {stats && stats.total > 0 && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    borderRadius: 1,
                    bgcolor: "background.paper",
                  }}
                >
                  <Grid container spacing={3} alignItems="center">
                    {/* Average Score */}
                    <Grid size={{ xs: 12, sm: 4 }} sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h2"
                        fontWeight={800}
                        color="primary.main"
                        sx={{ lineHeight: 1.1 }}
                      >
                        {stats.average}
                      </Typography>
                      <Rating
                        value={stats.average}
                        precision={0.1}
                        readOnly
                        size="medium"
                        sx={{ my: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {t("reviews.basedOn", "На основе")} {stats.total}{" "}
                        {t("reviews.countLabel", "отзывов")}
                      </Typography>
                    </Grid>

                    {/* Stars Distribution Progress Bars */}
                    <Grid size={{ xs: 12, sm: 8 }}>
                      <Stack spacing={1}>
                        {[5, 4, 3, 2, 1].map((stars) => {
                          const count = stats.distribution[stars] || 0;
                          const percentage =
                            stats.total > 0 ? (count / stats.total) * 100 : 0;
                          const isSelected = selectedRating === stars;

                          return (
                            <Stack
                              key={stars}
                              direction="row"
                              spacing={2}
                              alignItems="center"
                              onClick={() =>
                                handleRatingFilterChange(
                                  isSelected ? null : stars,
                                )
                              }
                              sx={{
                                cursor: "pointer",
                                p: 0.5,
                                px: 1,
                                borderRadius: 1,
                                "&:hover": { bgcolor: "action.hover" },
                                bgcolor: isSelected
                                  ? "action.selected"
                                  : "transparent",
                                transition: "background-color 0.2s",
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ minWidth: 60, fontWeight: 600 }}
                              >
                                {stars} {t("reviews.starsUnit", "звёзд")}
                              </Typography>
                              <Box
                                sx={{
                                  flex: 1,
                                  height: 8,
                                  bgcolor: "grey.100",
                                  borderRadius: 4,
                                  overflow: "hidden",
                                  position: "relative",
                                }}
                              >
                                <Box
                                  sx={{
                                    width: `${percentage}%`,
                                    height: "100%",
                                    bgcolor: isSelected
                                      ? "primary.main"
                                      : "warning.main",
                                    borderRadius: 4,
                                  }}
                                />
                              </Box>
                              <Typography
                                variant="body2"
                                sx={{ minWidth: 35, textAlign: "right" }}
                                color="text.secondary"
                              >
                                {count}
                              </Typography>
                            </Stack>
                          );
                        })}
                      </Stack>
                    </Grid>
                  </Grid>
                </Paper>
              )}

              {/* Star Filter Indicator */}
              {selectedRating !== null && (
                <Alert
                  severity="info"
                  sx={{ borderRadius: 1 }}
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => handleRatingFilterChange(null)}
                      sx={{ fontWeight: 600 }}
                    >
                      {t("common.reset", "Сбросить")}
                    </Button>
                  }
                >
                  {t("reviews.filteringBy", "Показаны только отзывы с оценкой")}{" "}
                  <strong>
                    {selectedRating} {t("reviews.starsUnit", "звёзд")}
                  </strong>
                </Alert>
              )}

              <Typography variant="h6" fontWeight={600}>
                {t("reviews.listTitle", "Отзывы пользователей")} ({total})
              </Typography>

              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                  <CircularProgress />
                </Box>
              ) : reviews.length === 0 ? (
                <Paper
                  variant="outlined"
                  sx={{ p: 4, textAlign: "center", borderRadius: 1 }}
                >
                  <Typography color="text.secondary" variant="body1">
                    {t(
                      "reviews.noReviews",
                      "Пока нет ни одного отзыва о сайте. Станьте первым!",
                    )}
                  </Typography>
                </Paper>
              ) : (
                <Stack spacing={2}>
                  {reviews.map((r) => {
                    const authorName = getAuthorName(r);
                    const initials = getInitials(r);
                    return (
                      <Paper
                        key={r.id}
                        variant="outlined"
                        sx={{
                          p: 2.5,
                          borderRadius: 1,
                          bgcolor: "background.paper",
                          transition: "box-shadow 0.2s",
                          "&:hover": {
                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                          },
                        }}
                      >
                        <Stack spacing={1.5}>
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                          >
                            <Avatar
                              sx={{
                                bgcolor: getRandomColor(authorName),
                                width: 44,
                                height: 44,
                                fontWeight: 600,
                                fontSize: 16,
                              }}
                            >
                              {initials}
                            </Avatar>
                            <Stack spacing={0.25} flex={1}>
                              <Typography fontWeight={600} variant="body1">
                                {authorName}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {new Date(r.created_at).toLocaleDateString(
                                  undefined,
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  },
                                )}
                              </Typography>
                            </Stack>
                            <Rating value={r.rating} readOnly size="small" />
                          </Stack>
                          {r.comment && (
                            <Typography
                              variant="body2"
                              color="text.primary"
                              sx={{
                                whiteSpace: "pre-line",
                                pl: 0.5,
                                lineHeight: 1.6,
                              }}
                            >
                              {r.comment}
                            </Typography>
                          )}
                        </Stack>
                      </Paper>
                    );
                  })}

                  {pages > 1 && (
                    <Stack
                      direction="row"
                      justifyContent="center"
                      sx={{ mt: 2 }}
                    >
                      <Pagination
                        count={pages}
                        page={page}
                        onChange={(_, val) =>
                          void fetchReviews(val, selectedRating)
                        }
                      />
                    </Stack>
                  )}
                </Stack>
              )}
            </Stack>
          </Grid>

          {/* Right Column: Submit Feedback / Guest Prompts */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={2.5}>
              <Typography variant="h6" fontWeight={600}>
                {t("reviews.formTitle", "Оставить отзыв")}
              </Typography>

              {isAuthenticated ? (
                <Paper
                  variant="outlined"
                  component="form"
                  onSubmit={handleSubmit}
                  sx={{ p: 3, borderRadius: 1, bgcolor: "background.paper" }}
                >
                  <Stack spacing={2.5}>
                    <Stack spacing={1}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="text.secondary"
                      >
                        {t("reviews.ratingLabel", "Ваша оценка")}
                      </Typography>
                      <Rating
                        name="rating-input"
                        value={rating}
                        onChange={(_, val) => setRating(val)}
                        size="large"
                      />
                    </Stack>

                    <Stack spacing={1}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="text.secondary"
                      >
                        {t(
                          "reviews.commentLabel",
                          "Комментарий (необязательно)",
                        )}
                      </Typography>
                      <TextField
                        multiline
                        rows={4}
                        fullWidth
                        placeholder={t(
                          "reviews.commentPlaceholder",
                          "Что вам понравилось или что можно улучшить на сайте?",
                        )}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        variant="outlined"
                      />
                    </Stack>

                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={submitting}
                      startIcon={
                        submitting ? <CircularProgress size={20} /> : <FiSend />
                      }
                      sx={{
                        textTransform: "none",
                        py: 1.2,
                        fontWeight: 600,
                        borderRadius: 1,
                      }}
                    >
                      {t("reviews.submitBtn", "Отправить отзыв")}
                    </Button>

                    <Alert severity="info" sx={{ borderRadius: 1 }}>
                      {t(
                        "reviews.moderationNotice",
                        "Отзыв будет опубликован после проверки модератором.",
                      )}
                    </Alert>
                  </Stack>
                </Paper>
              ) : (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    borderRadius: 1,
                    bgcolor: "background.paper",
                    textAlign: "center",
                    borderStyle: "dashed",
                    borderWidth: 2,
                    borderColor: "primary.light",
                  }}
                >
                  <Stack spacing={2} alignItems="center">
                    <Avatar
                      sx={{
                        bgcolor: "primary.light",
                        width: 56,
                        height: 56,
                        mb: 1,
                      }}
                    >
                      <FiMessageSquare size={26} color="#1976d2" />
                    </Avatar>
                    <Typography variant="h6" fontWeight={600}>
                      {t("reviews.guestTitle", "Поделитесь мнением")}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {t(
                        "reviews.guestSubtitle",
                        "Оставлять отзывы о работе платформы могут только авторизованные пользователи.",
                      )}
                    </Typography>
                    <Stack direction="row" spacing={1.5} sx={{ width: "100%" }}>
                      <Button
                        variant="contained"
                        component={Link}
                        to="/login"
                        fullWidth
                        sx={{
                          textTransform: "none",
                          fontWeight: 600,
                          borderRadius: 1,
                        }}
                      >
                        {t("header.login", "Войти")}
                      </Button>
                      <Button
                        variant="outlined"
                        component={Link}
                        to="/register"
                        fullWidth
                        sx={{
                          textTransform: "none",
                          fontWeight: 600,
                          borderRadius: 1,
                        }}
                      >
                        {t("header.register", "Регистрация")}
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
