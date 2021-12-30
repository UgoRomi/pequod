/* This example requires Tailwind CSS v2.0+ */
import { useEffect, useState } from 'react';
import { Switch } from '@headlessui/react';
import { classNames } from '../utils/utils';
import { MoonIcon, SunIcon } from '@heroicons/react/outline';

export default function DarkModeToggle() {
  const [enabled, setEnabled] = useState(false);

  // Get dark mode from local storage and toggle it
  const toggleDarkMode = () => {
    const currentMode = localStorage.getItem('theme');
    setEnabled(currentMode === 'light');
    if (currentMode === 'dark') {
      localStorage.setItem('theme', 'light');
      document.documentElement.classList.remove('dark');
    } else {
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
    }
  };

  useEffect(() => {
    const currentMode = localStorage.getItem('theme');
    setEnabled(currentMode === 'dark');
  }, []);

  return (
    <Switch
      checked={enabled}
      onChange={toggleDarkMode}
      className={classNames(
        enabled ? 'bg-purple-400' : 'bg-gray-400',
        'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
      )}
    >
      <span className='sr-only'>Use setting</span>
      <span
        className={classNames(
          enabled ? 'translate-x-5' : 'translate-x-0',
          'pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
        )}
      >
        <span
          className={classNames(
            enabled
              ? 'opacity-0 ease-out duration-100'
              : 'opacity-100 ease-in duration-200',
            'absolute inset-0 h-full w-full flex items-center justify-center transition-opacity'
          )}
          aria-hidden='true'
        >
          <SunIcon />
        </span>
        <span
          className={classNames(
            enabled
              ? 'opacity-100 ease-in duration-200'
              : 'opacity-0 ease-out duration-100',
            'absolute inset-0 h-full w-full flex items-center justify-center transition-opacity'
          )}
          aria-hidden='true'
        >
          <MoonIcon className='font-bold' />
        </span>
      </span>
    </Switch>
  );
}
