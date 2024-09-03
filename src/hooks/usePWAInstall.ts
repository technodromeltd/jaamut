import { useState, useEffect } from "react";

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);
  const blocked = localStorage.getItem("pwaInstallPromptCanceled") === "true";

  const setBlocked = () => {
    localStorage.setItem("pwaInstallPromptCanceled", "true");
  };

  const handleInstall = async () => {
    console.log("handleInstall", deferredPrompt);
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    console.log("deferredPrompt", deferredPrompt);
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setCanInstall(false);
    } else {
      // {{ edit_1 }}: Store in localStorage if the user cancels the install prompt
      localStorage.setItem("pwaInstallPromptCanceled", "true");
    }
    setDeferredPrompt(null);
  };

  return { canInstall, handleInstall, setBlocked, blocked };
};
