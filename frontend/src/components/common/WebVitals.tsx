"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function WebVitals() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && pathname) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
      console.debug("[WebVitals] Page view:", url);
    }
  }, [pathname, searchParams]);

  return null;
}
