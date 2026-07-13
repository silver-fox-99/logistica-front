import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
  Autocomplete,
  Box,
  Typography,
} from "@mui/material";
import type {
  GeoLocation,
  LocationType,
  CreateLocationDto,
  UpdateLocationDto,
} from "@/shared/api/adminGeoApi";
import { useLocalizedGeo } from "@/shared/utils/lookupUtils";
import { GEO_TYPE_RU } from "./GeoTreeFlow";

const TYPES: LocationType[] = [
  "COUNTRY",
  "REGION",
  "CITY",
  "DISTRICT",
  "OTHER",
];

type Props = {
  open: boolean;
  mode: "create" | "edit";
  title: string;
  all: GeoLocation[];
  initial?: Partial<GeoLocation>;
  onClose: () => void;
  onSubmit: (
    dto: CreateLocationDto | UpdateLocationDto,
  ) => Promise<void> | void;
  submitting?: boolean;
};

export default function GeoLocationDialog({
  open,
  mode,
  title,
  all,
  initial,
  onClose,
  onSubmit,
  submitting,
}: Props) {
  const { getLocalizedGeoName } = useLocalizedGeo();
  const [type, setType] = useState<LocationType>("CITY");
  const [name, setName] = useState("");
  const [nameRu, setNameRu] = useState<string>("");
  const [nameUz, setNameUz] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [iso2, setIso2] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [parent, setParent] = useState<GeoLocation | null>(null);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [order, setOrder] = useState<number | "">(0);

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    setType((initial?.type as LocationType) ?? "CITY");
    setName(initial?.name ?? "");
    setNameRu(initial?.name_ru ?? "");
    setNameUz(initial?.name_uz ?? "");
    setCode((initial?.code as string) ?? "");
    setIso2((initial?.iso2 as string) ?? "");
    setSlug((initial?.slug as string) ?? "");
    setIsActive((initial?.is_active as boolean) ?? true);
    setOrder(initial?.order ?? "");
    const p = initial?.parent_id
      ? (all.find((i) => i.id === initial!.parent_id) ?? null)
      : null;
    setParent(p);
    setErrors({});
  }, [initial, open, all]);

  // запрещаем выбирать самого себя и своих потомков
  const unavailableIds = useMemo(() => {
    if (!initial?.id) return new Set<string>();
    const set = new Set<string>([initial.id]);
    const walk = (id: string) => {
      all
        .filter((i) => i.parent_id === id)
        .forEach((ch) => {
          set.add(ch.id);
          walk(ch.id);
        });
    };
    walk(initial.id);
    return set;
  }, [all, initial?.id]);

  const parentOptions = useMemo(() => {
    let opts = all.filter((i) => !unavailableIds.has(i.id));
    if (type === "COUNTRY") {
      opts = []; // без родителя
    }
    if (type === "REGION") {
      opts = opts.filter((i) => i.type === "COUNTRY" || i.parent_id === null);
    }
    return opts;
  }, [all, unavailableIds, type]);

  const validate = () => {
    const e: Record<string, string | undefined> = {};
    if (!name.trim())
      e.name = "Название (английский / базовое) обязательно для заполнения";
    if (!type) e.type = "Тип обязателен для заполнения";
    if (type === "COUNTRY" && iso2 && !/^[A-Za-z]{2}$/.test(iso2))
      e.iso2 = "ISO2 код должен состоять из 2 латинских букв";
    if (type === "COUNTRY" && parent)
      e.type = "Страна не может иметь родительский элемент";
    if (code && code.length > 32) e.code = "Максимальная длина — 32 символа";
    if (slug && slug.length > 200) e.slug = "Максимальная длина — 200 символов";
    setErrors(e);
    return Object.values(e).every((v) => !v);
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (mode === "create") {
      const dto: CreateLocationDto = {
        type,
        name: name.trim(),
        name_ru: nameRu.trim() || null,
        name_uz: nameUz.trim() || null,
        parent_id: parent?.id || undefined,
        code: code || undefined,
        iso2: iso2 || undefined,
        slug: slug || undefined,
        order:
          order === ""
            ? undefined
            : typeof order === "number"
              ? order
              : undefined,
      };
      await onSubmit(dto);
    } else {
      const dto: UpdateLocationDto = {
        type,
        name: name.trim(),
        name_ru: nameRu.trim() || null,
        name_uz: nameUz.trim() || null,
        parent_id: parent ? parent.id : null,
        code: code || null,
        iso2: iso2 || null,
        slug: slug || null,
        is_active: isActive,
        order:
          order === ""
            ? undefined
            : typeof order === "number"
              ? order
              : undefined,
      };
      await onSubmit(dto);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 600, fontSize: 20 }}>{title}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <FormControl size="small" error={!!errors.type} fullWidth>
            <InputLabel>Тип локации</InputLabel>
            <Select
              label="Тип локации"
              value={type}
              onChange={(e) => setType(e.target.value as LocationType)}
            >
              {TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {GEO_TYPE_RU[t] || t}
                </MenuItem>
              ))}
            </Select>
            {!!errors.type && <FormHelperText>{errors.type}</FormHelperText>}
          </FormControl>

          <Box
            sx={{
              p: 2,
              border: "1px solid #e2e8f0",
              borderRadius: 2,
              bgcolor: "#f8fafc",
            }}
          >
            <Typography
              variant="caption"
              fontWeight={600}
              color="text.secondary"
              sx={{
                display: "block",
                mb: 1.5,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Названия на разных языках
            </Typography>
            <Stack spacing={2}>
              <TextField
                size="small"
                label="Название (английский / базовое)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                required
                fullWidth
              />

              <TextField
                size="small"
                label="Название (русский)"
                value={nameRu}
                onChange={(e) => setNameRu(e.target.value)}
                fullWidth
              />

              <TextField
                size="small"
                label="Название (узбекский)"
                value={nameUz}
                onChange={(e) => setNameUz(e.target.value)}
                fullWidth
              />
            </Stack>
          </Box>

          <Autocomplete
            options={parentOptions}
            getOptionLabel={(o) =>
              `${getLocalizedGeoName(o)} (${GEO_TYPE_RU[o.type] || o.type})`
            }
            value={parent}
            onChange={(_, v) => setParent(v)}
            renderInput={(p) => (
              <TextField
                {...p}
                size="small"
                label="Родительская локация (опционально)"
              />
            )}
            disabled={type === "COUNTRY"}
            fullWidth
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              size="small"
              label="Код (опционально)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              error={!!errors.code}
              helperText={errors.code}
              fullWidth
            />

            {type === "COUNTRY" && (
              <TextField
                size="small"
                label="ISO2 код страны"
                value={iso2}
                onChange={(e) => setIso2(e.target.value)}
                error={!!errors.iso2}
                helperText={errors.iso2}
                placeholder="UZ, RU, KZ, US..."
                fullWidth
              />
            )}

            <TextField
              size="small"
              label="Слаг (опционально)"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              error={!!errors.slug}
              helperText={errors.slug}
              fullWidth
            />
          </Stack>

          {mode === "edit" && (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                size="small"
                label="Порядок сортировки"
                type="text"
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                value={order}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setOrder(val === "" ? "" : parseInt(val, 10));
                }}
                helperText="Меньшее значение = выше в списке (например, 0 для Узбекистана)"
                fullWidth
              />
              <FormControl size="small" fullWidth>
                <InputLabel shrink>Статус активности</InputLabel>
                <Select
                  notched
                  value={String(isActive)}
                  onChange={(e) => setIsActive(e.target.value === "true")}
                  label="Статус активности"
                >
                  <MenuItem value="true">Активен</MenuItem>
                  <MenuItem value="false">Неактивен (скрыт)</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Отмена
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={submitting}>
          {submitting ? "Сохранение…" : "Сохранить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
