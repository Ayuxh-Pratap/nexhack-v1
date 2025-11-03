export type PlanFeature = {
    text: string;
};

export type Plan = {
    name: string;
    badge?: string;
    description: string;
    price: {
        monthly: number;
        yearly: number;
    };
    features: PlanFeature[];
    buttonText: string;
    popular?: boolean;
};

export const PRICING_PLANS: Plan[] = [
    {
        name: "Basic Plan",
        badge: "Basic",
        description: "Perfect for getting started",
        price: {
            monthly: 12,
            yearly: 115,
        },
        features: [
            { text: "Developer docs" },
            { text: "Submit cases to support" },
            { text: "API status notifications" },
            { text: "Troubleshooting" },
        ],
        buttonText: "Start with Basic",
    },
    {
        name: "Popular Plan",
        badge: "Popular",
        description: "Best for growing teams",
        price: {
            monthly: 40,
            yearly: 384,
        },
        features: [
            { text: "Developer docs" },
            { text: "Submit cases to support" },
            { text: "API status notifications" },
            { text: "Troubleshooting" },
        ],
        buttonText: "Start with Pro",
        popular: true,
    }
];

export const MARQUEE_ITEMS = [
    "Seamless Success",
    "Efficient Excellence",
    "Empowering Growth",
    "Innovative Simplicity",
    "Scalable Solutions",
    "Reliable Performance",
    "Global Reach"
];
