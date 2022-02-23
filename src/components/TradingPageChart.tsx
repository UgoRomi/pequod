import { GraphData } from "../pages/TradingPage";
import { classNames } from "../utils/utils";
import PairChart from "./PairChart";

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
        !priceHistory?.length ? "hidden lg:block" : "",
        "text-pequod-white xl:border-r xl:pr-12",
        className
      )}
    >
      {!!priceHistory?.length ? (
        <div style={{ height: "90%", width: "100%", minHeight: "190px" }}>
          <PairChart data={priceHistory} />
        </div>
      ) : (
        <div className="hidden h-full w-full items-center justify-center text-3xl text-pequod-white opacity-70 xl:flex">
          No data
        </div>
      )}
    </div>
  );
}
