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
  | "plain"
  | "floating"
  | "split"
  | "transparent"
  | "local"
  | "centered"
  | "boxed"
  | "classic"
  | "compact";

interface BusinessInfo {
  phone?: string;
  serviceArea?: string;
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
  variant = "local",
}: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const isLocalLike =
    variant === "local" || variant === "classic" || variant === "boxed";

  const phoneHref = business?.phone
    ? `tel:${business.phone.replace(/[^\d+]/g, "")}`
    : undefined;

  function closeMenu() {
    setOpen(false);
    window.requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }

  useEffect(() => {
    // eslint-disable-next-line @eslint-react/set-state-in-effect -- gate createPortal until after hydration
    setMounted(true);
  }, []);

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
        aria-label="Menü schließen"
        onClick={closeMenu}
      />

      <div className="bg-background text-foreground relative flex [min-height:100dvh] w-full flex-col overflow-y-auto shadow-2xl">
        <div className="border-border flex items-center justify-between gap-4 border-b px-5 py-5">
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
            aria-label="Menü schließen"
          >
            <XIcon className="h-6 w-6" />
          </Button>
        </div>

        <div className="px-5 pt-6 pb-8">
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.22em] uppercase">
            Navigation
          </p>

          <nav id="mobile-navigation" className="mt-5 grid gap-3">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group border-border bg-card hover:bg-muted flex items-center justify-between rounded-[1.75rem] border px-5 py-4 text-xl font-semibold tracking-tight shadow-sm transition-colors"
                onClick={closeMenu}
              >
                <span>{link.label}</span>
                <ArrowRightIcon className="text-muted-foreground h-5 w-5 transition-transform group-hover:translate-x-1" />
              </a>
            ))}
          </nav>
        </div>

        <div className="border-border bg-surface-tint mt-auto border-t px-5 py-6">
          {isLocalLike && (
            <div className="mb-5 grid gap-3 text-sm">
              {business?.serviceArea && (
                <div className="flex items-start gap-3">
                  <MapPinIcon className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                  <span className="text-muted-foreground">
                    {business.serviceArea}
                  </span>
                </div>
              )}

              {business?.hours && (
                <div className="flex items-start gap-3">
                  <ClockIcon className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                  <span className="text-muted-foreground">
                    {business.hours}
                  </span>
                </div>
              )}

              {business?.phone && phoneHref && (
                <a
                  href={phoneHref}
                  className="text-foreground flex items-start gap-3 font-semibold"
                  onClick={closeMenu}
                >
                  <PhoneIcon className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                  <span>{business.phone}</span>
                </a>
              )}
            </div>
          )}

          {cta && (
            <a
              href={cta.href}
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex w-full items-center justify-center rounded-full px-5 py-4 text-base font-semibold shadow-sm transition-colors"
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
        <span className="sr-only">Menü öffnen</span>
      </Button>

      {mounted && open ? createPortal(menu, document.body) : null}
    </div>
  );
}
