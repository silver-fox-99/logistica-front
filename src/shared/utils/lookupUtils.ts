import { useTranslation } from "react-i18next";

export type LookupOpt = { 
    slug: string; 
    label: string;
    ru?: string | null;
    uz?: string | null;
};

export function useLocalizedLookup() {
    const { i18n } = useTranslation();
    
    const getLocalizedLabel = (opt: LookupOpt): string => {
        const lang = i18n.resolvedLanguage || i18n.language || "uz";
        
        if (lang === "ru" && opt.ru) {
            return opt.ru;
        }
        
        if (lang === "uz" && opt.uz) {
            return opt.uz;
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

