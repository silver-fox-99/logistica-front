import {
    Box,
    Button,
    Divider,
    IconButton,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { FiTrash2 } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import type { BlacklistItem } from "../model/types";

type Props = {
    items: BlacklistItem[];
    phone: string;
    busy: boolean;
    loading: boolean;
    onPhoneChange: (value: string) => void;
    onAdd: () => void;
    onRemove: (id: string) => void;
};

export function TenderBlacklistCard({
                                        items,
                                        phone,
                                        busy,
                                        loading,
                                        onPhoneChange,
                                        onAdd,
                                        onRemove,
                                    }: Props) {
    const { t } = useTranslation();

    return (
        <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
            <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                    <Box>
                        <Typography variant="h6" fontWeight={800}>
                            {t("tenders.settings.blacklist")}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            {t("tenders.settings.blacklistDescription")}
                        </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                        {t("tenders.settings.blacklistTotal", {
                            count: items.length,
                            defaultValue: `${items.length} blocked`,
                        })}
                    </Typography>
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <TextField
                        label={t("tenders.settings.phone")}
                        placeholder="+998..."
                        value={phone}
                        onChange={(event) => onPhoneChange(event.target.value)}
                        fullWidth
                    />

                    <Button
                        variant="outlined"
                        onClick={onAdd}
                        disabled={busy}
                        sx={{ minWidth: 180 }}
                    >
                        {t("tenders.common.add")}
                    </Button>
                </Stack>

                <Divider />

                {loading && (
                    <Typography variant="body2" color="text.secondary">
                        {t("tenders.common.loading")}
                    </Typography>
                )}

                {!loading && !items.length && (
                    <Typography variant="body2" color="text.secondary">
                        {t("tenders.settings.blacklistEmpty", "Blacklist is empty")}
                    </Typography>
                )}

                {!loading &&
                    items.map((item) => (
                        <Paper key={item.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                                <Box>
                                    <Typography fontWeight={700}>{item.phone}</Typography>

                                    {item.reason && (
                                        <Typography variant="caption" color="text.secondary">
                                            {item.reason}
                                        </Typography>
                                    )}
                                </Box>

                                <IconButton color="error" onClick={() => onRemove(item.id)} disabled={busy}>
                                    <FiTrash2 />
                                </IconButton>
                            </Stack>
                        </Paper>
                    ))}
            </Stack>
        </Paper>
    );
}