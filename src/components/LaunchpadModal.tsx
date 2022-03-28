import swapIcon from "../images/swapIconLaunchpad.png";
import walletReceived from "../images/walletIconReceived.png";
import walletInitial from "../images/walletIconWhite.png";
import claimIcon from "../images/claimIcon.svg";

import {ArrowCircleRightIcon, XIcon} from "@heroicons/react/outline";
import {useEffect, useState} from "react";
import {formatAmount} from "../utils/utils";
import {useWeb3React} from "@web3-react/core";
import Web3 from "web3";

export default function LaunchpadModal({
  setOpen,
  hidden,
  initialStep,
  conversionRate,
  presaleAddress,
  presaleStatus,
}: {
  setOpen: any;
  hidden: boolean;
  initialStep: 0 | 1 | 2 | 3;
  conversionRate?: number;
  presaleAddress?: string;
  presaleStatus: {
    currentRaised: number;
    hardCap: number;
    softCap: number;
  };
}) {
  const [amountTo, setAmountTo] = useState<string>("0");
  const [amountFrom, setAmountFrom] = useState<string>("0");
  const [sendingBnb, setSendingBnb] = useState<boolean>(false);
  const [step, setStep] = useState<0 | 1 | 2 | 3>(initialStep);
  const {account, library} = useWeb3React();

  const updateFrom = (value: string, updateTo = true) => {
    // replace comma with dot
    const newValue = value.replace(",", ".");
    const valueNumeric = parseFloat(newValue);
    setAmountFrom(newValue);
    if (!conversionRate || !updateTo) return;
    setAmountTo((valueNumeric * conversionRate).toString());
  };

  const updateTo = (value: string) => {
    // replace comma with dot
    const newValue = value.replace(",", ".");
    const valueNumeric = parseFloat(newValue);
    setAmountTo(newValue);
    if (!conversionRate) return;
    updateFrom((valueNumeric / conversionRate).toString(), false);
  };

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  const sendBnbToPresaleAddress = async () => {
    try {
      setSendingBnb(true);
      await library.eth.sendTransaction({
        from: account,
        to: presaleAddress,
        value: Web3.utils.toWei(amountFrom, "ether"),
      });
      setStep(1);
    } catch (error) {
      console.error(error);
    } finally {
      setSendingBnb(false);
    }
  };

  return hidden ? (
    <></>
  ) : (
    <div className="fixed top-0 left-0 flex min-h-screen w-screen flex-col items-center justify-center bg-pequod-gray-300 text-center">
      {/* BUY FORM */}
      <div
        className={`${
          step === 0 ? "flex" : "hidden"
        } w-full md:w-1/5 flex-col items-center justify-center rounded-40 bg-pequod-gray p-12 text-white`}
      >
        <div className="flex w-full flex-row justify-between">
          <div>&nbsp;</div>
          <h3 className="self-center">Acquista Moby</h3>
          <div className="">
            <XIcon
              className="w-6 cursor-pointer"
              onClick={() => {
                setOpen(false);
                setStep(0);
              }}
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
              value={formatAmount(amountFrom || "0")}
              onChange={(e) => {
                updateFrom(e.target.value);
              }}
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
              value={formatAmount(amountTo || "0")}
              onChange={(e) => {
                updateTo(e.target.value);
              }}
            />

            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-white opacity-75">
              (WOT V2)
            </div>
          </div>

          <div className="relative mt-10 w-4/5 rounded-md shadow-sm">
            <button
              style={{borderColor: "#00FFFF", color: "#00FFFF"}}
              className="focus:outline-none block h-50 w-full rounded-10 border border-pequod-white bg-transparent px-2 py-1.5 text-pequod-white focus:ring focus:ring-pequod-purple disabled:cursor-not-allowed disabled:opacity-80 sm:text-sm"
              onClick={sendBnbToPresaleAddress}
            >
              {sendingBnb ? "Acquisto in corso..." : "Acquista"}
            </button>
          </div>
        </div>
      </div>

      {/* PRESALE OK */}
      <div
        className={`${
          step === 1 ? "flex" : "hidden"
        } w-full md:w-1/5 flex-col items-center justify-center rounded-40 bg-pequod-gray p-12 text-white md:w-2/5`}
      >
        <div className="flex w-full flex-row justify-between">
          <div>&nbsp;</div>
          <h3 className="self-center">Presale d'acquisto Moby</h3>
          <div className="">
            <XIcon
              className="w-6 cursor-pointer"
              onClick={() => {
                setOpen(false);
                setStep(0);
              }}
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
          style={{backgroundColor: "#B3B6BF", color: "#2d2d2d"}}
          className="block h-50 w-3/5 rounded-10 border border-pequod-white disabled:cursor-not-allowed sm:text-sm"
        >
          Token acquistati correttamente
        </button>
      </div>

      {/* PRESALE STATUS */}
      <div
        className={`${
          step === 2 ? "flex" : "hidden"
        } w-full md:w-1/5 flex-col items-center justify-center rounded-40 bg-pequod-gray p-12 text-white md:w-2/5`}
      >
        <div className="flex w-full flex-row justify-between">
          <div>&nbsp;</div>
          <h3 className="self-center">MOBY Presale status</h3>
          <div className="">
            <XIcon
              className="w-6 cursor-pointer"
              onClick={() => {
                setOpen(false);
              }}
            ></XIcon>
          </div>
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
              <div style={{position: "fixed", marginTop: "50px"}}>
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

      {/* CLAIM OK */}
      <div
        className={`${
          step === 3 ? "flex" : "hidden"
        } w-full md:w-1/5 flex-col items-center justify-center rounded-40 bg-pequod-gray p-12 text-white md:w-2/5`}
      >
        <div className="flex w-full flex-row justify-between">
          <div>&nbsp;</div>
          <h3 className="self-center">Ben fatto!</h3>
          <div className="">
            <XIcon
              className="w-6 cursor-pointer"
              onClick={() => {
                setOpen(false);
                setStep(0);
              }}
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
