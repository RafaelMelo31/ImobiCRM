import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Inicializar tema sincronamente para evitar flash
    if (typeof window === "undefined") return "light";
    
    try {
      const stored = localStorage.getItem("theme") as Theme;
      if (stored && (stored === "light" || stored === "dark")) {
        // Aplicar imediatamente
        const root = document.documentElement;
        if (stored === "dark") {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
        return stored;
      }
      
      // Verificar preferência do sistema
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
        return "dark";
      }
      
      return "light";
    } catch (error) {
      console.error("Erro ao carregar tema:", error);
      return "light";
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    
    try {
      localStorage.setItem("theme", theme);
    } catch (error) {
      console.error("Erro ao salvar tema:", error);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

