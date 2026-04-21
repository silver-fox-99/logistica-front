import { useEffect, useState } from "react";
import {
    Alert,
    Button,
    Card,
    CardContent,
    Chip,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { adminCompaniesApi } from "@/shared/api/adminCompaniesApi";
import type {
    CompanyJoinRequest,
    CompanyJoinRequestStatus,
} from "@/entities/company/model/types";

type Props = {
    companyId: string;
};

export function AdminCompanyJoinRequestsCard({ companyId }: Props) {
    const [items, setItems] = useState<CompanyJoinRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const loadJoinRequests = async () => {
        try {
            setIsLoading(true);
            setError("");
            const data = await adminCompaniesApi.listJoinRequests(companyId);
            setItems(data);
        } catch (e: any) {
            const message =
                e?.response?.data?.message ||
                e?.message ||
                "Не удалось загрузить заявки.";
            setError(Array.isArray(message) ? message[0] : message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadJoinRequests();
    }, [companyId]);

    const handleReviewed = (
        requestId: string,
        status: CompanyJoinRequestStatus,
        reviewComment: string,
    ) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === requestId
                    ? {
                        ...item,
                        status,
                        review_comment: reviewComment,
                        reviewed_at: new Date().toISOString(),
                    }
                    : item,
            ),
        );
    };

    return (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
                <Stack spacing={2}>
                    <Typography variant="h6" fontWeight={700}>
                        Заявки на вступление
                    </Typography>

                    {error ? <Alert severity="error">{error}</Alert> : null}

                    {isLoading ? (
                        <Typography>Загрузка...</Typography>
                    ) : items.length === 0 ? (
                        <Typography color="text.secondary">Заявки отсутствуют.</Typography>
                    ) : (
                        items.map((item) => (
                            <AdminCompanyJoinRequestRow
                                key={item.id}
                                companyId={companyId}
                                item={item}
                                onReviewed={handleReviewed}
                            />
                        ))
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}

function AdminCompanyJoinRequestRow(props: {
    companyId: string;
    item: CompanyJoinRequest;
    onReviewed: (
        requestId: string,
        status: CompanyJoinRequestStatus,
        reviewComment: string,
    ) => void;
}) {
    const { companyId, item, onReviewed } = props;

    const [status, setStatus] = useState<CompanyJoinRequestStatus>(item.status);
    const [reviewComment, setReviewComment] = useState(item.review_comment ?? "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const fullName = [item.user?.first_name, item.user?.last_name].filter(Boolean).join(" ").trim();
    const title = fullName || item.user?.email || item.user?.phone || item.user_id;

    const handleSave = async () => {
        try {
            setIsSubmitting(true);
            setError("");

            await adminCompaniesApi.reviewJoinRequest(companyId, item.id, {
                status,
                review_comment: reviewComment.trim() || "",
            });

            onReviewed(item.id, status, reviewComment.trim());
        } catch (e: any) {
            const message =
                e?.response?.data?.message ||
                e?.message ||
                "Не удалось обработать заявку.";
            setError(Array.isArray(message) ? message[0] : message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Stack
            spacing={1.5}
            sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
            }}
        >
            <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                spacing={1.5}
            >
                <Stack spacing={0.5}>
                    <Typography fontWeight={700}>{title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Запрошенная роль: {item.requested_role}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Сообщение: {item.message || "—"}
                    </Typography>
                </Stack>

                <Chip label={item.status} size="small" />
            </Stack>

            {error ? <Alert severity="error">{error}</Alert> : null}

            <TextField
                select
                label="Решение"
                value={status}
                onChange={(e) => setStatus(e.target.value as CompanyJoinRequestStatus)}
                fullWidth
            >
                <MenuItem value="PENDING">Оставить в ожидании</MenuItem>
                <MenuItem value="APPROVED">Одобрить</MenuItem>
                <MenuItem value="REJECTED">Отклонить</MenuItem>
                <MenuItem value="CANCELED">Отменить</MenuItem>
            </TextField>

            <TextField
                label="Комментарий"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                multiline
                minRows={3}
                fullWidth
            />

            <Button
                variant="contained"
                onClick={handleSave}
                disabled={isSubmitting}
                sx={{ textTransform: "none", fontWeight: 700, alignSelf: "flex-start" }}
            >
                {isSubmitting ? "Сохранение..." : "Сохранить решение"}
            </Button>
        </Stack>
    );
}