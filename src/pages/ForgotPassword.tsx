import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container max-w-md py-20 pt-28">
        <h1 className="text-3xl font-bold mb-2">Forgot password</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Password reset is handled by Auth0. Open the login screen and use the &quot;Forgot password&quot;
          link on the Auth0 page (or your identity provider&apos;s reset flow).
        </p>
        <div className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
          <Button type="button" className="w-full" disabled={isLoading} onClick={() => login()}>
            {isLoading ? "Please wait…" : "Go to Auth0 login"}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            <button type="button" className="underline" onClick={() => navigate("/login")}>
              Back to log in
            </button>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
