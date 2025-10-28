import {Stack} from "@mui/material";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import ProfileOverviewCard from "@/features/profile/ui/ProfileOverviewCard.tsx";
import ContactInfoCard, {type ContactInfo} from "@/features/profile/ui/ContactInfoCard.tsx";
import {useUserStore} from "@/entities/user/model/user.store.ts";
import {useEffect, useState} from "react";
import {profileApi} from "@/shared/api/profileApi.ts";


export default function ProfilePage() {
    const user = useUserStore(s => s.user)
    const setUser = useUserStore(s => s.setUser)
    const { t } = useTranslation()
    const [userDate, setUserDate] = useState<string>(t('profile.overview.unknown'))

    useEffect(() => {
        if (user) {
            setUserDate(
                new Date(user.created_at).toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    hour12: false,
                    timeZone: 'UTC'
                }) + ' (UTC timezone)'
            );
        }
    }, [user]);

    const updateUser = async (values: ContactInfo & { phoneMainE164?: string; phoneAltE164?: string }) => {
        try {
            const preparedData = {
                email: values.email,
                phone: values.phoneMainE164,
                meta: {
                    geo: values.geo,
                    phoneAlt: values.phoneAltE164,
                    telegram: values.telegram,
                    whatsapp: values.whatsapp,
                }
            }
            const res = await profileApi.updateProfile(preparedData)
            setUser(res.data)
            toast.success(t('profile.messages.updateSuccess'))
        } catch (error: any) {
            const message = error?.response?.data?.message || t('profile.messages.updateError')
            toast.error(message)
        }
    }

    return (
        <Stack spacing={3}>
            <ProfileOverviewCard
                fullName={user?.first_name + " " + user?.last_name}
                location={user?.meta?.geo || t('profile.overview.unknown')}
                registeredAt={userDate || t('profile.overview.unknown')}
            />
            <ContactInfoCard
                data={{
                    geo: user?.meta?.geo || '',
                    phoneMain: user?.phone || "",
                    phoneAlt: user?.meta?.phoneAlt || "",
                    telegram: user?.meta?.telegram || "",
                    whatsapp: user?.meta?.whatsapp || "",
                    email: user?.email || "",
                }}
                saving={false}
                onSave={updateUser}
            />
        </Stack>
    );
}
