import { classNames } from '../utils/utils';

export default function PercentageButton({
  text,
  active,
  setActive,
}: {
  text: string;
  active: boolean;
  setActive: () => void;
}) {
  return (
    <div
      onClick={setActive}
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
      <span className='w-full flex justify-center text-gray-700 dark:text-gray-200'>
        {text}
      </span>
    </div>
  );
}
