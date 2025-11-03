import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import AboutPageContent from "./_ui/about-page-content";

const AboutPage = () => {
    return (
        <ErrorBoundary fallback={<div>There was an error</div>}>
            <Suspense fallback={<div>Loading...</div>}>
                <AboutPageContent />
            </Suspense>
        </ErrorBoundary>
    );
};

export default AboutPage;
