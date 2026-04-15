"use client";

import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface NavLink {
  label: string;
  href: string;
}

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
          </SheetHeader>

          <nav className="flex flex-1 flex-col gap-1 px-4 py-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-foreground hover:bg-muted rounded-md px-3 py-3 text-base font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
