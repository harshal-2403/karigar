import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { Calendar, Clock, IndianRupee, User, Wrench, Wallet, CheckCircle2 } from "lucide-react";
import { API_ENDPOINTS } from "@/config/api";
import { cn } from "@/lib/utils";

interface Booking {
  id?: string;
  _id?: string;
  workerName: string;
  service: string;
  startDate: string;
  endDate: string;
  time: string;
  totalPrice?: number;
  status?: string;
  perDayCharges?: number;
  dayCount?: number;
}

type BookingFilter = "all" | "pending" | "completed";

const Profile = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [bookingFilter, setBookingFilter] = useState<BookingFilter>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const bookingKey = (b: Booking) => b.id || b._id || "";

  const loadBookings = useCallback(async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      setError("");
      const params = new URLSearchParams({ userId: user.id });
      if (bookingFilter !== "all") {
        params.set("status", bookingFilter);
      }
      const res = await fetch(`${API_ENDPOINTS.GET_BOOKINGS}?${params.toString()}`);
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || `HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (data.bookings && Array.isArray(data.bookings)) {
        setBookings(data.bookings);
      } else if (Array.isArray(data)) {
        setBookings(data);
      } else {
        setBookings([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings. Please check if the server is running.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, bookingFilter]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user) {
      navigate("/login");
      return;
    }
    loadBookings();
  }, [authLoading, isAuthenticated, user, navigate, loadBookings]);

  const handlePayToPerson = (booking: Booking) => {
    alert(`${t("profile.payToPersonAlert") || "Please pay"} ₹${booking.totalPrice || 0} ${t("profile.directlyTo") || "directly to"} ${booking.workerName}`);
  };

  const handleMarkCompleted = async (booking: Booking) => {
    const id = bookingKey(booking);
    if (!user?.id || !id) return;
    setUpdatingId(id);
    setError("");
    try {
      const res = await fetch(API_ENDPOINTS.UPDATE_BOOKING_STATUS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          bookingId: id,
          status: "completed",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || t("profile.updateStatusError"));
      }
      await loadBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("profile.updateStatusError"));
    } finally {
      setUpdatingId(null);
    }
  };

  const statusLabel = (raw?: string) => {
    const s = (raw || "pending").toLowerCase();
    if (s === "completed") return t("profile.statusCompleted");
    if (s === "confirmed") return t("profile.statusConfirmed");
    if (s === "cancelled") return t("profile.statusCancelled");
    return t("profile.statusPending");
  };

  const statusBadgeClass = (raw?: string) => {
    const s = (raw || "pending").toLowerCase();
    if (s === "completed" || s === "confirmed") return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200";
    if (s === "cancelled") return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200";
    return "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100";
  };

  if (authLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 pt-28 max-w-6xl">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                {authLoading ? "Loading…" : "Redirecting to login…"}
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const emptyTitle =
    bookingFilter === "pending"
      ? t("profile.noPendingBookings")
      : bookingFilter === "completed"
        ? t("profile.noCompletedBookings")
        : t("profile.noBookings");

  const emptyDescription =
    bookingFilter === "all"
      ? t("profile.noBookingsDescription")
      : bookingFilter === "pending"
        ? t("profile.emptyPendingHint")
        : t("profile.emptyCompletedHint");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-20 pt-28 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{t("profile.title") || "Your Profile"}</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{user.name}</span>
            <span>•</span>
            <span>{user.email}</span>
          </div>
        </div>

        <div className="mb-6 space-y-4">
          <h2 className="text-2xl font-semibold">{t("profile.myBookings") || "My Bookings"}</h2>
          <Tabs value={bookingFilter} onValueChange={(v) => setBookingFilter(v as BookingFilter)} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3 h-auto p-1">
              <TabsTrigger value="all" className="text-sm">
                {t("profile.filterAll")}
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-sm">
                {t("profile.filterPending")}
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-sm">
                {t("profile.filterCompleted")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">{t("profile.loading") || "Loading bookings..."}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 mb-6">
            <p className="text-destructive text-sm">{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => loadBookings()}>
              {t("profile.retry") || "Retry"}
            </Button>
          </div>
        )}

        {!isLoading && !error && bookings.length === 0 && (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <Calendar className="h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold mb-2">{emptyTitle}</h3>
                <p className="text-muted-foreground text-sm">{emptyDescription}</p>
              </div>
              <Button onClick={() => navigate("/")}>{t("profile.browseWorkers") || "Browse Workers"}</Button>
            </div>
          </Card>
        )}

        {!isLoading && !error && bookings.length > 0 && (
          <div className="grid gap-6">
            {bookings.map((booking) => {
              const st = (booking.status || "pending").toLowerCase();
              const canMarkCompleted = st === "pending";
              return (
                <Card key={bookingKey(booking)} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl mb-2">{booking.workerName}</CardTitle>
                        <CardDescription className="flex flex-wrap items-center gap-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Wrench className="h-4 w-4 shrink-0" />
                            <span className="font-medium capitalize">{booking.service}</span>
                          </div>
                          <span className="hidden sm:inline">•</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 shrink-0" />
                            <span>
                              {format(new Date(booking.startDate), "MMM dd, yyyy")} –{" "}
                              {format(new Date(booking.endDate), "MMM dd, yyyy")}
                            </span>
                          </div>
                          <span className="hidden sm:inline">•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 shrink-0" />
                            <span>{booking.time}</span>
                          </div>
                        </CardDescription>
                      </div>
                      <div
                        className={cn(
                          "shrink-0 px-3 py-1 rounded-full text-xs font-medium capitalize",
                          statusBadgeClass(booking.status)
                        )}
                      >
                        {statusLabel(booking.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{t("profile.perDay") || "Per Day"}</span>
                          <span className="font-semibold">₹{Number(booking.perDayCharges) || 0}</span>
                        </div>
                        {booking.dayCount != null && booking.dayCount > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{t("profile.days") || "Days"}</span>
                            <span className="font-semibold">{booking.dayCount}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-base pt-2 border-t">
                          <span className="font-semibold">{t("profile.total") || "Total Amount"}</span>
                          <span className="text-xl font-bold text-primary flex items-center gap-1">
                            <IndianRupee className="h-5 w-5" />
                            {booking.totalPrice ?? 0}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 md:justify-end">
                        {canMarkCompleted && (
                          <p className="text-xs text-muted-foreground md:text-right">{t("profile.markCompletedHint")}</p>
                        )}
                        <div className="flex flex-col sm:flex-row gap-2">
                          {canMarkCompleted && (
                            <Button
                              variant="secondary"
                              className="w-full sm:flex-1"
                              disabled={updatingId === bookingKey(booking)}
                              onClick={() => handleMarkCompleted(booking)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              {updatingId === bookingKey(booking) ? "…" : t("profile.markCompleted")}
                            </Button>
                          )}
                          <Button
                            variant="default"
                            onClick={() => handlePayToPerson(booking)}
                            className="w-full sm:flex-1"
                          >
                            <Wallet className="h-4 w-4 mr-2" />
                            {t("profile.payToPerson") || "Pay to Person"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
