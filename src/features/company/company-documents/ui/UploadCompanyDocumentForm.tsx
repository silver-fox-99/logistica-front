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
import { FiTrash2, FiUpload } from "react-icons/fi";
import { useCompanyDocuments } from "../model/useCompanyDocuments";

type Props = {
    companyId: string;
};

export function UploadCompanyDocumentForm({ companyId }: Props) {
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

    return (
        <Stack spacing={2}>
            <Card variant="outlined" sx={{ borderRadius: 4 }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                    <Stack spacing={2}>
                        <Stack spacing={0.5}>
                            <Typography variant="h5" fontWeight={700}>
                                Company documents
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Upload documents for company verification.
                            </Typography>
                        </Stack>

                        {error ? <Alert severity="error">{error}</Alert> : null}
                        {uploadError ? <Alert severity="error">{uploadError}</Alert> : null}

                        <TextField
                            select
                            label="Document type"
                            value={values.type}
                            onChange={(e) => setField("type", e.target.value)}
                            fullWidth
                        >
                            <MenuItem value="REGISTRATION_CERTIFICATE">Registration certificate</MenuItem>
                            <MenuItem value="TAX_CERTIFICATE">Tax certificate</MenuItem>
                            <MenuItem value="LICENSE">License</MenuItem>
                            <MenuItem value="INSURANCE">Insurance</MenuItem>
                            <MenuItem value="IDENTITY_DOCUMENT">Identity document</MenuItem>
                            <MenuItem value="OTHER">Other</MenuItem>
                        </TextField>

                        <TextField
                            label="Document title"
                            value={values.title}
                            onChange={(e) => setField("title", e.target.value)}
                            fullWidth
                        />

                        <TextField
                            label="Description"
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
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 700,
                                alignSelf: "flex-start",
                            }}
                        >
                            Select file
                            <input
                                hidden
                                type="file"
                                accept=".pdf,image/*"
                                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                            />
                        </Button>

                        {values.file ? (
                            <Typography variant="body2" color="text.secondary">
                                Selected file: {values.file.name}
                            </Typography>
                        ) : null}

                        <Button
                            onClick={upload}
                            disabled={isUploading}
                            variant="contained"
                            sx={{
                                height: 48,
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 700,
                                gap: 1,
                                alignSelf: "flex-start",
                                px: 2.5,
                            }}
                        >
                            <FiUpload size={18} />
                            {isUploading ? "Uploading..." : "Upload document"}
                        </Button>
                    </Stack>
                </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderRadius: 4 }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                    <Stack spacing={2}>
                        <Typography variant="h6" fontWeight={700}>
                            Uploaded documents
                        </Typography>

                        {isLoading ? (
                            <Typography variant="body2" color="text.secondary">
                                Loading...
                            </Typography>
                        ) : items.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                No documents uploaded yet.
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
                                        borderRadius: 2,
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
                                            Status: {item.status}
                                        </Typography>
                                        {item.review_comment ? (
                                            <Typography variant="body2" color="text.secondary">
                                                Comment: {item.review_comment}
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
                                            borderRadius: 2,
                                            fontWeight: 700,
                                            gap: 1,
                                        }}
                                    >
                                        <FiTrash2 size={16} />
                                        {isDeletingId === item.id ? "Deleting..." : "Delete"}
                                    </Button>
                                </Stack>
                            ))
                        )}
                    </Stack>
                </CardContent>
            </Card>
        </Stack>
    );
}