import { useCallback, useEffect, useState } from "react";
import {
  Paper,
  Stack,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  TextField,
  MenuItem,
  Chip,
  Tabs,
  Tab,
} from "@mui/material";
import { FiRefreshCcw, FiCheck, FiX, FiTrash2 } from "react-icons/fi";
import { userReviewsApi } from "@/shared/api/userReviewsApi";
import { siteReviewsApi, type SiteReview } from "@/shared/api/siteReviewsApi";
import type { UserReview } from "@/entities/user-reviews/model/types";
import { toast } from "react-toastify";
import { useAdminAccessStore } from "@/entities/adminAccess/model/adminAccess.store.ts";
import { viewCode } from "@/shared/ui/layout/AdminLayout.tsx";
import NoAccess from "@/shared/ui/no-access/NoAccess.tsx";

export default function AdminReviewsPage() {
  const [tab, setTab] = useState<"users" | "site">("users");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PENDING" | "PUBLISHED" | "REJECTED"
  >("ALL");

  // User Reviews state
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [userPage, setUserPage] = useState(1);

  // Site Reviews state
  const [siteReviews, setSiteReviews] = useState<SiteReview[]>([]);
  const [sitePage, setSitePage] = useState(1);

  const [loading, setLoading] = useState(false);
  const canViewReviews = useAdminAccessStore((s) =>
    s.hasPermission(viewCode("REVIEWS" as any)),
  );

  const fetchUserReviews = useCallback(
    async (nextPage = 1) => {
      setLoading(true);
      try {
        const data = await userReviewsApi.adminList({
          page: nextPage,
          limit: 20,
          sort: "new",
          status: statusFilter === "ALL" ? undefined : (statusFilter as any),
        });
        setUserPage(data.page);
        setUserReviews(data.items || []);
      } catch (e: any) {
        toast.error(
          e?.message || "Не удалось загрузить отзывы о пользователях",
        );
        setUserReviews([]);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter],
  );

  const fetchSiteReviews = useCallback(
    async (nextPage = 1) => {
      setLoading(true);
      try {
        const data = await siteReviewsApi.adminList({
          page: nextPage,
          limit: 20,
          status: statusFilter === "ALL" ? undefined : (statusFilter as any),
        });
        setSitePage(data.page);
        setSiteReviews(data.items || []);
      } catch (e: any) {
        toast.error(e?.message || "Не удалось загрузить отзывы о сайте");
        setSiteReviews([]);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter],
  );

  const refreshData = useCallback(
    (targetPage?: number) => {
      if (tab === "users") {
        void fetchUserReviews(targetPage ?? userPage);
      } else {
        void fetchSiteReviews(targetPage ?? sitePage);
      }
    },
    [tab, fetchUserReviews, fetchSiteReviews, userPage, sitePage],
  );

  useEffect(() => {
    refreshData(1);
  }, [tab, statusFilter]);

  // Actions for User Reviews
  const deleteUserReview = async (review: UserReview) => {
    const targetId =
      review.to_user_id ||
      (review as any).user_id ||
      (review as any).toUserId ||
      review.from_user_id;
    if (!targetId) {
      toast.error("Нет ID пользователя для удаления отзыва");
      return;
    }
    try {
      await userReviewsApi.adminRemove(targetId, review.id);
      setUserReviews((prev) => prev.filter((r) => r.id !== review.id));
      toast.success("Отзыв удален");
    } catch (e: any) {
      toast.error(e?.message || "Не удалось удалить отзыв");
    }
  };

  const updateUserReviewStatus = async (
    review: UserReview,
    nextStatus: "PUBLISHED" | "REJECTED",
  ) => {
    const targetId =
      review.to_user_id ||
      (review as any).user_id ||
      (review as any).toUserId ||
      review.from_user_id;
    if (!targetId) {
      toast.error("Нет ID пользователя для смены статуса");
      return;
    }
    try {
      const payload = {
        status: nextStatus,
        rating: review.rating,
        comment: review.comment,
        from_user_id: review.from_user_id || undefined,
        to_user_id: review.to_user_id || undefined,
        order_id: review.order_id || undefined,
        order_date: review.order_date
          ? new Date(review.order_date as any).toISOString()
          : review.created_at
            ? new Date(review.created_at as any).toISOString()
            : undefined,
        pickup_country_id: review.pickup_country_id || undefined,
        pickup_region_id: review.pickup_region_id || undefined,
        pickup_city_id: review.pickup_city_id || undefined,
        dropoff_country_id: review.dropoff_country_id || undefined,
        dropoff_region_id: review.dropoff_region_id || undefined,
        dropoff_city_id: review.dropoff_city_id || undefined,
        price_currency: review.price_currency || undefined,
        price_amount: review.price_amount ?? undefined,
      };
      await userReviewsApi.adminUpdate(targetId, review.id, payload);
      setUserReviews((prev) =>
        prev.map((r) =>
          r.id === review.id ? { ...r, status: nextStatus } : r,
        ),
      );
      toast.success(
        nextStatus === "PUBLISHED" ? "Отзыв опубликован" : "Отзыв отклонен",
      );
      refreshData(userPage);
    } catch (e: any) {
      toast.error(e?.message || "Не удалось обновить статус");
    }
  };

  // Actions for Site Reviews
  const deleteSiteReview = async (review: SiteReview) => {
    try {
      await siteReviewsApi.adminRemove(review.id);
      setSiteReviews((prev) => prev.filter((r) => r.id !== review.id));
      toast.success("Отзыв удален");
    } catch (e: any) {
      toast.error(e?.message || "Не удалось удалить отзыв");
    }
  };

  const updateSiteReviewStatus = async (
    review: SiteReview,
    nextStatus: "APPROVED" | "REJECTED",
  ) => {
    try {
      await siteReviewsApi.adminModerate(review.id, { status: nextStatus });
      setSiteReviews((prev) =>
        prev.map((r) =>
          r.id === review.id ? { ...r, status: nextStatus } : r,
        ),
      );
      toast.success(
        nextStatus === "APPROVED" ? "Отзыв опубликован" : "Отзыв отклонен",
      );
      refreshData(sitePage);
    } catch (e: any) {
      toast.error(e?.message || "Не удалось обновить статус");
    }
  };

  if (!canViewReviews) return <NoAccess />;

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3, borderRadius: 2 }} elevation={0}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <Stack spacing={0.5} flex={1}>
            <Typography variant="h5" fontWeight={600}>
              Модерация отзывов
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Просматривайте все отзывы и публикуйте/отклоняйте их после
              проверки.
            </Typography>
          </Stack>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <TextField
              select
              size="small"
              label="Статус"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="ALL">Все</MenuItem>
              <MenuItem value="PENDING">На модерации</MenuItem>
              <MenuItem value="PUBLISHED">Опубликованы / Одобрены</MenuItem>
              <MenuItem value="REJECTED">Отклонены</MenuItem>
            </TextField>
          </Stack>
          <Button
            startIcon={<FiRefreshCcw />}
            variant="outlined"
            onClick={() => refreshData()}
          >
            Обновить
          </Button>
        </Stack>

        <Tabs
          value={tab}
          onChange={(_, value: "users" | "site") => {
            setTab(value);
            setStatusFilter("ALL");
          }}
          sx={{ mt: 2 }}
        >
          <Tab value="users" label="Отзывы о пользователях" />
          <Tab value="site" label="Отзывы о сайте" />
        </Tabs>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 2 }} elevation={0}>
        <Stack spacing={2}>
          {tab === "users" ? (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Автор</TableCell>
                  <TableCell>Для пользователя</TableCell>
                  <TableCell>Рейтинг</TableCell>
                  <TableCell>Комментарий</TableCell>
                  <TableCell>Маршрут</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7}>Загрузка...</TableCell>
                  </TableRow>
                ) : userReviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>Отзывов нет</TableCell>
                  </TableRow>
                ) : (
                  userReviews.map((r) => {
                    const author =
                      [
                        (r as any)?.from_user?.first_name,
                        (r as any)?.from_user?.last_name,
                      ]
                        .filter(Boolean)
                        .join(" ") ||
                      [r.from_first_name, r.from_last_name]
                        .filter(Boolean)
                        .join(" ") ||
                      r.from_email ||
                      r.from_phone ||
                      r.from_user_id ||
                      "—";
                    const target =
                      [
                        (r as any)?.to_user?.first_name,
                        (r as any)?.to_user?.last_name,
                      ]
                        .filter(Boolean)
                        .join(" ") ||
                      [r.to_first_name, r.to_last_name]
                        .filter(Boolean)
                        .join(" ") ||
                      r.to_email ||
                      r.to_phone ||
                      r.to_user_id ||
                      "—";
                    const from =
                      [r.pickup_country, r.pickup_region, r.pickup_city]
                        .filter(Boolean)
                        .join(", ") ||
                      [
                        r.pickup_country_id,
                        r.pickup_region_id,
                        r.pickup_city_id,
                      ]
                        .filter(Boolean)
                        .join(", ") ||
                      "—";
                    const to =
                      [r.dropoff_country, r.dropoff_region, r.dropoff_city]
                        .filter(Boolean)
                        .join(", ") ||
                      [
                        r.dropoff_country_id,
                        r.dropoff_region_id,
                        r.dropoff_city_id,
                      ]
                        .filter(Boolean)
                        .join(", ") ||
                      "—";
                    const route = `${from} → ${to}`;
                    return (
                      <TableRow key={r.id}>
                        <TableCell>{author}</TableCell>
                        <TableCell>{target}</TableCell>
                        <TableCell>
                          {Number(r.rating ?? 0).toFixed(1)}
                        </TableCell>
                        <TableCell>{r.comment || "—"}</TableCell>
                        <TableCell>{route}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={r.status || "—"}
                            color={
                              r.status === "PUBLISHED"
                                ? "success"
                                : r.status === "REJECTED"
                                  ? "error"
                                  : "warning"
                            }
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                          >
                            <IconButton
                              size="small"
                              title="Опубликовать"
                              onClick={() =>
                                updateUserReviewStatus(r, "PUBLISHED")
                              }
                            >
                              <FiCheck />
                            </IconButton>
                            <IconButton
                              size="small"
                              title="Отклонить"
                              onClick={() =>
                                updateUserReviewStatus(r, "REJECTED")
                              }
                            >
                              <FiX />
                            </IconButton>
                            <IconButton
                              size="small"
                              title="Удалить"
                              onClick={() => deleteUserReview(r)}
                            >
                              <FiTrash2 />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Автор</TableCell>
                  <TableCell>Рейтинг</TableCell>
                  <TableCell>Комментарий</TableCell>
                  <TableCell>Модератор</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6}>Загрузка...</TableCell>
                  </TableRow>
                ) : siteReviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>Отзывов нет</TableCell>
                  </TableRow>
                ) : (
                  siteReviews.map((r) => {
                    const author = r.user
                      ? [r.user.first_name, r.user.last_name]
                          .filter(Boolean)
                          .join(" ") ||
                        r.user.email ||
                        r.user.phone ||
                        r.user.id
                      : "—";
                    const moderator = r.moderated_by
                      ? [r.moderated_by.first_name, r.moderated_by.last_name]
                          .filter(Boolean)
                          .join(" ")
                      : r.moderated_by_id
                        ? `ID: ${r.moderated_by_id}`
                        : "—";
                    return (
                      <TableRow key={r.id}>
                        <TableCell>{author}</TableCell>
                        <TableCell>
                          {Number(r.rating ?? 0).toFixed(1)}
                        </TableCell>
                        <TableCell>{r.comment || "—"}</TableCell>
                        <TableCell>{moderator}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={r.status || "—"}
                            color={
                              r.status === "APPROVED"
                                ? "success"
                                : r.status === "REJECTED"
                                  ? "error"
                                  : "warning"
                            }
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                          >
                            <IconButton
                              size="small"
                              title="Одобрить"
                              onClick={() =>
                                updateSiteReviewStatus(r, "APPROVED")
                              }
                            >
                              <FiCheck />
                            </IconButton>
                            <IconButton
                              size="small"
                              title="Отклонить"
                              onClick={() =>
                                updateSiteReviewStatus(r, "REJECTED")
                              }
                            >
                              <FiX />
                            </IconButton>
                            <IconButton
                              size="small"
                              title="Удалить"
                              onClick={() => deleteSiteReview(r)}
                            >
                              <FiTrash2 />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
