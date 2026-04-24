"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { LoadingSpinner } from "@/components/loading-spinner";

function getInternalAnchor(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return null;
  }

  return target.closest("a[href]") as HTMLAnchorElement | null;
}

function getLoadingLabel(anchor: HTMLAnchorElement) {
  const custom = anchor.getAttribute("data-loading-label");

  if (custom) {
    return custom;
  }

  const text = anchor.textContent?.trim();

  if (text) {
    return `Opening ${text}...`;
  }

  return "Opening next screen...";
}

export function NavigationFeedback() {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const [label, setLabel] = useState("Opening next screen...");

  useEffect(() => {
    if (!pending) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setPending(false);
    }, 520);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [pathname, pending]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = getInternalAnchor(event.target);

      if (!anchor) {
        return;
      }

      if (anchor.target && anchor.target !== "_self") {
        return;
      }

      if (anchor.hasAttribute("download")) {
        return;
      }

      const href = anchor.getAttribute("href");

      if (!href || href.startsWith("#")) {
        return;
      }

      const destination = new URL(anchor.href, window.location.href);
      const current = new URL(window.location.href);

      if (destination.origin !== current.origin) {
        return;
      }

      if (
        destination.pathname === current.pathname &&
        destination.search === current.search
      ) {
        return;
      }

      setLabel(getLoadingLabel(anchor));
      setPending(true);
    }

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  return (
    <div
      className={`route-feedback${pending ? " route-feedback--visible" : ""}`}
      aria-hidden={!pending}
    >
      <div className="route-feedback__bar" />
      <div className="route-feedback__pill">
        <LoadingSpinner className="spinner--route" label={label} />
        <span>{label}</span>
      </div>
    </div>
  );
}
