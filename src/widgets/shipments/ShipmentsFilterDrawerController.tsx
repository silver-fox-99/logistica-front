import React, { useCallback, useEffect, useState } from "react";

import ShipmentsFilterDrawer from "@/widgets/shipments/ShipmentsFilterDrawer";
import type { ShipmentsKind } from "@/entities/shipment/model/type";
import type { PublicFilters } from "@/widgets/public/PublicFiltersDrawer";

type Props = {
    open: boolean;

    initialKind: ShipmentsKind;
    initialFilters: PublicFilters;

    defaultKind: ShipmentsKind;
    defaultFilters: PublicFilters;

    onClose: () => void;
    onApply: (kind: ShipmentsKind, filters: PublicFilters) => void;
};

function cloneFilters<T>(v: T): T {
    // если фильтры будут вложенными — лучше structuredClone
    // return structuredClone(v);
    return { ...(v as any) };
}

export const ShipmentsFilterDrawerController = React.memo(function ShipmentsFilterDrawerController({
                                                                                                       open,

                                                                                                       initialKind,
                                                                                                       initialFilters,

                                                                                                       defaultKind,
                                                                                                       defaultFilters,

                                                                                                       onClose,
                                                                                                       onApply,
                                                                                                   }: Props) {
    const [draftKind, setDraftKind] = useState<ShipmentsKind>(initialKind);
    const [draftFilters, setDraftFilters] = useState<PublicFilters>(() => cloneFilters(initialFilters));

    useEffect(() => {
        if (!open) return;
        setDraftKind(initialKind);
        setDraftFilters(cloneFilters(initialFilters));
    }, [open, initialKind, initialFilters]);

    const handleReset = useCallback(() => {
        setDraftKind(defaultKind);
        setDraftFilters(cloneFilters(defaultFilters));
    }, [defaultFilters, defaultKind]);

    const handleApply = useCallback(() => {
        onApply(draftKind, draftFilters);
    }, [draftFilters, draftKind, onApply]);

    return (
        <ShipmentsFilterDrawer
            open={open}
            value={draftKind}
            onChange={setDraftKind}
            filters={draftFilters}
            onFiltersChange={setDraftFilters}
            onClose={onClose}
            onReset={handleReset}
            onApply={handleApply}
        />
    );
});
