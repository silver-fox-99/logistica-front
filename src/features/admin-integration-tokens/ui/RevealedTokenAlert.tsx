import React from "react";
import { Alert, Button, Typography } from "@mui/material";
import { FiCopy } from "react-icons/fi";

type Props = {
    token: string | null;
    onCopy: () => void;
};

export const RevealedTokenAlert = React.memo(function RevealedTokenAlert({
                                                                             token,
                                                                             onCopy,
                                                                         }: Props) {
    if (!token) {
        return null;
    }

    return (
        <Alert
            severity="warning"
            sx={{ mb: 2 }}
            action={
                <Button
                    color="inherit"
                    size="small"
                    startIcon={<FiCopy />}
                    onClick={onCopy}
                    sx={{ textTransform: "none" }}
                >
                    Copy
                </Button>
            }
        >
            <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
                Save this token now.
            </Typography>
            <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                {token}
            </Typography>
        </Alert>
    );
});