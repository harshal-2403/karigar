import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

const UserLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const syncError = searchParams.get("error") === "sync";
  const { login, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container max-w-md py-20 pt-28">
        <h1 className="text-3xl font-bold mb-2">Log In</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          Sign in with your Auth0 account. You will be redirected to the secure Auth0 login page.
        </p>
        <div className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
          {syncError && (
            <p className="text-sm text-destructive" role="alert">
              Could not sync your account with the app server. Check that the backend is running and try
              again.
            </p>
          )}
          <Button type="button" className="w-full" disabled={isLoading} onClick={() => login()}>
            {isLoading ? "Please wait…" : "Continue with Auth0"}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Don&apos;t have an account?{" "}
            <button type="button" className="underline" onClick={() => navigate("/register-user")}>
              Create one
            </button>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserLogin;
