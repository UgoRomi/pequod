import { GraphData } from '../pages/TradingPage';
import { PairDataTimeWindowEnum } from '../utils/chart';
import { classNames } from '../utils/utils';
import PairChart from './PairChart';
import TimeSlotButton from './TimeSlotButton';

export default function TradingPageChart({
  priceHistory,
  className,
  setTimeWindow,
  currentlySelectedTimeWindow,
  selectedTokenSymbol,
}: {
  priceHistory: GraphData[];
  className?: string;
  setTimeWindow: React.Dispatch<React.SetStateAction<PairDataTimeWindowEnum>>;
  currentlySelectedTimeWindow: PairDataTimeWindowEnum;
  selectedTokenSymbol: string;
}) {
  return (
    <div
      className={classNames(
        !priceHistory?.length ? 'hidden lg:block' : '',
        'text-pequod-white xl:border-r xl:pr-12',
        className || ''
      )}
    >
      {!!priceHistory?.length ? (
        <>
          <div style={{ height: '86%', width: '100%', minHeight: '190px' }}>
            <PairChart data={priceHistory} />
          </div>
          <span className="flex w-full pt-4">
            <TimeSlotButton
              active={
                currentlySelectedTimeWindow === PairDataTimeWindowEnum.ONE_HOUR
              }
              setTimeWindow={setTimeWindow}
              value={PairDataTimeWindowEnum.ONE_HOUR}
              text="1H"
            />
            <TimeSlotButton
              active={
                currentlySelectedTimeWindow ===
                PairDataTimeWindowEnum.FOUR_HOURS
              }
              setTimeWindow={setTimeWindow}
              value={PairDataTimeWindowEnum.FOUR_HOURS}
              text="4H"
            />
            <TimeSlotButton
              active={
                currentlySelectedTimeWindow === PairDataTimeWindowEnum.DAY
              }
              setTimeWindow={setTimeWindow}
              value={PairDataTimeWindowEnum.DAY}
              text="1D"
            />
            <TimeSlotButton
              active={
                currentlySelectedTimeWindow === PairDataTimeWindowEnum.WEEK
              }
              setTimeWindow={setTimeWindow}
              value={PairDataTimeWindowEnum.WEEK}
              text="1W"
            />
            <TimeSlotButton
              active={
                currentlySelectedTimeWindow === PairDataTimeWindowEnum.MONTH
              }
              setTimeWindow={setTimeWindow}
              value={PairDataTimeWindowEnum.MONTH}
              text="1M"
            />
            <TimeSlotButton
              active={
                currentlySelectedTimeWindow === PairDataTimeWindowEnum.YEAR
              }
              setTimeWindow={setTimeWindow}
              value={PairDataTimeWindowEnum.YEAR}
              text="1Y"
            />
            <span className="ml-auto inline-flex cursor-default items-center rounded-md px-3 py-2 text-sm font-medium leading-4 text-pequod-white  shadow-sm ">
              {selectedTokenSymbol}/BNB
            </span>
          </span>
        </>
      ) : (
        <div className="hidden h-full w-full items-center justify-center text-3xl text-pequod-white opacity-70 xl:flex">
          No data
        </div>
      )}
    </div>
  );
}
