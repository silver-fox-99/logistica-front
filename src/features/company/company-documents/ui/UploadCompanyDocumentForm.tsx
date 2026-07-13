import {
    Alert,
    Button,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { FiTrash2, FiUpload } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useCompanyDocuments } from "../model/useCompanyDocuments";

type Props = {
    companyId: string;
};

export function UploadCompanyDocumentForm({ companyId }: Props) {
    const { t } = useTranslation();

    const {
        items,
        values,
        isLoading,
        isUploading,
        isDeletingId,
        error,
        uploadError,
        setField,
        setFile,
        upload,
        remove,
    } = useCompanyDocuments(companyId);

    const getDocumentStatusLabel = (status?: string | null) => {
        if (!status) return "";
        return t(`companyDocuments.statuses.${status}`, {
            defaultValue: status,
        });
    };

    return (
        <Stack spacing={2}>
            <Paper variant="outlined" sx={{ borderRadius: "16px", borderColor: "divider", p: { xs: 2.5, md: 3 } }}>
                <Stack spacing={2}>
                    <Stack spacing={0.5}>
                        <Typography variant="h5" fontWeight={700}>
                            {t("companyDocuments.form.title")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t("companyDocuments.form.description")}
                        </Typography>
                    </Stack>

                    {error ? <Alert severity="error" sx={{ borderRadius: "8px" }}>{error}</Alert> : null}
                    {uploadError ? <Alert severity="error" sx={{ borderRadius: "8px" }}>{uploadError}</Alert> : null}

                    <TextField
                        select
                        label={t("companyDocuments.form.documentType")}
                        value={values.type}
                        onChange={(e) => setField("type", e.target.value)}
                        fullWidth
                    >
                        <MenuItem value="REGISTRATION_CERTIFICATE">
                            {t("companyDocuments.types.REGISTRATION_CERTIFICATE")}
                        </MenuItem>
                        <MenuItem value="TAX_CERTIFICATE">
                            {t("companyDocuments.types.TAX_CERTIFICATE")}
                        </MenuItem>
                        <MenuItem value="LICENSE">
                            {t("companyDocuments.types.LICENSE")}
                        </MenuItem>
                        <MenuItem value="INSURANCE">
                            {t("companyDocuments.types.INSURANCE")}
                        </MenuItem>
                        <MenuItem value="IDENTITY_DOCUMENT">
                            {t("companyDocuments.types.IDENTITY_DOCUMENT")}
                        </MenuItem>
                        <MenuItem value="OTHER">
                            {t("companyDocuments.types.OTHER")}
                        </MenuItem>
                    </TextField>

                    <TextField
                        label={t("companyDocuments.form.documentTitle")}
                        value={values.title}
                        onChange={(e) => setField("title", e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label={t("companyDocuments.form.documentDescription")}
                        value={values.description}
                        onChange={(e) => setField("description", e.target.value)}
                        fullWidth
                        multiline
                        minRows={3}
                    />

                    <Button
                        component="label"
                        variant="outlined"
                        sx={{
                            height: 44,
                            borderRadius: "8px",
                            textTransform: "none",
                            fontWeight: 700,
                            alignSelf: "flex-start",
                        }}
                    >
                        {t("companyDocuments.form.selectFile")}
                        <input
                            hidden
                            type="file"
                            accept=".pdf,image/*"
                            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        />
                    </Button>

                    {values.file ? (
                        <Typography variant="body2" color="text.secondary">
                            {t("companyDocuments.form.selectedFile", {
                                name: values.file.name,
                            })}
                        </Typography>
                    ) : null}

                    <Button
                        onClick={upload}
                        disabled={isUploading}
                        variant="contained"
                        sx={{
                            height: 48,
                            borderRadius: "8px",
                            textTransform: "none",
                            fontWeight: 700,
                            gap: 1,
                            alignSelf: "flex-start",
                            px: 2.5,
                        }}
                    >
                        <FiUpload size={18} />
                        {isUploading
                            ? t("companyDocuments.form.uploading")
                            : t("companyDocuments.form.uploadDocument")}
                    </Button>
                </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ borderRadius: "16px", borderColor: "divider", p: { xs: 2.5, md: 3 } }}>
                <Stack spacing={2}>
                    <Typography variant="h6" fontWeight={700}>
                        {t("companyDocuments.list.title")}
                    </Typography>

                    {isLoading ? (
                        <Typography variant="body2" color="text.secondary">
                            {t("companyDocuments.list.loading")}
                        </Typography>
                    ) : items.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                            {t("companyDocuments.list.empty")}
                        </Typography>
                    ) : (
                        items.map((item) => (
                            <Stack
                                key={item.id}
                                direction={{ xs: "column", md: "row" }}
                                justifyContent="space-between"
                                alignItems={{ xs: "flex-start", md: "center" }}
                                spacing={2}
                                sx={{
                                    p: 1.5,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    borderRadius: "12px",
                                }}
                            >
                                <Stack spacing={0.5}>
                                    <Typography variant="subtitle1" fontWeight={700}>
                                        {item.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {item.original_name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {t("companyDocuments.list.status", {
                                            value: getDocumentStatusLabel(item.status),
                                        })}
                                    </Typography>
                                    {item.review_comment ? (
                                        <Typography variant="body2" color="text.secondary">
                                            {t("companyDocuments.list.comment", {
                                                value: item.review_comment,
                                            })}
                                        </Typography>
                                    ) : null}
                                </Stack>

                                <Button
                                    color="error"
                                    variant="outlined"
                                    disabled={isDeletingId === item.id}
                                    onClick={() => remove(item.id)}
                                    sx={{
                                        textTransform: "none",
                                        borderRadius: "8px",
                                        fontWeight: 700,
                                        gap: 1,
                                    }}
                                >
                                    <FiTrash2 size={16} />
                                    {isDeletingId === item.id
                                        ? t("companyDocuments.list.deleting")
                                        : t("companyDocuments.list.delete")}
                                </Button>
                            </Stack>
                        ))
                    )}
                </Stack>
            </Paper>
        </Stack>
    );
}