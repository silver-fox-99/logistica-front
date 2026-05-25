import { Button, InputAdornment, Stack, TextField } from "@mui/material";
import { FiFilter, FiSearch } from "react-icons/fi";
import { useTranslation } from "react-i18next";

type Props = {
    value: string;
    activeFiltersCount?: number;
    onChange: (value: string) => void;
    onSearch: () => void;
    onOpenFilters: () => void;
};

export function TenderSearchBar({
                                    value,
                                    activeFiltersCount = 0,
                                    onChange,
                                    onSearch,
                                    onOpenFilters,
                                }: Props) {
    const { t } = useTranslation();

    return (
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
            <TextField
                size="small"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === "Enter") onSearch();
                }}
                placeholder={t("tenders.list.searchPlaceholder", "Search by title or cargo")}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <FiSearch />
                        </InputAdornment>
                    ),
                }}
                fullWidth
            />

            <Button variant="outlined" onClick={onSearch}>
                {t("tenders.common.find", "Find")}
            </Button>

            <Button variant="outlined" startIcon={<FiFilter />} onClick={onOpenFilters}>
                {activeFiltersCount > 0
                    ? t("tenders.filters.buttonWithCount", {
                        count: activeFiltersCount,
                        defaultValue: `Filters (${activeFiltersCount})`,
                    })
                    : t("tenders.filters.button", "Filters")}
            </Button>
        </Stack>
    );
}