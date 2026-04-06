import { Button, Chip, Stack, ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import { FiCheckSquare, FiLayers, FiSquare, FiTrash2 } from "react-icons/fi";
import { useTranslation } from "react-i18next";

import type { ShipmentsKind } from "@/entities/shipment/model/type";

type Props = {
    kind: ShipmentsKind;
    selectedCount: number;
    allPageSelected: boolean;
    hasAnyPageSelected: boolean;
    onKindChange: (kind: ShipmentsKind) => void;
    onSelectAllPage: () => void;
    onDeselectAllPage: () => void;
    onClearSelection: () => void;
    onOpenBulkActions: () => void;
};

export function MyShipmentsManageToolbar({
                                             kind,
                                             selectedCount,
                                             allPageSelected,
                                             hasAnyPageSelected,
                                             onKindChange,
                                             onSelectAllPage,
                                             onDeselectAllPage,
                                             onClearSelection,
                                             onOpenBulkActions,
                                         }: Props) {
    const { t } = useTranslation();

    return (
        <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={1}
            alignItems={{ xs: "stretch", lg: "center" }}
            justifyContent="space-between"
            sx={{ width: "100%" }}
        >
            <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
                useFlexGap
            >
                <ToggleButtonGroup
                    exclusive
                    value={kind}
                    size="small"
                    onChange={(_, value) => {
                        if (!value) return;
                        onKindChange(value);
                    }}
                    sx={{
                        "& .MuiToggleButton-root": {
                            px: 1.5,
                            py: 0.75,
                            minWidth: 88,
                            textTransform: "none",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                        },
                    }}
                >
                    <ToggleButton value="cargo">
                        {t("shipments.filters.cargo", "Cargo")}
                    </ToggleButton>

                    <ToggleButton value="transport">
                        {t("shipments.filters.transport", "Transport")}
                    </ToggleButton>
                </ToggleButtonGroup>

                <Chip
                    size="small"
                    color={selectedCount > 0 ? "primary" : "default"}
                    label={t("shipments.manage.selectedCountShort", {
                        count: selectedCount,
                        defaultValue: "Selected: {{count}}",
                    })}
                    sx={{
                        height: 32,
                        fontWeight: 600,
                        borderRadius: 2,
                    }}
                />
            </Stack>

            <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
                useFlexGap
                justifyContent={{ xs: "flex-start", lg: "flex-end" }}
            >
                {!allPageSelected ? (
                    <Tooltip title={t("shipments.manage.selectPage", "Select page")}>
                        <span>
                            <Button
                                variant="outlined"
                                startIcon={<FiCheckSquare />}
                                onClick={onSelectAllPage}
                                disabled={!hasAnyPageSelected && selectedCount > 0 ? false : false}
                                sx={{
                                    textTransform: "none",
                                    minWidth: "auto",
                                    px: 1.25,
                                    py: 0.875,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {t("shipments.manage.selectPageShort", "Select page")}
                            </Button>
                        </span>
                    </Tooltip>
                ) : (
                    <Tooltip title={t("shipments.manage.unselectPage", "Unselect page")}>
                        <span>
                            <Button
                                variant="outlined"
                                startIcon={<FiSquare />}
                                onClick={onDeselectAllPage}
                                sx={{
                                    textTransform: "none",
                                    minWidth: "auto",
                                    px: 1.25,
                                    py: 0.875,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {t("shipments.manage.unselectPageShort", "Unselect")}
                            </Button>
                        </span>
                    </Tooltip>
                )}

                <Tooltip title={t("shipments.manage.clearSelection", "Clear selection")}>
                    <span>
                        <Button
                            variant="outlined"
                            color="inherit"
                            startIcon={<FiTrash2 />}
                            onClick={onClearSelection}
                            disabled={selectedCount === 0}
                            sx={{
                                textTransform: "none",
                                minWidth: "auto",
                                px: 1.25,
                                py: 0.875,
                                whiteSpace: "nowrap",
                            }}
                        >
                            {t("shipments.manage.clearSelectionShort", "Clear")}
                        </Button>
                    </span>
                </Tooltip>

                <Tooltip title={t("shipments.manage.bulkActions", "Bulk actions")}>
                    <span>
                        <Button
                            variant="contained"
                            startIcon={<FiLayers />}
                            onClick={onOpenBulkActions}
                            disabled={selectedCount === 0}
                            sx={{
                                textTransform: "none",
                                minWidth: "auto",
                                px: 1.5,
                                py: 0.875,
                                whiteSpace: "nowrap",
                            }}
                        >
                            {t("shipments.manage.bulkActionsShort", "Bulk")}
                        </Button>
                    </span>
                </Tooltip>
            </Stack>
        </Stack>
    );
}