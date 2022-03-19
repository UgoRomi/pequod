/* This example requires Tailwind CSS v2.0+ */
import swapIcon from "../images/swapIconLaunchpad.png";
import walletReceived from "../images/walletIconReceived.png";
import walletInitial from "../images/walletIconWhite.png";
import claimIcon from "../images/claimIcon.svg";

import {ArrowCircleRightIcon, XIcon} from "@heroicons/react/outline";
export default function LaunchpadModal({
  setOpen,
  hidden,
}: {
  setOpen: any;
  hidden: boolean;
}) {
  return hidden ? (
    <></>
  ) : (
    <div className="flex min-h-screen w-screen top-0 left-0 justify-center text-center items-center fixed bg-pequod-gray-300 flex-col">
      {/* BUY FORM - RIMUOVI HIDDEN COME CLS*/}
      <div className="w-1/5 bg-pequod-gray rounded-40 p-12 text-white flex flex-col justify-center items-center hidden">
        <div className="flex flex-row w-full justify-between">
          <div>&nbsp;</div>
          <h3 className="self-center">Acquista Moby</h3>
          <div className="">
            <XIcon
              className="w-6 cursor-pointer"
              onClick={() => setOpen(false)}
            ></XIcon>
          </div>
        </div>
        <div className="mt-4 flex w-full flex-col items-center center">
          <div className="relative w-4/5 mt-1 rounded-md shadow-sm">
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
          <div className="relative w-4/5 mt-1 rounded-md shadow-sm">
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

          <div className="relative w-4/5 mt-10 rounded-md shadow-sm">
            <button
              style={{borderColor: "#00FFFF", color: "#00FFFF"}}
              className="focus:outline-none block h-50 w-full rounded-10 border border-pequod-white bg-transparent px-2 py-1.5 text-pequod-white focus:ring focus:ring-pequod-purple disabled:cursor-not-allowed disabled:opacity-80 sm:text-sm"
            >
              Acquista
            </button>
          </div>
        </div>
      </div>

      {/* PRESALE OK */}
      <div className="md:w-2/5 w-1/5 bg-pequod-gray rounded-40 p-12 text-white flex flex-col justify-center items-center hidden">
        <div className="flex flex-row w-full justify-between">
          <div>&nbsp;</div>
          <h3 className="self-center">Presale d'acquisto Moby</h3>
          <div className="">
            <XIcon
              className="w-6 cursor-pointer"
              onClick={() => setOpen(false)}
            ></XIcon>
          </div>
        </div>
        <div className="flex flex-row w-4/5 justify-between mt-20 mb-20">
          <img src={walletInitial} className="w-10" alt="wallet inital icon" />
          <ArrowCircleRightIcon className="w-10" />
          <img
            src={walletReceived}
            className="w-14 h-auto"
            alt="wallet receiver icon"
          />
        </div>
        <button
          disabled={true}
          style={{backgroundColor: "#B3B6BF", color: "#2d2d2d"}}
          className="block h-50 w-3/5 rounded-10 border border-pequod-white disabled:cursor-not-allowed sm:text-sm"
        >
          Token acquistati correttamente
        </button>
      </div>

      {/* PRESALE STATUS */}
      <div className="md:w-2/5 w-1/5 bg-pequod-gray rounded-40 p-12 text-white flex flex-col justify-center items-center hidden">
        <div className="flex flex-row w-full justify-between">
          <div>&nbsp;</div>
          <h3 className="self-center">MOBY Presale status</h3>
          <div className="">
            <XIcon
              className="w-6 cursor-pointer"
              onClick={() => setOpen(false)}
            ></XIcon>
          </div>
        </div>
        <div className="relative w-3/5 mt-10 rounded-md shadow-sm">
          <div className="focus:outline-none flex flex-row justify-between block h-50 w-full rounded-10 border border-pequod-white bg-transparent text-pequod-white focus:ring focus:ring-pequod-purple disabled:cursor-not-allowed disabled:opacity-80 sm:text-sm">
            <div
              style={{width: "50%", backgroundColor: "#00FFFF4f"}}
              className="h-50 rounded-10 rounded-tr-40 rounded-br-40 border-r bg-white flex items-center justify-center"
            >
              <h1>310</h1>
            </div>
            <div className="h-50 w-20 border-l border-dashed">
              <div style={{position: "fixed", marginTop: "50px"}}>
                HC
                <br /> 1000
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-white opacity-75">
            (BNB)
          </div>
        </div>

        <div className="relative w-3/5 mt-16 rounded-md shadow-sm">
          <div className="focus:outline-none flex flex-row-end justify-between block h-50 w-full rounded-10 border border-pequod-white bg-transparent text-pequod-white focus:ring focus:ring-pequod-purple disabled:cursor-not-allowed disabled:opacity-80 sm:text-sm">
            <div
              style={{width: "100%", backgroundColor: "#00FFFF4f"}}
              className="h-50 absolute right-0 rounded-15 pr-10 rounded-tl-40 rounded-bl-40 border-r bg-white flex items-center justify-center"
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
      <div className="md:w-2/5 w-1/5 bg-pequod-gray rounded-40 p-12 text-white flex flex-col justify-center items-center">
        <div className="flex flex-row w-full justify-between">
          <div>&nbsp;</div>
          <h3 className="self-center">Ben fatto!</h3>
          <div className="">
            <XIcon
              className="w-6 cursor-pointer"
              onClick={() => setOpen(false)}
            ></XIcon>
          </div>
        </div>
        <div className="flex flex-row w-4/5 justify-center mt-20 mb-20">
          <img src={claimIcon} className="w-20" alt="" />
        </div>

        <h3 className="self-center">Claim ottenuto con successo</h3>
      </div>
    </div>
  );
}
