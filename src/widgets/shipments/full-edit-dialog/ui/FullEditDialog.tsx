import {
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import type { InitialData, Kind } from "../model/types";
import { useFullEditDialog } from "../model/useFullEditDialog";
import { PointsSection } from "./PointsSection";

type Props = {
    open: boolean;
    kind: Kind;
    initial?: InitialData;
    onClose: () => void;
    onSubmit: (payload: any) => Promise<void> | void;
};

export default function FullEditDialog(props: Props) {
    const { open, onClose, kind } = props;

    const {
        form,
        fromPoints,
        toPoints,
        submitting,
        loadingFilters,
        isReady,
        numericInputProps,

        loadTypeOptions,
        cargoTypeOptions,
        bargainOptions,
        vehicleTypeOptions,
        currencyOptions,

        t,
        handleChange,
        handleMultiLoadTypeChange,
        toggleBool,
        updatePoint,
        addPoint,
        removePoint,
        submit,
    } = useFullEditDialog(props);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>
                {kind === "cargo"
                    ? t("shipments.editDialog.titleCargo")
                    : t("shipments.editDialog.titleTransport")}
            </DialogTitle>

            <DialogContent sx={{ pt: 1 }}>
                {loadingFilters && !isReady ? (
                    <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
                        <CircularProgress size={28} />
                    </Stack>
                ) : (
                    <Stack spacing={2} mt={0.5}>
                        <Grid container spacing={1.5}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label={t("shipments.editDialog.loadingDateFrom", {
                                        defaultValue: "Loading date (from)",
                                    })}
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    value={form.loadFrom}
                                    onChange={handleChange("loadFrom")}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label={t("shipments.editDialog.loadingDateTo", {
                                        defaultValue: "Loading date (to)",
                                    })}
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    value={form.loadTo}
                                    onChange={handleChange("loadTo")}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label={t("shipments.editDialog.unloadingDate", {
                                        defaultValue: "Unloading date",
                                    })}
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    value={form.unloadDate}
                                    onChange={handleChange("unloadDate")}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>{t("shipments.editDialog.vehicleType")}</InputLabel>
                                    <Select
                                        label={t("shipments.editDialog.vehicleType")}
                                        value={form.vehicleType}
                                        onChange={handleChange("vehicleType")}
                                    >
                                        {vehicleTypeOptions.map((opt) => (
                                            <MenuItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label={t("shipments.editDialog.vehiclesCount", {
                                        defaultValue: "Vehicles count",
                                    })}
                                    type="text"
                                    inputProps={numericInputProps}
                                    value={form.carsCount}
                                    onChange={handleChange("carsCount")}
                                    fullWidth
                                />
                            </Grid>

                            {kind === "cargo" && (
                                <>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormControl fullWidth>
                                            <InputLabel>{t("shipments.editDialog.loadType")}</InputLabel>
                                            <Select
                                                label={t("shipments.editDialog.loadType")}
                                                multiple
                                                value={form.loadType}
                                                onChange={handleMultiLoadTypeChange}
                                                renderValue={(selected) => {
                                                    const arr = Array.isArray(selected) ? selected : [selected];
                                                    if (!arr.length) {
                                                        return (
                                                            <em style={{ color: "#999" }}>
                                                                {t("shipments.editDialog.selectLoadType")}
                                                            </em>
                                                        );
                                                    }

                                                    const map = new Map(loadTypeOptions.map((x) => [x.value, x.label]));
                                                    return arr.map((v) => map.get(v) ?? v).join(", ");
                                                }}
                                            >
                                                {loadTypeOptions.map((opt) => (
                                                    <MenuItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormControl fullWidth>
                                            <InputLabel>{t("shipments.editDialog.cargoType")}</InputLabel>
                                            <Select
                                                label={t("shipments.editDialog.cargoType")}
                                                value={form.cargoType}
                                                onChange={handleChange("cargoType")}
                                            >
                                                {cargoTypeOptions.map((opt) => (
                                                    <MenuItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={!!form.allowPartialLoad}
                                                    onChange={toggleBool("allowPartialLoad")}
                                                />
                                            }
                                            label={t("shipments.editDialog.allowPartialLoad")}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            label={t("shipments.editDialog.palletsCount")}
                                            type="text"
                                            inputProps={numericInputProps}
                                            value={form.palletsCount}
                                            onChange={handleChange("palletsCount")}
                                            fullWidth
                                        />
                                    </Grid>
                                </>
                            )}

                            {kind === "transport" && (
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>{t("shipments.editDialog.bargain")}</InputLabel>
                                        <Select
                                            label={t("shipments.editDialog.bargain")}
                                            value={form.bargain}
                                            onChange={handleChange("bargain")}
                                        >
                                            {bargainOptions.map((opt) => (
                                                <MenuItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label={t("shipments.editDialog.weight")}
                                    type="text"
                                    inputProps={numericInputProps}
                                    value={form.weightT}
                                    onChange={handleChange("weightT")}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label={t("shipments.editDialog.volume")}
                                    type="text"
                                    inputProps={numericInputProps}
                                    value={form.volumeM3}
                                    onChange={handleChange("volumeM3")}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={!!form.hasDimensions}
                                            onChange={toggleBool("hasDimensions")}
                                        />
                                    }
                                    label={t("shipments.editDialog.specifyDimensions")}
                                />
                            </Grid>

                            {form.hasDimensions && (
                                <>
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <TextField
                                            label={t("shipments.editDialog.length")}
                                            type="text"
                                            inputProps={numericInputProps}
                                            value={form.lengthM}
                                            onChange={handleChange("lengthM")}
                                            fullWidth
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <TextField
                                            label={t("shipments.editDialog.width")}
                                            type="text"
                                            inputProps={numericInputProps}
                                            value={form.widthM}
                                            onChange={handleChange("widthM")}
                                            fullWidth
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <TextField
                                            label={t("shipments.editDialog.height")}
                                            type="text"
                                            inputProps={numericInputProps}
                                            value={form.heightM}
                                            onChange={handleChange("heightM")}
                                            fullWidth
                                        />
                                    </Grid>
                                </>
                            )}

                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>{t("shipments.editDialog.currency")}</InputLabel>
                                    <Select
                                        label={t("shipments.editDialog.currency")}
                                        value={form.priceCurrency}
                                        onChange={handleChange("priceCurrency")}
                                    >
                                        {currencyOptions.map((c) => (
                                            <MenuItem key={c.value} value={c.value}>
                                                {c.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label={t("shipments.editDialog.priceAmount")}
                                    type="text"
                                    inputProps={numericInputProps}
                                    value={form.priceAmount}
                                    onChange={handleChange("priceAmount")}
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Divider sx={{ my: 0.25 }} />
                            </Grid>

                            <PointsSection
                                side="from"
                                title={t("shipments.editDialog.from")}
                                points={fromPoints}
                                t={t}
                                onAdd={addPoint}
                                onUpdate={updatePoint}
                                onRemove={removePoint}
                            />

                            <PointsSection
                                side="to"
                                title={t("shipments.editDialog.to")}
                                points={toPoints}
                                t={t}
                                onAdd={addPoint}
                                onUpdate={updatePoint}
                                onRemove={removePoint}
                            />

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    label={t("shipments.editDialog.note")}
                                    value={form.note}
                                    onChange={handleChange("note")}
                                    fullWidth
                                    multiline
                                    minRows={2}
                                />
                            </Grid>
                        </Grid>
                    </Stack>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} variant="text">
                    {t("shipments.editDialog.cancel")}
                </Button>

                <Button onClick={submit} variant="contained" disabled={!isReady || submitting}>
                    {submitting ? (
                        <CircularProgress size={20} color="inherit" />
                    ) : (
                        t("shipments.editDialog.save")
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
}