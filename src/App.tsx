import { useState, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Icon from "@/components/ui/icon";

import MainPage from "@/pages/MainPage";
import CatalogPage from "@/pages/CatalogPage";
import OrgPage from "@/pages/OrgPage";
import MapPage from "@/pages/MapPage";
import EmergencyHelpPage from "@/pages/EmergencyHelpPage";
import AdminPage from "@/pages/AdminPage";

type Page = "home" | "catalog" | "org" | "map" | "emergency" | "admin";

interface NavState {
  page: Page;
  params: Record<string, string>;
}

const NAV_ITEMS: { id: Page; label: string; icon: string }[] = [
  { id: "home", label: "Главная", icon: "Home" },
  { id: "catalog", label: "Каталог", icon: "Search" },
  { id: "map", label: "Карта", icon: "Map" },
  { id: "emergency", label: "Помощь", icon: "Phone" },
];

const App = () => {
  const [nav, setNav] = useState<NavState>({ page: "home", params: {} });
  const [history, setHistory] = useState<NavState[]>([]);

  const navigate = useCallback(
    (page: string, params: Record<string, string> = {}) => {
      setHistory((prev) => [...prev, nav]);
      setNav({ page: page as Page, params });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [nav]
  );

  const goBack = useCallback(() => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory((h) => h.slice(0, -1));
      setNav(prev);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setNav({ page: "home", params: {} });
    }
  }, [history]);

  const showBottomNav = nav.page !== "admin";

  const renderPage = () => {
    switch (nav.page) {
      case "home":
        return <MainPage onNavigate={navigate} />;
      case "catalog":
        return (
          <CatalogPage
            onNavigate={navigate}
            initialCategory={nav.params.category}
          />
        );
      case "org":
        return (
          <OrgPage
            orgId={nav.params.id || ""}
            onBack={goBack}
            onNavigate={navigate}
          />
        );
      case "map":
        return <MapPage onNavigate={navigate} />;
      case "emergency":
        return <EmergencyHelpPage onNavigate={navigate} />;
      case "admin":
        return <AdminPage onNavigate={navigate} />;
      default:
        return <MainPage onNavigate={navigate} />;
    }
  };

  return (
    <TooltipProvider>
      <Toaster />
      <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col">
        <main
          className={`flex-1 max-w-2xl w-full mx-auto ${showBottomNav ? "pb-20" : ""}`}
        >
          {renderPage()}
        </main>

        {/* Нижняя навигация */}
        {showBottomNav && (
          <nav
            className="fixed bottom-0 left-0 right-0 z-50 bg-white/97 backdrop-blur-lg border-t border-[hsl(var(--border))]"
            role="navigation"
            aria-label="Основная навигация"
          >
            <div className="max-w-2xl mx-auto flex items-end">
              {NAV_ITEMS.map((item) => {
                const isActive = nav.page === item.id;
                const isEmergencyBtn = item.id === "emergency";

                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    aria-label={item.label}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex-1 flex flex-col items-center gap-1 transition-all duration-200 ${
                      isEmergencyBtn ? "pt-1 pb-3" : "py-3"
                    }`}
                  >
                    {isEmergencyBtn ? (
                      <div className="flex flex-col items-center -mt-4">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200 ${
                            isActive
                              ? "bg-red-600 scale-110 shadow-red-300"
                              : "bg-red-500 hover:bg-red-600 shadow-red-200 hover:scale-105"
                          }`}
                        >
                          <Icon name="Phone" size={20} className="text-white" />
                        </div>
                        <span
                          className={`text-[9px] font-semibold mt-1 leading-none ${
                            isActive ? "text-red-600" : "text-red-500"
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div
                          className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-150 ${
                            isActive
                              ? "bg-[hsl(var(--terra-light))] scale-110"
                              : "hover:bg-[hsl(var(--muted))]"
                          }`}
                        >
                          <Icon
                            name={item.icon}
                            size={17}
                            className={
                              isActive
                                ? "text-[hsl(var(--terra))]"
                                : "text-[hsl(var(--muted-foreground))]"
                            }
                          />
                        </div>
                        <span
                          className={`text-[10px] font-medium leading-none ${
                            isActive
                              ? "text-[hsl(var(--terra))]"
                              : "text-[hsl(var(--muted-foreground))]"
                          }`}
                        >
                          {item.label}
                        </span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </TooltipProvider>
  );
};

export default App;
