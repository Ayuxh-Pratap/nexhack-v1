import Navbar from "@/components/navigation/navbar";
import Hero from "./components/hero";
import Footer from "@/components/navigation/footer";
import Companies from "./components/companies";
import HowItWorks from "./components/how-it-works";
import Features from "./components/features";
import Faq from "./components/faq";
import Stats from "./components/stats";
import Testimonials from "./components/testimonials";
import CTA from "./components/cta";

const LandingPageContents = () => {
  return (
    <>
      <main className="w-full grow relative">
        <Navbar />
        <div className="w-full relative flex flex-col pt-16">
          <Hero />
          <Companies />
          <HowItWorks />
          <Features />
          <Faq />
          <Stats />
          <Testimonials />
          <CTA />
        </div>
        <Footer />
      </main>
    </>
  );
};

export default LandingPageContents;