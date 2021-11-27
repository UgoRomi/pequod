import PercentageButton from './PercentageButton';

export default function PercentagesGroup() {
  return (
    <div className='mt-3 grid grid-cols-4 gap-x-4'>
      <PercentageButton text='25%'></PercentageButton>
      <PercentageButton text='50%'></PercentageButton>
      <PercentageButton text='75%'></PercentageButton>
      <PercentageButton text='100%'></PercentageButton>
    </div>
  );
}
