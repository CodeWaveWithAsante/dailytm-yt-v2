"use client";

import { useEffect } from "react";

/**
 * One observer and one pointer listener for the whole page, instead of a
 * client wrapper around every animated node — the sections stay Server
 * Components and just carry `data-reveal` / `.spotlight`.
 */
export function LandingEffects() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-shown", "");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.15 },
    );
    document
      .querySelectorAll("[data-reveal]")
      .forEach((node) => observer.observe(node));

    function onPointerMove(event: PointerEvent) {
      const card = (event.target as Element | null)?.closest<HTMLElement>(
        ".spotlight",
      );
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--x", `${event.clientX - rect.left}px`);
      card.style.setProperty("--y", `${event.clientY - rect.top}px`);
    }
    document.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      observer.disconnect();
      document.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return null;
}
