"use client";

import { useEffect } from "react";

export function ClarityProvider() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID
    ) {
      import("@microsoft/clarity").then((clarityModule) => {
        const clarity = clarityModule.default || clarityModule;
        if (clarity && clarity.init) {
          clarity.init(process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID!);
        }
      }).catch((error) => {
        if (process.env.NODE_ENV === "development") {
          console.error("Clarity initialization failed:", error);
        }
      });
    }
  }, []);

  return null;
}