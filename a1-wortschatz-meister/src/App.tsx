import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Bootcamp from "./pages/Bootcamp";
import BootcampDay from "./pages/BootcampDay";
import GrammarHub, { GrammarTopicPage } from "./pages/GrammarHub";
import Mistakes from "./pages/Mistakes";
import AppNav from "./components/a2/AppNav";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppNav />
        <Routes>
          <Route path="/" element={<Bootcamp />} />
          <Route path="/day/:n" element={<BootcampDay />} />
          <Route path="/grammar" element={<GrammarHub />} />
          <Route path="/grammar/:id" element={<GrammarTopicPage />} />
          <Route path="/mistakes" element={<Mistakes />} />
          <Route path="/vocabulary" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
