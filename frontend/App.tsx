import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useSearchParams } from "react-router-dom";
import Index from "@/pages/Index";
import IntakeFlow from "@/pages/IntakeFlow";
import CheckIn from "@/pages/CheckIn";
import ClinicianDashboard from "@/pages/ClinicianDashboard";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

// Wrapper to handle remote param
const IntakeFlowWrapper = () => {
  const [searchParams] = useSearchParams();
  const isRemote = searchParams.get('remote') === 'true';
  return <IntakeFlow isRemote={isRemote} />;
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
