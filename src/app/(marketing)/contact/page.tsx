import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import ContactPageContent from './_ui/contact-page-content'

const ContactPage = () => (
    <ErrorBoundary fallback={<div>There was an error</div>}>
        <Suspense fallback={<div>Loading...</div>}>
            <ContactPageContent />
        </Suspense>
    </ErrorBoundary>
);

export default ContactPage