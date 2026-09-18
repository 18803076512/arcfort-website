import type { ReactNode } from "react";

type SectionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  labelledBy?: string;
};

export function Section({ children, className = "", id, labelledBy }: SectionProps) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={`section-space ${className}`}>
      {children}
    </section>
  );
}
