import { useTranslation } from "react-i18next";

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

