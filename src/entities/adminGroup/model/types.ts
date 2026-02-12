export type AdminGroup = {
    id: string;
    code: string;
    name: string;
    description: string | null;
    rank: number;
    is_root: boolean;
    created_at: string;
    updated_at: string;
};
