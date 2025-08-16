// src/lib/gtag.ts

// ---- Types for gtag ----
type Gtag = (
  ...args:
    | [command: "js", date: Date]
    | [command: "config", targetId: string, config?: Record<string, unknown>]
    | [command: "event", action: string, params?: Record<string, unknown>]
) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

// Track a page view
export const pageview = (url: string) => {
  if (!GA_ID || typeof window === "undefined" || !window.gtag) return;
  window.gtag("config", GA_ID, { page_path: url });
};

// Track a custom event
export const event = (action: string, params: Record<string, unknown> = {}) => {
  if (!GA_ID || typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", action, params);
};
