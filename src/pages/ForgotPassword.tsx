import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { API_ENDPOINTS } from "@/config/api";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);
    try {
      const res = await fetch(API_ENDPOINTS.AUTH_FORGOT_PASSWORD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        throw new Error(data.message || "Request failed");
      }
      setMessage(data.message || "If an account exists for this email, a verification code has been sent.");
      setStep("reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);
    try {
      const res = await fetch(API_ENDPOINTS.AUTH_RESET_PASSWORD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
          newPassword,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        throw new Error(data.message || "Reset failed");
      }
      navigate("/login", { state: { resetMessage: data.message }, replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container max-w-md py-20 pt-28">
        <h1 className="text-3xl font-bold mb-2">Forgot password</h1>
        <p className="text-muted-foreground text-sm mb-6">
          {step === "request"
            ? "Enter your email and we will send a verification code."
            : "Enter the code from your email and choose a new password."}
        </p>

        {step === "request" ? (
          <form
            onSubmit={handleRequestOtp}
            className="space-y-4 rounded-lg border bg-card p-6 shadow-sm"
          >
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending…" : "Send verification code"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              <Link to="/login" className="underline">
                Back to log in
              </Link>
            </p>
          </form>
        ) : (
          <form
            onSubmit={handleResetPassword}
            className="space-y-4 rounded-lg border bg-card p-6 shadow-sm"
          >
            {message && (
              <p className="text-sm text-emerald-600" role="status">
                {message}
              </p>
            )}
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="email-readonly">Email</Label>
              <Input id="email-readonly" type="email" value={email} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="otp">Verification code</Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Resetting…" : "Reset password"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              <button
                type="button"
                className="underline"
                onClick={() => {
                  setStep("request");
                  setOtp("");
                  setNewPassword("");
                  setError("");
                  setMessage("");
                }}
              >
                Request a new code
              </button>
            </p>
          </form>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
