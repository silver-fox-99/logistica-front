import React, { useState, useRef, useMemo, useEffect } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography,
    Box,
    Checkbox,
    FormControlLabel,
    FormGroup,
    Tooltip,
    IconButton,
    Divider,
    Alert,
    CircularProgress,
} from "@mui/material";
import {
    FaBold,
    FaItalic,
    FaUnderline,
    FaStrikethrough,
    FaCode,
    FaLink,
    FaTelegramPlane,
    FaEye,
    FaEyeSlash,
} from "react-icons/fa";

import type { TelegramNotificationConfig } from "@/entities/telegram-notification/model/types";

type Props = {
    open: boolean;
    configs: TelegramNotificationConfig[];
    submitting?: boolean;
    onClose: () => void;
    onSubmit: (payload: { bot_ids: string[]; html_text: string }) => Promise<boolean> | boolean;
};

// Safe helper to wrap selection in the textarea
const wrapTextWithTag = (
    textarea: HTMLTextAreaElement | null,
    startTag: string,
    endTag: string,
    textValue: string,
    onChangeText: (val: string) => void
) => {
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textValue.substring(start, end);
    const beforeText = textValue.substring(0, start);
    const afterText = textValue.substring(end);

    const replacement = `${startTag}${selectedText || ""}${endTag}`;
    const newText = beforeText + replacement + afterText;

    onChangeText(newText);

    // Maintain focus and set selection range
    setTimeout(() => {
        textarea.focus();
        const newStart = start + startTag.length;
        const newEnd = newStart + (selectedText ? selectedText.length : 0);
        textarea.setSelectionRange(newStart, newEnd);
    }, 10);
};

// Custom safe Telegram HTML sanitizer/renderer
function sanitizeHtmlForTelegram(html: string): string {
    if (!html) return "";

    // Step 1: Escape special HTML characters to prevent general HTML injection
    let sanitized = html
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // Step 2: Restore explicitly allowed Telegram formatting tags
    sanitized = sanitized
        .replace(/&lt;b&gt;([\s\S]*?)&lt;\/b&gt;/gi, "<b>$1</b>")
        .replace(/&lt;strong&gt;([\s\S]*?)&lt;\/strong&gt;/gi, "<strong>$1</strong>")
        .replace(/&lt;i&gt;([\s\S]*?)&lt;\/i&gt;/gi, "<i>$1</i>")
        .replace(/&lt;em&gt;([\s\S]*?)&lt;\/em&gt;/gi, "<em>$1</em>")
        .replace(/&lt;u&gt;([\s\S]*?)&lt;\/u&gt;/gi, "<u>$1</u>")
        .replace(/&lt;s&gt;([\s\S]*?)&lt;\/s&gt;/gi, "<s>$1</s>")
        .replace(/&lt;strike&gt;([\s\S]*?)&lt;\/strike&gt;/gi, "<strike>$1</strike>")
        .replace(/&lt;del&gt;([\s\S]*?)&lt;\/del&gt;/gi, "<del>$1</del>")
        .replace(/&lt;code&gt;([\s\S]*?)&lt;\/code&gt;/gi, "<code>$1</code>")
        .replace(/&lt;pre&gt;([\s\S]*?)&lt;\/pre&gt;/gi, "<pre>$1</pre>");

    // Support for interactive Telegram spoiler
    sanitized = sanitized.replace(
        /&lt;span\s+class=&quot;tg-spoiler&quot;&gt;([\s\S]*?)&lt;\/span&gt;/gi,
        '<span class="tg-spoiler">$1</span>'
    );

    // Support for safe external links
    sanitized = sanitized.replace(
        /&lt;a\s+href=&quot;([^&]*)&quot;&gt;([\s\S]*?)&lt;\/a&gt;/gi,
        '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>'
    );

    // Step 3: Replace newlines with <br /> for browser preview
    sanitized = sanitized.replace(/\n/g, "<br />");

    return sanitized;
}

