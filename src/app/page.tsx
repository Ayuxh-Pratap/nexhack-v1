import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";

import LandingPageContents from "./_ui/landing-page-contents";

const LandingPage = async () => {
  return (
      <ErrorBoundary fallback={<div>There was an error</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <LandingPageContents/>
        </Suspense>
      </ErrorBoundary>
  );
};

export default LandingPage;