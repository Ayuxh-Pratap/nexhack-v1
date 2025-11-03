import IntegrationsHero from "@/app/(marketing)/integrations/_ui/components/integrations-hero"
import IntegrationsSection from "@/app/(marketing)/integrations/_ui/components/integrations-section"
import CTA from "@/app/_ui/components/cta"
import Stats from "@/app/_ui/components/stats"

const IntegrationsPageContent = () => {
    return (
        <div className="w-full relative flex flex-col pt-16">
            <IntegrationsHero />
            <IntegrationsSection />
            <Stats />
            <CTA />
        </div>
    )
};

export default IntegrationsPageContent
