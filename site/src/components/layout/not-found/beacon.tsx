"use client";

import { useEffect } from "react";
import { capture, setPageContext } from "@/lib/analytics";

/** The 404 keeps the bad path in the address bar, so the page type cannot be read from the route. */
export function NotFoundBeacon() {
  useEffect(() => {
    const path = window.location.pathname;
    setPageContext({ pageType: "not_found" });
    capture("not_found", { path });
  }, []);
  return null;
}
