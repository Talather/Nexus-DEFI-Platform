"use client";

import clsx from "clsx";

export function SkeletonLoader({ className, variant = "default" }: { className?: string; variant?: "default" | "card" | "stat" | "table-row" }) {
  if (variant === "card") {
    return (
      <div className={clsx("glass-card p-6 animate-pulse", className)}>
        <div className="h-4 bg-nexus-dark-border rounded w-1/3 mb-4" />
        <div className="h-8 bg-nexus-dark-border rounded w-2/3 mb-2" />
        <div className="h-4 bg-nexus-dark-border rounded w-1/2" />
      </div>
    );
  }

  if (variant === "stat") {
    return (
      <div className={clsx("glass-card p-6 animate-pulse", className)}>
        <div className="flex justify-between mb-4">
          <div className="h-10 w-10 bg-nexus-dark-border rounded-xl" />
          <div className="h-4 w-12 bg-nexus-dark-border rounded" />
        </div>
        <div className="h-3 bg-nexus-dark-border rounded w-20 mb-2" />
        <div className="h-7 bg-nexus-dark-border rounded w-32" />
      </div>
    );
  }

  if (variant === "table-row") {
    return (
      <div className={clsx("flex items-center gap-4 p-4 animate-pulse", className)}>
        <div className="h-8 w-8 bg-nexus-dark-border rounded-full" />
        <div className="h-4 bg-nexus-dark-border rounded flex-1" />
        <div className="h-4 bg-nexus-dark-border rounded w-20" />
        <div className="h-4 bg-nexus-dark-border rounded w-16" />
      </div>
    );
  }

  return <div className={clsx("bg-nexus-dark-border rounded animate-pulse", className)} />;
}
