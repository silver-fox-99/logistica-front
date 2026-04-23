import type { TFunction } from "i18next";
import type { CommonInitData } from "@/shared/api/commonInitApi";
import type { GeoPoint, ShipmentRowData, ShipmentsKind } from "./type";
import type { useLocalizedLookup } from "@/shared/utils/lookupUtils";

export type ShipmentScope = "public" | "my";

export type FindLocalizedLabel = ReturnType<typeof useLocalizedLookup>["findLocalizedLabel"];

export type ShipmentRowHandlers = {
    onMoreOpen?: (id: string) => void;
    onFavoriteChange?: (id: string, isFavorite: boolean) => void;
    onUp?: (id: string) => void;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    onCopy?: (id: string) => void;
};

export type ShipmentDetailsContentProps = {
    data: ShipmentRowData;
    scope: ShipmentScope;
    lookups: CommonInitData["lookups"] | null;
    findLocalizedLabel: FindLocalizedLabel;
    t: TFunction;
    showActions?: boolean;
    onUp?: (id: string) => void;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    onCopy?: (id: string) => void;
    formatRoute: (point?: GeoPoint, withAddress?: boolean) => string;
};

export type ShipmentDetailsModalProps = {
    open: boolean;
    onClose: () => void;
    data: ShipmentRowData | null;
    kind: ShipmentsKind;
    lookups: CommonInitData["lookups"] | null;
    findLocalizedLabel: FindLocalizedLabel;
    t: TFunction;
    loading: boolean;
    formatRoute: (point?: GeoPoint, withAddress?: boolean) => string;
};