import { Stack } from "@mui/material";
import ProfileOverviewCard from "@/features/profile/ui/ProfileOverviewCard.tsx";
import ContactInfoCard from "@/features/profile/ui/ContactInfoCard.tsx";


export default function ProfilePage() {
    return (
        <Stack spacing={3}>
            <ProfileOverviewCard
                fullName="Ivan Ivanov"
                location="Uzbekistan"
                registeredAt="12/07/2025"
            />
            <ContactInfoCard
                data={{
                    phoneMain: "+998 097 000 0000",
                    phoneAlt: "+998 097 000 0000",
                    telegram: "@username",
                    whatsapp: "+998 097 000 0000",
                    email: "email@gmail.com",
                }}
                saving={false}
                onSave={async (values) => {
                    console.log("save contact info", values);
                }}
            />

        </Stack>
    );
}
