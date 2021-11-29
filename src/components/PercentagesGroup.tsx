import { useState } from 'react';
import PercentageButton from './PercentageButton';

export default function PercentagesGroup() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className='mt-3 grid grid-cols-4 gap-x-4'>
      <PercentageButton
        setActive={() => setActive(0)}
        active={active !== null && active >= 0}
        text='25%'
      ></PercentageButton>
      <PercentageButton
        setActive={() => setActive(1)}
        active={active !== null && active >= 1}
        text='50%'
      ></PercentageButton>
      <PercentageButton
        setActive={() => setActive(2)}
        active={active !== null && active >= 2}
        text='75%'
      ></PercentageButton>
      <PercentageButton
        setActive={() => setActive(3)}
        active={active !== null && active >= 3}
        text='100%'
      ></PercentageButton>
    </div>
  );
}
