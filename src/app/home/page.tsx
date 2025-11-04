import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";

import { HomePageContents } from "./_ui/home-page-contents";
import { AuthGuard } from "./_ui/auth-guard";

const HomePage = async () => {
  return (
      <ErrorBoundary fallback={<div>There was an error</div>}>
        <Suspense fallback={<div>Loading...</div>}>
        <AuthGuard>
          <HomePageContents/>
        </AuthGuard>
        </Suspense>
      </ErrorBoundary>
  );
};

export default HomePage;