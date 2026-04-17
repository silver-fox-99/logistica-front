import { useEffect, useState } from "react";
import {
    Alert,
    Button,
    Card,
    CardContent,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { adminCompaniesApi } from "@/shared/api/adminCompaniesApi";
import type { CompanyDocument, CompanyDocumentStatus } from "@/entities/company/model/types";

type Props = {
    companyId: string;
};

export function AdminCompanyDocumentsCard({ companyId }: Props) {
    const [items, setItems] = useState<CompanyDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const load = async () => {
        try {
            setIsLoading(true);
            setError("");
            const data = await adminCompaniesApi.listDocuments(companyId);
            setItems(data);
        } catch (e: any) {
            const message =
                e?.response?.data?.message ||
                e?.message ||
                "Failed to load documents.";
            setError(Array.isArray(message) ? message[0] : message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [companyId]);

    const updateDocument = async (
        documentId: string,
        status: CompanyDocumentStatus,
        reviewComment: string,
    ) => {
        try {
            const updated = await adminCompaniesApi.reviewDocument(companyId, documentId, {
                status,
                review_comment: reviewComment.trim() || null,
            });

            setItems((prev) =>
                prev.map((item) => (item.id === updated.id ? updated : item)),
            );
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
                <Stack spacing={2}>
                    <Typography variant="h6" fontWeight={700}>
                        Документы компании
                    </Typography>

                    {error ? <Alert severity="error">{error}</Alert> : null}

                    {isLoading ? (
                        <Typography>Загрузка...</Typography>
                    ) : items.length === 0 ? (
                        <Typography color="text.secondary">Документы не загружены</Typography>
                    ) : (
                        items.map((item) => (
                            <AdminCompanyDocumentRow
                                key={item.id}
                                item={item}
                                companyId={companyId}
                                onSave={updateDocument}
                            />
                        ))
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}

function AdminCompanyDocumentRow(props: {
    item: CompanyDocument;
    companyId: string;
    onSave: (documentId: string, status: CompanyDocumentStatus, reviewComment: string) => Promise<void>;
}) {
    const { item, companyId, onSave } = props;

    const [status, setStatus] = useState<CompanyDocumentStatus>(item.status);
    const [reviewComment, setReviewComment] = useState(item.review_comment ?? "");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = async () => {
        try {
            setIsSubmitting(true);
            await onSave(item.id, status, reviewComment);
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
            <Typography fontWeight={700}>{item.title}</Typography>
            <Typography variant="body2" color="text.secondary">
                {item.original_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Type: {item.type}
            </Typography>

            <Button
                component="a"
                href={adminCompaniesApi.getDocumentFileUrl(companyId, item.id)}
                target="_blank"
                rel="noreferrer"
                variant="outlined"
                sx={{ textTransform: "none", fontWeight: 700, alignSelf: "flex-start" }}
            >
                Открыть файл
            </Button>

            <TextField
                select
                label="Document status"
                value={status}
                onChange={(e) => setStatus(e.target.value as CompanyDocumentStatus)}
                fullWidth
            >
                <MenuItem value="PENDING">PENDING</MenuItem>
                <MenuItem value="APPROVED">APPROVED</MenuItem>
                <MenuItem value="REJECTED">REJECTED</MenuItem>
            </TextField>

            <TextField
                label="Review comment"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                multiline
                minRows={3}
                fullWidth
            />

            <Button
                onClick={handleSave}
                disabled={isSubmitting}
                variant="contained"
                sx={{ textTransform: "none", fontWeight: 700, alignSelf: "flex-start" }}
            >
                {isSubmitting ? "Сохранение..." : "Сохранить решение"}
            </Button>
        </Stack>
    );
}