import { useMemo, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useSearchParams } from "react-router-dom";
import Index from "@/pages/Index";
import IntakeFlow from "@/pages/IntakeFlow";
import CheckIn from "@/pages/CheckIn";
import ClinicianDashboard from "@/pages/ClinicianDashboard";
import NotFound from "@/pages/NotFound";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserCheck, ArrowRight, Home } from "lucide-react";

const queryClient = new QueryClient();

/**
 * In-clinic check-in gate shown BEFORE intake
 * - Collects first/last name + DOB
 * - Calls POST /api/checkin/checkin
 * - Navigates to /intake?session_token=... (and preserves remote param if present)
 */
const PatientCheckInGate = ({ isRemote }: { isRemote: boolean }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState(""); // expected format: YYYY-MM-DD
  const [isSubmitting, setIsSubmitting] = useState(false);

  const remoteParam = isRemote ? "remote=true&" : "";

  const handleCheckIn = async () => {
    if (!firstName.trim() || !lastName.trim() || !dob.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter first name, last name, and date of birth.",
        variant: "destructive",
      });
      return;
    }

    // Very light DOB validation (avoid blocking with strict parsing)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob.trim())) {
      toast({
        title: "Invalid date of birth format",
        description: "Please use YYYY-MM-DD (for example: 1990-01-01).",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/checkin/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          dob: dob.trim(),
        }),
      });

      if (!res.ok) {
        const raw = await res.text(); // read ONCE
        let msg = `Check-in failed (${res.status})`;
      
        try {
          const err = JSON.parse(raw);
          msg = err?.message || err?.detail?.[0]?.msg || msg;
        } catch {
          if (raw) msg = raw;
        }
      
        throw new Error(msg);
      }         

      const data = await res.json();

      const sessionToken =
        data?.session_token ||
        data?.intake?.session_token ||
        data?.result?.session_token;

      if (!sessionToken) {
        throw new Error("Check-in succeeded but no session_token was returned.");
      }

      // Optional: persist for refresh/reload convenience
      localStorage.setItem("session_token", sessionToken);

      toast({
        title: "Checked in",
        description: "Starting your intake now.",
      });

      navigate(`/intake?${remoteParam}session_token=${encodeURIComponent(sessionToken)}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast({
        title: "Check-in failed",
        description: msg,
        variant: "destructive",
      });
      // eslint-disable-next-line no-console
      console.error("Check-in error:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-slide-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Patient Check-In</h1>
          <p className="text-muted-foreground">
            Please confirm your name and date of birth to begin intake.
          </p>
        </div>

        <div className="intake-card space-y-4">
          <div>
            <Label className="form-label">First Name</Label>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" />
          </div>

          <div>
            <Label className="form-label">Last Name</Label>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
          </div>

          <div>
            <Label className="form-label">Date of Birth</Label>
            <Input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Format: YYYY-MM-DD (example: 1990-01-01)
            </p>
          </div>

          <Button className="w-full" onClick={handleCheckIn} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Continue to Intake
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <Button variant="ghost" className="w-full mt-4" onClick={() => navigate("/")}>
          <Home className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>
    </div>
  );
};

// Wrapper to handle remote param + session_token gate
const IntakeFlowWrapper = () => {
  const [searchParams] = useSearchParams();

  const isRemote = searchParams.get("remote") === "true";
  const sessionTokenFromQuery = searchParams.get("session_token");

  const sessionToken = useMemo(() => {
    return sessionTokenFromQuery || localStorage.getItem("session_token") || "";
  }, [sessionTokenFromQuery]);

  // - If NOT remote intake, require check-in before intake.
  // - If remote intake, allow starting intake directly (can change if you want).
  if (!isRemote && !sessionToken) {
    return <PatientCheckInGate isRemote={isRemote} />;
  }

  return <IntakeFlow isRemote={isRemote} sessionToken={sessionToken || undefined} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/intake" element={<IntakeFlowWrapper />} />
          <Route path="/checkin" element={<CheckIn />} />
          <Route path="/clinician" element={<ClinicianDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
