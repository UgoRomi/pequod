import swapIcon from "../images/swapIconLaunchpad.png";
import walletReceived from "../images/walletIconReceived.png";
import walletInitial from "../images/walletIconWhite.png";
import claimIcon from "../images/claimIcon.svg";

import {
  ArrowCircleRightIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/outline";
import {useEffect, useState} from "react";
import {formatAmount} from "../utils/utils";
import {useWeb3React} from "@web3-react/core";
import Web3 from "web3";

import {toast} from "react-toastify";
import {update} from "lodash";

export default function PresaleModalContent({
  initialStep,
  conversionRate,
  presaleAddress,
  title,
  symbol,
  tokenAddress,
  minBuy,
  maxBuy,
}: {
  initialStep: 0 | 1 | 2 | 3;
  conversionRate?: number;
  presaleAddress?: string;
  title?: string;
  symbol?: string;
  tokenAddress: string;
  minBuy: number;
  maxBuy: number;
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
  const copyToClipboard = () => {
    navigator.clipboard.writeText(tokenAddress);

    toast.success("Text copied");
  };
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
  return (
    <div className="flex flex-col items-center justify-center text-center">
      {/* BUY FORM */}
      <div
        className={`${
          step === 0 ? "flex" : "hidden"
        } w-full flex-col items-center justify-center rounded-40 bg-pequod-gray p-12 text-white`}
      >
        <div className="flex w-full flex-row justify-center">
          <h3 className="self-center">{title}</h3>
        </div>
        <div className="center mt-4 flex w-full flex-col items-center">
          <div className="relative mt-1 w-4/5 rounded-md shadow-sm">
            <input
              type="text"
              name="amountFrom"
              id="amountFrom"
              inputMode="decimal"
              min={minBuy}
              max={maxBuy}
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
              ({symbol})
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
        } w-full flex-col items-center justify-center rounded-40 bg-pequod-gray p-12 text-white`}
      >
        <div className="flex w-full flex-row justify-between">
          <div>&nbsp;</div>
          <h3 className="self-center">Presale d'acquisto {symbol}</h3>
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

      {/* CLAIM OK */}
      <div
        className={`${
          step === 3 ? "flex" : "hidden"
        } w-full flex-col items-center justify-center rounded-40 bg-pequod-gray p-12 text-white`}
      >
        <div className="flex w-full flex-row justify-between">
          <div>&nbsp;</div>
          <h3 className="self-center">Tokens inviati correttamente!</h3>
        </div>
        <div className="mt-20 mb-20 flex w-4/5 flex-col items-center justify-center">
          <img src={claimIcon} className="mb-4 w-20" alt="" />
          <div className="mt-4 flex w-full flex-row justify-center text-xl">
            <p style={{color: "#00FFFF"}}>Contratto:</p>&nbsp;
            <p className="md:w-5/5 w-4/5 overflow-hidden text-ellipsis md:w-auto">
              {tokenAddress}
            </p>
            <DocumentDuplicateIcon
              className="ml-3 h-6 w-6 flex-shrink-0 cursor-pointer text-white"
              style={{color: "#00FFFF"}}
              aria-hidden="true"
              onClick={(e) => copyToClipboard()}
            />
          </div>
          <div className="mt-4 flex flex-row text-xl">
            <p style={{color: "#00FFFF"}}>Simbolo:</p>&nbsp; {symbol}
          </div>
          <div className="mt-4 flex flex-row text-xl">
            <p style={{color: "#00FFFF"}}>Decimali:</p>&nbsp; 18
          </div>
        </div>
      </div>
    </div>
  );
}
