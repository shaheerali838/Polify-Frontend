import React from "react";
import { Sun, Moon } from "lucide-react";
import useTheme from "../hooks/useTheme.js";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle Theme"
      className="relative grid place-items-center w-8 h-8 rounded-xl text-zinc-500 dark:text-zinc-700 dark:text-zinc-500 hover:text-zinc-500 dark:hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors shrink-0"
    >
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
};

export default ThemeToggle;
