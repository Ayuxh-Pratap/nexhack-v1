import { PhoneIcon, MailIcon, MapPinIcon } from "lucide-react";

export const CONTACT_CARDS = [
    {
        title: "Phone Number",
        value: "+1 (123) 456-7890",
        icon: PhoneIcon
    },
    {
        title: "Verve Address",
        value: "Mumbai, India",
        icon: MapPinIcon
    },
    {
        title: "Email Address",
        value: "support@verve.com",
        icon: MailIcon
    }
] as const;
