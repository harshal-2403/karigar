import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

const UserRegister = () => {
  const navigate = useNavigate();
  const { loginSignup, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container max-w-md py-20 pt-28">
        <h1 className="text-3xl font-bold mb-2">Create Account</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          Sign up with Auth0. You will use the same secure login page with sign-up enabled.
        </p>
        <div className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
          <Button type="button" className="w-full" disabled={isLoading} onClick={() => loginSignup()}>
            {isLoading ? "Please wait…" : "Sign up with Auth0"}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <button type="button" className="underline" onClick={() => navigate("/login")}>
              Log in
            </button>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserRegister;
