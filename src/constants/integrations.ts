export type Integration = {
    name: string;
    description: string;
    icon: string;
    category: "social" | "api" | "crm" | "all";
};

export const INTEGRATION_CATEGORIES = [
    {
        label: "All Integrations",
        value: "all"
    },
    {
        label: "Social Integrations",
        value: "social"
    },
    {
        label: "API Integrations",
        value: "api"
    },
    {
        label: "CRM Integrations",
        value: "crm"
    }
] as const;

export const INTEGRATIONS: Integration[] = [
    {
        name: "Slack",
        description: "Connect and collaborate with your team in real-time through Slack integration.",
        icon: "/icons/slack.svg",
        category: "social"
    },
    {
        name: "Snapchat",
        description: "Automate your workflows by connecting Verve with thousands of apps through Snapchat.",
        icon: "/icons/snapchat.svg",
        category: "api"
    },
    {
        name: "Reddit",
        description: "Share and engage with the Reddit community directly from your Verve dashboard.",
        icon: "/icons/reddit.svg",
        category: "social"
    },
    {
        name: "Discord",
        description: "Build community and manage your Discord server with powerful integration tools.",
        icon: "/icons/discord.svg",
        category: "social"
    },
    {
        name: "Layers",
        description: "Manage your business presence and reviews across Layers platforms seamlessly.",
        icon: "/icons/new.svg",
        category: "crm"
    },
    {
        name: "Figma",
        description: "Design and prototype your projects with direct Figma integration support.",
        icon: "/icons/figma.svg",
        category: "api"
    },
    {
        name: "Apple",
        description: "Integrate your apps with Apple services and iOS ecosystem features.",
        icon: "/icons/apple.svg",
        category: "api"
    },
    {
        name: "Facebook",
        description: "Connect with your audience through comprehensive Facebook platform integration.",
        icon: "/icons/facebook.svg",
        category: "social"
    },
    {
        name: "Threads",
        description: "Showcase your design work and connect with the Threads creative community.",
        icon: "/icons/threads.svg",
        category: "social"
    },
    {
        name: "Meta",
        description: "Access Meta's suite of tools and platforms for enhanced social engagement.",
        icon: "/icons/meta.svg",
        category: "social"
    },
    {
        name: "LinkedIn",
        description: "Build your professional network and share updates via LinkedIn integration.",
        icon: "/icons/linkedin.svg",
        category: "social"
    },
    {
        name: "Snapchat",
        description: "Engage with younger audiences through Snapchat's creative tools and features.",
        icon: "/icons/snapchat.svg",
        category: "social"
    }
]; 