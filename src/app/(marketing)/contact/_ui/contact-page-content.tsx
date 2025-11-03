import React from 'react'
import ContactHero from "@/app/(marketing)/contact/_ui/components/contact-hero"
import ContactForm from "@/app/(marketing)/contact/_ui/components/contact-form"
import CTA from "@/app/_ui/components/cta"

const ContactPageContent = () => {
    return (
        <div className="w-full relative flex flex-col pt-16">
            <ContactHero />
            <ContactForm />
            <CTA />
        </div>
    )
};

export default ContactPageContent 