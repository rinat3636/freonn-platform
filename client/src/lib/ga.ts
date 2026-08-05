/**
 * Google Analytics 4 (GA4) helper
 * Measurement ID: G-1FWHX01PWY
 *
 * Usage:
 *   import { gaEvent, gaPageView } from '@/lib/ga';
 *   gaEvent('calculator_submit', { category: 'lead', label: 'calculator' });
 *   gaEvent('phone_click', { category: 'contact' });
 *   gaEvent('messenger_click', { category: 'contact' });
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const GA_MEASUREMENT_ID = "G-1FWHX01PWY" as const;

/**
 * Send a custom event to GA4
 */
export function gaEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, {
      send_to: GA_MEASUREMENT_ID,
      ...params,
    });
  }
}

/**
 * Send a page_view event to GA4 (for SPA navigation)
 */
export function gaPageView(path: string, title?: string): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      send_to: GA_MEASUREMENT_ID,
      page_path: path,
      page_title: title ?? document.title,
      page_location: window.location.href,
    });
  }
}

/**
 * Convenience: track calculator form submission
 */
export function gaCalculatorSubmit(): void {
  gaEvent('calculator_submit', {
    event_category: 'lead',
    event_label: 'calculator',
  });
}

/**
 * Convenience: track phone click
 */
export function gaPhoneClick(): void {
  gaEvent('phone_click', {
    event_category: 'contact',
    event_label: 'phone',
  });
}

/**
 * Convenience: track messenger click
 */
export function gaMessengerClick(): void {
  gaEvent('messenger_click', {
    event_category: 'contact',
    event_label: 'messenger',
  });
}
