import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import IntegrationPageContent from "./_ui/integration-page-content";

const IntegrationsPage = () => (
    <ErrorBoundary fallback={<div>There was an error</div>}>
      <Suspense fallback={<div>Loading...</div>}>
        <IntegrationPageContent />
      </Suspense>
    </ErrorBoundary>    
);

export default IntegrationsPage;
