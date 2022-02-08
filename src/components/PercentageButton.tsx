import { classNames } from "../utils/utils";
import { Percentages } from "./PercentagesGroup";

export default function PercentageButton({
  active,
  setActive,
  percentage,
  buttonClickCallback,
  darkModeClass,
  disabled,
}: {
  active: boolean;
  setActive: () => void;
  percentage: Percentages;
  buttonClickCallback: (percentage: Percentages) => void;
  darkModeClass: string;
  disabled: boolean;
}) {
  const buttonClick = () => {
    if (disabled) return;
    setActive();
    buttonClickCallback(percentage);
  };

  return (
    <div
      onClick={buttonClick}
      className={classNames(
        disabled ? "cursor-default opacity-70" : "cursor-pointer",
        "flex flex-col justify-center "
      )}
    >
      <button
        className={classNames(
          active ? "bg-pequod-purple" : "bg-pequod-white",
          "h-2 w-full rounded-lg disabled:cursor-default"
        )}
        disabled={disabled}
      >
        {" "}
      </button>
      <span
        className={`flex w-full justify-center text-xs text-pequod-pink ${darkModeClass}`}
      >
        {percentage}%
      </span>
    </div>
  );
}
