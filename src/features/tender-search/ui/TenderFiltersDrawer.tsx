import {
  Box,
  Button,
  Checkbox,
  Divider,
  Drawer,
  FormControlLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { TenderAuctionType } from "@/entities/tender/model/types";
import { RHFLookupAutocomplete } from "@/shared/ui/lookup/RHFLookupAutocomplete";
import type { LookupOpt } from "@/shared/utils/lookupUtils";
import type { TenderFiltersValue } from "../model/types";
import { TenderLocationFilterField } from "@/features/tender-search/ui/TenderLocationFilterField.tsx";

type Props = {
  open: boolean;
  value: TenderFiltersValue;
  cargoOpts: LookupOpt[];
  vehicleOpts: LookupOpt[];
  loadingTypeOpts: LookupOpt[];
  getLocalizedLabel: (option: LookupOpt) => string;
  onClose: () => void;
  onApply: (value: TenderFiltersValue) => void;
  onReset: () => void;
};

export function TenderFiltersDrawer({
  open,
  value,
  cargoOpts,
  vehicleOpts,
  loadingTypeOpts,
  getLocalizedLabel,
  onClose,
  onApply,
  onReset,
}: Props) {
  const { t } = useTranslation();

  const form = useForm<TenderFiltersValue>({
    values: value,
  });

  const { control, register, handleSubmit, reset } = form;

  const cleanFilters = (data: TenderFiltersValue): TenderFiltersValue => {
    return Object.fromEntries(
      Object.entries(data).filter(
        ([, value]) => value !== "" && value !== undefined && value !== null,
      ),
    ) as TenderFiltersValue;
  };

  const handleReset = () => {
    reset({} as TenderFiltersValue);
    onReset();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: 320, sm: 430 }, p: 2 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {t("tenders.filters.title", "Filters")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("tenders.filters.subtitle", "Refine tender search results")}
            </Typography>
          </Box>

          <Divider />

          <Typography variant="subtitle2">
            {t("tenders.filters.route", "Route")}
          </Typography>

          <TenderLocationFilterField
            control={control}
            name="pickup_location"
            label={t("tenders.filters.pickupLocation", "Pickup location")}
          />

          <TenderLocationFilterField
            control={control}
            name="dropoff_location"
            label={t("tenders.filters.dropoffLocation", "Dropoff location")}
          />

          <Divider />

          <Typography variant="subtitle2">
            {t("tenders.filters.dates", "Dates")}
          </Typography>

          <Stack direction="row" spacing={1}>
            <TextField
              label={t("tenders.filters.pickupFrom", "Pickup from")}
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
              {...register("pickup_date_from")}
            />

            <TextField
              label={t("tenders.filters.pickupTo", "Pickup to")}
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
              {...register("pickup_date_to")}
            />
          </Stack>

          <Stack direction="row" spacing={1}>
            <TextField
              label={t("tenders.filters.dropoffFrom", "Dropoff from")}
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
              {...register("dropoff_date_from")}
            />

            <TextField
              label={t("tenders.filters.dropoffTo", "Dropoff to")}
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
              {...register("dropoff_date_to")}
            />
          </Stack>

          <Divider />

          <Typography variant="subtitle2">
            {t("tenders.filters.params", "Tender parameters")}
          </Typography>

          <Controller
            control={control}
            name="auction_type"
            render={({ field }) => (
              <Select
                size="small"
                displayEmpty
                value={field.value ?? ""}
                onChange={(event) =>
                  field.onChange(event.target.value || undefined)
                }
                fullWidth
              >
                <MenuItem value="">
                  {t("tenders.list.allAuctionTypes", "All auction types")}
                </MenuItem>
                <MenuItem value={TenderAuctionType.DECREASING}>
                  {t("tenders.list.decreasing", "Decreasing")}
                </MenuItem>
                <MenuItem value={TenderAuctionType.INCREASING}>
                  {t("tenders.list.increasing", "Increasing")}
                </MenuItem>
              </Select>
            )}
          />

          <RHFLookupAutocomplete<TenderFiltersValue>
            control={control}
            name="cargo_type"
            label={t("tenders.fields.cargoType", "Cargo type")}
            placeholder={t(
              "tenders.create.selectCargoType",
              "Select cargo type",
            )}
            options={cargoOpts}
            getOptionLabel={getLocalizedLabel}
          />

          <RHFLookupAutocomplete<TenderFiltersValue>
            control={control}
            name="vehicle_type"
            label={t("tenders.fields.vehicleType", "Vehicle type")}
            placeholder={t(
              "tenders.create.selectVehicleType",
              "Select vehicle type",
            )}
            options={vehicleOpts}
            getOptionLabel={getLocalizedLabel}
          />

          <RHFLookupAutocomplete<TenderFiltersValue>
            control={control}
            name="loading_type"
            label={t("tenders.fields.loadingType", "Loading type")}
            placeholder={t(
              "tenders.create.selectLoadingType",
              "Select loading type",
            )}
            options={loadingTypeOpts}
            getOptionLabel={getLocalizedLabel}
          />

          <Divider />

          <Stack direction="row" spacing={1}>
            <TextField
              label={t("tenders.filters.weightFrom", "Weight from")}
              fullWidth
              {...register("weight_t_from")}
            />
            <TextField
              label={t("tenders.filters.weightTo", "Weight to")}
              fullWidth
              {...register("weight_t_to")}
            />
          </Stack>

          <Stack direction="row" spacing={1}>
            <TextField
              label={t("tenders.filters.volumeFrom", "Volume from")}
              fullWidth
              {...register("volume_m3_from")}
            />
            <TextField
              label={t("tenders.filters.volumeTo", "Volume to")}
              fullWidth
              {...register("volume_m3_to")}
            />
          </Stack>

          <Controller
            control={control}
            name="adr_required"
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!field.value}
                    onChange={(event) =>
                      field.onChange(event.target.checked || undefined)
                    }
                  />
                }
                label={t("tenders.create.adr", "ADR required")}
              />
            )}
          />

          <Controller
            control={control}
            name="hydraulic_tail_lift_required"
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!field.value}
                    onChange={(event) =>
                      field.onChange(event.target.checked || undefined)
                    }
                  />
                }
                label={t(
                  "tenders.create.hydraulicTailLiftRequired",
                  "Hydraulic tail lift required",
                )}
              />
            )}
          />

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="text" onClick={handleReset}>
              {t("tenders.common.reset", "Reset")}
            </Button>

            <Button
              variant="contained"
              onClick={handleSubmit((data) => {
                onApply(cleanFilters(data));
                onClose();
              })}
            >
              {t("tenders.common.apply", "Apply")}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Drawer>
  );
}
