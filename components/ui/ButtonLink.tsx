import Link from "next/link";
import type { ReactNode } from "react";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "onDark";
  className?: string;
};

const variantClasses = {
  primary: "button-primary",
  secondary: "button-secondary",
  onDark: "button-on-dark",
} as const;

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonLinkProps) {
  return (
    <Link href={href} className={`button-base ${variantClasses[variant]} ${className}`}>
      {children}
    </Link>
  );
}
