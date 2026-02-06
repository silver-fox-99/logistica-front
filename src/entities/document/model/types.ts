export enum DocumentStatus {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    ARCHIVED = "ARCHIVED",
}

export enum DocumentFormat {
    MARKDOWN = "MARKDOWN",
    HTML = "HTML",
}

export type DocumentEntity = {
    id: string;
    key: string;
    title: string;
    status: DocumentStatus;
    format: DocumentFormat;
    content: string;
    content_hash: string;
    version: number;
    published_at: string | null;
    updated_by: string | null;
    meta: Record<string, any>;
    created_at: string;
    updated_at: string;
};

export type CreateDocumentDto = {
    key: string;
    title: string;
    status?: DocumentStatus;
    format?: DocumentFormat;
    content: string;
    version?: number;
    published_at?: string | null;
    updated_by?: string | null;
    meta?: Record<string, any>;
};

export type UpdateDocumentDto = Partial<CreateDocumentDto>;
