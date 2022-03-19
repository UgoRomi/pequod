/* This example requires Tailwind CSS v2.0+ */
import swapIcon from "../images/swapIconLaunchpad.png";
import walletReceived from "../images/walletIconReceived.png";
import walletInitial from "../images/walletIconWhite.png";
import claimIcon from "../images/claimIcon.svg";

import { ArrowCircleRightIcon, XIcon } from "@heroicons/react/outline";
export default function LaunchpadModal({
  setOpen,
  hidden,
  step,
}: {
  setOpen: any;
  hidden: boolean;
  step: 0 | 1 | 2 | 3;
}) {
  return hidden ? (
    <></>
  ) : (
    <div className="fixed top-0 left-0 flex min-h-screen w-screen flex-col items-center justify-center bg-pequod-gray-300 text-center">
      {/* BUY FORM - RIMUOVI HIDDEN COME CLS*/}
      <div
        className={`${
          step === 0 ? "flex" : "hidden"
        } w-1/5 flex-col items-center justify-center rounded-40 bg-pequod-gray p-12 text-white`}
      >
        <div className="flex w-full flex-row justify-between">
          <div>&nbsp;</div>
          <h3 className="self-center">Acquista Moby</h3>
          <div className="">
            <XIcon
              className="w-6 cursor-pointer"
              onClick={() => setOpen(false)}
            ></XIcon>
          </div>
        </div>
        <div className="center mt-4 flex w-full flex-col items-center">
          <div className="relative mt-1 w-4/5 rounded-md shadow-sm">
            <input
              type="text"
              name="amountFrom"
              id="amountFrom"
              inputMode="decimal"
              autoComplete="off"
              autoCorrect="off"
              pattern="^[0-9]*[.,]?[0-9]*$"
              placeholder="0.0"
              minLength={1}
              maxLength={79}
              spellCheck="false"
              className="focus:outline-none block h-50 w-full rounded-10 border border-pequod-white bg-transparent px-2 py-1.5 text-pequod-white focus:ring focus:ring-pequod-purple disabled:cursor-not-allowed disabled:opacity-80 sm:text-sm"
            />

            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-white opacity-75">
              (BNB)
            </div>
          </div>
          <div className="mt-10 mb-10">
            <img src={swapIcon} alt="swap icon"></img>
          </div>
          <div className="relative mt-1 w-4/5 rounded-md shadow-sm">
            <input
              type="text"
              name="amountFrom"
              id="amountFrom"
              inputMode="decimal"
              autoComplete="off"
              autoCorrect="off"
              pattern="^[0-9]*[.,]?[0-9]*$"
              placeholder="0.0"
              minLength={1}
              maxLength={79}
              spellCheck="false"
              className="focus:outline-none block h-50 w-full rounded-10 border border-pequod-white bg-transparent px-2 py-1.5 text-pequod-white focus:ring focus:ring-pequod-purple disabled:cursor-not-allowed disabled:opacity-80 sm:text-sm"
            />

            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-white opacity-75">
              (WOT V2)
            </div>
          </div>

          <div className="relative mt-10 w-4/5 rounded-md shadow-sm">
            <button
              style={{ borderColor: "#00FFFF", color: "#00FFFF" }}
              className="focus:outline-none block h-50 w-full rounded-10 border border-pequod-white bg-transparent px-2 py-1.5 text-pequod-white focus:ring focus:ring-pequod-purple disabled:cursor-not-allowed disabled:opacity-80 sm:text-sm"
            >
              Acquista
            </button>
          </div>
        </div>
      </div>

      {/* PRESALE OK */}
      <div
        className={`${
          step === 1 ? "flex" : "hidden"
        } w-1/5 flex-col items-center justify-center rounded-40 bg-pequod-gray p-12 text-white md:w-2/5`}
      >
        <div className="flex w-full flex-row justify-between">
          <div>&nbsp;</div>
          <h3 className="self-center">Presale d'acquisto Moby</h3>
          <div className="">
            <XIcon
              className="w-6 cursor-pointer"
              onClick={() => setOpen(false)}
            ></XIcon>
          </div>
        </div>
        <div className="mt-20 mb-20 flex w-4/5 flex-row justify-between">
          <img src={walletInitial} className="w-10" alt="wallet inital icon" />
          <ArrowCircleRightIcon className="w-10" />
          <img
            src={walletReceived}
            className="h-auto w-14"
            alt="wallet receiver icon"
          />
        </div>
        <button
          disabled={true}
          style={{ backgroundColor: "#B3B6BF", color: "#2d2d2d" }}
          className="block h-50 w-3/5 rounded-10 border border-pequod-white disabled:cursor-not-allowed sm:text-sm"
        >
          Token acquistati correttamente
        </button>
      </div>

      {/* PRESALE STATUS */}
      <div
        className={`${
          step === 2 ? "flex" : "hidden"
        } w-1/5 flex-col items-center justify-center rounded-40 bg-pequod-gray p-12 text-white md:w-2/5`}
      >
        <div className="flex w-full flex-row justify-between">
          <div>&nbsp;</div>
          <h3 className="self-center">MOBY Presale status</h3>
          <div className="">
            <XIcon
              className="w-6 cursor-pointer"
              onClick={() => setOpen(false)}
            ></XIcon>
          </div>
        </div>
        <div className="relative mt-10 w-3/5 rounded-md shadow-sm">
          <div className="focus:outline-none block flex h-50 w-full flex-row justify-between rounded-10 border border-pequod-white bg-transparent text-pequod-white focus:ring focus:ring-pequod-purple disabled:cursor-not-allowed disabled:opacity-80 sm:text-sm">
            <div
              style={{ width: "50%", backgroundColor: "#00FFFF4f" }}
              className="flex h-50 items-center justify-center rounded-10 rounded-tr-40 rounded-br-40 border-r bg-white"
            >
              <h1>310</h1>
            </div>
            <div className="h-50 w-20 border-l border-dashed">
              <div style={{ position: "fixed", marginTop: "50px" }}>
                HC
                <br /> 1000
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-white opacity-75">
            (BNB)
          </div>
        </div>

        <div className="relative mt-16 w-3/5 rounded-md shadow-sm">
          <div className="focus:outline-none flex-row-end block flex h-50 w-full justify-between rounded-10 border border-pequod-white bg-transparent text-pequod-white focus:ring focus:ring-pequod-purple disabled:cursor-not-allowed disabled:opacity-80 sm:text-sm">
            <div
              style={{ width: "100%", backgroundColor: "#00FFFF4f" }}
              className="absolute right-0 flex h-50 items-center justify-center rounded-15 rounded-tl-40 rounded-bl-40 border-r bg-white pr-10"
            >
              <h1>920.054.460</h1>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-white opacity-75">
            (WOT)
          </div>
        </div>
      </div>

      {/* CLAIM OK */}
      <div
        className={`${
          step === 3 ? "flex" : "hidden"
        } w-1/5 flex-col items-center justify-center rounded-40 bg-pequod-gray p-12 text-white md:w-2/5`}
      >
        <div className="flex w-full flex-row justify-between">
          <div>&nbsp;</div>
          <h3 className="self-center">Ben fatto!</h3>
          <div className="">
            <XIcon
              className="w-6 cursor-pointer"
              onClick={() => setOpen(false)}
            ></XIcon>
          </div>
        </div>
        <div className="mt-20 mb-20 flex w-4/5 flex-row justify-center">
          <img src={claimIcon} className="w-20" alt="" />
        </div>

        <h3 className="self-center">Claim ottenuto con successo</h3>
      </div>
    </div>
  );
}
