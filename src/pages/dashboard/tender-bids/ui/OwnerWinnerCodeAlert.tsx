import { Alert, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

type Props = {
    code: string;
};

export function OwnerWinnerCodeAlert({ code }: Props) {
    const { t } = useTranslation();

    return (
        <Alert severity="success" sx={{ borderRadius: 2 }}>
            <Typography fontWeight={800}>
                {t("tenders.bids.winnerCodeTitle")}: {code}
            </Typography>

            <Typography variant="body2">
                {t("tenders.bids.winnerCodeDescription")}
            </Typography>
        </Alert>
    );
}