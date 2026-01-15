import type React from "react";
import type { SxProps, Theme } from "@mui/material/styles";

export type SortDir = "asc" | "desc";

export type SortState<TField extends string = string> = {
    field: TField;
    dir: SortDir;
};

export type CustomTableColumn<T, TSortField extends string = string> = {
    id: string;
    header: React.ReactNode;

    cell: (row: T) => React.ReactNode;

    sortable?: boolean;

    /** Backend sort field (union) */
    sortField?: TSortField;

    defaultSortDir?: SortDir;

    align?: "left" | "center" | "right";
    width?: number;
    minWidth?: number;
    maxWidth?: number;
    nowrap?: boolean;

    headerSx?: SxProps<Theme>;
    cellSx?: SxProps<Theme>;
};
