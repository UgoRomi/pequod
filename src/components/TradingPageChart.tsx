import { GraphData } from '../pages/TradingPage';
import { classNames } from '../utils/utils';
import PairChart from './PairChart';

export default function TradingPageChart({
  priceHistory,
  className,
}: {
  priceHistory: GraphData[];
  className: string;
}) {
  return (
    <div
      className={classNames(
        !priceHistory?.length ? 'hidden lg:block' : '',
        'xl:border-r xl:pr-3 text-pequod-white',
        className
      )}
    >
      {!!priceHistory?.length && (
        <div style={{ height: '90%', width: '100%', minHeight: '190px' }}>
          <PairChart data={priceHistory} />
        </div>
      )}
    </div>
  );
}
