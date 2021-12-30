import { classNames } from '../utils/utils';
import { Percentages } from './PercentagesGroup';

export default function PercentageButton({
  active,
  setActive,
  percentage,
  buttonClickCallback,
  darkModeClass = 'text-gray-200',
}: {
  active: boolean;
  setActive: () => void;
  percentage: Percentages;
  buttonClickCallback: (percentage: Percentages) => void;
  darkModeClass: string;
}) {
  const buttonClick = () => {
    setActive();
    buttonClickCallback(percentage);
  };

  return (
    <div
      onClick={buttonClick}
      className='flex flex-col justify-center cursor-pointer'
    >
      <button
        className={classNames(
          active ? 'bg-purple-400' : 'bg-purple-100',
          'h-2 rounded-lg w-full'
        )}
      >
        {' '}
      </button>
      <span
        className={`w-full flex justify-center text-gray-700 dark:${darkModeClass}`}
      >
        {percentage}%
      </span>
    </div>
  );
}
