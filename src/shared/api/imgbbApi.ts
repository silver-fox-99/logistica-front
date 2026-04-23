import axios from "axios";

type ImgbbUploadResponse = {
    data: {
        id: string;
        url: string;
        display_url: string;
        delete_url: string;
        image?: {
            url: string;
        };
        medium?: {
            url: string;
        };
        thumb?: {
            url: string;
        };
    };
    success: boolean;
    status: number;
};

const IMGBB_API_URL = "https://api.imgbb.com/1/upload";
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

if (!IMGBB_API_KEY) {
    console.warn("VITE_IMGBB_API_KEY is not set");
}

export const imgbbApi = {
    async upload(file: File): Promise<string> {
        if (!IMGBB_API_KEY) {
            throw new Error("IMGBB API key is missing");
        }

        const formData = new FormData();
        formData.append("image", file, file.name);

        const { data } = await axios.post<ImgbbUploadResponse>(
            `${IMGBB_API_URL}?key=${IMGBB_API_KEY}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        if (!data?.success || !data?.data?.url) {
            throw new Error("Image upload failed");
        }

        return data.data.url;
    },

    async uploadMany(files: File[]): Promise<string[]> {
        if (!files.length) return [];
        return Promise.all(files.map((file) => this.upload(file)));
    },
};