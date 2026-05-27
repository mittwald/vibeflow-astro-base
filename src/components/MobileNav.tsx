"use client";

import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { NavLink } from "@/config";

export function MobileNav({ links, name }: { links: NavLink[]; name: string }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <MenuIcon className="h-5 w-5" />
          <span className="sr-only">Menü öffnen</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" showCloseButton={false}>
        <div className="flex h-full flex-col">
          <SheetHeader className="border-border border-b px-6 py-5">
            <SheetTitle>
              <a href="/" className="text-lg font-semibold">
                {name}
              </a>
            </SheetTitle>
            <SheetDescription className="sr-only">
              Hauptnavigation
            </SheetDescription>
          </SheetHeader>

          <nav className="flex flex-1 flex-col gap-1 px-4 py-4">
            {links.map((link) =>
              link.items && link.items.length > 0 ? (
                <div key={link.label} className="py-1">
                  <p className="text-muted-foreground px-3 py-2 text-sm font-medium">
                    {link.label}
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {link.items.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="text-foreground hover:bg-muted rounded-md px-3 py-2.5 pl-6 text-base transition-colors"
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-foreground hover:bg-muted rounded-md px-3 py-3 text-base font-medium transition-colors"
                >
                  {link.label}
                </a>
              ),
            )}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
