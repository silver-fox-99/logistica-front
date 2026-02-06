export enum DocumentKey {
    REFERRAL_PROGRAM = "referral_agreement",
    ABOUT_COMPANY = "about_company",
    FAQ = "faq",
    TERMS_OF_USE = "terms_of_use",
    PRIVACY_POLICY = "privacy_policy",
    BILLING = "billing",
    USER_AGREEMENT = "user_agreement",
}

export const DOCUMENT_KEY_LABELS: Record<DocumentKey, string> = {
    [DocumentKey.REFERRAL_PROGRAM]: "Referral Program",
    [DocumentKey.ABOUT_COMPANY]: "About Company",
    [DocumentKey.FAQ]: "FAQ",
    [DocumentKey.TERMS_OF_USE]: "Terms of Use",
    [DocumentKey.PRIVACY_POLICY]: "Privacy Policy",
    [DocumentKey.BILLING]: "Payments & Billing",
    [DocumentKey.USER_AGREEMENT]: "User Agreement",
};
