"use client";

import { useEffect, useRef, useState } from "react";

import { createPortal } from "react-dom";
import {
  ArrowRightIcon,
  ClockIcon,
  MapPinIcon,
  MenuIcon,
  PhoneIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavLink {
  label: string;
  href: string;
}

type MobileNavVariant =
  | "local-minimal"
  | "trade-service"
  | "restaurant-reservation"
  | "practice-appointment"
  | "studio-booking"
  | "heritage"
  | "compact-logo-cta"
  | "plain"
  | "floating"
  | "split"
  | "transparent"
  | "local"
  | "centered"
  | "boxed";

interface BusinessInfo {
  phone?: string;
  serviceArea?: string;
  address?: string;
  hours?: string;
}

interface MobileNavProps {
  links: readonly NavLink[];
  name: string;
  cta?: NavLink;
  business?: BusinessInfo;
  variant?: MobileNavVariant;
}

export function MobileNav({
  links,
  name,
  cta,
  business,
  variant = "local-minimal",
}: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const phoneHref = business?.phone
    ? `tel:${business.phone.replace(/[^\d+]/g, "")}`
    : undefined;

  const isLocalLike = [
    "local-minimal",
    "trade-service",
    "restaurant-reservation",
    "practice-appointment",
    "local",
    "boxed",
  ].includes(variant);

  function closeMenu() {
    setOpen(false);
    window.requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    window.requestAnimationFrame(() => {
      closeRef.current?.focus();
    });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const menu = (
    <div
      className="fixed inset-0 z-[100] md:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-navigation-title"
    >
      <button
        className="absolute inset-0 bg-black/45"
        aria-label="Menue schliessen"
        onClick={closeMenu}
      />

      <div className="relative flex w-full flex-col overflow-y-auto bg-background text-foreground shadow-2xl [min-height:100dvh]">
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-5">
          <a
            href="/"
            id="mobile-navigation-title"
            className="font-heading text-xl font-semibold tracking-tight"
            onClick={closeMenu}
          >
            {name}
          </a>

          <Button
            ref={closeRef}
            variant="ghost"
            size="icon"
            onClick={closeMenu}
            aria-label="Menue schliessen"
          >
            <XIcon className="h-6 w-6" />
          </Button>
        </div>

        <div className="px-5 pb-8 pt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Navigation
          </p>

          <nav id="mobile-navigation" className="mt-5 grid gap-3">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group flex min-h-14 items-center justify-between rounded-[1.75rem] border border-border bg-card px-5 py-4 text-xl font-semibold tracking-tight shadow-sm transition-colors hover:bg-muted"
                onClick={closeMenu}
              >
                <span>{link.label}</span>
                <ArrowRightIcon className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-border bg-surface-tint px-5 py-6">
          {isLocalLike && (
            <div className="mb-5 grid gap-3 text-sm">
              {business?.serviceArea && (
                <div className="flex items-start gap-3">
                  <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{business.serviceArea}</span>
                </div>
              )}

              {business?.address && !business.serviceArea && (
                <div className="flex items-start gap-3">
                  <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{business.address}</span>
                </div>
              )}

              {business?.hours && (
                <div className="flex items-start gap-3">
                  <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{business.hours}</span>
                </div>
              )}

              {business?.phone && phoneHref && (
                <a
                  href={phoneHref}
                  className="flex items-start gap-3 font-semibold text-foreground"
                  onClick={closeMenu}
                >
                  <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{business.phone}</span>
                </a>
              )}
            </div>
          )}

          {cta && (
            <a
              href={cta.href}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-primary px-5 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              onClick={closeMenu}
            >
              {cta.label}
            </a>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="md:hidden">
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <MenuIcon className="h-6 w-6" />
        <span className="sr-only">Menue oeffnen</span>
      </Button>

      {open ? createPortal(menu, document.body) : null}
    </div>
  );
}
