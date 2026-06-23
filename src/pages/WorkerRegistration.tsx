import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, CheckCircle2, MapPin } from "lucide-react";
import { API_ENDPOINTS } from "@/config/api";
import { useToast } from "@/hooks/use-toast";

const WorkerRegistration = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    location: "",
    fullAddress: "",
    pincode: "",
    latitude: "",
    longitude: "",
    experience: "",
    perDayCharges: "",
    description: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<
    Array<{
      displayName: string;
      address: { postcode?: string; city?: string; town?: string; village?: string; state_district?: string };
      lat: string;
      lon: string;
    }>
  >([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [locationSearchError, setLocationSearchError] = useState("");

  // Fetch location suggestions from OpenStreetMap Nominatim
  useEffect(() => {
    const controller = new AbortController();

    const fetchSuggestions = async () => {
      if (!locationQuery || locationQuery.length < 3) {
        setLocationSuggestions([]);
        setIsSearchingLocation(false);
        return;
      }
      try {
        setIsSearchingLocation(true);
        setLocationSearchError("");
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(locationQuery)}`;
        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            "Accept-Language": "en",
          },
        });
        if (!res.ok) throw new Error("Failed to fetch location suggestions");
        const data = await res.json();
        const mapped = data.map((item: any) => ({
          displayName: item.display_name as string,
          address: item.address || {},
          lat: item.lat,
          lon: item.lon,
        }));
        setLocationSuggestions(mapped);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("Error fetching location suggestions:", err);
        setLocationSearchError("Unable to fetch location suggestions");
      } finally {
        setIsSearchingLocation(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [locationQuery]);

  const handleSelectLocation = (suggestion: {
    displayName: string;
    address: { postcode?: string; city?: string; town?: string; village?: string; state_district?: string };
    lat: string;
    lon: string;
  }) => {
    const pincode = suggestion.address.postcode || "";
    const cityName =
      suggestion.address.city ||
      suggestion.address.town ||
      suggestion.address.village ||
      suggestion.address.state_district ||
      "";

    setFormData((prev) => ({
      ...prev,
      location: cityName || suggestion.displayName,
      fullAddress: suggestion.displayName,
      pincode: pincode,
      latitude: suggestion.lat,
      longitude: suggestion.lon,
    }));
    setLocationQuery(suggestion.displayName);
    setLocationSuggestions([]);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate required fields
    if (!formData.name || !formData.phone || !formData.email || !formData.service || !formData.location || !formData.fullAddress || !formData.pincode || !formData.perDayCharges) {
      setError(t("workerRegistration.validationError") || "Please fill in all required fields including full address and pincode");
      return;
    }

    // Validate pincode is 6 digits
    if (!/^\d{6}$/.test(formData.pincode)) {
      setError(t("workerRegistration.invalidPincode") || "Please enter a valid 6-digit pincode");
      return;
    }

    // Validate per day charges is a number
    if (isNaN(Number(formData.perDayCharges)) || Number(formData.perDayCharges) <= 0) {
      setError(t("workerRegistration.invalidCharges") || "Please enter a valid per day charges amount");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Send data to backend API
      const response = await fetch(API_ENDPOINTS.REGISTER_WORKER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          perDayCharges: Number(formData.perDayCharges), // Convert to number
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Success
      toast({
        title: t("workerRegistration.successTitle") || "Registration successful",
        description:
          t("workerRegistration.successMessage") ||
          "Your worker profile has been submitted. Redirecting to home…",
      });
      setIsSubmitted(true);
      
      // Redirect to home after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error('Error registering worker:', err);
      setError(err instanceof Error ? err.message : t("workerRegistration.submitError") || "Failed to submit registration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center pt-20">
          <div className="container max-w-md text-center">
            <div className="mb-6 flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-primary" />
            </div>
            <h1 className="mb-4 text-3xl font-bold">{t("workerRegistration.successTitle")}</h1>
            <p className="mb-8 text-muted-foreground">{t("workerRegistration.successMessage")}</p>
            <Button onClick={() => navigate("/")}>{t("workerRegistration.backToHome")}</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container py-20 pt-28">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("workerRegistration.back")}
        </Button>

        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-bold">{t("workerRegistration.title")}</h1>
            <p className="text-muted-foreground">{t("workerRegistration.subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-card p-6 shadow-sm">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">{t("workerRegistration.name")} *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder={t("workerRegistration.namePlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t("workerRegistration.phone")} *</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder={t("workerRegistration.phonePlaceholder")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("workerRegistration.email")} *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder={t("workerRegistration.emailPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service">{t("workerRegistration.service")} *</Label>
              <Select
                value={formData.service}
                onValueChange={(value) => handleInputChange("service", value)}
              >
                <SelectTrigger id="service">
                  <SelectValue placeholder={t("workerRegistration.servicePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="carpenter">{t("services.carpenter")}</SelectItem>
                  <SelectItem value="plumber">{t("services.plumber")}</SelectItem>
                  <SelectItem value="electrician">{t("services.electrician")}</SelectItem>
                  <SelectItem value="painter">{t("services.painter")}</SelectItem>
                  <SelectItem value="dailyLabour">{t("services.dailyLabour")}</SelectItem>
                  <SelectItem value="cleaning">{t("services.cleaning")}</SelectItem>
                  <SelectItem value="makeupArtist">{t("services.makeupArtist")}</SelectItem>
                  <SelectItem value="locksmith">{t("services.locksmith")}</SelectItem>
                  <SelectItem value="carMechanic">{t("services.carMechanic")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">{t("workerRegistration.location")} *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  required
                  value={locationQuery || formData.location}
                  onChange={(e) => {
                    setLocationQuery(e.target.value);
                    handleInputChange("location", e.target.value);
                    // Allow user to edit address manually if needed
                    if (!formData.fullAddress) {
                      handleInputChange("fullAddress", e.target.value);
                    }
                  }}
                  placeholder={t("workerRegistration.locationPlaceholder")}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t("workerRegistration.locationHelper")}
              </p>
              {isSearchingLocation && (
                <p className="text-xs text-muted-foreground">{t("workerRegistration.searching")}</p>
              )}
              {locationSearchError && (
                <p className="text-xs text-destructive">{locationSearchError}</p>
              )}
              {locationSuggestions.length > 0 && (
                <div className="mt-2 rounded-lg border bg-card shadow-sm divide-y">
                  {locationSuggestions.map((suggestion, idx) => (
                    <button
                      type="button"
                      key={idx}
                      className="w-full text-left px-3 py-2 hover:bg-muted transition-colors"
                      onClick={() => handleSelectLocation(suggestion)}
                    >
                      <p className="text-sm text-foreground">{suggestion.displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        {suggestion.address.postcode ? `PIN: ${suggestion.address.postcode}` : ""}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullAddress">{t("workerRegistration.fullAddress")} *</Label>
              <Textarea
                id="fullAddress"
                required
                value={formData.fullAddress}
                onChange={(e) => handleInputChange("fullAddress", e.target.value)}
                placeholder={t("workerRegistration.fullAddressPlaceholder")}
                rows={3}
                readOnly
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                {t("workerRegistration.fullAddressHelper")}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pincode">{t("workerRegistration.pincode")} *</Label>
              <Input
                id="pincode"
                required
                type="text"
                maxLength={6}
                value={formData.pincode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ''); // Only numbers
                  handleInputChange("pincode", value);
                }}
                placeholder={t("workerRegistration.pincodePlaceholder")}
                readOnly={!!formData.pincode}
                className={formData.pincode ? "bg-muted" : ""}
              />
              <p className="text-xs text-muted-foreground">
                {t("workerRegistration.pincodeHelper")}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="experience">{t("workerRegistration.experience")}</Label>
                <Input
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => handleInputChange("experience", e.target.value)}
                  placeholder={t("workerRegistration.experiencePlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="perDayCharges">{t("workerRegistration.perDayCharges")} *</Label>
                <Input
                  id="perDayCharges"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.perDayCharges}
                  onChange={(e) => handleInputChange("perDayCharges", e.target.value)}
                  placeholder={t("workerRegistration.perDayChargesPlaceholder")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("workerRegistration.description")}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder={t("workerRegistration.descriptionPlaceholder")}
                rows={4}
              />
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? t("workerRegistration.submitting") : t("workerRegistration.submit")}
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default WorkerRegistration;