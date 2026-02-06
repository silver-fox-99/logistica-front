import api from "./axios";
import type {CreateDocumentDto, DocumentEntity, UpdateDocumentDto} from "@/entities/document/model/types.ts";


export const documentsApi = {
    async list(): Promise<DocumentEntity[]> {
        return api.get("/documents").then((r) => r.data);
    },

    async create(dto: CreateDocumentDto): Promise<DocumentEntity> {
        return api.post("/documents", dto).then((r) => r.data);
    },

    async update(id: string, dto: UpdateDocumentDto): Promise<DocumentEntity> {
        return api.patch(`/documents/${id}`, dto).then((r) => r.data);
    },

    async remove(id: string): Promise<{ ok: boolean }> {
        const r = await api.delete(`/documents/${id}`);
        return r.data;
    },

    async getByKey(key: string, version?: number): Promise<DocumentEntity> {
        return api.get(`/documents/by-key/${key}`, { params: { version } }).then((r) => r.data);
    },

    async publish(key: string, version: number): Promise<DocumentEntity> {
        return api.post(`/documents/${key}/publish`, null, { params: { version } }).then((r) => r.data);
    },

    async unpublish(key: string): Promise<DocumentEntity> {
        return api.post(`/documents/${key}/unpublish`).then((r) => r.data);
    },
};
