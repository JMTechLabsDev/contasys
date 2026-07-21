"use client";

import { useEffect } from "react";

export function SwRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      let refreshing = false;

      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });

      navigator.serviceWorker.register("/sw.js").then((registration) => {
        // Comprueba un SW nuevo en cada carga para no mantener un deploy anterior.
        registration.update();
      });
    }
  }, []);

  return null;
}
