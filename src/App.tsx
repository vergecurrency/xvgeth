import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { TokenPage } from "@/components/TokenPage";
import { tokenOrder, tokensBySlug } from "@/data/tokens";

const HOME_ROUTE = "/";

function normalizePath(pathname: string) {
  return pathname.replace(/\/+$/, "") || HOME_ROUTE;
}

export default function App() {
  const [pathname, setPathname] = useState(() => normalizePath(window.location.pathname));
  const tokens = tokenOrder.map((slug) => tokensBySlug[slug]);
  const activeToken = tokens[0];

  useEffect(() => {
    document.documentElement.dataset.farmTheme = "home";
    document.body.dataset.farmTheme = "home";
    document.documentElement.dataset.view = "token";
    document.body.dataset.view = "token";
  }, []);

  useEffect(() => {
    function syncViewport() {
      const viewportHeight = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--app-height", `${viewportHeight}px`);
    }

    function handlePopState() {
      setPathname(normalizePath(window.location.pathname));
    }

    syncViewport();
    window.addEventListener("pageshow", syncViewport);
    window.addEventListener("orientationchange", syncViewport);
    window.addEventListener("resize", syncViewport);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("pageshow", syncViewport);
      window.removeEventListener("orientationchange", syncViewport);
      window.removeEventListener("resize", syncViewport);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  function navigate(nextPath: string) {
    if (nextPath.startsWith("#")) {
      const element = document.querySelector(nextPath);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    const normalized = normalizePath(nextPath);
    if (normalized !== pathname) {
      window.history.pushState({}, "", normalized);
      setPathname(normalized);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <SiteHeader currentPath={pathname} tokens={tokens} onNavigate={navigate} />
      <TokenPage token={activeToken} tokens={tokens} onNavigate={navigate} />
    </>
  );
}
