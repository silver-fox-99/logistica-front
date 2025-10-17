import { initializeApp } from "firebase/app";
import {
    getAuth,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    type ConfirmationResult,
} from "firebase/auth";

const app = initializeApp({
    apiKey: import.meta.env.VITE_FB_API_KEY!,
    authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN!,
    projectId: import.meta.env.VITE_FB_PROJECT_ID!,
    storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET!,
    messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID!,
    appId: import.meta.env.VITE_FB_APP_ID!,
});

const auth = getAuth(app);

function ensureContainer(id = "recaptcha-container") {
    let el = document.getElementById(id);
    if (!el) {
        el = document.createElement("div");
        el.id = id;
        el.style.display = "none";
        document.body.appendChild(el);
    }
    return el;
}

class FirebasePhone {
    private recaptcha: RecaptchaVerifier | null = null;
    private confirmation: ConfirmationResult | null = null;

    private async getRecaptcha(containerId = "recaptcha-container") {

        if (this.recaptcha) return this.recaptcha;

        ensureContainer(containerId);

        // создаём новый
        this.recaptcha = new RecaptchaVerifier(auth, containerId, {
            size: "invisible",
            callback: () => {},
            "expired-callback": () => {},
        });


        await this.recaptcha.render();
        return this.recaptcha;
    }

    async sendCode(e164: string) {
        try { await this.recaptcha?.render(); } catch {
            try { this.recaptcha?.clear?.(); } catch {}
            this.recaptcha = null;
        }

        const verifier = await this.getRecaptcha();
        this.confirmation = await signInWithPhoneNumber(auth, e164, verifier);
    }

    async confirmCode(code: string): Promise<string> {
        if (!this.confirmation) throw new Error("No pending confirmation");
        const cred = await this.confirmation.confirm(code);
        return cred.user.getIdToken();
    }

    reset() {
        try { this.recaptcha?.clear?.(); } catch {}
        this.recaptcha = null;
        this.confirmation = null;
    }
}

export const firebasePhone = new FirebasePhone();
export { auth };
