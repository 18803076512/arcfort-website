"use client";

import { usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type MouseEvent,
} from "react";

type AutoClosingDetailsProps = Omit<ComponentPropsWithoutRef<"details">, "onClick" | "onKeyDown">;

export function AutoClosingDetails({ children, ...props }: AutoClosingDetailsProps) {
  const pathname = usePathname();
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (detailsRef.current?.open) {
      detailsRef.current.open = false;
    }
  }, [pathname]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const details = detailsRef.current;
      const target = event.target;

      if (details?.open && target instanceof Node && !details.contains(target)) {
        details.open = false;
      }
    }

    document.addEventListener("pointerdown", handlePointerDown, true);

    return () => document.removeEventListener("pointerdown", handlePointerDown, true);
  }, []);

  function handleClick(event: MouseEvent<HTMLDetailsElement>) {
    const target = event.target;

    if (target instanceof Element && target.closest("a[href]")) {
      detailsRef.current?.removeAttribute("open");
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDetailsElement>) {
    const details = detailsRef.current;

    if (event.key === "Escape" && details?.open) {
      event.preventDefault();
      details.open = false;
      details.querySelector<HTMLElement>("summary")?.focus();
    }
  }

  return (
    <details ref={detailsRef} onClick={handleClick} onKeyDown={handleKeyDown} {...props}>
      {children}
    </details>
  );
}
