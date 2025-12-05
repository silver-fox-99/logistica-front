// Тип для унифицированного представления локаций из публичных geo endpoints
export type GeoImportItem = {
    id: string;
    name: string;
    name_ru?: string | null;
    name_uz?: string | null;
    parent_id?: string | null;
    code?: string | null;
    iso2?: string | null;
    stateCode?: string | null;
    countryCode?: string | null;
    type?: string | null;
};