export function TelegramSendAdsDialog(props: Props) {
    const { open, configs, submitting, onClose, onSubmit } = props;

    const [selectedBotIds, setSelectedBotIds] = useState<string[]>([]);
    const [htmlText, setHtmlText] = useState("");
    const [previewRevealed, setPreviewRevealed] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Initialize list of active bots when dialog opens
    useEffect(() => {
        if (open) {
            // Select active bots by default
            const activeIds = configs.filter(c => c.is_active).map(c => c.id);
            setSelectedBotIds(activeIds);
            setHtmlText("");
            setPreviewRevealed(false);
        }
    }, [open, configs]);

    const handleToggleBot = (id: string) => {
        setSelectedBotIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        setSelectedBotIds(configs.map((c) => c.id));
    };

    const handleDeselectAll = () => {
        setSelectedBotIds([]);
    };

    // Calculate total channels targeted
    const totalChannelsTargeted = useMemo(() => {
        return configs
            .filter((c) => selectedBotIds.includes(c.id))
            .reduce((acc, c) => acc + c.chat_ids.length, 0);
    }, [configs, selectedBotIds]);

    const handleFormat = (tag: string, endTag?: string) => {
        const actualEndTag = endTag || tag;
        const textarea = textareaRef.current;
        wrapTextWithTag(textarea, tag, actualEndTag, htmlText, setHtmlText);
    };

    const handleAddLink = () => {
        const url = window.prompt("Введите URL ссылки:", "https://");
        if (url === null) return;
        const text = url.trim() || "ссылка";
        const tag = `<a href="${url}">`;
        const endTag = "</a>";
        const textarea = textareaRef.current;
        wrapTextWithTag(textarea, tag, endTag, htmlText, setHtmlText);
    };

    const handleSubmit = async () => {
        if (selectedBotIds.length === 0 || !htmlText.trim()) return;
        const success = await onSubmit({
            bot_ids: selectedBotIds,
            html_text: htmlText,
        });
        if (success) {
            onClose();
        }
    };

    const currentTimeString = useMemo(() => {
        const now = new Date();
        return now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    }, [open]);

    const sanitizedPreviewHtml = useMemo(() => {
        return sanitizeHtmlForTelegram(htmlText);
    }, [htmlText]);

    // Interactive preview click to reveal spoilers
    const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains("tg-spoiler")) {
            target.classList.toggle("revealed");
        }
    };

    return (
        <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ pb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                <FaTelegramPlane color="#0088cc" size={24} />
                <Typography variant="h6" fontWeight={700} component="span">
                    Рассылка рекламы по ботам
                </Typography>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 2 }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ minHeight: 420 }}>
                    {/* Left Column: Editor and Setup */}
                    <Stack spacing={2.5} sx={{ flex: 1, minWidth: 0 }}>
                        {/* Bot configuration selector */}
                        <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                                <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                                    Выберите ботов для отправки:
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    <Button size="small" onClick={handleSelectAll} sx={{ p: 0, minWidth: 0, textTransform: "none" }}>
                                        Выбрать всех
                                    </Button>
                                    <Typography variant="caption" color="text.secondary">|</Typography>
                                    <Button size="small" onClick={handleDeselectAll} sx={{ p: 0, minWidth: 0, textTransform: "none" }}>
                                        Снять всех
                                    </Button>
                                </Stack>
                            </Stack>

                            <Box
                                sx={{
                                    border: "1px solid",
                                    borderColor: "divider",
                                    borderRadius: 1.5,
                                    maxHeight: 120,
                                    overflowY: "auto",
                                    p: 1,
                                    backgroundColor: "action.hover",
                                }}
                            >
                                {configs.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary" align="center" py={2}>
                                        Конфигурации ботов не найдены. Сначала добавьте бота.
                                    </Typography>
                                ) : (
                                    <FormGroup>
                                        {configs.map((c) => (
                                            <FormControlLabel
                                                key={c.id}
                                                control={
                                                    <Checkbox
                                                        size="small"
                                                        checked={selectedBotIds.includes(c.id)}
                                                        onChange={() => handleToggleBot(c.id)}
                                                    />
                                                }
                                                label={
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {c.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            ({c.chat_ids.length} {c.chat_ids.length === 1 ? "канал" : c.chat_ids.length > 1 && c.chat_ids.length < 5 ? "канала" : "каналов"})
                                                        </Typography>
                                                        {!c.is_active && (
                                                            <Typography variant="caption" color="error.main" sx={{ fontSize: "10px", fontWeight: "bold" }}>
                                                                [Неактивен]
                                                            </Typography>
                                                        )}
                                                    </Stack>
                                                }
                                                sx={{ m: 0, py: 0.25 }}
                                            />
                                        ))}
                                    </FormGroup>
                                )}
                            </Box>
                        </Box>

                        {/* Formatting Editor */}
                        <Stack spacing={0.5}>
                            <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                                Текст сообщения (поддерживает Telegram HTML):
                              </Typography>
                            <Box
                                sx={{
                                    border: "1px solid",
                                    borderColor: "divider",
                                    borderRadius: 2,
                                    overflow: "hidden",
                                    "&:focus-within": {
                                        borderColor: "primary.main",
                                        boxShadow: (theme) => `0 0 0 1px ${theme.palette.primary.main}`,
                                    },
                                }}
                            >
                                {/* Editor Toolbar */}
                                <Stack
                                    direction="row"
                                    spacing={0.5}
                                    sx={{
                                        p: 0.75,
                                        backgroundColor: "action.hover",
                                        borderBottom: "1px solid",
                                        borderColor: "divider",
                                        flexWrap: "wrap",
                                        gap: 0.5,
                                    }}
                                >
                                    <Tooltip title="Жирный <b>">
                                        <IconButton size="small" onClick={() => handleFormat("<b>", "</b>")}>
                                            <FaBold size={13} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Курсив <i>">
                                        <IconButton size="small" onClick={() => handleFormat("<i>", "</i>")}>
                                            <FaItalic size={13} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Подчеркнутый <u>">
                                        <IconButton size="small" onClick={() => handleFormat("<u>", "</u>")}>
                                            <FaUnderline size={13} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Зачеркнутый <s>">
                                        <IconButton size="small" onClick={() => handleFormat("<s>", "</s>")}>
                                            <FaStrikethrough size={13} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Спойлер (скрытый)">
                                        <IconButton size="small" onClick={() => handleFormat('<span class="tg-spoiler">', '</span>')}>
                                            <FaEyeSlash size={13} />
                                        </IconButton>
                                    </Tooltip>
                                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                                    <Tooltip title="Моноширинный <code>">
                                        <IconButton size="small" onClick={() => handleFormat("<code>", "</code>")}>
                                            <FaCode size={13} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Блок кода <pre>">
                                        <IconButton size="small" onClick={() => handleFormat("<pre>", "</pre>")}>
                                            <Typography variant="caption" sx={{ fontWeight: "bold", fontSize: 10 }}>PRE</Typography>
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Вставить ссылку <a href>">
                                        <IconButton size="small" onClick={handleAddLink}>
                                            <FaLink size={13} />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>

                                <textarea
                                    ref={textareaRef}
                                    value={htmlText}
                                    onChange={(e) => setHtmlText(e.target.value)}
                                    placeholder="Введите рекламный текст сообщения. Используйте кнопки форматирования выше для выделения важных частей."
                                    style={{
                                        width: "100%",
                                        height: 180,
                                        padding: "12px",
                                        border: "none",
                                        outline: "none",
                                        resize: "none",
                                        fontFamily: "inherit",
                                        fontSize: "14px",
                                        backgroundColor: "transparent",
                                        color: "inherit",
                                    }}
                                />
                            </Box>
                        </Stack>

                        <Alert severity="info" icon={false} sx={{ py: 0.5, borderRadius: 1.5 }}>
                            <Typography variant="caption" component="div">
                                <b>Доступное форматирование:</b> Telegram поддерживает теги HTML. Вы можете использовать панель инструментов для быстрого оборачивания выделенного текста.
                            </Typography>
                        </Alert>
                    </Stack>

                    {/* Right Column: Live Telegram Preview */}
                    <Stack spacing={1} sx={{ width: { md: 280, xs: "100%" }, minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                            Предварительный просмотр:
                        </Typography>

                        {/* Telegram Chat Sandbox */}
                        <Box
                            sx={{
                                flex: 1,
                                borderRadius: 3,
                                backgroundColor: "#7ca3ca", // Telegram background color
                                border: "1px solid",
                                borderColor: "#6484a4",
                                p: 1.5,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "flex-end",
                                minHeight: 250,
                                maxHeight: 380,
                                overflowY: "auto",
                                position: "relative",
                            }}
                        >
                            {/* Spoiler Global Style injection to sandbox spoilers within preview bubble */}
                            <style>{`
                                .telegram-preview-bubble .tg-spoiler {
                                    background-color: rgba(50, 50, 50, 0.95);
                                    color: transparent !important;
                                    filter: blur(4.5px);
                                    cursor: pointer;
                                    border-radius: 3px;
                                    padding: 0 2px;
                                    transition: all 0.25s ease;
                                }
                                .telegram-preview-bubble .tg-spoiler.revealed,
                                .telegram-preview-bubble .tg-spoiler:hover {
                                    background-color: transparent;
                                    color: inherit !important;
                                    filter: none;
                                }
                                .telegram-preview-bubble a {
                                    color: #0088cc;
                                    text-decoration: none;
                                }
                                .telegram-preview-bubble a:hover {
                                    text-decoration: underline;
                                }
                                .telegram-preview-bubble code {
                                    background-color: rgba(0, 0, 0, 0.06);
                                    font-family: Consolas, monospace;
                                    font-size: 0.9em;
                                    padding: 1px 4px;
                                    border-radius: 3px;
                                }
                                .telegram-preview-bubble pre {
                                    background-color: rgba(0, 0, 0, 0.06);
                                    font-family: Consolas, monospace;
                                    font-size: 0.9em;
                                    padding: 8px;
                                    border-radius: 6px;
                                    margin: 4px 0;
                                    white-space: pre-wrap;
                                    word-break: break-all;
                                }
                            `}</style>

                            <Box sx={{ flex: 1 }} />

                            {/* Telegram Message Bubble */}
                            <Box
                                className="telegram-preview-bubble"
                                onClick={handlePreviewClick}
                                sx={{
                                    alignSelf: "flex-end",
                                    backgroundColor: "#e2f7cb", // Sent message green bubble
                                    borderRadius: "12px 12px 0px 12px",
                                    p: 1.25,
                                    maxWidth: "100%",
                                    minWidth: 80,
                                    boxShadow: "0 1px 1px rgba(0,0,0,0.15)",
                                    position: "relative",
                                    display: "flex",
                                    flexDirection: "column",
                                    wordBreak: "break-word",
                                    lineHeight: 1.4,
                                }}
                            >
                                <Box sx={{ fontSize: 14, color: "#000000", pb: 1.5, whiteSpace: "pre-wrap" }}>
                                    {htmlText.trim() ? (
                                        <div dangerouslySetInnerHTML={{ __html: sanitizedPreviewHtml }} />
                                    ) : (
                                        <Typography variant="body2" sx={{ fontStyle: "italic", color: "rgba(0,0,0,0.45)" }}>
                                            Здесь отобразится текст вашего сообщения...
                                        </Typography>
                                    )}
                                </Box>

                                {/* Time and Checkmark Indicator */}
                                <Stack
                                    direction="row"
                                    spacing={0.25}
                                    alignItems="center"
                                    sx={{
                                        position: "absolute",
                                        bottom: 3,
                                        right: 7,
                                        fontSize: 10,
                                        color: "#4f9e42",
                                        userSelect: "none",
                                    }}
                                >
                                    <span>{currentTimeString}</span>
                                    <span style={{ fontWeight: "bold", fontSize: 11 }}>✓✓</span>
                                </Stack>
                            </Box>
                        </Box>
                        <Typography variant="caption" color="text.secondary" align="center">
                            * Нажмите на размытый текст-спойлер для его просмотра
                        </Typography>
                    </Stack>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 1.5, justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                    {selectedBotIds.length > 0 && (
                        <Typography variant="body2" fontWeight={600} color="success.main">
                            Будет отправлено: {selectedBotIds.length} бот{selectedBotIds.length === 1 ? "у" : "ам"} (всего в {totalChannelsTargeted} канал{totalChannelsTargeted === 1 ? "ов" : totalChannelsTargeted > 1 && totalChannelsTargeted < 5 ? "ала" : "алов"})
                        </Typography>
                    )}
                    {selectedBotIds.length === 0 && (
                        <Typography variant="body2" fontWeight={600} color="error.main">
                            Не выбрано ни одного бота
                        </Typography>
                    )}
                </Box>

                <Stack direction="row" spacing={1.5}>
                    <Button onClick={onClose} disabled={submitting} variant="outlined">
                        Отмена
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={submitting || selectedBotIds.length === 0 || !htmlText.trim()}
                        startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <FaTelegramPlane />}
                    >
                        Отправить рассылку
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
}
