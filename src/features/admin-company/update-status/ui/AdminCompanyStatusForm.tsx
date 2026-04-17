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
import type { Company } from "@/entities/company/model/types";
import { useAdminUpdateCompanyStatus } from "../model/useAdminUpdateCompanyStatus";

type Props = {
    company: Company | null;
    onUpdated?: (company: Company) => void;
};

export function AdminCompanyStatusForm({ company, onUpdated }: Props) {
    const {
        status,
        setStatus,
        verificationComment,
        setVerificationComment,
        submit,
        isSubmitting,
        error,
        success,
    } = useAdminUpdateCompanyStatus(company, onUpdated);

    return (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
                <Stack spacing={2}>
                    <Typography variant="h6" fontWeight={700}>
                        Статус компании
                    </Typography>

                    {error ? <Alert severity="error">{error}</Alert> : null}
                    {success ? <Alert severity="success">{success}</Alert> : null}

                    <TextField
                        select
                        label="Status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        fullWidth
                    >
                        <MenuItem value="UNVERIFIED">UNVERIFIED</MenuItem>
                        <MenuItem value="PENDING_REVIEW">PENDING_REVIEW</MenuItem>
                        <MenuItem value="VERIFIED">VERIFIED</MenuItem>
                        <MenuItem value="REJECTED">REJECTED</MenuItem>
                        <MenuItem value="BLOCKED">BLOCKED</MenuItem>
                    </TextField>

                    <TextField
                        label="Verification comment"
                        value={verificationComment}
                        onChange={(e) => setVerificationComment(e.target.value)}
                        multiline
                        minRows={3}
                        fullWidth
                    />

                    <Button
                        variant="contained"
                        onClick={submit}
                        disabled={isSubmitting}
                        sx={{ textTransform: "none", fontWeight: 700, alignSelf: "flex-start" }}
                    >
                        {isSubmitting ? "Сохранение..." : "Обновить статус"}
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}