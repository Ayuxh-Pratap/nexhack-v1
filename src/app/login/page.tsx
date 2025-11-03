import { redirect } from "next/navigation";
import { LoginPageContent } from "./_ui/login-page-content";

const LoginPage = async () => {
  // Client-side auth check will happen in LoginPageContent
  return <LoginPageContent />;
};

export default LoginPage;
