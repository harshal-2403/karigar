import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { format, differenceInCalendarDays } from "date-fns";
import { API_ENDPOINTS } from "@/config/api";
import { DateRange } from "react-day-picker";
import { CalendarIcon, CheckCircle2, Clock, User, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

interface Worker {
  _id: string;
  name: string;
  phone: string;
  service: string;
  perDayCharges: number;
}

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worker: Worker | null;
  onBookingSuccess: () => void;
}

const BookingDialog = ({ open, onOpenChange, worker, onBookingSuccess }: BookingDialogProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingId, setBookingId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!dateRange?.from || !dateRange?.to) {
      setError(t("booking.selectDateRange") || "Please select check-in and check-out dates");
      return;
    }

    if (!selectedTime) {
      setError(t("booking.selectTime") || "Please select a time");
      return;
    }

    if (!worker) return;

    setIsLoading(true);

    try {
      if (!user?.id) {
        setError("Please login to continue");
        setIsLoading(false);
        return;
      }
      
      // Calculate total price based on days (inclusive)
      const dayCount = Math.max(1, differenceInCalendarDays(dateRange.to, dateRange.from) + 1);
      const totalPrice = dayCount * (worker.perDayCharges || 0);

      const safePerDay = Number(worker.perDayCharges);
      const safeTotal = Number.isFinite(totalPrice) ? totalPrice : 0;
      const userEmail = typeof user?.email === "string" ? user.email.trim() : "";
      if (!userEmail) {
        setError("Your account has no email. Log out and log in again, or re-register.");
        setIsLoading(false);
        return;
      }

      const bookingData = {
        workerId: worker._id,
        workerName: worker.name,
        workerPhone: worker.phone,
        service: worker.service,
        userId: user.id,
        userName: user.name || user.email.split("@")[0] || "User",
        userEmail,
        startDate: format(dateRange.from, "yyyy-MM-dd"),
        endDate: format(dateRange.to, "yyyy-MM-dd"),
        time: selectedTime,
        status: "pending",
        perDayCharges: Number.isFinite(safePerDay) ? safePerDay : 0,
        totalPrice: safeTotal,
        dayCount: dayCount,
      };

      const response = await fetch(API_ENDPOINTS.CREATE_BOOKING, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      const raw = await response.text();
      let data: { message?: string; detail?: string; id?: string } = {};
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        throw new Error(
          `Server returned non-JSON (${response.status}). Is the backend running on port 8080?`
        );
      }

      if (!response.ok) {
        const extra = data.detail ? ` — ${data.detail}` : "";
        throw new Error((data.message || "Booking failed") + extra);
      }

      setIsLoading(false);
      // Show confirmation
      setBookingId(data.id || "success");
      setShowConfirmation(true);
      onBookingSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("booking.error") || "Failed to create booking");
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (showConfirmation) {
      // Reset everything after showing confirmation
      setDateRange(undefined);
      setSelectedTime("");
      setShowConfirmation(false);
      setBookingId("");
      onOpenChange(false);
    } else {
      onOpenChange(false);
    }
  };

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
  ];

  const dayCount = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    return Math.max(1, differenceInCalendarDays(dateRange.to, dateRange.from) + 1);
  }, [dateRange]);

  const totalPrice = useMemo(() => {
    if (!worker) return 0;
    return dayCount * (worker.perDayCharges || 0);
  }, [dayCount, worker]);

  if (showConfirmation) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="flex flex-col items-center text-center py-6">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <DialogTitle className="text-2xl font-bold mb-2">
              {t("booking.confirmed") || "Booking Confirmed!"}
            </DialogTitle>
            <DialogDescription className="text-base mb-6">
              {t("booking.confirmationMessage") || "Your booking has been confirmed successfully."}
            </DialogDescription>
            {worker && dateRange?.from && dateRange?.to && (
              <div className="w-full space-y-4 bg-muted/50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("booking.worker") || "Worker"}</span>
                  <span className="font-semibold">{worker.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("booking.checkIn") || "Check-in"}</span>
                  <span className="font-semibold">{format(dateRange.from, "MMM dd, yyyy")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("booking.checkOut") || "Check-out"}</span>
                  <span className="font-semibold">{format(dateRange.to, "MMM dd, yyyy")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("booking.time") || "Time"}</span>
                  <span className="font-semibold">{selectedTime}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm font-semibold">{t("booking.total") || "Total Amount"}</span>
                  <span className="text-lg font-bold text-primary">₹{totalPrice}</span>
                </div>
              </div>
            )}
            <Button onClick={handleClose} className="w-full">
              {t("booking.close") || "Close"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{t("booking.title") || `Book ${worker?.name}`}</DialogTitle>
          <DialogDescription className="text-base">
            {t("booking.description") || "Select your dates and time to book this worker"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Worker Info Card */}
          {worker && (
            <div className="rounded-lg border bg-card p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{worker.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{t(`services.${worker.service}`)}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-sm text-muted-foreground">{t("booking.perDay") || "Per Day"}: </span>
                    <span className="text-lg font-bold text-primary">₹{worker.perDayCharges}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Date Range Selection */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">{t("booking.selectDates") || "Select Dates"}</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">{t("booking.checkIn") || "Check-in Date"}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange?.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? format(dateRange.from, "PPP") : (
                        <span>{t("booking.selectCheckIn") || "Select check-in date"}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange?.from}
                      onSelect={(date) => {
                        if (date) {
                          setDateRange({ from: date, to: dateRange?.to });
                        }
                      }}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">{t("booking.checkOut") || "Check-out Date"}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange?.to && "text-muted-foreground"
                      )}
                      disabled={!dateRange?.from}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.to ? format(dateRange.to, "PPP") : (
                        <span>{t("booking.selectCheckOut") || "Select check-out date"}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange?.to}
                      onSelect={(date) => {
                        if (date && dateRange?.from) {
                          if (date < dateRange.from) {
                            setDateRange({ from: date, to: dateRange.from });
                          } else {
                            setDateRange({ from: dateRange.from, to: date });
                          }
                        }
                      }}
                      disabled={(date) => 
                        !dateRange?.from || date < dateRange.from || date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label htmlFor="time" className="text-base font-semibold">
              <Clock className="inline h-4 w-4 mr-2" />
              {t("booking.selectTime") || "Select Time"}
            </Label>
            <select
              id="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="flex h-12 w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">{t("booking.selectTime") || "Select time"}</option>
              {timeSlots.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          {/* Price Breakdown */}
          {dateRange?.from && dateRange?.to && worker && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
              <h4 className="font-semibold">{t("booking.priceBreakdown") || "Price Breakdown"}</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    ₹{worker.perDayCharges} × {dayCount} {dayCount === 1 ? (t("booking.day") || "day") : (t("booking.days") || "days")}
                  </span>
                  <span className="font-medium">₹{worker.perDayCharges * dayCount}</span>
                </div>
                <div className="border-t pt-2 flex items-center justify-between">
                  <span className="font-semibold">{t("booking.total") || "Total Amount"}</span>
                  <span className="text-xl font-bold text-primary">₹{totalPrice}</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
              {error}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose} className="w-full sm:w-auto">
              {t("booking.cancel") || "Cancel"}
            </Button>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {t("booking.payDirectly") || "Pay Directly to labour"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
