import { Box, Button, IconButton, Stack, Typography } from "@mui/material";
import { FiImage, FiTrash2 } from "react-icons/fi";
import React from "react";

type Props = {
    label: string;
    helperText?: string;
    uploadButtonText: string;
    files: File[];
    previews: string[];
    disabled?: boolean;
    maxFiles?: number;
    onChange: (files: File[]) => void;
};

export function ImageUploadField({
                                     label,
                                     helperText,
                                     files,
                                     previews,
                                     disabled,
                                     maxFiles = 5,
                                     onChange,
                                     uploadButtonText
                                 }: Props) {
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(event.target.files ?? []);
        const next = [...files, ...selected].slice(0, maxFiles);
        onChange(next);
        event.target.value = "";
    };

    const handleRemove = (index: number) => {
        onChange(files.filter((_, i) => i !== index));
    };

    return (
        <Stack spacing={1.5}>
            <Box>
                <Typography variant="subtitle2">{label}</Typography>
                {helperText ? (
                    <Typography variant="body2" color="text.secondary">
                        {helperText}
                    </Typography>
                ) : null}
            </Box>

            <Button
                component="label"
                variant="outlined"
                startIcon={<FiImage />}
                disabled={disabled || files.length >= maxFiles}
                sx={{ alignSelf: "flex-start" }}
            >
                {uploadButtonText}
                <input
                    hidden
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleInputChange}
                />
            </Button>

            {previews.length > 0 && (
                <Stack direction="row" flexWrap="wrap" gap={1.5}>
                    {previews.map((src, index) => (
                        <Box
                            key={`${src}-${index}`}
                            sx={{
                                position: "relative",
                                width: 100,
                                height: 100,
                                borderRadius: 2,
                                overflow: "hidden",
                                border: "1px solid",
                                borderColor: "divider",
                            }}
                        >
                            <Box
                                component="img"
                                src={src}
                                alt={`upload-${index + 1}`}
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    display: "block",
                                }}
                            />
                            <IconButton
                                size="small"
                                onClick={() => handleRemove(index)}
                                sx={{
                                    position: "absolute",
                                    top: 4,
                                    right: 4,
                                    bgcolor: "background.paper",
                                }}
                            >
                                <FiTrash2 size={14} />
                            </IconButton>
                        </Box>
                    ))}
                </Stack>
            )}
        </Stack>
    );
}