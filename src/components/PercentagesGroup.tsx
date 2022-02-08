import PercentageButton from "./PercentageButton";

export enum Percentages {
  "25%" = 25,
  "50%" = 50,
  "75%" = 75,
  "100%" = 100,
}

export default function PercentagesGroup({
  buttonClickCallback,
  active,
  setActive,
  darkModeClass = "text-gray-200",
  disabled = false,
}: {
  buttonClickCallback: (percentage: Percentages) => void;
  active: number;
  setActive: React.Dispatch<React.SetStateAction<number>>;
  darkModeClass?: string;
  disabled?: boolean;
}) {
  return (
    <div className="mt-3 grid grid-cols-4 gap-x-4">
      <PercentageButton
        darkModeClass={darkModeClass}
        setActive={() => setActive(1)}
        active={active >= Percentages["25%"]}
        percentage={Percentages["25%"]}
        buttonClickCallback={buttonClickCallback}
        disabled={disabled}
      ></PercentageButton>
      <PercentageButton
        darkModeClass={darkModeClass}
        setActive={() => setActive(2)}
        active={active >= Percentages["50%"]}
        percentage={Percentages["50%"]}
        buttonClickCallback={buttonClickCallback}
        disabled={disabled}
      ></PercentageButton>
      <PercentageButton
        darkModeClass={darkModeClass}
        setActive={() => setActive(3)}
        active={active >= Percentages["75%"]}
        percentage={Percentages["75%"]}
        buttonClickCallback={buttonClickCallback}
        disabled={disabled}
      ></PercentageButton>
      <PercentageButton
        darkModeClass={darkModeClass}
        setActive={() => setActive(4)}
        active={active >= Percentages["100%"]}
        percentage={Percentages["100%"]}
        buttonClickCallback={buttonClickCallback}
        disabled={disabled}
      ></PercentageButton>
    </div>
  );
}
