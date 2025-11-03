import AboutHero from "@/app/(marketing)/about/_ui/components/about-hero";
import OurMission from "@/app/(marketing)/about/_ui/components/our-mission";
import OurStart from "@/app/(marketing)/about/_ui/components/our-start";
import OurStory from "@/app/(marketing)/about/_ui/components/our-story";
import CTA from "@/app/_ui/components/cta";
import Faq from "@/app/_ui/components/faq";

const AboutPageContent = () => {
    return (
        <div className="w-full relative flex flex-col pt-16">
            <AboutHero />
            <OurStory />
            <OurStart />
            <OurMission />
            <Faq />
            <CTA />
        </div>
    );
};

export default AboutPageContent;
