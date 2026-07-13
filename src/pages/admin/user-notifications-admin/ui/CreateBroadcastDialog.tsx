import React, { useState } from "react";
import {
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  AlertTitle,
  Box,
  Chip,
} from "@mui/material";
import { FiSend, FiLink, FiTag, FiXCircle } from "react-icons/fi";
import type { CreateBroadcastDto } from "@/shared/api/userNotificationsAdminApi.ts";

interface CreateBroadcastDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBroadcastDto) => Promise<void>;
  loading: boolean;
}

export default function CreateBroadcastDialog({
  open,
  onClose,
  onSubmit,
  loading,
}: CreateBroadcastDialogProps) {
  const [type, setType] = useState("SYSTEM_UPDATE");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [rawMetadata, setRawMetadata] = useState("");

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      return;
    }
    if (!message.trim()) {
      return;
    }

    let parsedMetadata = {};
    if (rawMetadata.trim()) {
      try {
        parsedMetadata = JSON.parse(rawMetadata);
      } catch (err) {
        return;
      }
    }

    await onSubmit({
      type,
      title: title.trim(),
      message: message.trim(),
      metadata: parsedMetadata,
    });

    // Reset form upon successful submit (handled by parent calling onClose)
    setTitle("");
    setMessage("");
    setRawMetadata("");
    setType("SYSTEM_UPDATE");
  };

  const isMetadataInvalid = () => {
    if (!rawMetadata.trim()) return false;
    try {
      JSON.parse(rawMetadata);
      return false;
    } catch (e) {
      return true;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <form onSubmit={(e) => void handleFormSubmit(e)}>
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
          Создание новой глобальной рассылки
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ py: 1 }}>
            {/* Тип уведомления */}
            <FormControl fullWidth size="small">
              <InputLabel id="broadcast-type-label">Тип уведомления</InputLabel>
              <Select
                labelId="broadcast-type-label"
                value={type}
                label="Тип уведомления"
                onChange={(e) => setType(e.target.value)}
              >
                <MenuItem value="SYSTEM_UPDATE">
                  Обновление системы / Объявление
                </MenuItem>
                <MenuItem value="PROMOTION">Акция / Скидка</MenuItem>
                <MenuItem value="NEWS">Новость платформы</MenuItem>
              </Select>
            </FormControl>

            {/* Заголовок */}
            <TextField
              label="Заголовок уведомления"
              placeholder="Например: Скидка 20% на все тарифы!"
              size="small"
              fullWidth
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            {/* Сообщение */}
            <TextField
              label="Текст сообщения"
              placeholder="Введите полный текст уведомления..."
              multiline
              rows={4}
              fullWidth
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            {/* Метаданные JSON */}
            <TextField
              label="Метаданные (JSON)"
              placeholder='{"link": "/tariffs", "badge": "SALE"}'
              multiline
              rows={3}
              fullWidth
              value={rawMetadata}
              onChange={(e) => setRawMetadata(e.target.value)}
              helperText="Добавьте полезную нагрузку, например ссылки для перехода по клику на уведомление"
              error={isMetadataInvalid()}
            />

            {/* Подсказки по метаданным */}
            <Alert
              severity="info"
              sx={{ borderRadius: 2, "& .MuiAlert-message": { width: "100%" } }}
            >
              <AlertTitle
                sx={{ fontWeight: 600, fontSize: "0.875rem", mb: 0.5 }}
              >
                Что такое метаданные?
              </AlertTitle>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ lineHeight: 1.4 }}
              >
                Они позволяют добавлять интерактивные кнопки или яркие плашки к
                уведомлению:
                <br />• <strong>"link"</strong> — создаст кнопку перехода в
                нужный раздел (например, в оплату или тендеры).
                <br />• <strong>"badge"</strong> — отобразит цветной текстовый
                ярлык (например, "АКЦИЯ" или "ВАЖНО") рядом с заголовком.
              </Typography>
            </Alert>

            {/* Заготовки (Пресеты) */}
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 1, fontWeight: 600 }}
              >
                Готовые шаблоны метаданных (кликните для выбора):
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
                sx={{ gap: 1 }}
              >
                <Chip
                  icon={<FiLink size={12} />}
                  label="Кнопка 'Тарифы и оплата'"
                  size="small"
                  clickable
                  variant="outlined"
                  onClick={() =>
                    setRawMetadata(
                      JSON.stringify({ link: "/dashboard/payments" }, null, 4),
                    )
                  }
                  sx={{ borderRadius: 1.5 }}
                />
                <Chip
                  icon={<FiLink size={12} />}
                  label="Кнопка 'Мои тендеры'"
                  size="small"
                  clickable
                  variant="outlined"
                  onClick={() =>
                    setRawMetadata(
                      JSON.stringify({ link: "/dashboard/tenders" }, null, 4),
                    )
                  }
                  sx={{ borderRadius: 1.5 }}
                />
                <Chip
                  icon={<FiTag size={12} />}
                  label="Ярлык 'АКЦИЯ'"
                  size="small"
                  clickable
                  variant="outlined"
                  onClick={() =>
                    setRawMetadata(JSON.stringify({ badge: "АКЦИЯ" }, null, 4))
                  }
                  sx={{ borderRadius: 1.5 }}
                />
                <Chip
                  icon={<FiTag size={12} />}
                  label="Ярлык 'ВАЖНО'"
                  size="small"
                  clickable
                  variant="outlined"
                  onClick={() =>
                    setRawMetadata(JSON.stringify({ badge: "ВАЖНО" }, null, 4))
                  }
                  sx={{ borderRadius: 1.5 }}
                />
                <Chip
                  icon={<FiXCircle size={12} />}
                  label="Очистить метаданные"
                  size="small"
                  clickable
                  color="error"
                  variant="outlined"
                  onClick={() => setRawMetadata("")}
                  sx={{ borderRadius: 1.5 }}
                />
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={onClose}
            color="inherit"
            disabled={loading}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || isMetadataInvalid()}
            startIcon={loading ? <CircularProgress size={16} /> : <FiSend />}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Запустить рассылку
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
