
import {
    Drawer, Box, Stack, Typography, RadioGroup, FormControlLabel, Radio, Button, Divider
} from "@mui/material";

export type ShipmentsKind = "cargo" | "transport";

type Props = {
    open: boolean;
    value: ShipmentsKind;
    onChange: (v: ShipmentsKind) => void;
    onClose: () => void;
    onApply: () => void;
    onReset: () => void;
};

export default function ShipmentsFilterDrawer({
                                                  open, value, onChange, onClose, onApply, onReset
                                              }: Props) {
    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: 320, p: 2 }}>
                <Typography variant="h6" mb={1}>Filter</Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                    Select what to show in the list.
                </Typography>

                <Stack spacing={1.5}>
                    <Typography variant="subtitle2">Type</Typography>
                    <RadioGroup
                        value={value}
                        onChange={(e) => onChange(e.target.value as ShipmentsKind)}
                    >
                        <FormControlLabel value="cargo" control={<Radio />} label="Cargo" />
                        <FormControlLabel value="transport" control={<Radio />} label="Transport" />
                    </RadioGroup>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button variant="text" onClick={onReset}>Reset</Button>
                    <Button variant="contained" onClick={onApply}>Apply</Button>
                </Stack>
            </Box>
        </Drawer>
    );
}
