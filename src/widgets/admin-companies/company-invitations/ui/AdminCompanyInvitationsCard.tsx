import { useEffect, useState } from "react";
import {
    Alert,
    Button,
    Card,
    CardContent,
    Chip,
    Stack,
    Typography,
} from "@mui/material";
import { adminCompaniesApi } from "@/shared/api/adminCompaniesApi";
import type { CompanyInvitation } from "@/entities/company/model/types";

type Props = {
    companyId: string;
};

export function AdminCompanyInvitationsCard({ companyId }: Props) {
    const [items, setItems] = useState<CompanyInvitation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const loadInvitations = async () => {
        try {
            setIsLoading(true);
            setError("");
            const data = await adminCompaniesApi.listInvitations(companyId);
            setItems(data);
        } catch (e: any) {
            const message =
                e?.response?.data?.message ||
                e?.message ||
                "Не удалось загрузить приглашения.";
            setError(Array.isArray(message) ? message[0] : message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadInvitations();
    }, [companyId]);

    const handleCanceled = (invitationId: string) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === invitationId
                    ? {
                        ...item,
                        status: "CANCELED",
                        responded_at: new Date().toISOString(),
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
                        Приглашения в компанию
                    </Typography>

                    {error ? <Alert severity="error">{error}</Alert> : null}

                    {isLoading ? (
                        <Typography>Загрузка...</Typography>
                    ) : items.length === 0 ? (
                        <Typography color="text.secondary">Приглашения не найдены.</Typography>
                    ) : (
                        items.map((item) => (
                            <AdminCompanyInvitationRow
                                key={item.id}
                                companyId={companyId}
                                item={item}
                                onCanceled={handleCanceled}
                            />
                        ))
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}

function AdminCompanyInvitationRow(props: {
    companyId: string;
    item: CompanyInvitation;
    onCanceled: (invitationId: string) => void;
}) {
    const { companyId, item, onCanceled } = props;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleCancel = async () => {
        try {
            setIsSubmitting(true);
            setError("");
            await adminCompaniesApi.cancelInvitation(companyId, item.id);
            onCanceled(item.id);
        } catch (e: any) {
            const message =
                e?.response?.data?.message ||
                e?.message ||
                "Не удалось отменить приглашение.";
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
                    <Typography fontWeight={700}>
                        {item.email || item.phone || "Без контактных данных"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Роль: {item.role}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Сообщение: {item.message || "—"}
                    </Typography>
                </Stack>

                <Chip label={item.status} size="small" />
            </Stack>

            {error ? <Alert severity="error">{error}</Alert> : null}

            <Button
                variant="outlined"
                color="error"
                onClick={handleCancel}
                disabled={isSubmitting || item.status !== "PENDING"}
                sx={{ textTransform: "none", fontWeight: 700, alignSelf: "flex-start" }}
            >
                {isSubmitting ? "Отмена..." : "Отменить приглашение"}
            </Button>
        </Stack>
    );
}