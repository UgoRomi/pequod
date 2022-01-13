import { classNames } from '../utils/utils';
import { Percentages } from './PercentagesGroup';

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
        disabled ? 'cursor-default opacity-70' : 'cursor-pointer',
        'flex flex-col justify-center '
      )}
    >
      <button
        className={classNames(
          active ? 'bg-pequod-purple' : 'bg-pequod-white',
          'h-2 rounded-lg w-full disabled:cursor-default'
        )}
        disabled={disabled}
      >
        {' '}
      </button>
      <span
        className={`w-full flex justify-center text-xs dark:text-pequod-pink dark:${darkModeClass}`}
      >
        {percentage}%
      </span>
    </div>
  );
}
