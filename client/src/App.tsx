import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import FormBuilder from "@/pages/form-builder";
import FormFill from "@/pages/form-fill";

function Router() {
  return (
    <Switch>
      <Route path="/" component={FormBuilder} />
      <Route path="/builder" component={FormBuilder} />
      <Route path="/builder/:id" component={FormBuilder} />
      <Route path="/fill/:shareUrl" component={FormFill} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
