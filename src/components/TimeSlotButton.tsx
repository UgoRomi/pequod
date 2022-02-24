import { PairDataTimeWindowEnum } from '../utils/chart';
import { classNames } from '../utils/utils';

export default function TimeSlotButton({
  text,
  setTimeWindow,
  value,
  active,
}: {
  text: string;
  setTimeWindow: React.Dispatch<React.SetStateAction<PairDataTimeWindowEnum>>;
  value: PairDataTimeWindowEnum;
  active: boolean;
}) {
  return (
    <button
      onClick={() => setTimeWindow(value)}
      type="button"
      className={classNames(
        active ? 'text-pequod-purple' : 'text-pequod-white',
        'focus:outline-none inline-flex items-center rounded-md px-3 py-2 text-sm font-medium leading-4  shadow-sm '
      )}
    >
      {text}
    </button>
  );
}
