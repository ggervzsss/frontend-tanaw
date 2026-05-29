import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { TOAST_DURATION_MS } from "@/shared/config/app.config";
import { queryClient } from "@/shared/lib/queryClient";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
        <Toaster position="top-right" toastOptions={{ duration: TOAST_DURATION_MS }} />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
