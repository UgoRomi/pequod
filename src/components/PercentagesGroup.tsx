import { useState } from 'react';
import PercentageButton from './PercentageButton';

export enum Percentages {
  '25%' = 25,
  '50%' = 50,
  '75%' = 75,
  '100%' = 100,
}

export default function PercentagesGroup({
  buttonClickCallback,
  darkModeClass = 'text-gray-200',
}: {
  buttonClickCallback: (percentage: Percentages) => void;
  darkModeClass?: string;
}) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className='mt-3 grid grid-cols-4 gap-x-4'>
      <PercentageButton
        darkModeClass={darkModeClass}
        setActive={() => setActive(0)}
        active={active !== null && active >= 0}
        percentage={Percentages['25%']}
        buttonClickCallback={buttonClickCallback}
      ></PercentageButton>
      <PercentageButton
        darkModeClass={darkModeClass}
        setActive={() => setActive(1)}
        active={active !== null && active >= 1}
        percentage={Percentages['50%']}
        buttonClickCallback={buttonClickCallback}
      ></PercentageButton>
      <PercentageButton
        darkModeClass={darkModeClass}
        setActive={() => setActive(2)}
        active={active !== null && active >= 2}
        percentage={Percentages['75%']}
        buttonClickCallback={buttonClickCallback}
      ></PercentageButton>
      <PercentageButton
        darkModeClass={darkModeClass}
        setActive={() => setActive(3)}
        active={active !== null && active >= 3}
        percentage={Percentages['100%']}
        buttonClickCallback={buttonClickCallback}
      ></PercentageButton>
    </div>
  );
}
