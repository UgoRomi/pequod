/* This example requires Tailwind CSS v2.0+ */
import { useEffect, useState } from "react";
import { Switch } from "@headlessui/react";
import { classNames } from "../utils/utils";
import { MoonIcon, SunIcon } from "@heroicons/react/outline";

export default function DarkModeToggle() {
  const [enabled, setEnabled] = useState(false);

  // Get dark mode from local storage and toggle it
  const toggleDarkMode = () => {
    const currentMode = localStorage.getItem("theme");
    setEnabled(currentMode === "light");
    if (currentMode === "dark") {
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
    } else {
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
    }
  };

  useEffect(() => {
    const currentMode = localStorage.getItem("theme");
    setEnabled(currentMode === "dark");
  }, []);

  return (
    <>
      <span
        className={classNames(
          enabled ? "opacity-30" : "opacity-100",
          "pr-4 text-white"
        )}
      >
        {" "}
        Light{" "}
      </span>

      <Switch
        checked={enabled}
        onChange={toggleDarkMode}
        className={classNames(
          enabled ? "bg-pequod-dark" : "bg-pequod-dark",
          "focus:outline-none relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        )}
      >
        <span className="sr-only">Use setting</span>
        <span
          className={classNames(
            enabled ? "translate-x-5" : "translate-x-0",
            "pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-pequod-pink text-white shadow ring-0 transition duration-200 ease-in-out"
          )}
        >
          <span
            className={classNames(
              enabled
                ? "opacity-0 duration-100 ease-out"
                : "opacity-100 duration-200 ease-in",
              "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity"
            )}
            aria-hidden="true"
          >
            <SunIcon />
          </span>
          <span
            className={classNames(
              enabled
                ? "opacity-100 duration-200 ease-in"
                : "opacity-0 duration-100 ease-out",
              "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity"
            )}
            aria-hidden="true"
          >
            <MoonIcon className="font-bold" />
          </span>
        </span>
      </Switch>

      <span
        className={classNames(
          !enabled ? "opacity-30" : "opacity-100",
          "pl-4 text-white"
        )}
      >
        {" "}
        Dark{" "}
      </span>
    </>
  );
}
