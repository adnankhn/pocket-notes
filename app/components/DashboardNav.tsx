"use client";

import { cn } from "@/lib/utils";
import { CreditCard, Home, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./UserNav";
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"


export function DashboardNav({ free_credits, subscription_status }: { free_credits: number, subscription_status:string }) {
  const pathname = usePathname();
  console.log(pathname);
  return (
    <nav className="grid items-start gap-2">
      {navItems.map((item, index) => (
        <Link key={index} href={item.href}>
          <span
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === item.href ? "bg-accent" : "bg-transparent"
            )}
          >
            <item.icon className="mr-2 h-4 w-4 text-primary" />
            <span>{item.name}</span>
          </span>
        </Link>
      ))}
      {subscription_status !== "active" && (
        <div className="mt-4">
          <Progress value={100 - (free_credits / 5) * 100} />
          <Label htmlFor="picture" className="p-1 mt-1 text-xs">Free credits remaining: { free_credits } / 5 </Label>
        </div>
      )}

    </nav>

  );
}
