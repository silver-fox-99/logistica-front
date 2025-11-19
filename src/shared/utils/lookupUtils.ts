import { useTranslation } from "react-i18next";
import { useCallback } from "react";

export type LookupOpt = { 
    slug: string; 
    label: string;
    label_ru?: string | null;
    label_uz?: string | null;
};

export function useLocalizedLookup() {
    const { i18n } = useTranslation();
    
    const getLocalizedLabel = (opt: LookupOpt): string => {
        const lang = i18n.resolvedLanguage || i18n.language || "uz";
        
        if (lang === "ru" && opt.label_ru) {
            return opt.label_ru;
        }
        
        if (lang === "uz" && opt.label_uz) {
            return opt.label_uz;
        }
        
        return opt.label;
    };

    const findLocalizedLabel = (opts: LookupOpt[], slug?: string): string => {
        if (!slug) return "";
        const opt = opts.find(o => o.slug === slug);
        return opt ? getLocalizedLabel(opt) : slug;
    };

    return { getLocalizedLabel, findLocalizedLabel };
}

export type GeoItem = {
    id?: string;
    name: string;
    name_ru?: string | null;
    name_uz?: string | null;
};

export function useLocalizedGeo() {
    const { i18n } = useTranslation();
    
    const getLocalizedGeoName = useCallback((geo: GeoItem | { name: string; name_ru?: string | null; name_uz?: string | null }): string => {
        const lang = i18n.resolvedLanguage || i18n.language || "uz";
        
        if (lang === "ru" && geo.name_ru) {
            return geo.name_ru;
        }
        
        if (lang === "uz" && geo.name_uz) {
            return geo.name_uz;
        }
        
        return geo.name;
    }, [i18n.resolvedLanguage, i18n.language]);

    return { getLocalizedGeoName };
}

