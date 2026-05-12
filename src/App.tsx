import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Icon from "@/components/ui/icon";
import HomePage from "@/pages/HomePage";
import DirectoryPage from "@/pages/DirectoryPage";
import ArticlesPage from "@/pages/ArticlesPage";
import EmergencyPage from "@/pages/EmergencyPage";
import SavedPage from "@/pages/SavedPage";

type Page = "home" | "directory" | "articles" | "emergency" | "saved";

const navItems: { id: Page; label: string; icon: string }[] = [
  { id: "home", label: "Главная", icon: "Home" },
  { id: "directory", label: "Справочник", icon: "Users" },
  { id: "articles", label: "Материалы", icon: "BookOpen" },
  { id: "emergency", label: "Помощь", icon: "Phone" },
  { id: "saved", label: "Избранное", icon: "Heart" },
];

const App = () => {
  const [page, setPage] = useState<Page>("home");

  const renderPage = () => {
    switch (page) {
      case "home": return <HomePage onNavigate={(p) => setPage(p as Page)} />;
      case "directory": return <DirectoryPage />;
      case "articles": return <ArticlesPage />;
      case "emergency": return <EmergencyPage />;
      case "saved": return <SavedPage />;
    }
  };

  return (
    <TooltipProvider>
      <Toaster />
      <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col">
        <main className="flex-1 pb-24 max-w-2xl w-full mx-auto">
          {renderPage()}
        </main>

        {/* Нижняя навигация */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[hsl(var(--border))]">
          <div className="max-w-2xl mx-auto flex items-center">
            {navItems.map((item) => {
              const isActive = page === item.id;
              const isEmergency = item.id === "emergency";

              return (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 px-1 transition-all duration-200 ${
                    isEmergency
                      ? isActive ? "text-red-600" : "text-red-400"
                      : isActive
                      ? "text-[hsl(var(--terra))]"
                      : "text-[hsl(var(--muted-foreground))]"
                  }`}
                >
                  {isEmergency ? (
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                      isActive ? "bg-red-500 text-white scale-110" : "bg-red-50 text-red-400"
                    }`}>
                      <Icon name="Phone" size={17} />
                    </div>
                  ) : (
                    <div className={`w-7 h-7 flex items-center justify-center rounded-xl transition-all ${
                      isActive ? "bg-[hsl(var(--terra-light))] scale-110" : ""
                    }`}>
                      <Icon name={item.icon} size={17} />
                    </div>
                  )}
                  <span className="text-[10px] font-medium leading-none">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </TooltipProvider>
  );
};

export default App;
