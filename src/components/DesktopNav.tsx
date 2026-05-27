"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import type { NavLink } from "@/config";
import { cn } from "@/lib/utils";

function isActive(href: string | undefined, currentPath: string) {
  if (!href) return false;
  return currentPath === href || currentPath === href + "/";
}

export function DesktopNav({
  links,
  currentPath,
}: {
  links: NavLink[];
  currentPath: string;
}) {
  if (links.length === 0) return null;

  return (
    <NavigationMenu viewport={false} className="hidden md:flex">
      <NavigationMenuList className="gap-6">
        {links.map((link) => {
          // Eintrag mit Unterlinks → Hover-Dropdown
          if (link.items && link.items.length > 0) {
            const active = link.items.some((item) =>
              isActive(item.href, currentPath),
            );
            return (
              <NavigationMenuItem key={link.label}>
                <NavigationMenuTrigger
                  className={cn(
                    "h-auto gap-1 bg-transparent px-0 py-0 text-sm font-normal hover:bg-transparent focus:bg-transparent data-open:bg-transparent data-popup-open:bg-transparent",
                    active
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground data-open:text-foreground",
                  )}
                >
                  {link.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-48 gap-0.5 p-1.5">
                    {link.items.map((item) => (
                      <li key={item.href}>
                        <NavigationMenuLink
                          asChild
                          active={isActive(item.href, currentPath)}
                        >
                          <a href={item.href}>{item.label}</a>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            );
          }

          // Einfacher Link (kein Dropdown)
          const active = isActive(link.href, currentPath);
          return (
            <NavigationMenuItem key={link.href ?? link.label}>
              <a
                href={link.href}
                className={cn(
                  "text-sm transition-colors",
                  active
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </a>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
