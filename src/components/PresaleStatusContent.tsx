export default function PresaleStatusContent({
  presaleStatus,
  conversionRate,
}: {
  presaleStatus: {
    currentRaised: number;
    hardCap: number;
    softCap: number;
  };
  conversionRate: number;
}) {
  return (
    <div className="flex flex-col items-center justify-center bg-pequod-gray-300 text-center">
      {/* PRESALE STATUS */}
      <div
        className={`flex w-full flex-col items-center justify-center rounded-40 bg-pequod-gray p-12 text-white md:w-2/5`}
      >
        <div className="flex w-full flex-row justify-between">
          <div>&nbsp;</div>
          <h3 className="self-center">MOBY Presale status</h3>
        </div>
        <div className="relative mt-10 w-3/5 rounded-md shadow-sm">
          <div className="focus:outline-none flex h-50 w-full flex-row justify-between rounded-10 border border-pequod-white bg-transparent text-pequod-white focus:ring focus:ring-pequod-purple disabled:cursor-not-allowed disabled:opacity-80 sm:text-sm">
            <div
              style={{
                width: `${
                  (presaleStatus.currentRaised * 100) / presaleStatus.hardCap
                }%`,
                backgroundColor: "#00FFFF4f",
              }}
              className="flex h-50 items-center justify-center rounded-10 rounded-tr-40 rounded-br-40 border-r bg-white"
            >
              <h1>{presaleStatus.currentRaised}</h1>
            </div>
            <div className="h-50 w-20 border-l border-dashed">
              <div style={{ position: "fixed", marginTop: "50px" }}>
                HC
                <br /> {presaleStatus.hardCap}
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-white opacity-75">
            (BNB)
          </div>
        </div>

        <div className="relative mt-16 w-3/5 rounded-md shadow-sm">
          <div className="focus:outline-none flex-row-end flex h-50 w-full justify-between rounded-10 border border-pequod-white bg-transparent text-pequod-white focus:ring focus:ring-pequod-purple disabled:cursor-not-allowed disabled:opacity-80 sm:text-sm">
            <div
              style={{
                width: `${
                  (presaleStatus.currentRaised * 100) / presaleStatus.hardCap
                }%`,
                backgroundColor: "#00FFFF4f",
              }}
              className="absolute right-0 flex h-50 items-center justify-center rounded-15 rounded-tl-40 rounded-bl-40 border-r bg-white pr-10"
            >
              <h1>{presaleStatus.currentRaised * (conversionRate || 0)}</h1>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-white opacity-75">
            (WOT)
          </div>
        </div>
      </div>
    </div>
  );
}
