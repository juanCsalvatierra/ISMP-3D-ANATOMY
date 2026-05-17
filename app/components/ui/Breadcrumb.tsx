"use client";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-1 px-4 py-2 ui-mono text-xs text-muted">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className="flex items-center gap-1">
            {index > 0 && <span className="text-muted opacity-50">/</span>}
            {item.href && !isLast ? (
              <Link href={item.href} className="ui-link hover:text-accent transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-foreground" : "text-muted"}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
