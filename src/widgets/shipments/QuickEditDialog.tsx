import { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Stack, TextField, Button
} from "@mui/material";

type Props = {
    open: boolean;
    kind: "cargo" | "transport";
    initial?: {
        dateFrom?: string | null;
        dateTo?: string | null;
        priceAmount?: number | null;
        contactExtraPhone?: string | null;
        note?: string | null;
    };
    onClose: () => void;
    onSubmit: (payload: {
        date_from: string | null;
        date_to: string | null;
        price_amount: number | null;
        contact_extra_phone: string | null;
        note: string | null;
    }) => Promise<void> | void;
};

export default function QuickEditDialog({ open, kind, initial, onClose, onSubmit }: Props) {
    const [dateFrom, setDateFrom] = useState<string>("");
    const [dateTo, setDateTo] = useState<string>("");
    const [price, setPrice] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [note, setNote] = useState<string>("");

    useEffect(() => {
        setDateFrom(initial?.dateFrom ?? "");
        setDateTo(initial?.dateTo ?? "");
        setPrice(
            initial?.priceAmount == null || Number.isNaN(initial?.priceAmount)
                ? ""
                : String(initial?.priceAmount)
        );
        setPhone(initial?.contactExtraPhone ?? "");
        setNote(initial?.note ?? "");
    }, [open, initial]);

    const submit = async () => {
        await onSubmit({
            date_from: dateFrom || null,
            date_to: dateTo || null,
            price_amount: price === "" ? null : Number(price),
            contact_extra_phone: phone || null,
            note: note || null,
        });
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{kind === "cargo" ? "Edit cargo" : "Edit transport"}</DialogTitle>
            <DialogContent>
                <Stack spacing={1.5} mt={0.5}>
                    <TextField
                        label="Loading date from"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={dateFrom ?? ""}
                        onChange={(e) => setDateFrom(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Loading date to"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={dateTo ?? ""}
                        onChange={(e) => setDateTo(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Price amount"
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Additional phone"
                        placeholder="+XXXXXXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        fullWidth
                        helperText="Optional. + and 10–20 digits."
                    />
                    <TextField
                        label="Note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        fullWidth
                        multiline
                        minRows={2}
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="text">Cancel</Button>
                <Button onClick={submit} variant="contained">Save</Button>
            </DialogActions>
        </Dialog>
    );
}
